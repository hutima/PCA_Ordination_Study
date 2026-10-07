from pathlib import Path

CONSTANTS = r'''// SRS scheduling constants — aligned with the canonical Duff scheduler.

// An N-day interval is due in 24N - 2 hours. The first day is 22h and each
// additional day is a full 24h, preventing reviews from drifting later daily.
export const SRS_DAY_MS = 22 * 60 * 60 * 1000;
export const SRS_FULL_DAY_MS = 24 * 60 * 60 * 1000;
export const SRS_AGAIN_MS = 5 * 60 * 1000;
export const SRS_UNCERTAIN_MIN_MS = 2 * 60 * 60 * 1000;
export const SRS_UNCERTAIN_MAX_MS = 7 * 24 * 60 * 60 * 1000; // legacy-compatible export
export const SRS_UNCERTAIN_CAP_MS = SRS_UNCERTAIN_MIN_MS;     // legacy alias
export const SRS_UNSPACED_RECOVERY_MS = 60 * 60 * 1000;
export const SRS_MAX_INTERVAL_DAYS = 14;

// Lapse / relearn ladder. Hard remains in-session; Uncertain gets a 2h
// confirming review. Established spacing resumes at half the pre-lapse value.
export const SRS_RELEARN_STEP_DAYS = 1;
export const SRS_HARD_RELEARN_STEPS = 2;

// Leech is enabled only for the relaxed / continuous-review cadence.
export const LEECH_LAPSE_THRESHOLD = 4;
export const LEECH_UNPIN_STREAK = 3;
export const LEECH_DRILL_DAYS = 1;

export const SRS_CADENCE_PRESETS = {
  intensive: {
    id: 'intensive',
    label: '2-month intensive',
    maxIntervalDays: SRS_MAX_INTERVAL_DAYS,
    lapseResumeCapDays: 7,
    easyCurve: { high: 2.5, midBase: 1.5, midDiv: 40, lowBase: 1.2, lowDiv: 100 },
    leechEnabled: false,
    useCardDifficulty: false,
  },
  relaxed: {
    id: 'relaxed',
    label: '8-month / continuous review',
    maxIntervalDays: 60,
    maxEasyStepDays: 14,
    lapseResumeCapDays: 14,
    easyCurve: { high: 2.0, midBase: 1.5, midDiv: 40, lowBase: 1.3, lowDiv: 40 },
    leechEnabled: true,
    useCardDifficulty: true,
    difficultyNeutralEase: 2.3,
  },
};
export const DEFAULT_SRS_CADENCE = 'intensive';
export function getCadencePreset(id) {
  return SRS_CADENCE_PRESETS[id] || SRS_CADENCE_PRESETS[DEFAULT_SRS_CADENCE];
}

export const SRS_NEAR_WINDOW_MS = 30 * 60 * 1000;
export const SRS_CYCLE_ADVANCE_MS = 60 * 60 * 1000;
export const SESSION_IDLE_RESET_MS = 5 * 60 * 60 * 1000;
'''

