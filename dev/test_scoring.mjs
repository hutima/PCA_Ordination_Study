// Unit tests for the score-grading domain module and the score-record
// persistence layer. Run: node dev/test_scoring.mjs
import assert from 'node:assert/strict';
import {
  GRADES, gradeForPercent, scorePercent, buildScore, isBetterRecord,
} from '../js/domain/scoring.js';
import {
  sanitizeRecords, updateQuizRecord, updateExamRecord,
} from '../js/app/scoreRecords.js';

let sections = 0;
function section(name, fn) {
  fn();
  sections++;
  console.log(`OK  ${name}`);
}

// ── grade boundaries ────────────────────────────────────────────────────
section('grade boundaries', () => {
  const cases = [
    [0, 'D'], [59, 'D'], [60, 'C'], [69, 'C'], [70, 'B'], [79, 'B'],
    [80, 'A'], [94, 'A'], [95, 'S'], [100, 'S'],
  ];
  for (const [pct, expected] of cases) {
    assert.equal(gradeForPercent(pct).grade, expected, `pct ${pct} -> ${expected}`);
  }
  // GRADES itself stays ordered high-to-low and bottoms out at 0.
  assert.equal(GRADES[GRADES.length - 1].minPct, 0);
  for (let i = 1; i < GRADES.length; i++) {
    assert.ok(GRADES[i - 1].minPct > GRADES[i].minPct, 'GRADES must be strictly descending by minPct');
  }
});

// ── malformed inputs to gradeForPercent ─────────────────────────────────
section('gradeForPercent malformed/clamped inputs', () => {
  assert.equal(gradeForPercent(null), null);
  assert.equal(gradeForPercent(NaN), null);
  assert.equal(gradeForPercent('80'), null);
  assert.equal(gradeForPercent(undefined), null);
  assert.equal(gradeForPercent(-5).grade, 'D');
  assert.equal(gradeForPercent(150).grade, 'S');
});

// ── scorePercent / buildScore ────────────────────────────────────────────
section('scorePercent', () => {
  assert.equal(scorePercent(1, 0), null, 'zero denominator -> null');
  assert.equal(scorePercent(1, -5), null, 'negative denominator -> null');
  assert.equal(scorePercent(1, NaN), null, 'NaN denominator -> null');
  assert.equal(scorePercent(NaN, 10), null, 'NaN numerator -> null');
  assert.equal(scorePercent(2, 3), 67, 'rounding 2/3 -> 67');
  assert.equal(scorePercent(1, 3), 33, 'rounding 1/3 -> 33');
  assert.equal(scorePercent(20, 10), 100, 'correct > total clamps to 100');
  assert.equal(scorePercent(-4, 10), 0, 'negative correct clamps to 0');

  const empty = buildScore(0, 0);
  assert.equal(empty.pct, null);
  assert.equal(empty.grade, null);
  assert.equal(empty.correct, 0);
  assert.equal(empty.total, 0);

  const full = buildScore(8, 10);
  assert.equal(full.pct, 80);
  assert.equal(full.grade, 'A');
  assert.equal(full.correct, 8);
  assert.equal(full.total, 10);
});

// ── isBetterRecord ───────────────────────────────────────────────────────
section('isBetterRecord', () => {
  const rec = (pct, total, correct, completedAt) => ({ pct, total, correct, completedAt });

  assert.equal(isBetterRecord(rec(90, 10, 9, 100), rec(80, 10, 8, 50)), true, 'higher pct wins');
  assert.equal(isBetterRecord(rec(80, 10, 8, 50), rec(90, 10, 9, 100)), false, 'lower pct loses');

  assert.equal(isBetterRecord(rec(80, 20, 16, 100), rec(80, 10, 8, 50)), true, 'tie-pct larger total wins');
  assert.equal(isBetterRecord(rec(80, 10, 8, 50), rec(80, 20, 16, 100)), false, 'tie-pct smaller total loses');

  assert.equal(isBetterRecord(rec(80, 10, 8, 200), rec(80, 10, 8, 100)), true, 'full tie, newer completedAt -> true');
  assert.equal(isBetterRecord(rec(80, 10, 8, 100), rec(80, 10, 8, 100)), true, 'full tie, equal completedAt -> true');
  assert.equal(isBetterRecord(rec(80, 10, 8, 50), rec(80, 10, 8, 100)), false, 'full tie, older completedAt -> false');

  assert.equal(isBetterRecord(rec(NaN, 10, 8, 1), rec(50, 10, 5, 1)), false, 'malformed candidate rejected');
  assert.equal(isBetterRecord(rec(101, 10, 8, 1), null), false, 'out-of-range pct rejected');
  assert.equal(isBetterRecord(rec(50, 10, 11, 1), null), false, 'correct > total rejected');
  assert.equal(isBetterRecord(rec(50, 0, 0, 1), null), false, 'total <= 0 rejected');

  assert.equal(isBetterRecord(rec(50, 10, 5, 1), null), true, 'valid candidate + null existing -> true');
  assert.equal(isBetterRecord(rec(50, 10, 5, 1), { garbage: true }), true, 'valid candidate + malformed existing -> true');
  assert.equal(isBetterRecord(rec(50, 10, 5, 1), undefined), true, 'valid candidate + missing existing -> true');
});

