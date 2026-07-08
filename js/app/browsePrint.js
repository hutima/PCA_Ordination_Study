// Browse-mode card export / print.
//
// Adds a "Print / Export" workflow to Browse without touching Review, Quiz,
// Mock exam, Catechisms, or SRS progress. Pressing Print / Export enters a
// local selection mode (checkboxes + Select all visible / Clear / Cancel /
// Print selected). Print selected builds a print-only DOM area from the chosen
// cards and calls window.print(), so the browser's native print / save-as-PDF
// flow produces a clean document — no PDF library, static-site compatible.
//
// State is entirely local to Browse (browseExportMode + selectedBrowseCardIds);
// nothing here writes to the SRS store. WCF cards honor the current "WCF card
// detail" setting via resolveCardDetail, so exported WCF cards contain the full
// confession text by default.

export function createBrowsePrint(ctx) {
  const { escapeHtml, renderAnswer, renderRefs, resolveCardDetail, DATA, rerenderBrowse } = ctx;

  const bp = {
    exportMode: false,
    selected: new Set(), // card ids chosen for print (local to Browse)
  };

  // Card lookup that survives the outline re-render (ids are stable in PCA_DATA).
  function findCard(setKey, cardId) {
    const set = DATA.sets[setKey];
    return set ? set.cards.find(c => c.id === cardId) : null;
  }

  // The controls row: normal Browse buttons, or the selection toolbar while in
  // export mode. The Print / Export button toggles selection mode.
  bp.controlsHtml = function () {
    if (!bp.exportMode) {
      return `<div class="browse-controls">
          <button class="ctrl-btn" id="browseExpandBtn" type="button">Expand all</button>
          <button class="ctrl-btn" id="browseCollapseBtn" type="button">Collapse all</button>
          <button class="ctrl-btn" id="browsePrintBtn" type="button">🖨 Print / Export</button>
        </div>`;
    }
    return `<div class="browse-controls browse-export-controls">
        <label class="browse-selectall" title="Select or deselect every visible card">
          <input type="checkbox" id="browseSelectAllChk"> Select / deselect all</label>
        <button class="ctrl-btn" id="browseCancelExportBtn" type="button">Cancel</button>
        <button class="ctrl-btn" id="browseTxtBtn" type="button">Export .txt</button>
        <button class="quick-btn quick-primary" id="browsePrintSelectedBtn" type="button">Print selected <span id="browseSelCount">(0)</span></button>
        <span class="browse-export-hint">Tick the cards to include, then Print selected or Export .txt.</span>
        <span class="browse-warn" id="browseWarn" role="alert" hidden>Select at least one card first.</span>
      </div>`;
  };

  // A per-card checkbox, rendered only while export mode is active. Placed inside
  // each <details>' <summary> so it sits beside the question.
  bp.checkboxHtml = function (cardId) {
    if (!bp.exportMode) return '';
    const checked = bp.selected.has(cardId) ? ' checked' : '';
    return `<label class="browse-check" title="Select for print">
      <input type="checkbox" data-browse-check="${escapeHtml(cardId)}"${checked}></label>`;
  };

  function updateCount(area) {
    const c = area.querySelector('#browseSelCount');
    if (c) c.textContent = `(${bp.selected.size})`;
    const warn = area.querySelector('#browseWarn');
    if (warn && bp.selected.size) warn.hidden = true;
    syncMaster(area);
  }

  // Reflect the selection in the top "Select / deselect all" master checkbox:
  // checked when all visible cards are selected, indeterminate when only some.
  function syncMaster(area) {
    const master = area.querySelector('#browseSelectAllChk');
    if (!master) return;
    const visible = bp.getVisibleBrowseCards(area).map(c => c.cardId);
    const on = visible.filter(id => bp.selected.has(id)).length;
    master.checked = on > 0 && on === visible.length;
    master.indeterminate = on > 0 && on < visible.length;
  }

  // Every card currently rendered in the outline (its stable id + set key).
  bp.getVisibleBrowseCards = function (area) {
    return [...area.querySelectorAll('.browse-item[data-card-id]')].map(el => ({
      cardId: el.getAttribute('data-card-id'),
      setKey: el.getAttribute('data-set-key'),
    }));
  };

  bp.wire = function (area) {
    const expand = area.querySelector('#browseExpandBtn');
    if (expand) expand.addEventListener('click', () => area.querySelectorAll('details.browse-item').forEach(d => { d.open = true; }));
    const collapse = area.querySelector('#browseCollapseBtn');
    if (collapse) collapse.addEventListener('click', () => area.querySelectorAll('details.browse-item').forEach(d => { d.open = false; }));

    const printBtn = area.querySelector('#browsePrintBtn');
    if (printBtn) printBtn.addEventListener('click', () => { bp.exportMode = true; rerenderBrowse(); });

    const cancel = area.querySelector('#browseCancelExportBtn');
    if (cancel) cancel.addEventListener('click', () => { bp.exportMode = false; bp.selected.clear(); rerenderBrowse(); });

    // Master "Select / deselect all" checkbox at the top: checked → select every
    // visible card, unchecked → deselect all.
    const master = area.querySelector('#browseSelectAllChk');
    if (master) master.addEventListener('change', () => {
      const on = master.checked;
      bp.getVisibleBrowseCards(area).forEach(c => on ? bp.selected.add(c.cardId) : bp.selected.delete(c.cardId));
      area.querySelectorAll('input[data-browse-check]').forEach(cb => { cb.checked = on; });
      master.indeterminate = false;
      updateCount(area);
    });

    // Checkbox toggles mutate the local selection without a re-render (keeps the
    // outline's open/scroll state). A click on the checkbox must not toggle the
    // parent <details> open/closed.
    area.querySelectorAll('input[data-browse-check]').forEach(cb => {
      cb.addEventListener('click', (e) => e.stopPropagation());
      cb.addEventListener('change', () => {
        const id = cb.getAttribute('data-browse-check');
        cb.checked ? bp.selected.add(id) : bp.selected.delete(id);
        updateCount(area);
      });
    });

    // Selected cards in outline order (each { card, setKey }); shows the inline
    // warning and returns null if nothing is ticked. Shared by print + txt.
    const gather = () => {
      if (!bp.selected.size) {
        const warn = area.querySelector('#browseWarn');
        if (warn) warn.hidden = false;
        return null;
      }
      return bp.getVisibleBrowseCards(area)
        .filter(c => bp.selected.has(c.cardId))
        .map(c => ({ card: findCard(c.setKey, c.cardId), setKey: c.setKey }))
        .filter(x => x.card);
    };

    const printSel = area.querySelector('#browsePrintSelectedBtn');
    if (printSel) printSel.addEventListener('click', () => {
      const cards = gather();
      if (cards) bp.openBrowsePrint(cards);
    });

    const txtBtn = area.querySelector('#browseTxtBtn');
    if (txtBtn) txtBtn.addEventListener('click', () => {
      const cards = gather();
      if (cards) bp.downloadTxt(bp.buildBrowseTxt(cards));
    });
  };

  // Build the print-only markup from the selected cards. Reuses renderAnswer /
  // renderRefs / escapeHtml — no unsafe raw HTML. WCF cards render in the
  // currently selected detail mode (full text vs. summary).
  bp.buildBrowsePrintHtml = function (cards) {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const setLabels = [...new Set(cards.map(x => (DATA.sets[x.setKey] || {}).label).filter(Boolean))];
    const head = `<header class="print-head">
        <h1>PCA Ordination &amp; Licensure Study</h1>
        <p class="print-meta">${cards.length} card${cards.length === 1 ? '' : 's'} · Generated ${escapeHtml(dateStr)}</p>
        ${setLabels.length ? `<p class="print-sets">${setLabels.map(escapeHtml).join(' · ')}</p>` : ''}
      </header>`;
    const body = cards.map(({ card }) => {
      const rc = resolveCardDetail(card);
      const answerMd = rc._wcfSummaryMode ? rc.summary : rc.a;
      return `<article class="print-card">
          <h2 class="print-q">${escapeHtml(card.q)}</h2>
          <div class="print-a">${renderAnswer(answerMd)}</div>
          ${renderRefs(card.refs)}
        </article>`;
    }).join('');
    return `${head}<div class="print-cards">${body}</div>`;
  };

  // Self-contained print stylesheet for the print document (below). Because the
  // document is a separate iframe, it inherits NONE of the app's CSS — no theme
  // colours, no --text-scale, no iOS text-size-adjust — so the 14pt sizing and
  // white page are honoured exactly on every browser. Compact layout; long WCF
  // quotations may break across pages.
  const PRINT_CSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
    html, body { background: #fff; color: #000; }
    body { font-family: Georgia, 'Times New Roman', serif; font-size: 14pt; line-height: 1.32; }
    @page { margin: 1in; }
    .print-head { border-bottom: 1pt solid #000; padding-bottom: 5pt; margin-bottom: 10pt; }
    .print-head h1 { font-size: 15pt; margin: 0 0 2pt; }
    .print-meta, .print-sets { font-size: 10pt; margin: 1pt 0; }
    .print-card { margin: 0 0 9pt; }
    .print-q { font-size: 14pt; font-weight: 700; margin: 0 0 2pt; break-after: avoid; }
    .print-a { font-size: 14pt; }
    .print-a p { margin: 0 0 4pt; }
    .print-a ul, .print-a ol { margin: 0 0 4pt 20pt; }
    .print-a li { margin: 0 0 1pt; }
    .qa-callout { margin: 0 0 3pt; }
    .qa-prov-label { font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5pt; margin: 0 0 1pt; }
    .qa-refs { margin-top: 2pt; font-size: 10.5pt; }
    .qa-ref-chip { color: #000; }
    .qa-ref-chip::after { content: ' \\00B7 '; }
    .qa-ref-chip:last-child::after { content: ''; }
    a, .qa-ref-inline { color: #000; text-decoration: none; }
    table { border-collapse: collapse; width: 100%; margin: 5pt 0; font-size: 11pt; }
    th, td { border: 1px solid #000; padding: 3pt 6pt; text-align: left; vertical-align: top; }
    blockquote { border-left: 2pt solid #000; margin: 4pt 0; padding-left: 8pt; }
  `;

  // Print via a hidden, off-screen iframe that holds a complete standalone
  // document. This is reliable across browsers — Chrome desktop renders a
  // display:none-then-@media-print region as a BLANK page, and an in-page region
  // inherits the app's font scaling on iOS; a dedicated iframe document avoids
  // both. No popup (can't be blocked), no PDF library, static-site compatible.
  bp.openBrowsePrint = function (cards) {
    const docHtml = `<!doctype html><html><head><meta charset="utf-8">`
      + `<meta name="viewport" content="width=device-width, initial-scale=1">`
      + `<title>PCA Ordination &amp; Licensure Study — cards</title>`
      + `<style>${PRINT_CSS}</style></head><body>${bp.buildBrowsePrintHtml(cards)}</body></html>`;
    const old = document.getElementById('browsePrintFrame');
    if (old) old.remove();
    const frame = document.createElement('iframe');
    frame.id = 'browsePrintFrame';
    frame.setAttribute('aria-hidden', 'true');
    // Off-screen but NOT display:none / visibility:hidden (those can suppress
    // printing in some browsers).
    frame.style.cssText = 'position:fixed; right:0; bottom:0; width:0; height:0; border:0;';
    document.body.appendChild(frame);
    const fdoc = frame.contentWindow.document;
    fdoc.open();
    fdoc.write(docHtml);
    fdoc.close();
    let printed = false;
    const doPrint = () => {
      if (printed) return;
      printed = true;
      try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch (e) {}
      const remove = () => setTimeout(() => { if (frame.parentNode) frame.remove(); }, 400);
      try { frame.contentWindow.addEventListener('afterprint', remove); } catch (e) {}
      setTimeout(remove, 60000); // fallback cleanup where afterprint doesn't fire
    };
    // Print once the iframe document has laid out. A written document is usually
    // 'complete' immediately; the load listener + timeout fallback cover the rest.
    frame.addEventListener('load', () => setTimeout(doPrint, 80));
    setTimeout(doPrint, 300);
  };

  // ── Plain-text (.txt) export ───────────────────────────────────────────
  // For users who want to format the cards themselves. Markdown is flattened to
  // plain text: bare standard labels (WCF:, WSC:…) are dropped, "Note:" is kept,
  // **bold**/`code`/blockquote markers are stripped, list markers are preserved.
  const STRIP_LABEL = /^(WSC|WLC|WCF|WSA|BCO|Calvin|Luther|Augustine|Turretin|Heidelberg):\s*/;
  function mdToText(md) {
    return String(md == null ? '' : md).replace(/\r\n?/g, '\n').split('\n').map(line => {
      let l = line.replace(/\s+$/, '');
      l = l.replace(STRIP_LABEL, '');           // drop "WCF:" etc. (keep "Note:")
      l = l.replace(/^\s*>\s?/, '');             // blockquote marker
      l = l.replace(/\*\*(.+?)\*\*/g, '$1');     // bold
      l = l.replace(/`([^`]+)`/g, '$1');         // code
      l = l.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)'); // links → "label (url)"
      return l;
    }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  bp.buildBrowseTxt = function (cards) {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const setLabels = [...new Set(cards.map(x => (DATA.sets[x.setKey] || {}).label).filter(Boolean))];
    const lines = [
      'PCA Ordination & Licensure Study',
      `${cards.length} card${cards.length === 1 ? '' : 's'} · Generated ${dateStr}`,
    ];
    if (setLabels.length) lines.push(setLabels.join(' · '));
    lines.push('='.repeat(60), '');
    cards.forEach(({ card }, i) => {
      const rc = resolveCardDetail(card);
      const answerMd = rc._wcfSummaryMode ? rc.summary : rc.a;
      lines.push(card.q, '', mdToText(answerMd));
      if (card.refs && card.refs.length) lines.push('', `Refs: ${card.refs.join(' · ')}`);
      if (i < cards.length - 1) lines.push('', '-'.repeat(60), '');
    });
    return lines.join('\n') + '\n';
  };

  // Download the text as a .txt file (Blob + object URL; no library, static-safe).
  bp.downloadTxt = function (text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pca-study-cards.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Leaving Browse for another mode resets the local export state so re-entering
  // Browse starts clean.
  bp.reset = function () { bp.exportMode = false; bp.selected.clear(); };

  return bp;
}
