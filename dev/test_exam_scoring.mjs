// Unit tests for the mock-exam answer-code tally (js/domain/examScore.js).
// Run: node dev/test_exam_scoring.mjs
import assert from 'node:assert/strict';
import { tallyCodes } from '../js/domain/examScore.js';
import { buildScore } from '../js/domain/scoring.js';

let sections = 0;
function section(name, fn) {
  fn();
  sections++;
  console.log(`OK  ${name}`);
}

// ── only 'c'/'w' affect the rank ─────────────────────────────────────────
section('self-graded codes excluded from rank', () => {
  const t = tallyCodes(['e', 'e', 'e']);
  assert.equal(t.autoAnswered, 0, 'no auto-graded codes present');
  assert.equal(t.autoCorrect, 0);
  assert.equal(t.autoWrong, 0);
  assert.equal(t.autoPct, null, 'autoPct null when nothing auto-graded, even with all "e"');
  assert.equal(t.autoGrade, null);
  assert.equal(t.selfCorrect, 3, 'e still counted as self-graded correct');
  assert.equal(t.answered, 3);
});

// ── empty input ───────────────────────────────────────────────────────────
section('no codes at all', () => {
  const t = tallyCodes([]);
  assert.equal(t.autoAnswered, 0);
  assert.equal(t.answered, 0);
  assert.equal(t.autoPct, null, 'never 0');
  assert.equal(t.autoGrade, null, 'never D');
});

// ── mixed tabulation buckets ──────────────────────────────────────────────
section('mixed tabulation counts each bucket', () => {
  const t = tallyCodes(['c', 'c', 'w', 'e', 'p', 'a']);
  assert.equal(t.autoAnswered, 3);
  assert.equal(t.autoCorrect, 2);
  assert.equal(t.autoWrong, 1);
  assert.equal(t.selfCorrect, 1);
  assert.equal(t.selfPartial, 1);
  assert.equal(t.selfIncorrect, 1);
  assert.equal(t.answered, 6);
  assert.equal(t.autoPct, 67, 'round(2/3 * 100)');
  assert.equal(t.autoGrade, 'C', '67% falls in the C band (60-69)');
});

// ── unknown codes ignored ─────────────────────────────────────────────────
section('unknown codes ignored', () => {
  const t = tallyCodes(['c', 'w', 'x', '?', '', 'z']);
  assert.equal(t.autoAnswered, 2, 'only c/w counted');
  assert.equal(t.autoCorrect, 1);
  assert.equal(t.autoWrong, 1);
  assert.equal(t.answered, 2, 'unknown codes contribute to no bucket, so not answered either');
  assert.equal(t.autoPct, 50);
});

// ── 4c/1w -> 80% -> A ─────────────────────────────────────────────────────
section('4c/1w tally -> 80% grade A', () => {
  const t = tallyCodes(['c', 'c', 'c', 'c', 'w']);
  assert.equal(t.autoAnswered, 5);
  assert.equal(t.autoCorrect, 4);
  assert.equal(t.autoPct, 80);
  assert.equal(t.autoGrade, 'A');
  // Cross-check against the shared scoring module directly.
  const score = buildScore(t.autoCorrect, t.autoAnswered);
  assert.equal(score.pct, 80);
  assert.equal(score.grade, 'A');
});

// ── boundary: 95% -> S ────────────────────────────────────────────────────
section('boundary 95% via codes -> S', () => {
  const codes = Array(19).fill('c').concat(['w']); // 19/20 = 95%
  const t = tallyCodes(codes);
  assert.equal(t.autoAnswered, 20);
  assert.equal(t.autoCorrect, 19);
  assert.equal(t.autoPct, 95);
  assert.equal(t.autoGrade, 'S');
});

console.log(`\n${sections} section(s) passed.`);