// ── sanitizeRecords ──────────────────────────────────────────────────────
section('sanitizeRecords', () => {
  assert.deepEqual(sanitizeRecords(null), { version: 1, quiz: {}, exam: {} }, 'null -> empty shape');
  assert.deepEqual(sanitizeRecords('garbage'), { version: 1, quiz: {}, exam: {} }, 'non-object -> empty shape');
  assert.deepEqual(sanitizeRecords(42), { version: 1, quiz: {}, exam: {} }, 'number -> empty shape');

  const mixed = sanitizeRecords({
    quiz: {
      good: { pct: 80, correct: 8, total: 10, grade: 'A', completedAt: 1000 },
      bad_total: { pct: 80, correct: 8, total: 0, grade: 'A', completedAt: 1000 },
      bad_range: { pct: 150, correct: 8, total: 10, grade: 'A', completedAt: 1000 },
      not_object: 'nope',
    },
    exam: {
      bible: {
        'mcq:full': { pct: 90, correct: 90, total: 100, grade: 'S', completedAt: 500 },
        'mixed:quick': { pct: -1, correct: 0, total: 10, grade: 'D', completedAt: 500 },
      },
      theology: 'not an object',
    },
  });
  assert.ok(mixed.quiz.good, 'valid quiz record survives');
  assert.equal(mixed.quiz.bad_total, undefined, 'zero-total quiz record dropped');
  assert.equal(mixed.quiz.bad_range, undefined, 'out-of-range pct quiz record dropped');
  assert.equal(mixed.quiz.not_object, undefined, 'non-object quiz record dropped');
  assert.ok(mixed.exam.bible['mcq:full'], 'valid nested exam variant survives');
  assert.equal(mixed.exam.bible['mixed:quick'], undefined, 'invalid nested exam variant dropped');
  assert.equal(mixed.exam.theology, undefined, 'non-object exam section dropped');

  const wrongGrade = sanitizeRecords({
    quiz: { x: { pct: 62, correct: 62, total: 100, grade: 'Z', completedAt: 1 } },
  });
  assert.equal(wrongGrade.quiz.x.grade, 'C', 'invalid grade letter re-derived from pct');

  const missingCompletedAt = sanitizeRecords({
    quiz: { x: { pct: 62, correct: 62, total: 100, grade: 'C' } },
  });
  assert.equal(missingCompletedAt.quiz.x.completedAt, 0, 'missing completedAt defaults to 0');
});

// ── updateQuizRecord / updateExamRecord ──────────────────────────────────
section('updateQuizRecord', () => {
  const empty = () => ({ version: 1, quiz: {}, exam: {} });

  // Improvement installs, isNewRecord true.
  let records = empty();
  let out = updateQuizRecord(records, 'bible', { pct: 70, correct: 7, total: 10, completedAt: 100, bestStreak: 3 });
  assert.equal(out.isNewRecord, true);
  assert.equal(out.previous, null);
  assert.equal(records.quiz.bible.pct, 70);
  assert.equal(records.quiz.bible.bestStreak, 3, 'bestStreak carried on quiz records');

  out = updateQuizRecord(records, 'bible', { pct: 90, correct: 9, total: 10, completedAt: 200, bestStreak: 5 });
  assert.equal(out.isNewRecord, true, 'strict pct improvement -> new record');
  assert.equal(out.previous.pct, 70);
  assert.equal(records.quiz.bible.pct, 90);
  assert.equal(records.quiz.bible.bestStreak, 5);

  // Equal pct+total refresh: timestamp updates, isNewRecord false.
  out = updateQuizRecord(records, 'bible', { pct: 90, correct: 9, total: 10, completedAt: 999 });
  assert.equal(out.isNewRecord, false, 'pure tie refresh is not a new record');
  assert.equal(records.quiz.bible.completedAt, 999, 'timestamp refreshed on tie');
  assert.equal(records.quiz.bible.pct, 90);

  // Worse result: untouched, false.
  out = updateQuizRecord(records, 'bible', { pct: 50, correct: 5, total: 10, completedAt: 5000 });
  assert.equal(out.isNewRecord, false);
  assert.equal(records.quiz.bible.pct, 90, 'worse result does not overwrite');
  assert.equal(records.quiz.bible.completedAt, 999, 'worse result does not touch timestamp');

  // Malformed result: untouched, false.
  out = updateQuizRecord(records, 'bible', { pct: NaN, correct: 1, total: 10 });
  assert.equal(out.isNewRecord, false);
  assert.equal(records.quiz.bible.pct, 90, 'malformed result does not overwrite');
});

section('updateExamRecord', () => {
  const records = { version: 1, quiz: {}, exam: {} };
  let out = updateExamRecord(records, 'bco', 'tf:full', { pct: 60, correct: 30, total: 50, completedAt: 1 });
  assert.equal(out.isNewRecord, true);
  assert.equal(records.exam.bco['tf:full'].pct, 60);

  out = updateExamRecord(records, 'bco', 'tf:full', { pct: 60, correct: 30, total: 50, completedAt: 2 });
  assert.equal(out.isNewRecord, false, 'exact tie refresh is not a new record');
  assert.equal(records.exam.bco['tf:full'].completedAt, 2);

  // Different variant key on the same section is independent.
  out = updateExamRecord(records, 'bco', 'mixed:quick', { pct: 40, correct: 4, total: 10, completedAt: 1 });
  assert.equal(out.isNewRecord, true);
  assert.equal(records.exam.bco['tf:full'].pct, 60, 'other variant untouched');
  assert.equal(records.exam.bco['mixed:quick'].pct, 40);
});

console.log(`\n${sections} section(s) passed.`);
