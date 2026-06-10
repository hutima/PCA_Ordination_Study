import { clamp } from '../../utils/helpers.js';
import { addDailyDurationSlice } from '../../utils/time.js';

export function sanitizeUsageStats(stats, maxStudySessionHistory) {
  const safe = stats && typeof stats === 'object' ? stats : {};
  safe.totalMs = Number.isFinite(safe.totalMs) ? Math.max(0, safe.totalMs) : 0;
  safe.dailyMs = safe.dailyMs && typeof safe.dailyMs === 'object' ? safe.dailyMs : {};
  safe.activeStudyMs = Number.isFinite(safe.activeStudyMs) ? Math.max(0, safe.activeStudyMs) : 0;
  safe.activeDailyMs = safe.activeDailyMs && typeof safe.activeDailyMs === 'object' ? safe.activeDailyMs : {};
  safe.lastActiveAt = Number.isFinite(safe.lastActiveAt) ? safe.lastActiveAt : 0;
  safe.lastStudyInteractionAt = Number.isFinite(safe.lastStudyInteractionAt) ? safe.lastStudyInteractionAt : 0;
  safe.lastStudyCountedAt = Number.isFinite(safe.lastStudyCountedAt) ? safe.lastStudyCountedAt : 0;
  safe.firstStudyAt = Number.isFinite(safe.firstStudyAt) ? safe.firstStudyAt : 0;
  safe.studySessionHistory = Array.isArray(safe.studySessionHistory)
    ? safe.studySessionHistory
      .filter(entry => entry && typeof entry === 'object')
      .map(entry => ({
        startedAt: Number.isFinite(entry.startedAt) ? Math.max(0, entry.startedAt) : 0,
        endedAt: Number.isFinite(entry.endedAt) ? Math.max(0, entry.endedAt) : 0,
        durationMs: Number.isFinite(entry.durationMs) ? Math.max(0, entry.durationMs) : 0,
        interactionCount: Number.isFinite(entry.interactionCount) ? Math.max(0, entry.interactionCount) : 0
      }))
      .filter(entry => entry.startedAt && entry.endedAt && entry.durationMs > 0)
      .slice(-maxStudySessionHistory)
    : [];
  safe.currentStudySession = safe.currentStudySession && typeof safe.currentStudySession === 'object'
    ? {
      startedAt: Number.isFinite(safe.currentStudySession.startedAt) ? Math.max(0, safe.currentStudySession.startedAt) : 0,
      durationMs: Number.isFinite(safe.currentStudySession.durationMs) ? Math.max(0, safe.currentStudySession.durationMs) : 0,
      interactionCount: Number.isFinite(safe.currentStudySession.interactionCount) ? Math.max(0, safe.currentStudySession.interactionCount) : 0
    }
    : null;
  if (safe.currentStudySession && !safe.currentStudySession.startedAt) safe.currentStudySession = null;
  safe.cardXpEarned = Number.isFinite(safe.cardXpEarned) ? Math.max(0, safe.cardXpEarned) : -1;
  return safe;
}

export function addUsageSlice(usage, startTs, durationMs) {
  if (!durationMs || durationMs <= 0) return;
  addDailyDurationSlice(usage.dailyMs, startTs, durationMs);
  usage.totalMs += durationMs;
}

export function addActiveStudySlice(usage, startTs, durationMs) {
  if (!durationMs || durationMs <= 0) return;
  addDailyDurationSlice(usage.activeDailyMs, startTs, durationMs);
  usage.activeStudyMs += durationMs;
  if (usage.currentStudySession) {
    usage.currentStudySession.durationMs = (usage.currentStudySession.durationMs || 0) + durationMs;
  }
}

export function accumulateUsageTime(usage, now = Date.now()) {
  if (!usage.lastActiveAt) {
    usage.lastActiveAt = now;
    return 0;
  }
  const rawDelta = now - usage.lastActiveAt;
  const delta = clamp(rawDelta, 0, 10 * 60 * 1000);
  if (delta > 0) addUsageSlice(usage, usage.lastActiveAt, delta);
  usage.lastActiveAt = now;
  return delta;
}

export function accumulateActiveStudyTime(usage, studyIdleMs, now = Date.now()) {
  if (!usage.lastStudyInteractionAt || !usage.lastStudyCountedAt) return 0;
  const eligibleEnd = Math.min(now, usage.lastStudyInteractionAt + studyIdleMs);
  const delta = clamp(eligibleEnd - usage.lastStudyCountedAt, 0, studyIdleMs);
  if (delta > 0) {
    addActiveStudySlice(usage, usage.lastStudyCountedAt, delta);
    usage.lastStudyCountedAt = eligibleEnd;
  }
  return delta;
}

export function finalizeStudySession(usage, studyIdleMs, maxStudySessionHistory, now = Date.now()) {
  accumulateActiveStudyTime(usage, studyIdleMs, now);
  if (usage.currentStudySession && usage.currentStudySession.startedAt && usage.currentStudySession.durationMs > 0) {
    usage.studySessionHistory.push({
      startedAt: usage.currentStudySession.startedAt,
      endedAt: usage.lastStudyCountedAt || now,
      durationMs: usage.currentStudySession.durationMs,
      interactionCount: usage.currentStudySession.interactionCount || 0
    });
    usage.studySessionHistory = usage.studySessionHistory.slice(-maxStudySessionHistory);
  }
  usage.currentStudySession = null;
  usage.lastStudyInteractionAt = 0;
  usage.lastStudyCountedAt = 0;
}

export function noteStudyInteraction(usage, opts = {}) {
  const now = Number.isFinite(opts.now) ? opts.now : Date.now();
  if (opts.documentHidden || !opts.hasSelectedCards) return;
  if (!usage.firstStudyAt) usage.firstStudyAt = now;

  if (usage.lastStudyInteractionAt && now - usage.lastStudyInteractionAt > opts.studySessionBreakMs) {
    finalizeStudySession(usage, opts.studyIdleMs, opts.maxStudySessionHistory, now);
  }

  if (!usage.currentStudySession) {
    usage.currentStudySession = { startedAt: now, durationMs: 0, interactionCount: 0 };
  }

  accumulateActiveStudyTime(usage, opts.studyIdleMs, now);
  usage.lastStudyInteractionAt = now;
  if (!usage.lastStudyCountedAt) usage.lastStudyCountedAt = now;
  usage.currentStudySession.interactionCount = (usage.currentStudySession.interactionCount || 0) + 1;
}

export function getUsageMsForDay(usage, dayKey) {
  return usage.dailyMs[dayKey] || 0;
}

export function getActiveStudyMsForDay(usage, dayKey) {
  return usage.activeDailyMs[dayKey] || 0;
}
