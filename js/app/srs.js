// Applies a self-check / quiz outcome to card SRS progress, then persists
// and logs the review. The spaced path mirrors the current Duff engine.
import {
  SRS_UNCERTAIN_MIN_MS, SRS_RELEARN_STEP_DAYS, SRS_HARD_RELEARN_STEPS,
  LEECH_LAPSE_THRESHOLD, LEECH_UNPIN_STREAK, LEECH_DRILL_DAYS,
  getCadencePreset,
} from '../domain/srs/constants.js';
import {
  setProgressDelay, getNextEasyIntervalDays, msFromDays,
  getLastEasyIntervalDays, getSrsStage, getSrsEase,
} from '../domain/srs/scheduler.js';
import { recordConfidenceSample, getConfidencePct, computeCardXpAward } from '../domain/srs/confidence.js';
import { clamp } from '../utils/helpers.js';
import { state, getProgress, saveProgress, recordActivity, addXp } from './store.js';

function preLapseIntervalDays(progress) {
  return Math.max(getLastEasyIntervalDays(progress), Number(progress.intervalDays) || 0);
}
function applyEasyGrowth(progress, cadence, now) {
  const nextIntervalDays = getNextEasyIntervalDays(progress, cadence);
  progress.streak = (progress.streak || 0) + 1;
  progress.easyStreak = (progress.easyStreak || 0) + 1;
  progress.srsStage = getSrsStage(progress) + 1;
  progress.ease = clamp(getSrsEase(progress) + 0.08, 1.3, 3.0);
  progress.lastEasyIntervalDays = nextIntervalDays;
  progress.firstConfirmedAt = progress.firstConfirmedAt || now;
  setProgressDelay(progress, msFromDays(nextIntervalDays), now);
}
function resumeAfterLapse(progress, cadence, now) {
  const resumeDays = clamp(
    preLapseIntervalDays(progress) * 0.5,
    SRS_RELEARN_STEP_DAYS,
    cadence.lapseResumeCapDays,
  );
  progress.inRelearn = false;
  progress.relearnLeft = 0;
  progress.streak = (progress.streak || 0) + 1;
  progress.easyStreak = (progress.easyStreak || 0) + 1;
  progress.lastEasyIntervalDays = resumeDays;
  setProgressDelay(progress, msFromDays(resumeDays), now);
}
function applyHardLapse(progress, cadence, now) {
  const wasInRelearn = progress.inRelearn === true;
  const wasLeech = progress.leechDrill === true;
  const establishedDays = preLapseIntervalDays(progress);
  const startsLapseEpisode = !wasInRelearn && !wasLeech && establishedDays > 0;

  progress.streak = 0;
  progress.easyStreak = 0;
  if (startsLapseEpisode) {
    progress.srsStage = Math.max(0, getSrsStage(progress) - 1);
    progress.ease = clamp(getSrsEase(progress) - 0.2, 1.3, 3.0);
    progress.lapseCount = (progress.lapseCount || 0) + 1;
    progress.preLapseIntervalDays = establishedDays;
  }

  const shouldLeech = cadence.leechEnabled && (
    wasLeech || (startsLapseEpisode && progress.lapseCount >= LEECH_LAPSE_THRESHOLD)
  );
  if (shouldLeech) {
    progress.leechDrill = true;
    progress.leechStreak = 0;
    progress.inRelearn = false;
    progress.relearnLeft = 0;
    setProgressDelay(progress, 0, now);
    return true;
  }

  if (!wasInRelearn) progress.preLapseIntervalDays = establishedDays;
  progress.inRelearn = true;
  progress.relearnLeft = SRS_HARD_RELEARN_STEPS;
  setProgressDelay(progress, 0, now); // due-now; deck rebuild routes it through middle
  return true;
}
function applyUncertainLapse(progress, now) {
  if (!progress.inRelearn) progress.preLapseIntervalDays = preLapseIntervalDays(progress);
  progress.inRelearn = true;
  progress.relearnLeft = 0;
  progress.streak = (progress.streak || 0) + 1;
  progress.easyStreak = 0;
  setProgressDelay(progress, SRS_UNCERTAIN_MIN_MS, now);
}
function applyCorrectOutcome(progress, cadence, now, ratedOutcome) {
  if (progress.leechDrill) {
    progress.leechStreak = (progress.leechStreak || 0) + 1;
    if (progress.leechStreak < LEECH_UNPIN_STREAK) {
      progress.streak = (progress.streak || 0) + 1;
      setProgressDelay(progress, msFromDays(LEECH_DRILL_DAYS), now);
      return;
    }
    progress.leechDrill = false;
    progress.leechStreak = 0;
    progress.lapseCount = 0;
    progress.lastEasyIntervalDays = LEECH_DRILL_DAYS;
    applyEasyGrowth(progress, cadence, now);
    return;
  }
  if (progress.inRelearn) {
    if ((progress.relearnLeft || 0) > 0) {
      progress.relearnLeft -= 1;
      progress.streak = (progress.streak || 0) + 1;
      setProgressDelay(progress, msFromDays(SRS_RELEARN_STEP_DAYS), now);
      return;
    }
    resumeAfterLapse(progress, cadence, now);
    return;
  }
  if (ratedOutcome === 'pass') {
    applyUncertainLapse(progress, now);
    return;
  }
  applyEasyGrowth(progress, cadence, now);
}

