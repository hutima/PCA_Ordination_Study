# Restart: Quiz Difficulty & Answer-Pattern Bias

## Objective
Remove exploitable answer patterns (correct = longest / only comma-list / most
precise; T/F bank skews True with nonsense falses) from all reachable quiz
content while preserving doctrinal/polity accuracy, stable IDs, and progress
compatibility. Add a quality audit tool + regression tests.

## Branch / commit
- Branch: `claude/session-gia4er` (session-designated; based on origin/main @ 9059a52)
- Mergeable: yes (clean tree at last update)

## System map (Phase 1 — done)
- Hand-authored MCQ banks: `js/data/quiz/{bco,bible_books,bible_content,church_history,hot_topics,sacraments,theology}.js` → `window.PCA_QUIZ`, 143 Qs, schema `{id, subject, q, choices:[4], answerIndex, refs?}`.
- Overlays: `js/data/quiz_cards/*.js` (9 files) → `window.PCA_CARD_QUIZ`, 1,191 entries, `'card-id': {q?, choices:[4], answerIndex}`.
- T/F: `js/data/quiz/bco_tf.js` → `window.PCA_QUIZ_TF`, 77 entries `{id, q, answer:bool, refs?, note?}`.
- Generation: `js/app/quiz.js` — `cardQuiz()` (inline `card.quiz` > overlay), `buildQuiz()`. **Authored MCQs are NOT shuffled** (`correctIndex = answerIndex` as-authored) — position bias is live. Auto-gen path shuffles + remaps + `pickBalancedDistractors()` (same-set siblings, length-windowed).
- Exam: `js/app/exam.js` — `tfItem()` maps `answer→correctIndex` (True=0/False=1, fixed); `drawSpread()` round-robin; answered-id exclusion prevents dupes.
- Existing checks: `dev/validate.mjs` has `choiceGiveaway()` (correct vs median×1.6+12 — weak); no position-distribution or T/F-balance audit exists. Tests: `dev/test_{scoring,quiz_session,exam_scoring}.mjs`.

## Completed work
- Phase 0: no prior work found; restart doc created.
- Phase 1: system map (above).

## Files changed
- docs/restart/quiz-difficulty.md (this file)

## Tests run
- none yet

## Audit statistics
- baseline: pending (Phase 2)

## Unresolved questions
- Whether to shuffle authored-MCQ choices at presentation time (kills position
  bias at runtime; needs to keep answerIndex remap correct + tests).

## Next action
Phase 2: Sonnet agent writes `dev/audit_quiz_quality.mjs` (repo keeps dev
scripts in `dev/`, not `tools/`), runs it, reports baseline. Then commit
"chore: add quiz quality baseline audit".
