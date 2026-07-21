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
- Phase 0: no prior work found; restart doc created (commit cfd4e39).
- Phase 1: system map (above).
- Phase 2: `dev/audit_quiz_quality.mjs` written (read-only, `--json` flag,
  loader mirrors validate.mjs). Baseline saved to
  `docs/restart/quiz-audit-baseline.txt`.
- Phase 3: rubric approved at `docs/restart/quiz-quality-rubric.md`
  (amended: allowlist is machine-readable in dev/, not per-file comments).

## Baseline statistics (pre-fix)
- Banks n=143: answerIndex dist 0:27 **1:81** 2:23 3:12; correct=longest
  55.9%; margin-giveaway 5.6%; comma-tell 5.6%. Worst: sacraments 86.7%
  longest.
- Overlays n=1182 (+11 malformed): correct=longest **73.8%**; margin-giveaway
  **28.4%**; comma-tell **32.2%**; dist 0:412…3:199. Worst: bible_books 95%
  longest / 63.8% margin; bco_comprehensive 89.7%/41.8%; wcf 88.4%/41.6%;
  theology 84%/33.7%; bible_books_nt 84%/33%. small_subjects: all answerIndex
  0 + 11 entries with 2-3 choices (ht-003a/b, 006a/b, 007a/b, 009a/b,
  012a/b/c — pass validate's ≥2 gate silently).
- T/F n=77: **52T/25F (2.08)**; longest streak 5; 12 absolute-word giveaways;
  8 missing refs (qz-bcotf-17/18/27/28/29/30/34/50); false-without-note: 0.

## Decisions
- Position bias fixed at RUNTIME: shuffle authored choices + remap
  correctIndex in `buildQuiz()` (quiz.js:63-64) and `authoredItem()`
  (exam.js:99-103) via a shared helper. Content rewrites do NOT need to
  rebalance answerIndex. Risk to verify: exam in-flight run persistence must
  not corrupt resumed picks (check how items serialize in
  pca_exam_progress_v1).
- Content rewrites target margin-giveaway, comma-tell, extreme-imbalance,
  malformed sets, and T/F balance/near-misses — things shuffle can't fix.
- Structural tests land early (pass against current content); statistical
  gate tests land AFTER content fixes, with a documented allowlist in dev/.

## Adjudications (orchestrator decisions)
- qz-ht-12: agent's creation-days stem rewrite accepted, but stem re-worded
  by orchestrator to "arranged topically rather than as a strict
  chronological sequence" — the phrase "literary framework" lexically echoed
  the correct choice "The framework (literary) view".
- qz-bcotf-27/28/30 (five permanent GA program committees incl. Reformed
  University Fellowship): confirmed accurate as True — AC, CDM, MNA, MTW,
  RUF (RUF is the successor designation of Reformed University Ministries).
  Left unchanged.
- bco_tf true→false flips (13 ids) spot-verified by orchestrator:
  01 (Constitution = WCF + both catechisms + BCO), 19 (two perpetual
  offices), 39 (no denominational trust clause, BCO 25-9), 50 (burden on
  prosecution, BCO 31-2), 51 (30-day appeal notice, BCO 42-4) — all
  polity-accurate.

- bco-comp-080 (RE/deacon vows): orchestrator verified final choices against
  the source card (BCO 24-6 paraphrase) — correct choice matches; distractors
  are membership-vow-flavored near misses. Accepted.
- Potential future allowlist entries (currently passing, noted only):
  bco-comp-132 (irreducible chapter list "BCO 56, 57, 58, and 59-3"),
  bco-comp-152 (fixed five-membership-vow enumeration).

## Files changed
- docs/restart/quiz-difficulty.md, docs/restart/quiz-quality-rubric.md,
  docs/restart/quiz-audit-baseline.txt, dev/audit_quiz_quality.mjs

## Tests run
- node dev/validate.mjs — clean (after audit tool added)

## Next action
Phase 4 fan-out (parallel Sonnet, disjoint files, agents do NOT commit):
- W-shuffle: runtime shuffle fix + structural tests (js/app/quiz.js,
  js/app/exam.js, dev/test_quiz_quality*.mjs)
- WA: banks js/data/quiz/*.js (except bco_tf)
- WB: js/data/quiz/bco_tf.js whole-bank rewrite
- WC: overlays bco.js + bco_comprehensive.js
- WD: overlays bible_books.js + bible_books_nt.js
- WE: overlays theology.js + wcf.js
- WF: overlays bible_content.js + church_history.js + small_subjects.js
  (incl. fixing the 11 malformed 2-3-choice entries to 4 plausible choices)
Orchestrator commits per workstream after review.
