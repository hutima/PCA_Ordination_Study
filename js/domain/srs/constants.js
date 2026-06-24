// SRS scheduling constants

export const SRS_DAY_MS = 20 * 60 * 60 * 1000;
export const SRS_AGAIN_MS = 5 * 60 * 1000;
export const SRS_UNCERTAIN_MIN_MS = 2 * 60 * 60 * 1000;    // 2h floor for uncertain (spaced)
export const SRS_UNCERTAIN_MAX_MS = 7 * 24 * 60 * 60 * 1000; // 1-week ceiling for uncertain cards (scaled by certainty)
export const SRS_UNCERTAIN_CAP_MS = SRS_UNCERTAIN_MIN_MS;  // legacy alias
// Unspaced recovery delay is decoupled from the spaced uncertain floor — bumping
// the spaced floor (to give Again's middle-dump behaviour room) shouldn't slow
// the unspaced flip-deck cycle down.
export const SRS_UNSPACED_RECOVERY_MS = 60 * 60 * 1000;    // 1h
// Stabilization rule (in scheduler.js): "easy" caps at 1 day until the card
// has 5+ recent flips AND ≥50% confidence. Then confidence-scaled growth
// ramps 1 → 3 → 8 → 14 at top confidence rather than jumping to the cap.
export const SRS_MAX_INTERVAL_DAYS = 14;
export const SRS_NEAR_WINDOW_MS = 30 * 60 * 1000;
export const SRS_CYCLE_ADVANCE_MS = 60 * 60 * 1000;
// Idle gap that ends a study session. Used by spaced-mode buildStudyDeck to
// decide "fresh start" (middle → active dump + reshuffle), and by the
// persistence layer to decide whether to restore the saved active/middle
// membership across reloads. Resets on any study interaction (vocab,
// grammar, or reader — anything that fires noteStudyInteraction).
export const SESSION_IDLE_RESET_MS = 5 * 60 * 60 * 1000;
