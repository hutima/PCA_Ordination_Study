// Score grading (percent → letter grade) — pure, no DOM/storage. Shared by the
// Quiz and Mock-exam results screens, and by the high-score record layer in
// js/app/scoreRecords.js. Content-agnostic: this scale applies to any
// correct/total tally in the app, not a particular subject or section.

// Ordered high-to-low: the first entry whose minPct the percent clears wins.
// One place to change the grading scale.
export const GRADES = [
  { grade: 'S', minPct: 95, label: 'Exceptional mastery' },
  { grade: 'A', minPct: 80, label: 'Expected pass' },
  { grade: 'B', minPct: 70, label: 'Almost there — expected pass begins at 80%' },
  { grade: 'C', minPct: 60, label: 'Significant review needed' },
  { grade: 'D', minPct: 0,  label: 'Substantial review needed' },
];

export const EXPECTED_PASS_PCT = 80;

export const PASS_DISCLAIMER = 'Practice benchmark only. Actual exam standards and grading remain with your presbytery.';

function clampPct(n) {
  return Math.min(100, Math.max(0, n));
}

// correct/total -> whole-number percent, clamped to 0–100. Returns null when
// total is 0/negative/non-finite or correct is non-finite (an empty/invalid
// run has no percent — never silently 0%).
export function scorePercent(correct, total) {
  if (!Number.isFinite(total) || total <= 0) return null;
  if (!Number.isFinite(correct)) return null;
  const clampedCorrect = Math.max(0, Math.min(correct, total)); // negative -> 0, >total -> total
  return clampPct(Math.round((clampedCorrect / total) * 100));
}

// Whole-number percent (already clamped 0–100 by the caller ideally) -> the
// matching grade descriptor { grade, label, minPct }. null for anything that
// isn't a finite number (an empty run has no grade, not a D).
export function gradeForPercent(pct) {
  if (typeof pct !== 'number' || !Number.isFinite(pct)) return null;
  const clamped = clampPct(pct);
  for (const g of GRADES) {
    if (clamped >= g.minPct) return { grade: g.grade, label: g.label, minPct: g.minPct };
  }
  return null; // unreachable — GRADES bottoms out at 0
}

// Non-negative integer, or 0 for anything non-finite.
function sanitizeCount(n) {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.max(0, v) : 0;
}

// Builds the full result object a UI needs to render a score: raw tally plus
// derived percent/grade. pct/grade/label/minPct are null together when the
// run is empty/invalid (scorePercent returned null) — never 0%/D.
export function buildScore(correct, total) {
  const pct = scorePercent(correct, total);
  const g = gradeForPercent(pct);
  return {
    correct: sanitizeCount(correct),
    total: sanitizeCount(total),
    pct,
    grade: g ? g.grade : null,
    label: g ? g.label : null,
    minPct: g ? g.minPct : null,
  };
}

function isValidRecordShape(r) {
  if (!r || typeof r !== 'object') return false;
  const { pct, total, correct } = r;
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) return false;
  if (!Number.isInteger(total) || total <= 0) return false;
  if (!Number.isInteger(correct) || correct < 0 || correct > total) return false;
  return true;
}

// Should `candidate` replace `existing` as the stored high-score record?
// Malformed candidate -> false. Valid candidate + missing/malformed existing
// -> true. Otherwise: higher pct wins; a pct tie goes to the larger total;
// a full tie (pct and total equal) refreshes the timestamp — true only when
// candidate.completedAt >= existing.completedAt.
export function isBetterRecord(candidate, existing) {
  if (!isValidRecordShape(candidate)) return false;
  if (!isValidRecordShape(existing)) return true;
  if (candidate.pct !== existing.pct) return candidate.pct > existing.pct;
  if (candidate.total !== existing.total) return candidate.total > existing.total;
  const cAt = Number(candidate.completedAt);
  const eAt = Number(existing.completedAt);
  const cSafe = Number.isFinite(cAt) ? cAt : 0;
  const eSafe = Number.isFinite(eAt) ? eAt : 0;
  return cSafe >= eSafe;
}