export function applyOutcome(card, outcome) {
  if (!state.spacedOn) {
    addXp(computeCardXpAward(outcome, false, false));
    recordActivity();
    return;
  }
  const p = getProgress(card.id);
  const now = Date.now();
  const ratedOutcome = outcome === 'pass' ? 'pass' : outcome === 'easy' ? 'easy' : 'again';
  const cadence = getCadencePreset(state.spacingCadence);
  const wasConfirmed = !!p.firstConfirmedAt;
  recordConfidenceSample(p, ratedOutcome);
  if (!p.firstConfirmedAt) {
    const pct = getConfidencePct(p);
    if (pct !== null && pct >= 70) p.firstConfirmedAt = now;
  }
  addXp(computeCardXpAward(ratedOutcome, !wasConfirmed && !!p.firstConfirmedAt, true));

  if (ratedOutcome === 'again') {
    const dropFromActive = applyHardLapse(p, cadence, now);
    if (dropFromActive && Array.isArray(state.spacedActiveIds)) {
      state.spacedActiveIds = state.spacedActiveIds.filter(id => id !== card.id);
    }
    p.failCount = (p.failCount || 0) + 1;
  } else {
    applyCorrectOutcome(p, cadence, now, ratedOutcome);
    p.passCount = (p.passCount || 0) + 1;
  }
  p.reps = (p.reps || 0) + 1;
  p.lastReviewedAt = now;
  saveProgress();
  recordActivity();
}

// Catechism grading remains a confidence/mastery signal, independent
// of the subject-deck SRS cadence and the global spaced toggle.
export function applyCatechismOutcome(id, outcome) {
  const p = getProgress(id);
  const now = Date.now();
  const wasConfirmed = !!p.firstConfirmedAt;
  recordConfidenceSample(p, outcome);
  if (!p.firstConfirmedAt) {
    const pct = getConfidencePct(p);
    if (pct !== null && pct >= 70) p.firstConfirmedAt = now;
  }
  if (outcome === 'easy') p.passCount = (p.passCount || 0) + 1;
  else if (outcome === 'again') p.failCount = (p.failCount || 0) + 1;
  p.reps = (p.reps || 0) + 1;
  p.lastReviewedAt = now;
  addXp(computeCardXpAward(outcome, !wasConfirmed && !!p.firstConfirmedAt, true));
  saveProgress();
  recordActivity();
}
