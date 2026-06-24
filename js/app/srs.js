// Applies a self-check / quiz outcome to a card's SRS progress, then persists
// and logs the review for the activity heatmap. Wraps the pure scheduler in
// domain/srs/* with the app's store.

import { SRS_AGAIN_MS } from '../domain/srs/constants.js';
import {
  setProgressDelay, getUncertainDelayMs, getNextEasyIntervalDays, msFromDays,
} from '../domain/srs/scheduler.js';
import { recordConfidenceSample, getConfidencePct, computeCardXpAward } from '../domain/srs/confidence.js';
import { state, getProgress, saveProgress, recordActivity, addXp } from './store.js';

export function applyOutcome(card, outcome) {
  // Unspaced mode: no SRS writes — the rep is logged for the streak/heatmap
  // (plus a little XP). Deck shaping (retire/recycle) is handled by the controller.
  if (!state.spacedOn) {
    addXp(computeCardXpAward(outcome, false, false));
    recordActivity();
    return;
  }
  const p = getProgress(card.id);
  const now = Date.now();
  const wasConfirmed = !!p.firstConfirmedAt;
  recordConfidenceSample(p, outcome);
  // First time the card crosses into "confirmed" (rolling confidence ≥ 70%):
  // stamp it so the gamification layer can count confirmations and award a
  // first-confirmation XP bonus.
  if (!p.firstConfirmedAt) {
    const pct = getConfidencePct(p);
    if (pct !== null && pct >= 70) p.firstConfirmedAt = now;
  }
  addXp(computeCardXpAward(outcome, !wasConfirmed && !!p.firstConfirmedAt, true));
  if (outcome === 'again') {
    setProgressDelay(p, SRS_AGAIN_MS, now);
    p.failCount = (p.failCount || 0) + 1;
  } else if (outcome === 'pass') {
    setProgressDelay(p, getUncertainDelayMs(p), now);
    p.passCount = (p.passCount || 0) + 1;
  } else { // easy
    const days = getNextEasyIntervalDays(p);
    p.lastEasyIntervalDays = days;
    setProgressDelay(p, msFromDays(days), now);
    p.passCount = (p.passCount || 0) + 1;
  }
  p.reps = (p.reps || 0) + 1;
  p.lastReviewedAt = now;
  saveProgress();
  recordActivity();
}

// Catechism-mode grading: a self-contained per-question progress signal for the
// Catechisms reader, kept independent of the global spaced/unspaced toggle (the
// mode is a straight read-through, not a scheduled deck). Records confidence, a
// confirmation stamp (rolling ≥70%), XP, and the activity rep — but no SRS
// dueAt scheduling. Keyed by a namespaced id (`cat:<cat>:<n>`) so it lives in
// the same progress store yet never mixes with the subject decks.
export function applyCatechismOutcome(id, outcome) {
  const p = getProgress(id);
  const now = Date.now();
  const wasConfirmed = !!p.firstConfirmedAt;
  recordConfidenceSample(p, outcome);
  if (!p.firstConfirmedAt) {
    const pct = getConfidencePct(p);
    if (pct !== null && pct >= 70) p.firstConfirmedAt = now;
  }
  if (outcome === 'easy') p.passCount = (p.passCount || 0) + 1;
  else if (outcome === 'again') p.failCount = (p.failCount || 0) + 1;
  p.reps = (p.reps || 0) + 1;
  p.lastReviewedAt = now;
  addXp(computeCardXpAward(outcome, !wasConfirmed && !!p.firstConfirmedAt, true));
  saveProgress();
  recordActivity();
}
