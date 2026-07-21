# Restart ledger — BCO True/False bank expansion

**Objective:** add 30–50 (target ~40) net-new True/False questions to
`js/data/quiz/bco_tf.js` (`window.PCA_QUIZ_TF`, the Mock exam's BCO section),
with balanced answers, plausible near-miss falses, refs + notes on every new
question, no duplicates, and all quality gates green.

## State

- **Branch:** `claude/bco-tf-questions-expansion-ksc1o8` (up to date with origin/main)
- **Base commit:** 098b838 (main)
- **Existing question count:** 77 (39 True / 38 False, 50.6% T; longest streak 4; max ID `qz-bcotf-77`; all IDs unique)
- **Target new questions:** ~40 (net-new; IDs continue at `qz-bcotf-78`)
- **Drafted:** 0 · **Reviewed:** 0 · **Committed:** 0
- **Files changed so far:** none (this ledger only)
- **Tests run:** baseline stats computed; full suite not yet run this session
- **Unresolved BCO questions:** none yet
- **Mergeable:** yes (branch == origin/main)

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

Launch 3 Sonnet drafting batches (A: membership/officers/courts;
B: candidacy/licensure/calls/GA procedure; C: discipline/worship), then
blind-review, adjudicate, integrate at IDs 78+, run gates, bump cache,
commit, push, open draft PR.
