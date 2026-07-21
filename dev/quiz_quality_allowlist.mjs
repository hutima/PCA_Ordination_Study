// Documented exceptions to the quiz-quality regression gates in
// dev/test_quiz_quality.mjs. Consumed by that test file AND pointed to by
// docs/restart/quiz-quality-rubric.md's "Allowlist" section.
//
// Format: each category maps a flagged question `id` -> a one-line reason
// string. An id listed here is exempted from THAT flag category only (e.g.
// an id under `marginGiveaway` still must clear `commaTell` and
// `extremeImbalance` unless also listed there). Every entry requires both
// the id and a real, reviewed one-line reason — never add an id here to
// silence a genuine content problem; fix the content instead.
//
// The gate has two directions:
//   - any id flagged by dev/audit_quiz_quality.mjs that is NOT listed here
//     fails the build.
//   - any id listed here that the audit no longer flags is STALE — the gate
//     warns (does not fail) so the entry can be pruned next time someone
//     touches this file.
//
// CURRENTLY EMPTY: as of 2026-07-21 the audit reports 0 marginGiveaway,
// 0 commaTell, 0 extremeImbalance across every bank and overlay file, so no
// exceptions are needed. Add an entry only when a genuine, reviewed
// exception exists (e.g. an irreducible fixed-length/fixed-formula correct
// answer that legitimately can't be shortened or reworded).
export const ALLOWLIST = {
  marginGiveaway: {
    // id: 'one-line reason',
  },
  commaTell: {
    // id: 'one-line reason',
  },
  extremeImbalance: {
    // id: 'one-line reason',
  },
};
