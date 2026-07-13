# AGENT_RESTART — ranked quiz/exam results, high scores, celebrations

Temporary orchestration state. Delete when all work + gates + docs are done.

## Branch
`claude/fable-orchestration-governance-0kcce8` (exists on origin; push with `-u`).

## Objective
Gamify Quiz + Mock exam with objectively-graded (MCQ/TF-only) ratio, %, D/C/B/A/S
rank (A=80 expected-pass practice benchmark, S=95), per-category high scores,
optional celebrations (default on) + sounds (default off). Written/self-graded
answers never enter the ranked score. Incomplete runs never create records.

## Agreed architecture (Gate 1 — approved)
- `js/domain/scoring.js` (NEW, pure; no DOM/localStorage):
  GRADES table [{min:95,'S','Exceptional mastery'},{80,'A','Expected pass'},
  {70,'B','Almost there'},{60,'C','Significant review needed'},
  {0,'D','Substantial review needed'}]; `scorePercent(correct,total)` →
  Math.round, null on 0-denominator; `gradeForPercent(pct)` → {grade,label,minPct}
  (clamp 0–100, null on non-finite); `buildScore(correct,total)` →
  {correct,total,pct,grade,label} (pct/grade null when total===0);
  `isBetterRecord(candidate, existing)` → pct desc, then total desc, then
  newer completedAt; rejects malformed candidates.
- `js/app/scoreRecords.js` (NEW): key `pca_score_records_v1`, shape
  `{version:1, quiz:{[subjectId]:rec}, exam:{[sectionId]:{[format:length]:rec}}}`,
  rec = {pct,correct,total,grade,bestStreak?,completedAt}. Defensive
  load/validate/save/clear; `updateQuizRecord(subjectId, result)` /
  `updateExamRecord(sectionId, formatLengthKey, result)` return
  {isNewRecord, previous}; `displayRecords()` for Progress. Validation helper
  `sanitizeRecords(raw)` exported for import use.
