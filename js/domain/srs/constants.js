// SRS scheduling constants — aligned with the canonical Duff scheduler.

// An N-day interval is due in 24N - 2 hours. The first day is 22h and each
// additional day is a full 24h, preventing reviews from drifting later daily.
export const SRS_DAY_MS = 22 * 60 * 60 * 1000;
export const SRS_FULL_DAY_MS = 24 * 60 * 60 * 1000;
export const SRS_AGAIN_MS = 5 * 60 * 1000;
export const SRS_UNCERTAIN_MIN_MS = 2 * 60 * 60 * 1000;
export const SRS_UNCERTAIN_MAX_MS = 7 * 24 * 60 * 60 * 1000; // legacy-compatible export
export const SRS_UNCERTAIN_CAP_MS = SRS_UNCERTAIN_MIN_MS;     // legacy alias
export const SRS_UNSPACED_RECOVERY_MS = 60 * 60 * 1000;
export const SRS_MAX_INTERVAL_DAYS = 14;

// Lapse / relearn ladder. Hard remains in-session; Uncertain gets a 2h
// confirming review. Established spacing resumes at half the pre-lapse value.
export const SRS_RELEARN_STEP_DAYS = 1;
export const SRS_HARD_RELEARN_STEPS = 2;

// Leech is enabled only for the relaxed / continuous-review cadence.
export const LEECH_LAPSE_THRESHOLD = 4;
export const LEECH_UNPIN_STREAK = 3;
export const LEECH_DRILL_DAYS = 1;

export const SRS_CADENCE_PRESETS = {
  intensive: {
    id: 'intensive',
    label: '2-month intensive',
    maxIntervalDays: SRS_MAX_INTERVAL_DAYS,
    lapseResumeCapDays: 7,
    easyCurve: { high: 2.5, midBase: 1.5, midDiv: 40, lowBase: 1.2, lowDiv: 100 },
    leechEnabled: false,
    useCardDifficulty: false,
  },
  relaxed: {
    id: 'relaxed',
    label: '8-month / continuous review',
    maxIntervalDays: 60,
    maxEasyStepDays: 14,
    lapseResumeCapDays: 14,
    easyCurve: { high: 2.0, midBase: 1.5, midDiv: 40, lowBase: 1.3, lowDiv: 40 },
    leechEnabled: true,
    useCardDifficulty: true,
    difficultyNeutralEase: 2.3,
  },
};
export const DEFAULT_SRS_CADENCE = 'intensive';
export function getCadencePreset(id) {
  return SRS_CADENCE_PRESETS[id] || SRS_CADENCE_PRESETS[DEFAULT_SRS_CADENCE];
}

export const SRS_NEAR_WINDOW_MS = 30 * 60 * 1000;
export const SRS_CYCLE_ADVANCE_MS = 60 * 60 * 1000;
export const SESSION_IDLE_RESET_MS = 5 * 60 * 60 * 1000;
