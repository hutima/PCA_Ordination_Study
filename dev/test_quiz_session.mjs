// Unit tests for the finite Quiz-run session layer. Run: node dev/test_quiz_session.mjs
import assert from 'node:assert/strict';
import { DATA } from '../js/app/store.js';
import * as quizSession from '../js/app/quizSession.js';

let sections = 0;
function section(name, fn) {
  fn();
  sections++;
  console.log(`OK  ${name}`);
}

// Fake subjects for subject-mapping tests. DATA falls back to
// { subjects: [], sets: {} } under node (no window) — push into it directly.
DATA.subjects.length = 0;
DATA.subjects.push(
  { id: 'bible', label: 'Bible Content', setKeys: ['bible-set-1'] },
  { id: 'theology', label: 'Theology', setKeys: ['theo-set-1'] },
);

const q = (correctIndex, choices = ['a', 'b', 'c', 'd']) => ({ prompt: null, choices, correctIndex });

// Auto-style cards (real set key, mapped via DATA.subjects[].setKeys).
const cardB1 = { id: 'b1', q: 'Bible Q1', _setKey: 'bible-set-1', _setLabel: 'Bible Content' };
const cardB2 = { id: 'b2', q: 'Bible Q2', _setKey: 'bible-set-1', _setLabel: 'Bible Content' };
// Authored bank card ('quiz:<subjectId>' key).
const cardT1 = { id: 't1', q: 'Theology Q1', _setKey: 'quiz:theology', _setLabel: 'Theology' };
// Authored bank card whose subject id isn't registered — falls back to the
// set key itself + the card's own label.
const cardX1 = { id: 'x1', q: 'Mystery Q1', _setKey: 'quiz:ghost', _setLabel: 'Ghost Subject' };

function makeSpy(result = { isNewRecord: true, previous: null }) {
  const calls = [];
  const fn = (subjectId, payload) => { calls.push({ subjectId, payload }); return result; };
  fn.calls = calls;
  return fn;
}

// ── startRun / dedupe / empty ────────────────────────────────────────────
section('startRun dedupes by id; empty/no cards clears the run', () => {
  quizSession.startRun([cardB1, cardB1, cardB2]);
  assert.equal(quizSession.hasRun(), true);
  assert.equal(quizSession.summary().total, 2, 'duplicate card deduped by id');

  quizSession.startRun([]);
  assert.equal(quizSession.hasRun(), false, 'empty card list clears the run');
  assert.equal(quizSession.summary().total, 0);

  quizSession.startRun(null);
  assert.equal(quizSession.hasRun(), false, 'non-array clears the run');
});

// ── subject mapping ──────────────────────────────────────────────────────
section('subject mapping: real set key vs authored quiz:<id> vs fallback', () => {
  quizSession.startRun([cardB1, cardT1, cardX1]);
  quizSession.recordAnswer(cardB1, q(0), true);
  quizSession.recordAnswer(cardT1, q(0), true);
  quizSession.recordAnswer(cardX1, q(0), true);
  const s = quizSession.summary();
  const byId = Object.fromEntries(s.bySubject.map(b => [b.subjectId, b]));
  assert.ok(byId.bible, 'real set key maps to its owning subject (bible)');
  assert.equal(byId.bible.label, 'Bible Content');
  assert.ok(byId.theology, "'quiz:theology' maps to subject id 'theology'");
  assert.equal(byId.theology.label, 'Theology');
  assert.ok(byId.ghost, "'quiz:ghost' with no matching subject falls back to the raw id");
  assert.equal(byId.ghost.label, 'Ghost Subject', 'unmatched authored subject falls back to the card label');
});

// ── first-answer-only scoring (Flip-deck recycle can't rewrite the score) ─
section('recordAnswer: first attempt counts, repeat is a no-op', () => {
  quizSession.startRun([cardB1, cardB2]);
  let res = quizSession.recordAnswer(cardB1, q(0), true);
  assert.equal(res.counted, true);
  assert.equal(quizSession.answeredCount(), 1);
  assert.equal(quizSession.summary().correct, 1);

  // Same card re-answered (e.g. a Flip-deck recycle revisits it) — ignored,
  // even though this "second attempt" is wrong.
  res = quizSession.recordAnswer(cardB1, q(0), false);
  assert.equal(res.counted, false, 'repeat answer on the same card is a no-op');
  assert.equal(quizSession.answeredCount(), 1, 'answered count unchanged');
  assert.equal(quizSession.summary().correct, 1, 'score unchanged by the repeat');

  // Unknown card (not in the snapshot) is also a no-op.
  res = quizSession.recordAnswer({ id: 'not-in-run' }, q(0), true);
  assert.equal(res.counted, false, 'a card outside the snapshot is ignored');
});

