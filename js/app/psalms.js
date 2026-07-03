// Psalms devotional reader — a per-psalm render path inside the Catechisms mode
// (keyed off cat.kind === 'psalms'). This is ADDITIVE: the WSC/WLC/BCO flip-card
// behaviour is untouched; modes.js branches to this reader only for the Psalms
// category and delegates the psalm-specific body/keys/source here.
//
// The psalm card is NOT a flip card: the individual verse rows are the
// interactive controls (tap to reveal/hide one verse), so the card body itself
// carries no click-to-flip. Whole-psalm grading still flows through the shared
// catechism grade() → applyCatechismOutcome(cat:psalms:<n>).
//
// Dependency rule: this module must NOT import the controller (pca.js) — it
// receives everything it needs (escapeHtml, withCardAnchor, rerender) as an
// injected ctx, keeping the graph acyclic. It also must stay Node-importable:
// no document/localStorage/window/fetch access at module top level — all of it
// lives inside functions that only run at render/interaction time.
//
// KJV verse text is bundled (public domain). ESV is fetched live, one psalm per
// request, using the user's OWN ESV API token — the token and text are never
// baked into the repo; the token is stored only in localStorage and never logged.

const VERSION_KEY = 'pca_psalm_version_v1';   // 'kjv' | 'esv'
const TOKEN_KEY   = 'pca_esv_token_v1';
const CACHE_KEY   = 'pca_esv_psalm_cache_v1';

const ESV_COPYRIGHT_LINE =
  'Scripture text: ESV®, via your ESV API token — not stored in the app beyond your local cache.';

