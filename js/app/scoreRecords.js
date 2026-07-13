// High-score record persistence for Quiz (per subject) and Mock exam (per
// section × format/length variant). Sanitization + comparison are pure and
// exported so they can run under node without a DOM (see dev/test_scoring.mjs);
// only load/save/clear touch localStorage.

import { gradeForPercent, isBetterRecord } from '../domain/scoring.js';

export const SCORE_RECORDS_KEY = 'pca_score_records_v1';

const VALID_GRADES = new Set(['S', 'A', 'B', 'C', 'D']);

function emptyRecords() {
  return { version: 1, quiz: {}, exam: {} };
}

// Reuse isBetterRecord's own validity rules rather than duplicating them:
// against a missing/malformed "existing", it returns true iff `r` alone is a
// valid record shape.
function isValidRecordShape(r) {
  return isBetterRecord(r, null);
}

// Coerce a raw (possibly hand-edited or stale) stored record into a clean
// { pct, correct, total, grade, bestStreak?, completedAt } or null if it
// can't be made valid.
function sanitizeRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const total = Math.round(Number(raw.total));
  const correct = Math.round(Number(raw.correct));
  const pct = Number(raw.pct);
  const candidate = { pct, correct, total };
  if (!isValidRecordShape(candidate)) return null;
  const completedAtNum = Number(raw.completedAt);
  const completedAt = Number.isFinite(completedAtNum) && completedAtNum >= 0 ? completedAtNum : 0;
  const grade = VALID_GRADES.has(raw.grade) ? raw.grade : (gradeForPercent(pct) || {}).grade || null;
  const out = { pct, correct, total, grade, completedAt };
  if (raw.bestStreak !== undefined) {
    const bs = Math.round(Number(raw.bestStreak));
    if (Number.isFinite(bs) && bs >= 0) out.bestStreak = bs;
  }
  return out;
}

// Pure: given any parsed value, return a well-formed records object
// containing only valid entries. Never throws.
export function sanitizeRecords(raw) {
  const out = emptyRecords();
  if (!raw || typeof raw !== 'object') return out;

  if (raw.quiz && typeof raw.quiz === 'object') {
    for (const [subjectId, rec] of Object.entries(raw.quiz)) {
      const clean = sanitizeRecord(rec);
      if (clean) out.quiz[subjectId] = clean;
    }
  }

  if (raw.exam && typeof raw.exam === 'object') {
    for (const [sectionId, variants] of Object.entries(raw.exam)) {
      if (!variants || typeof variants !== 'object') continue;
      for (const [variantKey, rec] of Object.entries(variants)) {
        const clean = sanitizeRecord(rec);
        if (!clean) continue;
        if (!out.exam[sectionId]) out.exam[sectionId] = {};
        out.exam[sectionId][variantKey] = clean;
      }
    }
  }

  return out;
}

export function loadRecords() {
  if (typeof localStorage === 'undefined') return emptyRecords();
  try {
    const raw = JSON.parse(localStorage.getItem(SCORE_RECORDS_KEY));
    return sanitizeRecords(raw);
  } catch (e) {
    return emptyRecords();
  }
}

export function saveRecords(records) {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(SCORE_RECORDS_KEY, JSON.stringify(records)); } catch (e) {}
}

export function clearRecords() {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.removeItem(SCORE_RECORDS_KEY); } catch (e) {}
}

// Builds the candidate record to compare/store from a caller-supplied result
// (pct/correct/total/grade/bestStreak/completedAt — any subset, sanitized).
function toCandidateRecord(result) {
  const sanitized = sanitizeRecord({
    pct: result?.pct,
    correct: result?.correct,
    total: result?.total,
    grade: result?.grade,
    bestStreak: result?.bestStreak,
    completedAt: Number.isFinite(result?.completedAt) ? result.completedAt : Date.now(),
  });
  return sanitized;
}

// Pure: mutates `records` in place, installing `result` at records.quiz[subjectId]
// when it's a better (or tying/refreshing) record than what's there. Returns
// { isNewRecord, previous } — previous is the prior record or null; isNewRecord
// is true only on a strict improvement (higher pct, or tie-pct higher total) —
// a pure timestamp refresh (full tie) updates completedAt but reports false so
// the UI never celebrates a tie as a new high score.
export function updateQuizRecord(records, subjectId, result) {
  const previous = records.quiz[subjectId] || null;
  const candidate = toCandidateRecord(result);
  if (!candidate) return { isNewRecord: false, previous };
  if (!isBetterRecord(candidate, previous)) return { isNewRecord: false, previous };
  const strictImprovement = !previous
    || candidate.pct > previous.pct
    || (candidate.pct === previous.pct && candidate.total > previous.total);
  records.quiz[subjectId] = candidate;
  return { isNewRecord: strictImprovement, previous };
}

// Same as updateQuizRecord but keyed by section + variant (format:length) for
// Mock exam, e.g. exam.bible['mcq:full'].
export function updateExamRecord(records, sectionId, variantKey, result) {
  if (!records.exam[sectionId]) records.exam[sectionId] = {};
  const previous = records.exam[sectionId][variantKey] || null;
  const candidate = toCandidateRecord(result);
  if (!candidate) return { isNewRecord: false, previous };
  if (!isBetterRecord(candidate, previous)) return { isNewRecord: false, previous };
  const strictImprovement = !previous
    || candidate.pct > previous.pct
    || (candidate.pct === previous.pct && candidate.total > previous.total);
  records.exam[sectionId][variantKey] = candidate;
  return { isNewRecord: strictImprovement, previous };
}

// Thin app wrappers: load, apply the pure helper, save, return its result.
export function recordQuizResult(subjectId, result) {
  const records = loadRecords();
  const outcome = updateQuizRecord(records, subjectId, result);
  saveRecords(records);
  return outcome;
}

export function recordExamResult(sectionId, variantKey, result) {
  const records = loadRecords();
  const outcome = updateExamRecord(records, sectionId, variantKey, result);
  saveRecords(records);
  return outcome;
}