// ── completion ───────────────────────────────────────────────────────────
section('isComplete() true only once every snapshot id is answered', () => {
  quizSession.startRun([cardB1, cardB2]);
  assert.equal(quizSession.isComplete(), false);
  quizSession.recordAnswer(cardB1, q(0), true);
  assert.equal(quizSession.isComplete(), false, 'one of two answered');
  const res = quizSession.recordAnswer(cardB2, q(0), true);
  assert.equal(quizSession.isComplete(), true);
  assert.equal(res.complete, true, 'recordAnswer reports completion in its return value');
});

// ── streak / bestStreak ──────────────────────────────────────────────────
section('streak and bestStreak track correct runs, reset on a miss', () => {
  const cards = [cardB1, cardB2, cardT1, cardX1];
  quizSession.startRun(cards);
  quizSession.recordAnswer(cardB1, q(0), true);
  assert.equal(quizSession.summary().streak, 1);
  quizSession.recordAnswer(cardB2, q(0), true);
  assert.equal(quizSession.summary().streak, 2);
  assert.equal(quizSession.summary().bestStreak, 2);
  quizSession.recordAnswer(cardT1, q(0), false);
  assert.equal(quizSession.summary().streak, 0, 'a miss resets the current streak');
  assert.equal(quizSession.summary().bestStreak, 2, 'bestStreak keeps the earlier high point');
  quizSession.recordAnswer(cardX1, q(0), true);
  assert.equal(quizSession.summary().streak, 1);
  assert.equal(quizSession.summary().bestStreak, 2, 'a single correct answer does not beat the earlier streak of 2');
});

// ── missed capture ───────────────────────────────────────────────────────
section('a wrong answer is captured in missed with prompt + correct text', () => {
  quizSession.startRun([cardB1, cardB2]);
  const quiz = q(2, ['wrong0', 'wrong1', 'right', 'wrong3']);
  quizSession.recordAnswer(cardB1, quiz, false);
  const s = quizSession.summary();
  assert.equal(s.missed.length, 1);
  assert.equal(s.missed[0].id, 'b1');
  assert.equal(s.missed[0].prompt, 'Bible Q1');
  assert.equal(s.missed[0].correctText, 'right');
});

// ── bySubject totals sum to the overall (score denominator = answered) ───
section('summary().score uses ANSWERED as the denominator; bySubject sums to overall', () => {
  quizSession.startRun([cardB1, cardB2, cardT1]);
  quizSession.recordAnswer(cardB1, q(0), true);
  quizSession.recordAnswer(cardB2, q(0), false);
  quizSession.recordAnswer(cardT1, q(0), true);
  const s = quizSession.summary();
  assert.equal(s.total, 3);
  assert.equal(s.answered, 3);
  assert.equal(s.correct, 2);
  assert.equal(s.score.total, 3, 'score denominator is answered, not total (all answered here)');
  const sumAnswered = s.bySubject.reduce((n, b) => n + b.answered, 0);
  const sumCorrect = s.bySubject.reduce((n, b) => n + b.correct, 0);
  assert.equal(sumAnswered, s.answered, 'bySubject answered sums to the overall answered');
  assert.equal(sumCorrect, s.correct, 'bySubject correct sums to the overall correct');
});

// ── early end: finalize applies no records ───────────────────────────────
section('early-ended (incomplete) run: finalize applies no records', () => {
  quizSession.startRun([cardB1, cardB2, cardT1]);
  quizSession.recordAnswer(cardB1, q(0), true); // only 1 of 3 answered
  quizSession.endEarly();
  const spy = makeSpy();
  const fin = quizSession.finalize(spy);
  assert.equal(fin.applied, false);
  assert.equal(spy.calls.length, 0, 'no record calls for an incomplete run');
  assert.equal(fin.anyNewRecord, false);
  assert.equal(quizSession.summary().endedEarly, true);
});