export function createPsalmReader({ escapeHtml, withCardAnchor, rerender }) {
  // ── Module (closure) state ─────────────────────────────────────────────
  let version = loadVersion();      // 'kjv' | 'esv'
  const revealed = new Set();       // verse numbers currently revealed (per psalm)
  let summaryVisible = true;        // summary block open? resets to true per psalm
  let currentN = null;              // psalm number currently rendered
  let currentVerseNums = [];        // verse nums of the displayed translation (for reveal-all/onKey)
  // ESV fetch state for the currently viewed psalm.
  let esv = { state: 'idle', kind: null, verses: null, n: null }; // state: idle|loading|ok|error
  let tokenModalWired = false;

  // ── localStorage helpers (guarded; never touched at import time) ────────
  function loadVersion() {
    try { return localStorage.getItem(VERSION_KEY) === 'esv' ? 'esv' : 'kjv'; } catch (e) { return 'kjv'; }
  }
  function saveVersion() { try { localStorage.setItem(VERSION_KEY, version); } catch (e) {} }
  function getToken() { try { return (localStorage.getItem(TOKEN_KEY) || '').trim(); } catch (e) { return ''; } }
  function saveToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch (e) { return {}; }
  }
  function writeCache(n, verses) {
    const cache = readCache();
    cache[n] = { verses, ts: Date.now() };
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); }
    catch (e) {
      // Quota exceeded — evict the oldest cached psalm by timestamp, retry once.
      try {
        const oldest = Object.entries(cache).sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0))[0];
        if (oldest) delete cache[oldest[0]];
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch (e2) { /* give up silently — the reader still works from network */ }
    }
  }

  // ── ESV text parsing (adapted from Lectio, not imported) ────────────────
  function normText(s) { return (s || '').replace(/\r/g, '').replace(/\s+/g, ' ').trim(); }
  function parseEsv(text) {
    text = (text || '').replace(/\r/g, '');
    const parts = text.split(/\[(\d+)\]/);
    const verses = [];
    for (let i = 1; i < parts.length; i += 2) {
      const num = parseInt(parts[i], 10);
      const t = normText(parts[i + 1]);
      if (t) verses.push({ num, text: t });
    }
    if (!verses.length) { const t = normText(text); if (t) verses.push({ num: 1, text: t }); }
    return verses;
  }

  // ── Per-psalm sync (single detection point for a psalm change) ──────────
  // Called from bodyHtml on every render; when the psalm number changes we
  // reset the per-verse reveal state and re-seed ESV from cache (a version
  // swap on the SAME psalm keeps reveal state and does not pass through here).
  function syncPsalm(n) {
    if (currentN === n) return;
    currentN = n;
    revealed.clear();
    summaryVisible = true; // a fresh psalm always shows its summary/application
    seedEsvFromCache(n);
  }
  function seedEsvFromCache(n) {
    if (version !== 'esv') { esv = { state: 'idle', kind: null, verses: null, n }; return; }
    const cached = readCache()[n];
    esv = (cached && cached.verses && cached.verses.length)
      ? { state: 'ok', kind: null, verses: cached.verses, n }
      : { state: 'idle', kind: null, verses: null, n }; // idle → wire() will fetch
  }

  // ── ESV fetch (exactly one psalm per request; cache-first) ──────────────
  function esvUrl(n) {
    return 'https://api.esv.org/v3/passage/text/?q=Psalm+' + n +
      '&include-passage-references=false&include-verse-numbers=true' +
      '&include-first-verse-numbers=true&include-footnotes=false' +
      '&include-headings=false&include-short-copyright=false' +
      '&include-passage-horizontal-lines=false&include-heading-horizontal-lines=false';
  }
  // Only apply an async result if the user is still on the same psalm+ESV.
  function stillViewing(n) { return currentN === n && version === 'esv'; }
  function setEsvError(kind, n) {
    if (stillViewing(n)) { esv = { state: 'error', kind, verses: null, n }; withCardAnchor(rerender); }
  }
  // Kick off a fetch for the given psalm if we don't already have/await it.
  function maybeFetch(n) {
    if (version !== 'esv') return;
    if (esv.n === n && esv.state !== 'idle') return; // ok/loading/error already handled
    esv = { state: 'loading', kind: null, verses: null, n }; // idle renders as "Loading…" too
    fetchEsv(n);
  }
  async function fetchEsv(n) {
    const token = getToken();
    if (!token) { setEsvError('notoken', n); return; }
    try {
      const res = await fetch(esvUrl(n), { headers: { Authorization: 'Token ' + token } });
      if (res.status === 401) return setEsvError('unauthorized', n);
      if (res.status === 429) return setEsvError('ratelimit', n);
      if (!res.ok) return setEsvError('generic', n);
      const data = await res.json();
      const passages = (data && data.passages) || [];
      const verses = parseEsv(passages.join('\n'));
      if (!verses.length) return setEsvError('generic', n);
      writeCache(n, verses);
      if (stillViewing(n)) { esv = { state: 'ok', kind: null, verses, n }; withCardAnchor(rerender); }
    } catch (err) {
      // Network failure — fall back to cache if we have it, else a friendly error.
      const cached = readCache()[n];
      if (cached && cached.verses && cached.verses.length) {
        if (stillViewing(n)) { esv = { state: 'ok', kind: null, verses: cached.verses, n }; withCardAnchor(rerender); }
      } else {
        setEsvError('network', n);
      }
    }
  }

  // ── Version selection ───────────────────────────────────────────────────
  function onSelectVersion(v) {
    if (v === version) return;
    if (v === 'esv') {
      if (!getToken()) { openTokenModal(); return; } // don't switch until a token is saved
      version = 'esv'; saveVersion();
      seedEsvFromCache(currentN);
      withCardAnchor(rerender); // wire() then fetches if not cached
      return;
    }
    version = 'kjv'; saveVersion();
    withCardAnchor(rerender);
  }

  // ── ESV token modal (#esvTokenOverlay in index.html) ────────────────────
  // pca.js initOverlayDismiss() auto-wires backdrop-click + Escape to hide any
  // .consent-overlay — that plain hide leaves us on KJV, because the version
  // only flips to ESV on an explicit "Save & use ESV".
  function openTokenModal() {
    installTokenModal();
    const ov = typeof document !== 'undefined' && document.getElementById('esvTokenOverlay');
    if (!ov) return;
    const input = document.getElementById('esvTokenInput');
    if (input) input.value = '';
    ov.classList.add('show'); ov.setAttribute('aria-hidden', 'false');
    if (input) input.focus();
  }
  function closeTokenModal() {
    const ov = typeof document !== 'undefined' && document.getElementById('esvTokenOverlay');
    if (!ov) return;
    ov.classList.remove('show'); ov.setAttribute('aria-hidden', 'true');
  }
  function installTokenModal() {
    if (tokenModalWired || typeof document === 'undefined') return;
    const saveBtn = document.getElementById('esvTokenSaveBtn');
    const kjvBtn = document.getElementById('esvTokenKjvBtn');
    if (!saveBtn || !kjvBtn) return; // modal not in DOM yet (e.g. under test) — retry next open
    tokenModalWired = true;
    saveBtn.addEventListener('click', () => {
      const input = document.getElementById('esvTokenInput');
      const token = input ? input.value.trim() : '';
      if (!token) { if (input) input.focus(); return; } // require a non-empty token
      saveToken(token);
      version = 'esv'; saveVersion();
      closeTokenModal();
      seedEsvFromCache(currentN);
      withCardAnchor(rerender); // wire() then fetches if not cached
    });
    kjvBtn.addEventListener('click', () => { closeTokenModal(); /* stay on KJV */ });
  }

  // ── Rendering ───────────────────────────────────────────────────────────
  // The translation whose verses are currently displayed.
  function displayedVerses(item) {
    if (version === 'esv' && esv.state === 'ok' && esv.verses) return esv.verses;
    return item.verses || [];
  }
  function versesList(verses) {
    if (!verses || !verses.length) return '<div class="psalm-verses-status">No verses to show.</div>';
    const rows = verses.map(v => {
      const isRev = revealed.has(v.num);
      const text = isRev ? '<span class="psalm-verse-text">' + escapeHtml(v.text) + '</span>' : '';
      return '<button type="button" class="psalm-verse' + (isRev ? ' revealed' : '') + '"' +
        ' data-verse="' + v.num + '" aria-expanded="' + isRev + '">' +
        '<span class="psalm-verse-num">' + v.num + '</span>' + text + '</button>';
    }).join('');
    return '<div class="psalm-verses">' + rows + '</div>';
  }
  function esvErrorHtml() {
    const kjvBtn = '<button type="button" class="ctrl-btn" data-psalm-action="use-kjv">Use King James</button>';
    const tokenBtn = '<button type="button" class="ctrl-btn" data-psalm-action="reenter-token">Re-enter token</button>';
    let msg, actions;
    switch (esv.kind) {
      case 'unauthorized':
        msg = 'That ESV token was rejected.'; actions = tokenBtn + kjvBtn; break;
      case 'ratelimit':
        msg = 'ESV rate limit hit — wait a moment, or use King James.'; actions = kjvBtn; break;
      case 'notoken':
        msg = 'An ESV API token is needed to load this text.'; actions = tokenBtn + kjvBtn; break;
      case 'network':
        msg = 'Couldn’t reach the ESV API and there’s no cached copy of this psalm.'; actions = kjvBtn; break;
      default:
        msg = 'The ESV text couldn’t be loaded right now.'; actions = kjvBtn; break;
    }
    return '<div class="psalm-error"><p>' + escapeHtml(msg) + '</p>' +
      '<div class="psalm-error-actions">' + actions + '</div></div>';
  }
  function versesBlock(item) {
    if (version === 'esv') {
      if (esv.state === 'error') return esvErrorHtml();
      if (esv.state === 'ok') return versesList(esv.verses);
      return '<div class="psalm-verses-status">Loading ESV…</div>'; // idle | loading
    }
    return versesList(item.verses);
  }

  // Build the #catBody inner HTML for a psalm. `extras` carries the shared
  // status badge, the whole-psalm grade markRow, and the item count — all
  // computed by modes.js so the reader stays decoupled from the SRS namespace.
  function bodyHtml(cat, item, extras) {
    syncPsalm(item.n);
    const verses = displayedVerses(item);
    currentVerseNums = verses.map(v => v.num);

    const versions =
      '<div class="theme-switcher psalm-versions" role="group" aria-label="Translation">' +
        '<button type="button" class="theme-btn' + (version === 'kjv' ? ' active' : '') + '"' +
          ' data-version="kjv" aria-pressed="' + (version === 'kjv') + '">KJV</button>' +
        '<button type="button" class="theme-btn' + (version === 'esv' ? ' active' : '') + '"' +
          ' data-version="esv" aria-pressed="' + (version === 'esv') + '">ESV</button>' +
      '</div>';
    // Summary block: a header row that doubles as the show/hide toggle, holding
    // the 1–2 sentence summary plus a short bullet list of practical application
    // points for a parishioner (item.apply). Code defensively — the regenerated
    // data file adds `apply` and may land after this code, so render the summary
    // alone when apply is missing/empty.
    const apply = Array.isArray(item.apply) ? item.apply.filter(s => s && String(s).trim()) : [];
    const summary = item.summary
      ? '<div class="qa-callout qa-attribution psalm-summary">' +
          '<button type="button" class="psalm-summary-toggle" data-psalm-action="toggle-summary"' +
            ' aria-expanded="' + summaryVisible + '">' +
            '<span class="qa-prov-label">Summary</span>' +
            '<span class="psalm-summary-hint">' + (summaryVisible ? 'Hide' : 'Show') + '</span>' +
          '</button>' +
          (summaryVisible
            ? '<div class="psalm-summary-body"><p>' + escapeHtml(item.summary) + '</p>' +
                (apply.length
                  ? '<ul class="psalm-apply">' +
                      apply.map(s => '<li>' + escapeHtml(s) + '</li>').join('') + '</ul>'
                  : '') +
              '</div>'
            : '') +
        '</div>'
      : '';
    const controls =
      '<div class="psalm-controls">' +
        '<button type="button" class="ctrl-btn" data-psalm-action="reveal-all">Reveal all</button>' +
        '<button type="button" class="ctrl-btn" data-psalm-action="hide-all">Hide all</button>' +
      '</div>';

    return (
      '<div class="qa-card psalm-card">' +
        '<div class="qa-deck-label"><span>Psalms · Psalm ' + item.n + ' of ' + extras.total + '</span>' +
          (extras.statusBadge || '') + '</div>' +
        '<div class="qa-question">' + escapeHtml(item.q) + '</div>' +
        summary + versions + controls + versesBlock(item) +
      '</div>' +
      extras.markRow
    );
  }

  // Wire the psalm-interactive controls (version switch, per-verse toggle,
  // reveal/hide-all, ESV error actions). Grade buttons are wired by modes.js so
  // they hit the shared catechism grade path.
  function wire(body, cat, item) {
    installTokenModal();
    body.querySelectorAll('[data-version]').forEach(b =>
      b.addEventListener('click', () => onSelectVersion(b.dataset.version)));
    body.querySelectorAll('.psalm-verse').forEach(b =>
      b.addEventListener('click', () => toggleVerse(Number(b.dataset.verse))));
    body.querySelectorAll('[data-psalm-action]').forEach(b =>
      b.addEventListener('click', () => doAction(b.dataset.psalmAction, item)));
    // If ESV is selected but not yet loaded/cached for this psalm, fetch it now.
    maybeFetch(item.n);
  }
  function toggleVerse(num) {
    if (revealed.has(num)) revealed.delete(num); else revealed.add(num);
    withCardAnchor(rerender);
  }
  function doAction(action, item) {
    if (action === 'toggle-summary') { summaryVisible = !summaryVisible; withCardAnchor(rerender); return; }
    if (action === 'reveal-all') { displayedVerses(item).forEach(v => revealed.add(v.num)); withCardAnchor(rerender); return; }
    if (action === 'hide-all') { revealed.clear(); withCardAnchor(rerender); return; }
    if (action === 'use-kjv') { version = 'kjv'; saveVersion(); withCardAnchor(rerender); return; }
    if (action === 'reenter-token') { openTokenModal(); return; }
  }

  function sourceText(cat) { return version === 'esv' ? ESV_COPYRIGHT_LINE : cat.source; }

  // Space/Enter toggles reveal-all / hide-all for the whole psalm — but only
  // when focus isn't on an interactive element, so keyboard activation of a
  // focused verse row (a native button) still works. Returns false in that case
  // so pca.js lets the default action through.
  function onKey(e) {
    const tag = e.target && e.target.tagName;
    if (/BUTTON|A|SELECT|INPUT/.test(tag)) return false;
    e.preventDefault();
    const allRevealed = currentVerseNums.length > 0 && currentVerseNums.every(n => revealed.has(n));
    if (allRevealed) revealed.clear();
    else currentVerseNums.forEach(n => revealed.add(n));
    withCardAnchor(rerender);
    return true;
  }

  function isPsalms(cat) { return !!cat && cat.kind === 'psalms'; }

  return { isPsalms, bodyHtml, wire, onSelectVersion, sourceText, onKey };
}
