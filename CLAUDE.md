# Repository notes for Claude

This repo is the **PCA Ordination & Licensure Study** app — a static, offline
spaced-repetition review app adapted from the Duff Greek study tool. Read
**`PROJECT_PLAN.md`** first: it is the source of truth for the plan, decisions,
architecture/reuse map, content contract, phase status, and next steps.

## Orientation

- **Entry point:** `js/app/pca.js` — a thin controller over focused modules in
  `js/app/`: `store.js` (shared state + persistence), `content.js` (data
  access), `quiz.js` (MCQ generation), `answer.js` (provenance rendering +
  summaries), `refs.js` (citation → official-source links), `srs.js` (outcome
  application), `modes.js` (study-mode registry), `progress.js` (analytics
  overlay). Styling: `styles.css` (base tokens) + `css/pca.css`. Progress
  persists to `localStorage['pca_progress_v1']`, selection to
  `['pca_selection_v1']`, daily-activity log to `['pca_activity_v1']`.
- **Adding a study mode:** add a descriptor in `js/app/modes.js`
  (`createModes`), a `<button data-mode="id">` in `index.html`, and any new
  files to the `sw.js` PRECACHE. The controller wires clicks/keyboard/render
  through the registry.
- **Study modes:** Review (self-check; short summary first, full answer &
  quotations behind an expander), Quiz (MCQ), Browse (collapsible outline,
  non-graded), Mock exam (finite scored MCQ session), Catechisms (WSC/WLC
  full text plus a hand-authored BCO-paraphrase set in
  `js/data/catechisms_bco.js`, as flip cards — dropdown per set + per
  question, proofs/references in a collapsed section; position persists to
  `pca_catechism_v1`; a set with `verbatim: false` renders a paraphrase
  callout instead of the confessional one). A Due/Weak/In-order/Flip-deck
  focus toggle shapes the Review/Quiz deck (In order = unspaced read-through
  in book order; Flip deck = non-spaced, ported from Duff: Hard/Uncertain
  recycle to the back of the pile, Easy retires for the session — no SRS
  writes, only the activity log). A persisted Shuffle toggle
  (`pca_shuffle_v1`, default on) controls deck order; it is disabled under
  In order. Review grade buttons show on both hidden and revealed states.
  An empty subject selection means an empty deck — there is no implicit
  "study everything" fallback. Card re-renders run through `withCardAnchor()` (pca.js) so
  reveal/hide/next never jumps the page. Answers are provenance-tagged
  (`renderAnswer()`: standard quotes vs study notes) and reference chips
  deep-link to official texts (`refLink()`). Review's reveal: short table-free
  answers (≤480 chars — memory verses) render in full (`directAnswer()`);
  longer cards show a teaser — the authored `card.summary` when present, else
  derived (`summarize()`: skips table rows, lists "Key passages:" for
  Scripture-topic cards, appends "(+N more)" rather than truncating — a
  teaser must never end mid-thought; `validate.mjs` enforces this). Authored
  summaries and structural repairs live in each builder's curation layer
  (`CURATE` dicts keyed by card id; shared ops engine in `dev/curation.py` —
  fails loudly if a key stops matching). `dev/audit.mjs` flags the failure
  classes found in real phone use (questions-in-answers, glued inline
  answers, flattened tables, mid-thought teasers). 3+-column Markdown tables
  are emitted with `class="md-stack"` + per-cell `data-th` and stack into
  labeled row-blocks under 640px (`css/pca.css`). Never embed copyrighted
  text (the BCO, the R. S. Clark covenant-theology essay in the church
  history source) — the curation layer cuts these.
- **Standards data (public domain):** generated from the four Westminster
  PDFs (removed from the repo in Phase 16 to keep it small — restore them
  locally to re-run these two builders; `.gitignore` now blocks
  `*.pdf/*.doc/*.docx/*.zip`) — `dev/build_catechisms.py` → `js/data/catechisms.js`
  (`window.PCA_CATECHISMS`, WSC 107 + WLC 196 with proof citations);
  `dev/build_wcf.py` → `js/data/wcf.js` (`window.PCA_WCF`, 33 chapters /
  171 sections; build-time artifact, not loaded by the app);
  `dev/build_theology_wcf.mjs` → `js/data/subjects/theology_wcf.js`
  (a theology sub-deck quoting WCF chapters not otherwise cited).
  The BCO is copyrighted — never embed its text; link to pcaac.org instead.
- **SRS engine (reused, content-agnostic):** `js/domain/srs/{constants,
  scheduler,confidence}.js`. Outcomes `again`/`pass`/`easy` =
  Hard/Uncertain/Easy. Do not edit lightly.
- **Content:** `js/data/subjects/<id>.js` files register into the global
  `window.PCA_DATA` contract (see PROJECT_PLAN §4). Add a subject by dropping a
  data file there and a `<script defer>` tag in `index.html`. The BCO subject
  spans three files: `bco.js` (2007 Q&A deck, orders 1–4), `bco_governance.js`
  (orders 5–6), and `bco_comprehensive.js` (user-supplied 2025 paraphrase
  bundle, 165 cards in 8 sub-decks, orders 7–14 — Foundations through the
  Directory for Worship); later files merge `setKeys` into the existing
  subject, so load order in `index.html` matters (`bco.js` first).
- **Subject selector:** sub-decks render as one collapsible
  `<details class="subdeck-group">` per subject (summary shows a selected
  count); open/closed state lives in `openSubdeckGroups` (`pca.js`) so it
  survives the re-render on every tile click. The modal scrolls as one unit —
  don't reintroduce a nested scrollbox.
- **Markdown:** answers are Markdown rendered by `js/utils/markdown.js`
  (escape-first; lists, GFM tables, blockquotes, inline emphasis).
- **Validate content:** `node dev/validate.mjs` (card shape, Markdown render,
  MCQ answer-length fairness). **Release check:** `node dev/check_sw.mjs`
  (precache completeness + `?v=N`/CACHE agreement).
- **Serve locally:** `python3 -m http.server 8137` then open `/`.

## Maintenance rules

- Keep `PROJECT_PLAN.md` **Status** and **Next steps** current as phases land.
- Asset URLs in `index.html` carry a `?v=N` cache-bust param. The service
  worker (`sw.js`) is wired and auto-updates; on every release bump the `?v=N`
  in `index.html` **and** `CACHE` in `sw.js` together so returning users
  auto-refresh onto the new version.
- When adding/removing a subject data file, update the `<script defer>` tags in
  `index.html` and re-run `node dev/validate.mjs`.