SCHEDULER = r'''// SRS scheduling logic — pure functions, aligned with Duff.
import {
  SRS_DAY_MS, SRS_FULL_DAY_MS, SRS_AGAIN_MS, SRS_UNCERTAIN_MIN_MS,
  SRS_UNSPACED_RECOVERY_MS, DEFAULT_SRS_CADENCE, getCadencePreset,
} from './constants.js';
import { clamp } from '../../utils/helpers.js';
import { getConfidencePct } from './confidence.js';

const DEFAULT_CADENCE = getCadencePreset(DEFAULT_SRS_CADENCE);

function easyMultiplierFor(recentPct, curve) {
  if (recentPct >= 90) return curve.high;
  if (recentPct >= 70) return curve.midBase + (recentPct - 70) / curve.midDiv;
  return curve.lowBase + (recentPct - 50) / curve.lowDiv;
}

export function msFromDays(days) {
  if (!(days > 0)) return 0;
  if (days <= 1) return Math.round(days * SRS_DAY_MS);
  return Math.round(SRS_DAY_MS + (days - 1) * SRS_FULL_DAY_MS);
}

export function daysFromMs(ms) {
  if (!(ms > 0)) return 0;
  if (ms <= SRS_DAY_MS) return ms / SRS_DAY_MS;
  return 1 + (ms - SRS_DAY_MS) / SRS_FULL_DAY_MS;
}

export function msFromHours(hours) { return Math.round(hours * 60 * 60 * 1000); }

export function setProgressDelay(progress, delayMs, now = Date.now()) {
  progress.intervalDays = daysFromMs(delayMs);
  progress.dueAt = now + delayMs;
}

export function getRemainingProgressDelayMs(progress, now = Date.now()) {
  if (!progress || !progress.dueAt) return 0;
  return Math.max(0, progress.dueAt - now);
}

export function setMinimumProgressDelay(progress, minimumDelayMs, now = Date.now()) {
  const remainingDelayMs = getRemainingProgressDelayMs(progress, now);
  if (remainingDelayMs < minimumDelayMs) {
    setProgressDelay(progress, minimumDelayMs, now);
    return true;
  }
  progress.intervalDays = daysFromMs(remainingDelayMs);
  return false;
}

export function getSrsEase(progress) {
  const rawEase = Number(progress?.ease);
  const safeEase = Number.isFinite(rawEase) ? rawEase : 2.3;
  progress.ease = clamp(safeEase, 1.3, 3.0);
  return progress.ease;
}

export function getSrsStage(progress) {
  const rawStage = Number(progress?.srsStage);
  return Number.isFinite(rawStage) ? Math.max(0, Math.floor(rawStage)) : 0;
}

export function getLastEasyIntervalDays(progress) {
  const rawDays = Number(progress?.lastEasyIntervalDays);
  return Number.isFinite(rawDays) ? Math.max(0, rawDays) : 0;
}

export function getNextEasyIntervalDays(progress, cadence = DEFAULT_CADENCE) {
  const history = Array.isArray(progress?.confidenceHistory)
    ? progress.confidenceHistory.filter(Number.isFinite) : [];
  const recentPct = history.length
    ? (history.reduce((s, v) => s + v, 0) / history.length) * 100 : 0;
  if (history.length < 5 || recentPct < 50) return 1;

  let multiplier = easyMultiplierFor(recentPct, cadence.easyCurve);
  if (cadence.useCardDifficulty) {
    multiplier *= getSrsEase(progress) / (cadence.difficultyNeutralEase || 2.3);
  }
  const previousDays = Math.max(
    1,
    getLastEasyIntervalDays(progress),
    Number.isFinite(Number(progress?.intervalDays)) ? Math.max(0, Number(progress.intervalDays)) : 0,
  );
  const minNext = Math.ceil(previousDays + 1);
  let next = Math.min(cadence.maxIntervalDays, Math.max(Math.round(previousDays * multiplier), minNext));
  if (Number.isFinite(cadence.maxEasyStepDays)) {
    next = Math.min(next, Math.max(minNext, Math.round(previousDays + cadence.maxEasyStepDays)));
  }
  return next;
}

// Legacy-compatible helpers retained for older PCA call sites/plugins.
export function getRecentUncertainCeilingMs(progress, { capDays = 7, floorMs = 0 } = {}) {
  const history = Array.isArray(progress?.confidenceHistory)
    ? progress.confidenceHistory.filter(Number.isFinite) : [];
  const last3 = history.slice(-3);
  if (!last3.length || !last3.some(value => value < 1)) return null;
  const certainty = last3.reduce((sum, value) => sum + value, 0) / last3.length;
  return Math.max(floorMs, msFromDays(capDays * certainty));
}

export function getUncertainDelayMs(progress) {
  const pct = getConfidencePct(progress);
  if (pct === null || pct < 70) return SRS_UNCERTAIN_MIN_MS;
  const prev = Number(progress?.intervalDays) || 0;
  if (prev <= 0) return SRS_UNCERTAIN_MIN_MS;
  const ceiling = Math.max(getRecentUncertainCeilingMs(progress) ?? msFromDays(14), SRS_UNCERTAIN_MIN_MS);
  return clamp(msFromDays(prev * 0.5), SRS_UNCERTAIN_MIN_MS, ceiling);
}

export function formatRemainingForTable(dueAt) {
  const now = Date.now();
  if (!dueAt || dueAt <= now) return 'now';
  const remaining = dueAt - now;
  if (remaining > 12 * 60 * 60 * 1000) return `${Math.max(1, Math.ceil(daysFromMs(remaining)))}d`;
  if (remaining >= 60 * 60 * 1000) return `${Math.max(1, Math.ceil(remaining / 3600000))}h`;
  return `${Math.max(1, Math.ceil(remaining / 60000))}m`;
}

export function applyUnspacedSchedule(progress, cycleEntry, outcome, reviewedAt = Date.now()) {
  const normalized = outcome === 'easy' ? 'easy' : outcome === 'pass' ? 'pass' : 'again';
  if (normalized === 'again') {
    cycleEntry.wrongThisCycle = true;
    cycleEntry.lastOutcome = 'again';
    setProgressDelay(progress, SRS_AGAIN_MS, reviewedAt);
    return progress;
  }
  const recovering = cycleEntry.wrongThisCycle;
  cycleEntry.correctCount += 1;
  cycleEntry.lastOutcome = normalized;
  setMinimumProgressDelay(progress,
    (normalized === 'pass' || recovering) ? SRS_UNSPACED_RECOVERY_MS : SRS_DAY_MS,
    reviewedAt);
  return progress;
}
'''