// ── practice run: finalize applies no records ────────────────────────────
section('practice run (Review missed): finalize applies no records even complete', () => {
  quizSession.startRun([cardB1, cardB2], { practice: true });
  quizSession.recordAnswer(cardB1, q(0), true);
  quizSession.recordAnswer(cardB2, q(0), true);
  assert.equal(quizSession.isComplete(), true);
  const spy = makeSpy();
  const fin = quizSession.finalize(spy);
  assert.equal(fin.applied, false);
  assert.equal(spy.calls.length, 0, 'a practice run never writes a high-score record');
  assert.equal(quizSession.summary().practice, true);
});

// ── complete, non-practice run: finalize applies per-subject records ─────
section('complete run: finalize applies one record per subject via the injected recordFn', () => {
  quizSession.startRun([cardB1, cardB2, cardT1]);
  quizSession.recordAnswer(cardB1, q(0), true);
  quizSession.recordAnswer(cardB2, q(0), false);
  quizSession.recordAnswer(cardT1, q(0), true);
  const spy = makeSpy({ isNewRecord: true, previous: { pct: 50, correct: 1, total: 2 } });
  const fin = quizSession.finalize(spy);
  assert.equal(fin.applied, true);
  assert.equal(spy.calls.length, 2, 'one recordFn call per distinct subject (bible, theology)');
  const byId = Object.fromEntries(spy.calls.map(c => [c.subjectId, c.payload]));
  assert.equal(byId.bible.correct, 1);
  assert.equal(byId.bible.total, 2);
  assert.equal(byId.theology.correct, 1);
  assert.equal(byId.theology.total, 1);
  assert.equal(fin.anyNewRecord, true);
  assert.ok(fin.bySubject.bible, 'per-subject outcome recorded under its subject id');
  assert.ok(fin.bySubject.theology);
});

// ── finalize idempotence ─────────────────────────────────────────────────
section('finalize() is idempotent: the second call returns the cached outcome, spy not re-invoked', () => {
  quizSession.startRun([cardB1]);
  quizSession.recordAnswer(cardB1, q(0), true);
  const spy1 = makeSpy();
  const outcome1 = quizSession.finalize(spy1);
  assert.equal(spy1.calls.length, 1);

  const spy2 = makeSpy();
  const outcome2 = quizSession.finalize(spy2);
  assert.equal(spy2.calls.length, 0, 'second finalize() call must not invoke a new recordFn');
  assert.equal(outcome2, outcome1, 'second call returns the exact cached outcome object');
});

// ── missedCards() resolves to the actual snapshot card objects ───────────
section('missedCards() returns the underlying card objects for missed entries', () => {
  quizSession.startRun([cardB1, cardB2, cardT1]);
  quizSession.recordAnswer(cardB1, q(0), true);
  quizSession.recordAnswer(cardB2, q(0), false);
  quizSession.recordAnswer(cardT1, q(0), false);
  const missed = quizSession.missedCards();
  assert.equal(missed.length, 2);
  assert.ok(missed.includes(cardB2));
  assert.ok(missed.includes(cardT1));
  assert.ok(!missed.includes(cardB1));
});

// ── early end freezes the run ────────────────────────────────────────────
section('endEarly() freezes the tally: later answers never complete the run or write records', () => {
  quizSession.startRun([cardB1, cardB2, cardT1]);
  quizSession.recordAnswer(cardB1, q(0), true);
  quizSession.endEarly();
  assert.equal(quizSession.isOver(), true, 'ended-early run is over');
  assert.equal(quizSession.isComplete(), false);

  // Answers after the early end are study-only — not counted.
  const r = quizSession.recordAnswer(cardB2, q(0), true);
  assert.equal(r.counted, false, 'post-end answer must not count');
  quizSession.recordAnswer(cardT1, q(0), true);
  const s = quizSession.summary();
  assert.equal(s.answered, 1, 'tally frozen at the early end');
  assert.equal(s.complete, false, 'run can never complete after an early end');
  assert.equal(s.endedEarly, true);

  const spy = makeSpy();
  const outcome = quizSession.finalize(spy);
  assert.equal(outcome.applied, false, 'no records for an ended-early run');
  assert.equal(spy.calls.length, 0);
});

console.log(`\n${sections} section(s) passed.`);
