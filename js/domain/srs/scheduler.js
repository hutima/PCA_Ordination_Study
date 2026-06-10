// SRS scheduling logic — pure functions, no state access
import { SRS_DAY_MS, SRS_AGAIN_MS, SRS_UNCERTAIN_MIN_MS, SRS_UNCERTAIN_MAX_MS, SRS_UNSPACED_RECOVERY_MS, SRS_MAX_INTERVAL_DAYS } from './constants.js';
import { clamp } from '../../utils/helpers.js';
import { getConfidencePct } from './confidence.js';

export function msFromDays(days) {
  return Math.round(days * SRS_DAY_MS);
}

export function msFromHours(hours) {
  return Math.round(hours * 60 * 60 * 1000);
}

export function setProgressDelay(progress, delayMs, now = Date.now()) {
  progress.intervalDays = delayMs / SRS_DAY_MS;
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
  progress.intervalDays = remainingDelayMs / SRS_DAY_MS;
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

export function getNextEasyIntervalDays(progress) {
  const history = Array.isArray(progress?.confidenceHistory)
    ? progress.confidenceHistory.filter(Number.isFinite)
    : [];
  const recentPct = history.length
    ? (history.reduce((s, v) => s + v, 0) / history.length) * 100
    : 0;

  // Stabilization: while the card has fewer than 5 recorded flips, or its
  // last-10-flip confidence is under 50%, cap "easy" at 1 study day so the
  // card has to reappear at least 5 times at high confidence before any
  // longer interval is unlocked.
  if (history.length < 5 || recentPct < 50) return 1;

  // Post-stabilization: confidence-scaled multiplier on the previous
  // interval. Growth is gradual (1 → 3 → 8 → 14 at top confidence) rather
  // than a hard jump to the 14-day cap.
  //   90–100% → 2.5
  //   70–89%  → 1.5–2.0  (linear across 70–90%)
  //   50–69%  → 1.2–1.4  (linear across 50–70%)
  let multiplier;
  if (recentPct >= 90)      multiplier = 2.5;
  else if (recentPct >= 70) multiplier = 1.5 + (recentPct - 70) / 40;
  else                      multiplier = 1.2 + (recentPct - 50) / 100;

  const previousDays = Math.max(
    1,
    getLastEasyIntervalDays(progress),
    Number.isFinite(Number(progress?.intervalDays)) ? Math.max(0, Number(progress.intervalDays)) : 0
  );
  const proposedDays = previousDays * multiplier;
  const minNext = Math.ceil(previousDays + 1);
  let cappedDays = Math.min(SRS_MAX_INTERVAL_DAYS, Math.max(Math.round(proposedDays), minNext));

  // Recent-3-flip uncertain ceiling: any shaky flip in the last 3 caps the
  // next 'easy' interval at 1 day × certainty, floored at 1 hour so a run
  // of recent 'again's can't push the cap to immediately-due. Overrides the
  // global SRS_MAX_INTERVAL_DAYS cap when stricter.
  const uncertainCeilingMs = getRecentUncertainCeilingMs(progress, { capDays: 1, floorMs: 60 * 60 * 1000 });
  if (uncertainCeilingMs !== null) {
    const uncertainCeilingDays = uncertainCeilingMs / SRS_DAY_MS;
    cappedDays = Math.min(cappedDays, uncertainCeilingDays);
  }
  return cappedDays;
}

export function getEasyDelayMs(progress) {
  return msFromDays(getNextEasyIntervalDays(progress));
}

// If any of the last 3 flips were uncertain or unknown (sample < 1), the
// card is treated as uncertain and its interval is capped at capDays ×
// recent certainty (last-3 avg). Easy passes capDays:1 + floorMs:1h so the
// next 'easy' lands between 1 h and 1 day; Pass/Uncertain use the default
// capDays:7 (no floor — its own UNCERTAIN_MIN_MS handles the floor at the
// call site). Returns null when the rule does not apply.
export function getRecentUncertainCeilingMs(progress, { capDays = 7, floorMs = 0 } = {}) {
  const history = Array.isArray(progress?.confidenceHistory)
    ? progress.confidenceHistory.filter(Number.isFinite)
    : [];
  const last3 = history.slice(-3);
  if (!last3.length) return null;
  if (!last3.some(value => value < 1)) return null;
  const certainty = last3.reduce((sum, value) => sum + value, 0) / last3.length;
  return Math.max(floorMs, msFromDays(capDays * certainty));
}

export function getUncertainDelayMs(progress) {
  // Delay for an 'uncertain/pass' outcome:
  //   <70% confidence → 1h floor (keep review pressure up before weekly quizzes)
  //   otherwise       → ½ previous interval, capped at 7 days × recent certainty
  //                     (last-3-flip avg; falls back to the global max otherwise)
  const pct = getConfidencePct(progress);
  if (pct === null || pct < 70) return SRS_UNCERTAIN_MIN_MS;
  const prevIntervalDays = Number(progress?.intervalDays) || 0;
  if (prevIntervalDays <= 0) return SRS_UNCERTAIN_MIN_MS;
  const halfMs = msFromDays(prevIntervalDays * 0.5);
  const rawCeiling = getRecentUncertainCeilingMs(progress) ?? msFromDays(SRS_MAX_INTERVAL_DAYS);
  const ceiling = Math.max(rawCeiling, SRS_UNCERTAIN_MIN_MS);
  return clamp(halfMs, SRS_UNCERTAIN_MIN_MS, ceiling);
}

export function formatRemainingForTable(dueAt) {
  const now = Date.now();
  if (!dueAt || dueAt <= now) return 'now';
  const remaining = dueAt - now;
  if (remaining > 12 * 60 * 60 * 1000) {
    return `${Math.max(1, Math.ceil(remaining / SRS_DAY_MS))}d`;
  }
  if (remaining >= 60 * 60 * 1000) {
    return `${Math.max(1, Math.ceil(remaining / (60 * 60 * 1000)))}h`;
  }
  return `${Math.max(1, Math.ceil(remaining / (60 * 1000)))}m`;
}

// Apply unspaced schedule — takes cycleState and progress as arguments
export function applyUnspacedSchedule(progress, cycleEntry, outcome, reviewedAt = Date.now()) {
  const normalizedOutcome = outcome === 'easy' ? 'easy' : outcome === 'pass' ? 'pass' : 'again';

  if (normalizedOutcome === 'again') {
    cycleEntry.wrongThisCycle = true;
    cycleEntry.lastOutcome = 'again';
    setProgressDelay(progress, SRS_AGAIN_MS, reviewedAt);
    return progress;
  }

  const recoveringFromMiss = cycleEntry.wrongThisCycle;
  const minimumDelayMs = (normalizedOutcome === 'pass' || recoveringFromMiss)
    ? SRS_UNSPACED_RECOVERY_MS
    : SRS_DAY_MS;

  cycleEntry.correctCount += 1;
  cycleEntry.lastOutcome = normalizedOutcome;
  setMinimumProgressDelay(progress, minimumDelayMs, reviewedAt);
  return progress;
}
