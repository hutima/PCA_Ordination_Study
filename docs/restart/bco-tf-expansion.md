# Restart ledger — BCO True/False bank expansion

**Objective:** add 30–50 (target ~40) net-new True/False questions to
`js/data/quiz/bco_tf.js` (`window.PCA_QUIZ_TF`, the Mock exam's BCO section),
with balanced answers, plausible near-miss falses, refs + notes on every new
question, no duplicates, and all quality gates green.

## State — COMPLETE

- **Branch:** `claude/bco-tf-questions-expansion-ksc1o8`
- **Base commit:** 098b838 (main)
- **Previous question count:** 77 (39 True / 38 False, 50.6% T; longest streak 4; max ID `qz-bcotf-77`)
- **Final question count:** 119 — **42 net-new** (`qz-bcotf-78`…`qz-bcotf-119`)
- **Final balance:** 62 True (52.1%) / 57 False (47.9%); longest same-answer streak 4
- **Drafted:** 45 (3 Sonnet batches × 15) · **Reviewed:** 45 (3 independent blind Sonnet reviewers — 45/45 answer agreement) · **Rejected:** 3 (duplicate of qz-bco-13; mirror-pair redundancy; absolute-tell redundancy) · **Rewritten in adjudication:** 8 (giveaway-absolute removal / near-miss sharpening; 2 flipped to positive-True form) · **Escalated to Opus:** 0 (no reviewer/drafter disagreements arose)
- **Committed:** 42 (single content commit — one atomic unit keeps every commit green against the new 107-question size floor)
- **Files changed:** js/data/quiz/bco_tf.js (+42 questions), dev/validate.mjs (new hard gates), index.html + sw.js (v72→v73 cache bump), this ledger
- **Tests run (all green):** dev/validate.mjs (119 TF, 0 problems), dev/test_quiz_quality.mjs (13 sections incl. T/F balance/streak/notes/refs gates), dev/audit.mjs (8 flags = baseline), dev/test_scoring.mjs, dev/test_quiz_session.mjs, dev/test_exam_scoring.mjs, dev/check_sw.mjs (pca-v73 consistent)
- **Unresolved BCO questions:** none
- **Mergeable:** yes

## Audit findings (Phase 1, complete)

Existing coverage: constitution/3 parts, church power, courts overview,
officers overview, 5 permanent committees, membership classes, worship
elements, property, amendments (26-2/26-3), censures + discipline basics,
exam areas (21-4), review & control, overtures vs appeals, mission churches,
evangelists, profession-of-faith vows, DfW constitutional chapters (56–59),
diaconate devolution, Session moderator, congregational business, minister
bounds.

Gaps to fill (coverage plan): receiving/transfer/dismissal of members (46),
erasure (38-3/38-4), quorums (12-1/13-2/14-2), commissions vs committees (15),
RE representation in higher courts (13-1/14-2), congregational meetings (25),
church organization (5), assistant vs associate pastors (22-3), dissolution
of pastoral relations (23), candidacy (18), internship/licensure (19), calls
(20), transfer of ministers, licensure-vs-ordination exam differences
(19 vs 21), references (41), complaints (43) vs appeals (42) details, offense
classes (29), process/citations/witnesses (31–35), one-year limit (32-20),
without-process cases (38-1), demission (38-2), process against TEs (34),
restoration (37), DfW: baptism (56), Lord's Supper (58), marriage (59),
who administers sacraments.

## Quality gates (already in repo — new content must pass)

- `node dev/validate.mjs` — TF block: unique ids, boolean answers, no long
  quoted BCO wording (copyright).
- `node dev/test_quiz_quality.mjs` — TF gates: True ratio 45–55%, longest
  same-answer streak ≤ 4, note on every False, refs on every entry, unique ids.
- `node dev/audit_quiz_quality.mjs` — report-only TF metrics.
- Others: `dev/audit.mjs` (baseline 8 flags), `dev/test_scoring.mjs`,
  `dev/test_quiz_session.mjs`, `dev/test_exam_scoring.mjs`, `dev/check_sw.mjs`.
- **Release ritual:** bump `?v=N` in index.html + `CACHE` in sw.js (v72 → v73)
  in the same PR.

## Exact next action

None — work is complete. Topic distribution of the 42 new questions:
membership transfer/jurisdiction (2), quorums & representation (5),
commissions vs committees (2), congregational meetings & officer election (4),
church organization + assistant/associate pastors (2), candidacy/internship/
licensure (5), calls & pastoral relations (3), TE ordination (3),
references (1), offenses & process (6), appeals vs complaints (2), cases
without process & restoration (3), Directory for Worship (4).

Known limitations: several new items reinforce facts also drilled by the
BCO review-card MCQ overlays (different mode — the TF bank feeds only the
Mock exam's BCO section, overlays feed the Quiz mode, so they never appear
in the same deck); a few paragraph-level refs are deliberately chapter-level
where paragraph precision wasn't confirmable from repo content.
