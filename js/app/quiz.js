// MCQ eligibility, generation, and the quiz deck.
//
// A card is quiz-eligible if it carries an authored `quiz` block, or its answer
// is short enough to be a single option and its sub-deck has enough short-answer
// siblings to draw distractors from. Auto-generated distractors are chosen to be
// length-balanced with the correct answer so length never gives it away.

import { DATA } from './store.js';
import {
  cardsForKeys, effectiveSetKeys, selectedSubjectIds, subjectLabel, shuffle,
} from './content.js';

export function isShortAnswer(card) {
  const a = (card.a || '').trim();
  return !!a && !a.includes('\n') && a.length <= 80 && !a.includes('|') && !a.includes('**');
}

export function shortSiblings(setKey, exclude) {
  const set = DATA.sets[setKey];
  if (!set) return [];
  const seen = new Set([exclude]);
  const out = [];
  for (const c of set.cards) {
    const a = (c.a || '').trim();
    if (isShortAnswer(c) && !seen.has(a)) { seen.add(a); out.push(a); }
  }
  return out;
}

// Per-card authored MCQ overlay (window.PCA_CARD_QUIZ): card id →
// { q?, choices, answerIndex }. The overlay lives in js/data/quiz_cards/* —
// separate files, so the hand-authored MCQs survive a builder re-running one
// of the generated subject files. An inline `quiz` block on the card wins.
// The optional `q` lets an overlay pose a sharper question than the card's own
// (e.g. "Which best states the theme of Romans?" for an outline card).
export function cardQuiz(card) {
  if (card.quiz && Array.isArray(card.quiz.choices)) return card.quiz;
  const bank = (typeof window !== 'undefined' && window.PCA_CARD_QUIZ) || {};
  const cq = bank[card.id];
  return (cq && Array.isArray(cq.choices)) ? cq : null;
}

export function quizEligible(card) {
  const cq = cardQuiz(card);
  if (cq && cq.choices.length >= 2) return true;
  if (!isShortAnswer(card)) return false;
  return shortSiblings(card._setKey, card.a.trim()).length >= 3;
}

// Choose distractors whose lengths sit closest to the correct answer's, then
// randomize among that near-length pool — so the correct option is not the
// conspicuously longest/shortest choice.
function pickBalancedDistractors(correct, pool, n = 3) {
  if (pool.length <= n) return shuffle(pool.slice());
  const byClosest = pool.slice().sort(
    (a, b) => Math.abs(a.length - correct.length) - Math.abs(b.length - correct.length));
  const window = byClosest.slice(0, Math.min(pool.length, n * 2));
  return shuffle(window).slice(0, n);
}

export function buildQuiz(card) {
  const cq = cardQuiz(card);
  if (cq) {
    return { prompt: cq.q || card.q, choices: cq.choices.slice(), correctIndex: cq.answerIndex, picked: -1 };
  }
  const correct = card.a.trim();
  const distractors = pickBalancedDistractors(correct, shortSiblings(card._setKey, correct), 3);
  const choices = shuffle([correct, ...distractors]);
  return { prompt: card.q, choices, correctIndex: choices.indexOf(correct), picked: -1 };
}

// Quiz deck = hand-authored MCQs (window.PCA_QUIZ) for the selected subjects,
// plus auto-generated MCQs from short-answer review cards in the selection.
export function quizDeckCards() {
  const keys = effectiveSetKeys();
  if (!keys.length) return []; // no subjects selected → nothing to quiz
  const subj = selectedSubjectIds();
  const bank = (typeof window !== 'undefined' && window.PCA_QUIZ) || [];
  const authored = bank
    .filter(q => !subj || subj.has(q.subject))
    .map(q => ({
      id: q.id, q: q.q, refs: q.refs || [],
      _setKey: 'quiz:' + q.subject, _setLabel: subjectLabel(q.subject),
      quiz: { choices: q.choices, answerIndex: q.answerIndex },
    }));
  const auto = cardsForKeys(keys).filter(quizEligible);
  return authored.concat(auto);
}
