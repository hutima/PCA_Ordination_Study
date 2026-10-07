// Applies a self-check / quiz outcome to a card's SRS progress, then persists
// and logs the review. Scheduling semantics mirror the canonical Duff engine.
import {
  SRS_AGAIN_MS, SRS_UNCERTAIN_MIN_MS, SRS_RELEARN_STEP_DAYS,
  SRS_HARD_RELEARN_STEPS, LEECH_LAPSE_THRESHOLD, LEECH_UNPIN_STREAK,
  LEECH_DRILL_DAYS, getCadencePreset,
} from '../domain/srs/constants.js';
import {
  setProgressDelay, getSrsEase, getSrsStage, getLastEasyIntervalDays,
  getNextEasyIntervalDays, msFromDays,
} from '../domain/srs/scheduler.js';
import { recordConfidenceSample, getConfidencePct, computeCardXpAward } from '../domain/srs/confidence.js';
import { clamp } from '../utils/helpers.js';
import { state, getProgress, saveProgress, recordActivity, addXp } from './store.js';

function normalize(p) {
  const numeric = ['streak','easyStreak','srsStage','lastEasyIntervalDays','preLapseIntervalDays',
    'relearnLeft','lapseCount','leechStreak','passCount','failCount','reps','lastReviewedAt'];
  for (const key of numeric) p[key] = Number.isFinite(Number(p[key])) ? Math.max(0, Number(p[key])) : 0;
  p.ease = Number.isFinite(Number(p.ease)) ? clamp(Number(p.ease), 1.3, 3.0) : 2.3;
  p.inRelearn = p.inRelearn === true;
  p.leechDrill = p.leechDrill === true;
  p.confidenceHistory = Array.isArray(p.confidenceHistory) ? p.confidenceHistory : [];
  return p;
}

function preLapseIntervalDays(p) {
  return Math.max(getLastEasyIntervalDays(p), Number(p.intervalDays) || 0);
}

function applyEasyGrowth(p, cadence, now) {
  const nextDays = getNextEasyIntervalDays(p, cadence);
  p.streak += 1;
  p.easyStreak += 1;
  p.srsStage = getSrsStage(p) + 1;
  p.ease = clamp(getSrsEase(p) + 0.08, 1.3, 3.0);
  p.lastEasyIntervalDays = nextDays;
  p.firstConfirmedAt = p.firstConfirmedAt || now;
  setProgressDelay(p, msFromDays(nextDays), now);
}

function resumeAfterLapse(p, cadence, now) {
  const resumeDays = clamp(preLapseIntervalDays(p) * 0.5, SRS_RELEARN_STEP_DAYS, cadence.lapseResumeCapDays);
  p.inRelearn = false;
  p.relearnLeft = 0;
  p.streak += 1;
  p.easyStreak += 1;
  p.lastEasyIntervalDays = resumeDays;
  setProgressDelay(p, msFromDays(resumeDays), now);
}

function applyHardLapse(p, cadence, now) {
  const wasInRelearn = p.inRelearn === true;
  const wasLeech = p.leechDrill === true;
  const establishedDays = preLapseIntervalDays(p);
  const startsLapseEpisode = !wasInRelearn && !wasLeech && establishedDays > 0;

  p.streak = 0;
  p.easyStreak = 0;
  if (startsLapseEpisode) {
    p.srsStage = Math.max(0, getSrsStage(p) - 1);
    p.ease = clamp(getSrsEase(p) - 0.2, 1.3, 3.0);
    p.lapseCount += 1;
    p.preLapseIntervalDays = establishedDays;
  }

  const shouldLeech = cadence.leechEnabled &&
    (wasLeech || (startsLapseEpisode && p.lapseCount >= LEECH_LAPSE_THRESHOLD));
  if (shouldLeech) {
    p.leechDrill = true;
    p.leechStreak = 0;
    p.inRelearn = false;
    p.relearnLeft = 0;
  } else {
    if (!wasInRelearn) p.preLapseIntervalDays = establishedDays;
    p.inRelearn = true;
    p.relearnLeft = SRS_HARD_RELEARN_STEPS;
  }
  // PCA keeps the historical persisted 5-minute Again timestamp. The live
  // middle pile below overrides it within the current session.
  setProgressDelay(p, SRS_AGAIN_MS, now);
}

