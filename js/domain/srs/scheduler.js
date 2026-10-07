// SRS scheduling logic — pure functions, no state access.
import {
  SRS_DAY_MS, SRS_FULL_DAY_MS, SRS_AGAIN_MS, SRS_UNCERTAIN_MIN_MS,
  SRS_UNSPACED_RECOVERY_MS, SRS_MAX_INTERVAL_DAYS,
  DEFAULT_SRS_CADENCE, getCadencePreset,
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
    const neutralEase = cadence.difficultyNeutralEase || 2.3;
    multiplier *= getSrsEase(progress) / neutralEase;
  }
  const previousDays = Math.max(
    1,
    getLastEasyIntervalDays(progress),
    Number.isFinite(Number(progress?.intervalDays)) ? Math.max(0, Number(progress.intervalDays)) : 0,
  );
  const proposedDays = previousDays * multiplier;
  const minNext = Math.ceil(previousDays + 1);
  let cappedDays = Math.min(cadence.maxIntervalDays, Math.max(Math.round(proposedDays), minNext));
  if (Number.isFinite(cadence.maxEasyStepDays)) {
    cappedDays = Math.min(cappedDays, Math.max(minNext, Math.round(previousDays + cadence.maxEasyStepDays)));
  }
  return cappedDays;
}
export function getEasyDelayMs(progress, cadence = DEFAULT_CADENCE) {
  return msFromDays(getNextEasyIntervalDays(progress, cadence));
}

// Retained for older callers; the modern spaced-review flow uses the
// explicit relearn ladder in app/srs.js instead.
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
  const prevIntervalDays = Number(progress?.intervalDays) || 0;
  if (prevIntervalDays <= 0) return SRS_UNCERTAIN_MIN_MS;
  const halfMs = msFromDays(prevIntervalDays * 0.5);
  const rawCeiling = getRecentUncertainCeilingMs(progress) ?? msFromDays(SRS_MAX_INTERVAL_DAYS);
  return clamp(halfMs, SRS_UNCERTAIN_MIN_MS, Math.max(rawCeiling, SRS_UNCERTAIN_MIN_MS));
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
  const normalizedOutcome = outcome === 'easy' ? 'easy' : outcome === 'pass' ? 'pass' : 'again';
  if (normalizedOutcome === 'again') {
    cycleEntry.wrongThisCycle = true;
    cycleEntry.lastOutcome = 'again';
    setProgressDelay(progress, SRS_AGAIN_MS, reviewedAt);
    return progress;
  }
  const recoveringFromMiss = cycleEntry.wrongThisCycle;
  const minimumDelayMs = (normalizedOutcome === 'pass' || recoveringFromMiss)
    ? SRS_UNSPACED_RECOVERY_MS : SRS_DAY_MS;
  cycleEntry.correctCount += 1;
  cycleEntry.lastOutcome = normalizedOutcome;
  setMinimumProgressDelay(progress, minimumDelayMs, reviewedAt);
  return progress;
}
