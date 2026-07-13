// Finite Quiz run session — module-local, never persisted (the run lives only
// as long as the current quiz deck). Tracks which cards have been answered
// (first attempt only — a Flip-deck recycle or revisit can never rewrite the
// score), the current/best streak, and missed questions; produces the summary
// + per-subject breakdown the results screen renders, and writes the run's
// outcome into the shared high-score record layer (scoreRecords.js) exactly
// once per completed, non-practice run.

import { DATA } from './store.js';
import { buildScore } from '../domain/scoring.js';
import { recordQuizResult } from './scoreRecords.js';

let currentRun = null;

// Resolve a quiz-deck card to the subject it should be scored under.
// Authored bank cards carry `_setKey = 'quiz:<subjectId>'`; auto-generated
// cards carry a real set key, scored under whichever subject owns that key.
function subjectFor(card) {
  const setKey = card._setKey || '';
  if (setKey.startsWith('quiz:')) {
    const subjectId = setKey.slice('quiz:'.length);
    const subj = DATA.subjects.find(s => s.id === subjectId);
    return { subjectId, subjectLabel: (subj && subj.label) || card._setLabel };
  }
  const subj = DATA.subjects.find(s => Array.isArray(s.setKeys) && s.setKeys.includes(setKey));
  if (subj) return { subjectId: subj.id, subjectLabel: subj.label };
  return { subjectId: setKey, subjectLabel: card._setLabel };
}

// Start (or clear) a scored run over `cards`. Dedupes by card.id; an
// empty/invalid card list clears the run entirely (hasRun() -> false).
// opts.practice marks a "Review missed"-style run whose outcome never writes
// a high-score record.
export function startRun(cards, opts = {}) {
  const list = Array.isArray(cards) ? cards : [];
  const seen = new Set();
  const snapshot = [];
  for (const card of list) {
    if (!card || card.id == null || seen.has(card.id)) continue;
    seen.add(card.id);
    const { subjectId, subjectLabel } = subjectFor(card);
    snapshot.push({ id: card.id, card, subjectId, subjectLabel });
  }
  if (!snapshot.length) { currentRun = null; return; }
  currentRun = {
    snapshot,
    answers: new Map(),  // card id -> boolean correct (first attempt only)
    streak: 0,
    bestStreak: 0,
    missed: [],          // [{ id, prompt, correctText }] in miss order
    practice: !!opts.practice,
    endedEarly: false,
    viewingResults: false,
    finalized: null,     // cached finalize() outcome, once computed
  };
}

export function hasRun() { return !!currentRun; }

export function answeredCount() { return currentRun ? currentRun.answers.size : 0; }

export function isComplete() {
  return !!currentRun && currentRun.snapshot.length > 0
    && currentRun.answers.size === currentRun.snapshot.length;
}

// Record the FIRST attempt at a card only — a Flip-deck recycle or a revisit
// that re-presents an already-answered card must never rewrite the score.
export function recordAnswer(card, quiz, correct) {
  if (!currentRun || !card) return { counted: false, complete: isComplete() };
  const entry = currentRun.snapshot.find(e => e.id === card.id);
  if (!entry || currentRun.answers.has(card.id)) return { counted: false, complete: isComplete() };
  currentRun.answers.set(card.id, !!correct);
  if (correct) {
    currentRun.streak += 1;
    if (currentRun.streak > currentRun.bestStreak) currentRun.bestStreak = currentRun.streak;
  } else {
    currentRun.streak = 0;
    currentRun.missed.push({
      id: card.id,
      prompt: (quiz && quiz.prompt) || card.q,
      correctText: (quiz && Array.isArray(quiz.choices)) ? quiz.choices[quiz.correctIndex] : '',
    });
  }
  return { counted: true, complete: isComplete() };
}