function applyUncertainLapse(p, now) {
  if (!p.inRelearn) p.preLapseIntervalDays = preLapseIntervalDays(p);
  p.inRelearn = true;
  p.relearnLeft = 0;
  p.streak += 1;
  p.easyStreak = 0;
  setProgressDelay(p, SRS_UNCERTAIN_MIN_MS, now);
}

function applyCorrectOutcome(p, cadence, now, outcome) {
  if (p.leechDrill) {
    p.leechStreak += 1;
    if (p.leechStreak < LEECH_UNPIN_STREAK) {
      p.streak += 1;
      setProgressDelay(p, msFromDays(LEECH_DRILL_DAYS), now);
      return;
    }
    p.leechDrill = false;
    p.leechStreak = 0;
    p.lapseCount = 0;
    p.lastEasyIntervalDays = LEECH_DRILL_DAYS;
    applyEasyGrowth(p, cadence, now);
    return;
  }
  if (p.inRelearn) {
    if (p.relearnLeft > 0) {
      p.relearnLeft -= 1;
      p.streak += 1;
      setProgressDelay(p, msFromDays(SRS_RELEARN_STEP_DAYS), now);
      return;
    }
    resumeAfterLapse(p, cadence, now);
    return;
  }
  if (outcome === 'pass') {
    applyUncertainLapse(p, now);
    return;
  }
  applyEasyGrowth(p, cadence, now);
}

function removeId(list, id) { return Array.isArray(list) ? list.filter(x => x !== id) : []; }
function moveToMiddle(id) {
  state.spacedActiveIds = removeId(state.spacedActiveIds, id);
  state.spacedMiddleIds = removeId(state.spacedMiddleIds, id);
  state.spacedMiddleIds.push(id);
}
function clearLiveMembership(id) {
  state.spacedActiveIds = removeId(state.spacedActiveIds, id);
  state.spacedMiddleIds = removeId(state.spacedMiddleIds, id);
}

export function applyOutcome(card, outcome) {
  if (!state.spacedOn) {
    addXp(computeCardXpAward(outcome, false, false));
    recordActivity();
    return;
  }
  const p = normalize(getProgress(card.id));
  const now = Date.now();
  const cadence = getCadencePreset(state.spacingCadence);
  const wasConfirmed = !!p.firstConfirmedAt;
  recordConfidenceSample(p, outcome);
  if (!p.firstConfirmedAt) {
    const pct = getConfidencePct(p);
    if (pct !== null && pct >= 70) p.firstConfirmedAt = now;
  }
  addXp(computeCardXpAward(outcome, !wasConfirmed && !!p.firstConfirmedAt, true));

  if (outcome === 'again') {
    applyHardLapse(p, cadence, now);
    p.failCount += 1;
    moveToMiddle(card.id);
  } else {
    applyCorrectOutcome(p, cadence, now, outcome);
    p.passCount += 1;
    clearLiveMembership(card.id);
  }
  p.reps += 1;
  p.lastReviewedAt = now;
  saveProgress();
  recordActivity();
}

// Catechism mode remains unscheduled and independent of the global deck cadence.
export function applyCatechismOutcome(id, outcome) {
  const p = normalize(getProgress(id));
  const now = Date.now();
  const wasConfirmed = !!p.firstConfirmedAt;
  recordConfidenceSample(p, outcome);
  if (!p.firstConfirmedAt) {
    const pct = getConfidencePct(p);
    if (pct !== null && pct >= 70) p.firstConfirmedAt = now;
  }
  if (outcome === 'easy') p.passCount += 1;
  else if (outcome === 'again') p.failCount += 1;
  p.reps += 1;
  p.lastReviewedAt = now;
  addXp(computeCardXpAward(outcome, !wasConfirmed && !!p.firstConfirmedAt, true));
  saveProgress();
  recordActivity();
}
