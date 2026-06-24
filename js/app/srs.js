// Applies a self-check / quiz outcome to a card's SRS progress, then persists
// and logs the review for the activity heatmap. Wraps the pure scheduler in
// domain/srs/* with the app's store.

import { SRS_AGAIN_MS } from '../domain/srs/constants.js';
import {
  setProgressDelay, getUncertainDelayMs, getNextEasyIntervalDays, msFromDays,
} from '../domain/srs/scheduler.js';
import { recordConfidenceSample } from '../domain/srs/confidence.js';
import { state, getProgress, saveProgress, recordActivity } from './store.js';

export function applyOutcome(card, outcome) {
  // Unspaced mode: no SRS writes — the rep is logged for the streak/heatmap
  // only. Deck shaping (retire/recycle) is handled by the controller.
  if (!state.spacedOn) { recordActivity(); return; }
  const p = getProgress(card.id);
  const now = Date.now();
  recordConfidenceSample(p, outcome);
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