export function endEarly() { if (currentRun) currentRun.endedEarly = true; }
export function openResults() { if (currentRun) currentRun.viewingResults = true; }
export function closeResults() { if (currentRun) currentRun.viewingResults = false; }
export function viewingResults() { return !!(currentRun && currentRun.viewingResults); }

// The actual card objects behind the run's missed entries (snapshot order) —
// used to build a "Review missed" practice run.
export function missedCards() {
  if (!currentRun || !currentRun.missed.length) return [];
  const ids = new Set(currentRun.missed.map(m => m.id));
  return currentRun.snapshot.filter(e => ids.has(e.id)).map(e => e.card);
}

function emptySummary() {
  return {
    total: 0, answered: 0, correct: 0, wrong: 0, bestStreak: 0, streak: 0,
    score: buildScore(0, 0), bySubject: [], missed: [], complete: false,
    endedEarly: false, practice: false,
  };
}

// { total, answered, correct, wrong, bestStreak, streak, score, bySubject,
//   missed, complete, endedEarly, practice }. `score`'s denominator is
// ANSWERED (not total) so an early-ended run scores what was actually
// answered. `bySubject` lists only subjects with answered>0, in the order
// their first card was answered.
export function summary() {
  if (!currentRun) return emptySummary();
  const { snapshot, answers, missed, bestStreak, streak, practice, endedEarly } = currentRun;
  const total = snapshot.length;
  let correct = 0;
  const order = [];
  const bySubjectMap = new Map();
  for (const entry of snapshot) {
    if (!answers.has(entry.id)) continue;
    const isCorrect = answers.get(entry.id);
    if (isCorrect) correct++;
    let bucket = bySubjectMap.get(entry.subjectId);
    if (!bucket) {
      bucket = { subjectId: entry.subjectId, label: entry.subjectLabel, answered: 0, correct: 0 };
      bySubjectMap.set(entry.subjectId, bucket);
      order.push(entry.subjectId);
    }
    bucket.answered++;
    if (isCorrect) bucket.correct++;
  }
  const answered = answers.size;
  const bySubject = order.map(id => {
    const b = bySubjectMap.get(id);
    return { subjectId: b.subjectId, label: b.label, answered: b.answered, correct: b.correct, score: buildScore(b.correct, b.answered) };
  });
  return {
    total, answered, correct, wrong: answered - correct,
    bestStreak, streak,
    score: buildScore(correct, answered),
    bySubject,
    missed: missed.slice(),
    complete: isComplete(),
    endedEarly: !!endedEarly,
    practice: !!practice,
  };
}

// Write per-subject high-score records exactly once per completed,
// non-practice, non-empty run — once computed the outcome is cached on the
// run so re-renders of the results screen never re-apply records (or
// re-trigger a celebration keyed off a "new record").
export function finalize(recordFn = recordQuizResult) {
  if (!currentRun) return { applied: false, bySubject: {}, anyNewRecord: false, previous: null };
  if (currentRun.finalized) return currentRun.finalized;
  const s = summary();
  if (!s.complete || s.practice || s.answered === 0) {
    const outcome = { applied: false, bySubject: {}, anyNewRecord: false, previous: null };
    currentRun.finalized = outcome;
    return outcome;
  }
  const completedAt = Date.now();
  const bySubject = {};
  let anyNewRecord = false;
  for (const b of s.bySubject) {
    const result = recordFn(b.subjectId, {
      pct: b.score.pct, correct: b.correct, total: b.answered,
      grade: b.score.grade, bestStreak: currentRun.bestStreak, completedAt,
    });
    bySubject[b.subjectId] = result;
    if (result && result.isNewRecord) anyNewRecord = true;
  }
  const previous = s.bySubject.length === 1
    ? ((bySubject[s.bySubject[0].subjectId] && bySubject[s.bySubject[0].subjectId].previous) || null)
    : null;
  const outcome = { applied: true, bySubject, anyNewRecord, previous };
  currentRun.finalized = outcome;
  return outcome;
}
