# Quiz quality rubric (for content-rewrite agents)

Applies to `js/data/quiz/bco.js` (MCQ), `js/data/quiz/bco_tf.js` (True/False),
and `js/data/quiz_cards/*.js` (per-card MCQ overlay), and any other
hand-authored quiz bank in this repo.

## Hard constraints (never violate)

- **BCO stays paraphrased.** No extended/verbatim BCO quotations anywhere —
  copyright. Short wording cues only, never multi-word lifts.
- **IDs are stable.** Never rename or renumber an existing `id`. Add new
  entries with new ids; never repurpose an old id for different content.
- **`answerIndex` must match the correct choice**, after any reordering.
  Re-check it by hand every time choices are edited or shuffled.
- **Accuracy beats difficulty.** A clean, slightly-easy question beats a hard
  one that is polity- or theology-questionable.
- **Escalate, don't guess.** If a polity or theological point is genuinely
  disputed or unclear from the source material, flag it for human review
  instead of inventing an answer.
- **No filler distractors.** If a distractor can't be made substantively
  plausible, rewrite the stem rather than padding it with throwaway words.

## MCQ standards (bco.js, quiz_cards/*.js)

- Exactly one unambiguously best answer — no two choices both defensible.
- 3 distractors drawn from the **same conceptual category** as the answer
  (see derivation sources below), not random unrelated facts.
- **Parallel grammatical form** across all 4 choices (same tense, part of
  speech, sentence-fragment shape).
- **Comparable specificity and length** — no choice noticeably longer,
  shorter, more hedged, or more precise than the others (the giveaway check
  in `dev/validate.mjs` catches egregious gaps; ±30% is the target).
- No giveaway via punctuation, capitalization, or terminology register (e.g.
  don't make the correct answer the only one using the BCO's own vocabulary).
- No absurd/joke distractors — every option should be something an
  under-prepared candidate could plausibly pick. Rare justified exceptions
  (e.g. one silly option in a deliberately easy warm-up card) belong in the
  allowlist below, not scattered unexplained.
- **List questions** ("name the three...", "which are the two..."): every
  choice has the same multi-part structure (same item count, same joining
  style) — never pit a 3-item list against a single term.
- **Definition questions** ("what is X"): all four choices share parallel
  syntax (e.g. all start "X is..." / all are noun phrases of similar shape).

### Distractor derivation sources (pick from these, don't invent random wrong facts)

- Adjacent/neighboring BCO provisions (right chapter, wrong section)
- Confused church courts (Session vs. Presbytery vs. GA vs. the nonexistent
  Synod)
- Similar officer duties (TE vs. RE vs. deacon)
- Nearby thresholds/deadlines (10 vs. 30 vs. 60 days; simple majority vs.
  2/3 vs. 3/4)
- Related but distinct theological formulations (e.g. supra- vs.
  infralapsarian, traducianism vs. creationism)
- Wrong-but-associated persons/events/dates
- Reversed procedural order (steps of discipline, order of the BCO's parts)
- Right concept, wrong court/office/document
- One-element substitution, omission, or addition in a list answer

## True/False standards (bco_tf.js)

- Bank should run **~45-55% True** overall — check the running tally, not
  just the file section you're editing.
- **No run of the same answer longer than 4** in file order, and no visible
  alternating (T,F,T,F,...) pattern — vary the rhythm.
- False statements must be **near misses**, not random falsehoods. Use:
  wrong court for a real power; TE/RE confusion; ordination vs. installation;
  wrong (but real) threshold/deadline; appeal vs. complaint vs. reference vs.
  overture vs. review-and-control confusion; right rule, wrong class of
  persons; advisory vs. binding confusion; reversed process order; claims
  that are narrowly over- or under-broad.
- Avoid absurd falses (e.g. "the GA meets on the moon") — they don't test
  polity knowledge.
- **Every false statement gets a concise `note`** explaining the actual rule.
- True statements get a `note` too when the distinction is subtle enough
  that a candidate could doubt it.
- Preserve or improve `refs` — never drop a citation, add one when missing.
- **Never distort doctrine or polity to hit the ~50% balance.** If the bank
  is running too True-heavy, write a new, honest near-miss false rather than
  flipping a true statement into an inaccurate one.

## Allowlist (documented length/shape exceptions)

When a question legitimately can't avoid a length or structural imbalance —
e.g. the correct answer is an irreducible formula, a fixed number, or a
named list that has no shorter paraphrase — it may deviate from the
comparable-length/parallel-form rule *only* if added to the shared
machine-readable allowlist consumed by the quality gate (kept with the audit
tooling in `dev/`), each entry: `id` + one-line reason. Do not silently
deform a distractor to force a length match instead.