SRS = r'''// Applies a self-check / quiz outcome to a card's SRS progress, then persists
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
'''

Path('js/domain/srs/constants.js').write_text(CONSTANTS)
Path('js/domain/srs/scheduler.js').write_text(SCHEDULER)
Path('js/app/srs.js').write_text(SRS)

# Store: cadence persistence + explicit middle-pile membership.
path = Path('js/app/store.js')
text = path.read_text()
text = text.replace("export const SPACED_KEY = 'pca_spaced_v1';", "export const SPACED_KEY = 'pca_spaced_v1';\nexport const SRS_CADENCE_KEY = 'pca_srs_cadence_v1';")
text = text.replace("  spacedOn: true,          // spaced-repetition master switch (persisted); off = unspaced", "  spacedOn: true,          // spaced-repetition master switch (persisted); off = unspaced\n  spacingCadence: 'intensive', // 'intensive' (2-month) | 'relaxed' (8-month), persisted")
text = text.replace("  spacedActiveIds: [],     // in-flight \"active\" pile ids (spaced session continuity)", "  spacedActiveIds: [],     // in-flight \"active\" pile ids (spaced session continuity)\n  spacedMiddleIds: [],     // in-session Again/newly-due pile; can override future dueAt")
needle = "export function saveSpaced() {\n  try { localStorage.setItem(SPACED_KEY, state.spacedOn ? 'on' : 'off'); } catch (e) {}\n}\n"
insert = needle + "export function loadSpacingCadence() {\n  try { state.spacingCadence = localStorage.getItem(SRS_CADENCE_KEY) === 'relaxed' ? 'relaxed' : 'intensive'; }\n  catch (e) { state.spacingCadence = 'intensive'; }\n}\nexport function saveSpacingCadence() {\n  try { localStorage.setItem(SRS_CADENCE_KEY, state.spacingCadence === 'relaxed' ? 'relaxed' : 'intensive'); } catch (e) {}\n}\n"
if needle not in text: raise SystemExit('store spaced persistence anchor missing')
text = text.replace(needle, insert, 1)
old = "    p = { confidenceHistory: [], intervalDays: 0, dueAt: 0, ease: 2.3, passCount: 0, failCount: 0, reps: 0, lastReviewedAt: 0 };"
new = "    p = { confidenceHistory: [], intervalDays: 0, dueAt: 0, ease: 2.3, srsStage: 0, streak: 0, easyStreak: 0, lastEasyIntervalDays: 0, preLapseIntervalDays: 0, inRelearn: false, relearnLeft: 0, lapseCount: 0, leechDrill: false, leechStreak: 0, passCount: 0, failCount: 0, reps: 0, lastReviewedAt: 0, firstConfirmedAt: 0 };"
if old not in text: raise SystemExit('store progress default anchor missing')
text = text.replace(old, new, 1)
path.write_text(text)