- `js/app/quizSession.js` (NEW): finite quiz run. `startRun(cards)` snapshots
  unique ids + per-card top-level subjectId (authored bank `_setKey
  'quiz:<subj>'` maps to subj id; auto cards map set key → owning subject via
  DATA). `recordAnswer(cardId, correct)` records FIRST answer only (repeat =
  no-op → flip-deck recycles can't improve the score); tracks
  answered/correct/streak/bestStreak/bySubject/missed ids. `isComplete()`,
  `summary()`. Run restarts whenever buildDeck() runs in quiz mode.
- Quiz UI (modes.js quiz descriptor + narrow pca.js hooks): after final first
  answer, forward action becomes "See results ›" (results screen =
  state.quizRun.showResults branch); "End quiz now" after ≥1 answer (early end
  → show partial result, Answered X of Y, NO record, NO celebration). Results:
  grade hero, pct, correct/answered, answered/available, best streak,
  expected-pass note + presbytery disclaimer, per-subject breakdown w/ grades,
  previous record / "New high score", missed review, Take another / Review
  missed / Back. Records update per-subject only on COMPLETE runs.
  quizOutcome() remains the only grading route; SRS/flip behaviour untouched.
- exam.js: sitting results get auto-graded hero (grade only when ≥1 MCQ/TF
  answered; explanatory line for mixed; "no auto-graded questions" text when
  none). Sitting record iff countAnswered === items.length && autoAnswered>0
  (early Finish with unanswered items → no record). Record key: section +
  `${format}:${length}`. cumulative() gains autoAnswered/autoCorrect/autoWrong/
  autoPct/autoGrade derived ONLY from 'c'/'w' codes; shown on results, summary,
  section-complete, chooser footers. Existing combined tabulation kept.
- `js/app/celebration.js` (NEW): WebAudio synth tones (answer correct/wrong,
  A chime, S fanfare <1s) + canvas confetti overlay (pointer-events:none,
  fixed, auto-cleanup of RAF/timers/DOM, once per results screen). Skips when
  prefers-reduced-motion / pref off / document.hidden; reduced-motion → static
  accent class. AudioContext created lazily on user gesture, failures silent.
- store.js prefs: `pca_sound_v1` (default OFF), `pca_celebrate_v1` (default ON)
  + state.soundOn/state.celebrationsOn + load/save. Advanced-settings toggle
  rows in index.html (Duff .toggle-switch pattern, title → info modal), wired
  in pca.js updateAdvancedButtons/installToggleInfo.
- progress.js: "Best scores" section (compact rows). "Clear best scores…"
  confirmed control in Settings block (index.html + pca.js) — clears ONLY
  records. resetAllProgress additionally clears score records (exam answer
  ledger stays with its own per-section Resets — do not broaden).
- Export v2: {version:2, progress, scoreRecords}; import accepts v1 (progress
  only) and v2; malformed scoreRecords section never blocks progress import.
- sw.js: add new files to PRECACHE + bump CACHE + index.html ?v=N together;
  `node dev/check_sw.mjs` must pass.
- Tests: `dev/test_scoring.mjs` (node:assert) — grade boundaries, clamping,
  0-denominator, record comparison, quiz-session first-answer semantics, exam
  c/w-only derivation.

## Refinements (Fable decisions, post-Gate-1)
- A also creates `js/app/scoreUi.js` — shared pure HTML builders
  (gradeBadgeHtml/scoreHeroHtml/expectedPassNote) so Quiz + Exam result heroes
  can't drift. Hero carries role="status" aria-live="polite"; grade is text.
- Quiz run state is module-local in quizSession.js (NOT in store.js state, not
  persisted — never exported). buildDeck() gets ONE hook: wrap the internal
  builder; `if (state.mode==='quiz') quizSession.startRun(state.deck)`.
- "Review missed" = new run over just-missed cards, flagged practice:true →
  shows a score but NEVER updates records (else a 1-question retry could beat
  a 50-question record). "Take another quiz" = buildDeck({forceShuffle:true}).
- Records update exactly once per results screen (finalize()/completeSitting()
  guard flags) — re-renders must not re-apply records or re-celebrate.
- Exam sitting records: only non-resumed sittings with countAnswered ===
  items.length and autoAnswered>0 (resumed remnants have tiny denominators).
  Variant key `${format}:${length}`. Record applied in next()/finish() at
  done=true (completeSitting helper), render only displays.
- C adds pure `js/domain/examScore.js` (tallyAnswerCodes over 'c/w/e/p/a') +
  `dev/test_exam_scoring.mjs`; B adds `dev/test_quiz_session.mjs`. Gates to run
  at the end: test_scoring + test_quiz_session + test_exam_scoring + validate +
  audit + check_sw.
- sw.js/index.html ?v: SINGLE owner = E, one release bump v67→v68 at the end
  (intermediate commits are online-runnable; offline precache completeness
  lands with the release commit). Nobody else touches sw.js/index.html except
  D's settings rows in index.html.
- CSS class contract (B adds base styles in a delimited pca.css section, D
  polishes + celebration overlay): .score-hero, .grade-badge .grade-{s,a,b,c,d},
  .score-pct, .score-ratio, .score-grade-label, .score-prev, .score-note,
  .new-record-badge, .streak-chip, breakdown rows, .best-score-row (E),
  .celebrate-accent (reduced-motion static accent).
- Parallel B∥C: disjoint files; each `git add` ONLY its own listed files
  (never -A), retry once on index.lock.

## Task ledger
| # | Owner | Scope | Status |
|---|-------|-------|--------|
| A | sonnet | scoring.js + scoreRecords.js + scoreUi.js + test_scoring.mjs | DONE 9be467a; Gate 2 passed |
| D1 | sonnet | celebration.js + store.js prefs (no UI wiring yet) | DONE 8066771 |
| B | sonnet | quizSession.js + modes.js quiz run/results + narrow pca.js hooks + base css | RUNNING |
| C | sonnet | exam.js ranked results + records + cumulative auto fields + examScore.js | RUNNING (∥ B) |
| D2 | sonnet | wire celebration/sounds into quiz+exam results, index.html toggle rows, pca.js toggle wiring, css polish (.celebrate-accent) | pending (after B+C) |
| E | sonnet | progress.js Best scores + Clear-best-scores control + export v2/import + resetAll records + sw.js precache + v67→v68 bump + docs | pending (after D2) |
| F | Fable | Gate reviews 2–5, final diff review | Gate 2 done |

## Sequencing / file locks
pca.js, index.html, css/pca.css: B → D2 → E (one owner at a time).
modes.js: B then D2 (sound/celebration calls only). exam.js: C then D2.
store.js: D1 (done). sw.js/docs: E only.

## Completed commits
- 9be467a feat: add shared score grading and record persistence (A)
- 8066771 feat: add celebration and sound utilities with persisted preferences (D1)

## Tests already run
- node dev/test_scoring.mjs — 7 sections pass (A)
- node --check + node import smoke on celebration.js/store.js (D1)

## Known notes / risks
- sanitizeRecord keeps stored pct without re-deriving from correct/total —
  acceptable (display records); E's import path relies on sanitizeRecords.
- .celebrate-accent class not yet in css — D2 adds it.
- dev/check_sw.mjs EXPECTED to fail until E's release commit (new modules not
  yet precached; ?v stays 67 until then).

## Next action
When B and C both land: Fable Gate 3 review (pca.js/modes.js diff, exam.js
record semantics), then launch D2.
