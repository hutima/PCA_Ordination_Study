# Repository notes for Claude

This repo is the **PCA Ordination & Licensure Study** app — a static, offline
spaced-repetition review app adapted from the Duff Greek study tool. Read
**`PROJECT_PLAN.md`** first: it is the source of truth for the plan, decisions,
architecture/reuse map, content contract, phase status, and next steps.

## Orientation

- **Entry point:** `js/app/pca.js` (ES module). Drives the shell in
  `index.html`; styling in `styles.css` (base design tokens) + `css/pca.css`
  (PCA-specific). State is module-local; progress persists to
  `localStorage['pca_progress_v1']`, selection to `['pca_selection_v1']`,
  daily-activity log (streak/heatmap) to `['pca_activity_v1']`.
- **Study modes:** Review (self-check), Quiz (MCQ), Browse (collapsible
  outline, non-graded), Mock exam (finite scored MCQ session). A Due/Weak
  focus toggle filters the Review/Quiz deck. Answers are provenance-tagged
  (`renderAnswer()`: standard quotes vs study notes) and reference chips
  deep-link to official texts (`refLink()`).
- **SRS engine (reused, content-agnostic):** `js/domain/srs/{constants,
  scheduler,confidence}.js`. Outcomes `again`/`pass`/`easy` =
  Hard/Uncertain/Easy. Do not edit lightly.
- **Content:** `js/data/subjects/<id>.js` files register into the global
  `window.PCA_DATA` contract (see PROJECT_PLAN §4). Add a subject by dropping a
  data file there and a `<script defer>` tag in `index.html`.
- **Markdown:** answers are Markdown rendered by `js/utils/markdown.js`
  (escape-first; lists, GFM tables, blockquotes, inline emphasis).
- **Validate content:** `node dev/validate.mjs`.
- **Serve locally:** `python3 -m http.server 8137` then open `/`.

## Maintenance rules

- Keep `PROJECT_PLAN.md` **Status** and **Next steps** current as phases land.
- Asset URLs in `index.html` carry a `?v=N` cache-bust param. The service
  worker (`sw.js`) is wired and auto-updates; on every release bump the `?v=N`
  in `index.html` **and** `CACHE` in `sw.js` together so returning users
  auto-refresh onto the new version.
- When adding/removing a subject data file, update the `<script defer>` tags in
  `index.html` and re-run `node dev/validate.mjs`.