# Controller: load/save cadence, explicit live middle membership, and settings UI.
path = Path('js/app/pca.js')
text = path.read_text()
text = text.replace("  loadSpaced, saveSpaced, loadUnspacedReset, saveUnspacedReset, loadUnspaced, saveUnspaced,", "  loadSpaced, saveSpaced, loadSpacingCadence, saveSpacingCadence, loadUnspacedReset, saveUnspacedReset, loadUnspaced, saveUnspaced,")
old = "  let due = cards.filter(isDue);\n  let deferred = cards.filter(c => !isDue(c));"
new = "  const retryIds = new Set(state.spacedMiddleIds || []);\n  const isSessionDue = (c) => isDue(c) || retryIds.has(c.id);\n  let due = cards.filter(isSessionDue);\n  let deferred = cards.filter(c => !isSessionDue(c));"
if old not in text: raise SystemExit('pca due anchor missing')
text = text.replace(old, new, 1)
text = text.replace("      due = cards.filter(isDue);\n      deferred = cards.filter(c => !isDue(c));", "      due = cards.filter(isSessionDue);\n      deferred = cards.filter(c => !isSessionDue(c));", 1)
text = text.replace("    middle = [];", "    middle = [];\n    state.spacedMiddleIds = [];", 1)
old = "  state.spacedActiveIds = active.map(c => c.id);\n  const orderedDeferred"
new = "  state.spacedActiveIds = active.map(c => c.id);\n  state.spacedMiddleIds = middle.map(c => c.id);\n  const orderedDeferred"
if old not in text: raise SystemExit('pca deck membership anchor missing')
text = text.replace(old, new, 1)
# cadence button sync
old = "  setToggle('spacedToggle', 'spacedBtn', state.spacedOn, false);\n  setToggle('unspacedResetToggle', 'unspacedResetBtn', state.unspacedDailyReset, state.spacedOn);"
new = "  setToggle('spacedToggle', 'spacedBtn', state.spacedOn, false);\n  for (const id of ['cadenceIntensiveBtn', 'cadenceRelaxedBtn']) {\n    const b = $(id); if (!b) continue;\n    const cadence = b.getAttribute('data-cadence');\n    b.classList.toggle('active', cadence === state.spacingCadence);\n    b.disabled = !state.spacedOn;\n  }\n  setToggle('unspacedResetToggle', 'unspacedResetBtn', state.unspacedDailyReset, state.spacedOn);"
if old not in text: raise SystemExit('advanced button anchor missing')
text = text.replace(old, new, 1)
# new setter after toggleSpaced
anchor = "function toggleSpaced() {\n  state.spacedOn = !state.spacedOn;\n  saveSpaced();\n  updateAdvancedButtons();\n  updateResetLabels();\n  buildDeck({ forceShuffle: true });\n  renderCard();\n}\n"
addition = anchor + "function setSpacingCadence(cadence) {\n  state.spacingCadence = cadence === 'relaxed' ? 'relaxed' : 'intensive';\n  saveSpacingCadence();\n  updateAdvancedButtons();\n  buildDeck({ forceShuffle: true });\n  renderCard();\n}\n"
if anchor not in text: raise SystemExit('toggleSpaced anchor missing')
text = text.replace(anchor, addition, 1)
# init cadence
text = text.replace("  loadSpaced();\n  loadUnspacedReset();", "  loadSpaced();\n  loadSpacingCadence();\n  loadUnspacedReset();", 1)
# event listeners
anchor = "  $('spacedToggle').addEventListener('click', toggleSpaced);\n  $('unspacedResetToggle').addEventListener('click', toggleUnspacedReset);"
replacement = "  $('spacedToggle').addEventListener('click', toggleSpaced);\n  document.querySelectorAll('[data-cadence]').forEach(b => b.addEventListener('click', () => setSpacingCadence(b.getAttribute('data-cadence'))));\n  $('unspacedResetToggle').addEventListener('click', toggleUnspacedReset);"
if anchor not in text: raise SystemExit('listener anchor missing')
text = text.replace(anchor, replacement, 1)
path.write_text(text)

# Settings UI + release v74.
path = Path('index.html')
text = path.read_text()
text = text.replace('?v=73', '?v=74')
text = text.replace("title=\"Spaced repetition. On schedules each card by how well you know it and only resurfaces it when it's due — the 2-month / 14-day cadence. Off is unspaced: study the whole selection ignoring the schedule, marking cards until they're cleared (reps are still logged for your streak and XP).\"", "title=\"Spaced repetition. On schedules each card by how well you know it using the cadence selected below. Off is unspaced: study the whole selection ignoring the schedule, marking cards until they're cleared.\"")
spaced_block = '''      <button class="toggle-label" id="spacedToggle" type="button" role="switch" aria-checked="true"
        title="Spaced repetition. On schedules each card by how well you know it using the cadence selected below. Off is unspaced: study the whole selection ignoring the schedule, marking cards until they're cleared.">
        <span class="toggle-switch on" id="spacedBtn" aria-hidden="true"></span>
        <span class="toggle-text">Spaced repetition</span>
      </button>
'''
if spaced_block not in text: raise SystemExit('index spaced block anchor missing')
cadence_block = spaced_block + '''      <div class="display-prefs-row" id="cadenceControls">
        <span class="display-prefs-label">SRS cadence</span>
        <div class="theme-switcher" role="group" aria-label="Spaced repetition cadence">
          <button class="theme-btn active" id="cadenceIntensiveBtn" type="button" data-cadence="intensive" title="2-month intensive: reviews top out at 14 days; leech drill disabled.">2-month</button>
          <button class="theme-btn" id="cadenceRelaxedBtn" type="button" data-cadence="relaxed" title="8-month / continuous review: intervals may grow to 60 days and repeated genuine lapses can enter the leech drill.">8-month</button>
        </div>
      </div>
'''
text = text.replace(spaced_block, cadence_block, 1)
path.write_text(text)

path = Path('sw.js')
text = path.read_text().replace("const CACHE = 'pca-v73';", "const CACHE = 'pca-v74';")
path.write_text(text)
