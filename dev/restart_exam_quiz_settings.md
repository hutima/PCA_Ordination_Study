# Restart doc — mock exam structure + quiz/focus behavior

Working notes for the C&C-committee exam feedback task. Delete this file once
all sections are done and the PR is clean/mergeable.

## Branch / commit

- Branch: `claude/mock-exam-quiz-updates-16p6b8` (from `main` @ c899f5b)
- Current commit: (updated per section — see `git log`)

## Task summary

1. **Mock exam** → written-exam-style practice per the committee guide, secs 1–3:
   - Bible Knowledge: 100 questions, mixed MCQ + short-answer.
   - Theology: WCF/WSC/doctrines written practice — **no fixed count stated in
     the guide; do not fabricate one.**
   - BCO: ~50 True/False (five permanent committees, elements of worship,
     courts, PCA constitution, three parts of the BCO, discipline, censures).
   - Pools smaller than target ⇒ honest note ("Showing N available; target 100").
   - Do NOT commit the committee PDF.
2. **Quiz focus fixes**: Due first / Weak spots / In order / Flip deck must be
   intelligible under Quiz; show quiz-ready vs selected counts; flip-deck
   retire/recycle must work in Quiz.
3. Quiz must not appear to stop at "a set number" — explain eligibility.

## Section status

- [x] A — orientation + this doc
- [x] B — mock exam redesign (`js/app/exam.js`, `js/data/quiz/bco_tf.js`)
- [x] C — quiz/focus behavior (`quizOutcome` via ctx, flip-aware, deck meta)
- [ ] D — UX copy + version bump (v63 → v64) + validation

## Diagnosis (Section A findings)

- `EXAM_SIZE = 25` in `js/app/pca.js:37`; exam mode (`modes.js`) shuffles
  `quizDeckCards()`, slices to 25, renders MCQ only. Exam keyboard handling is
  special-cased inside `initKeyboard()` in `pca.js` (to be moved to
  `exam.onKey`).
- Quiz mode answers via `applyOutcome()` directly in `modes.js` (`quiz.answer`),
  bypassing `mark()`; so `focus === 'flip'` never retires/recycles under Quiz
  (buildDeck's flip branch filters `state.flipArchived`, but nothing adds to it
  from Quiz). Unspaced quiz already safe: `applyOutcome` logs XP/activity only
  when `state.spacedOn` is false.
- Quiz deck = authored `PCA_QUIZ` bank (per selected *subject*) + auto MCQ from
  quiz-eligible cards (authored `quiz` block, or short answer ≤80 chars with ≥3
  short siblings). Long self-check cards are excluded by design — the "fixed
  number of questions" complaint. Fix = honest deck meta + empty states, not
  force-MCQing long cards.
- Pool counts (node audit, all subjects):
  bible_content 173 cards / 79 auto-eligible / 81 short / 15 authored MCQ;
  bible_books 229 / 0; bco 262 cards / 6 auto / 30 authored MCQ (no T/F yet);
  theology 187, wcf 173, shorter_catechism 56, doctrines_proofs 10 (→ written
  prompt pool ≈ 426).
- `dev/validate.mjs` imports every `js/data/quiz/*.js` and validates the
  `PCA_QUIZ` global as MCQs (unique choices, giveaway heuristics) → the T/F
  bank must use a separate global (`PCA_QUIZ_TF`) and get its own validation
  block. `dev/audit.mjs` baseline = 8 flags (must not grow).
- Committee PDF (sections 1–3) verified: 100 mixed MCQ/short-answer Bible
  questions; Theology via WCF with SC focus + listed doctrines, no count given;
  ~50 T/F BCO questions; know 5 permanent committees, elements of worship,
  courts, constitution, three parts of BCO, disciplinary procedures, censures.

## Design decisions

- New `js/app/exam.js` — `createExamMode(ctx)` registered by `modes.js`
  (replaces the inline exam descriptor). Sections config: bible (target 100,
  subjects bible_content+bible_books, MCQ+short), theology (no target, sample
  20/run from theology+wcf+shorter_catechism+doctrines_proofs, written
  self-graded), bco (target 50, T/F from `PCA_QUIZ_TF`), mixed (20/10/20
  sampler). Pools draw from ALL app content (not the study selection) — the
  chooser says so.
- Item model: `{ kind: 'mcq'|'tf'|'short'|'written', card, quiz? }`; short and
  written render textarea (optional) + reveal → self-grade
  Incorrect/Partial/Correct → `applyOutcome('again'|'pass'|'easy')`.
- Quiz fix: controller exposes `quizOutcome(correct)` via ctx; flip focus sets
  a pending retire/recycle applied on the next move (no SRS writes, XP +
  activity only — Review flip convention); other focuses keep
  `applyOutcome(easy|again)`.
- Deck meta (quiz): quiz-question count, selected-card count, due count (spaced
  + Due first), retired count (flip), position; note that long cards live in
  Review/Browse when the quiz deck is smaller than the selection.

## Commands run (results)

- Baseline `node dev/validate.mjs` → PASS (103 authored quiz questions, 0
  problems; exit 0).
- Baseline `node dev/audit.mjs` → 8 flags (the known baseline).
- After Section B: `node dev/validate.mjs` → PASS (103 MCQ + 52 T/F, 0
  problems); `node dev/audit.mjs` → 8 flags (unchanged); `node --check` clean
  on exam.js/modes.js/pca.js/bco_tf.js.
- After Section B: headless-Chromium smoke test (python http.server :8137 +
  playwright-core): chooser shows 4 sections ("96 available of the
  100-question written section", "426 prompts · 20 sampled per run", 52 T/F,
  mixed); BCO T/F run + feedback + Finish now + results OK; Bible mixed run
  incl. short-answer typed capture + self-grade OK; Theology written run OK;
  no JS errors (only the sandbox-blocked Google Analytics fetch).
- After Section C: `node --check` clean; headless-Chromium QA:
  - Quiz meta: "24 quiz questions · 24 due · question 1 of 24" (Due first),
    counts under In order, "16 fact-style questions from your 31 selected
    cards" note when eligible < selected (theology sets).
  - Weak spots: fresh profile shows the explanatory empty state; 5 wrong quiz
    answers → weak deck of 5.
  - Flip deck under Quiz: correct retires (pile 24→23, retired 1), wrong
    recycles (pile stays, hint text shown), full run ends at "Flip deck
    finished — you've retired all 24 cards" + working restart; retired counts
    are scoped to the active mode's card universe (quiz bank vs review cards).
  - Review flip regression: Easy retires, meta counts correct.
  - WCF-only selection in Quiz: "None of the 10 cards in this selection are
    quiz-ready…" empty state.
- (Update this list before each later commit.)

## Known risks / manual tests still needed

- Manual browser QA for all of Section E (quiz focus modes, exam sections,
  Browse/WCF regression) — pending until B/C land.
- User-device QA on iOS PWA (textarea focus, keyboard nav) recommended.
- T/F bank facts will be paraphrased from the BCO — spot-check refs against
  pcaac.org before merge.
- SW cache bump (v63 → v64) deliberately deferred to Section D.
