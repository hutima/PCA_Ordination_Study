// Study-mode registry.
//
// Each mode is a descriptor: { id, label, title, usesDeck, focusable, render(area) }
// plus optional hooks (start(), and handlers the keyboard layer calls). To add a
// study mode: write a descriptor here, add it to the MODES array returned below,
// and add a matching <button data-mode="id"> in index.html (and the sw.js cache
// bump). The controller (pca.js) wires everything else through the shared `ctx`.
//
// `ctx` is the controller surface the modes draw on (state, render helpers, deck
// operations). It is injected so modes never import the controller — keeping the
// dependency graph acyclic.

import { createPsalmReader } from './psalms.js';

export function createModes(ctx) {
  const {
    state, DATA, escapeHtml, renderAnswer, summarize, hasMoreThanSummary, directAnswer, renderRefs,
    resolveCardDetail, buildQuiz, applyOutcome, applyCatechismOutcome, getConfidencePct, rerender, mark, move, toggleReveal, withCardAnchor,
    effectiveSetKeys, quizDeckCards, shuffle, emptyState, navRowHtml, wireNav,
    setDeckMeta, EXAM_SIZE, browsePrint,
  } = ctx;

  // ── Review (self-check, progressive disclosure) ──────────────────────
  const review = {
    id: 'review', label: 'Review', usesDeck: true, focusable: true,
    title: 'Self-check flashcards: recall, reveal, grade yourself',
    render(area) {
      // WCF cards resolve to Full-text or Summary form per the "WCF card detail"
      // setting before rendering (grading still targets the raw deck card).
      const card = resolveCardDetail(state.deck[state.pos]);
      const refsHtml = renderRefs(card.refs);
      // Short answers (memory verses etc.) render in full on reveal; longer
      // ones show a short summary first, with the full answer + quotations
      // behind a tap-to-open expander so long card backs stay scannable. WCF
      // cards in Full-text mode always render the full section directly.
      const direct = directAnswer(card) || card._wcfFull;
      const more = !direct && hasMoreThanSummary(card);
      const fullLabel = card._wcfSummaryMode ? 'Full WCF text' : 'Full answer &amp; quotations';
      const fullBlock = more
        ? `<details class="qa-full"><summary class="qa-full-toggle">${fullLabel}</summary>
             <div class="qa-answer">${renderAnswer(card.a)}</div></details>`
        : '';
      const revealBody = direct
        ? `<div class="qa-answer">${renderAnswer(card.a)}</div>`
        // Teasers render as Markdown (escape-first) so multi-part summaries
        // can be bulleted lists instead of semicolon chains.
        : `<div class="qa-summary">${renderAnswer(summarize(card))}</div>`;
      const answerBlock = state.revealed
        ? `<div class="qa-divider"></div>
           ${revealBody}
           ${refsHtml}${fullBlock}
           <div class="qa-reveal-hint qa-tap-hint">Tap card to hide</div>`
        : `<div class="qa-reveal-hint qa-tap-hint">Tap card to reveal answer</div>`;
      // Grading is available from both sides of the card — you can mark a
      // card you already know without flipping it first.
      const markRow = `<div class="mark-row" style="display:flex">
             <button class="mark-btn mark-again" data-outcome="again" type="button">✗ Hard</button>
             <button class="mark-btn mark-pass" data-outcome="pass" type="button">~ Uncertain</button>
             <button class="mark-btn mark-easy" data-outcome="easy" type="button">✓ Easy</button>
           </div>`;
      area.innerHTML = `
        <div class="qa-card ${state.revealed ? 'revealed' : ''}" id="qaCard" role="button" tabindex="0" aria-pressed="${state.revealed}">
          <div class="qa-deck-label">${escapeHtml(card._setLabel)}</div>
          <div class="qa-question">${escapeHtml(card.q)}</div>
          ${answerBlock}
        </div>
        ${navRowHtml()}
        ${markRow}`;
      const qaCard = area.querySelector('#qaCard');
      if (qaCard) qaCard.addEventListener('click', (e) => {
        // Don't flip when the user is interacting with a link/expander/button,
        // or selecting text.
        if (e.target.closest('a, summary, details, button')) return;
        if (typeof getSelection === 'function' && String(getSelection()).length) return;
        toggleReveal();
      });
      wireNav();
      area.querySelectorAll('.mark-btn').forEach(btn =>
        btn.addEventListener('click', () => mark(btn.dataset.outcome)));
    },
  };

  // ── Quiz (MCQ over the deck) ─────────────────────────────────────────
  function renderChoices(quiz) {
    return quiz.choices.map((choice, idx) => {
      let cls = 'quiz-choice';
      if (quiz.picked >= 0) {
        if (idx === quiz.correctIndex) cls += ' correct';
        else if (idx === quiz.picked) cls += ' wrong';
        else cls += ' dim';
      }
      return `<button class="${cls}" data-choice="${idx}" type="button" ${quiz.picked >= 0 ? 'disabled' : ''}>${escapeHtml(choice)}</button>`;
    }).join('');
  }
  const quiz = {
    id: 'quiz', label: 'Quiz', usesDeck: true, focusable: true,
    title: 'Multiple-choice quiz on fact-style cards (passages, events, key facts)',
    answer(idx) {
      const q = state.quiz;
      if (!q || q.picked >= 0) return;
      q.picked = idx;
      applyOutcome(state.deck[state.pos], idx === q.correctIndex ? 'easy' : 'again');
      rerender();
    },
    render(area) {
      const card = state.deck[state.pos];
      const q = state.quiz || (state.quiz = buildQuiz(card));
      const feedback = q.picked >= 0
        ? `<div class="quiz-feedback ${q.picked === q.correctIndex ? 'correct' : 'wrong'}">${q.picked === q.correctIndex ? '✓ Correct' : '✗ Not quite'}</div>${renderRefs(card.refs)}`
        : '';
      area.innerHTML = `
        <div class="qa-card revealed">
          <div class="qa-deck-label">${escapeHtml(card._setLabel)} · Quiz</div>
          <div class="qa-question">${escapeHtml(card.q)}</div>
          <div class="quiz-choices">${renderChoices(q)}</div>
          ${feedback}
        </div>
        ${navRowHtml()}`;
      area.querySelectorAll('.quiz-choice').forEach(btn =>
        btn.addEventListener('click', () => quiz.answer(Number(btn.dataset.choice))));
      wireNav();
    },
  };

  // ── Browse (non-graded outline; card export/print) ───────────────────
  // Each card is rendered with a WCF-detail-aware answer and stable
  // data-card-id / data-set-key so the Print / Export selection workflow
  // (js/app/browsePrint.js) can gather exactly the chosen cards.
  function browseAnswerHtml(card) {
    const rc = resolveCardDetail(card);
    if (rc._wcfSummaryMode) {
      // Summary mode: concise answer up front, full WCF text behind an expander.
      return `<div class="qa-summary">${renderAnswer(rc.summary)}</div>
        <details class="qa-full"><summary class="qa-full-toggle">Full WCF text</summary>
          <div class="qa-answer">${renderAnswer(rc.a)}</div></details>`;
    }
    return renderAnswer(rc.a);
  }
  const browse = {
    id: 'browse', label: 'Browse', usesDeck: false, focusable: false,
    title: 'Read a subject as an outline — tap a question to expand the answer',
    render(area) {
      const keys = effectiveSetKeys();
      setDeckMeta('');
      if (!keys.length) { area.innerHTML = emptyState('Choose one or more subjects, then browse them here as an outline.'); return; }
      let total = 0;
      let html = browsePrint.controlsHtml();
      for (const k of keys) {
        const set = DATA.sets[k];
        if (!set) continue;
        html += `<div class="browse-group"><div class="browse-group-title">${escapeHtml(set.label)} · ${set.cards.length}</div>`;
        for (const c of set.cards) {
          total++;
          html += `<details class="browse-item" data-card-id="${escapeHtml(c.id)}" data-set-key="${escapeHtml(k)}">
            <summary>${browsePrint.checkboxHtml(c.id)}<span class="browse-q">${escapeHtml(c.q)}</span></summary>
            <div class="browse-a">${browseAnswerHtml(c)}${renderRefs(c.refs)}</div></details>`;
        }
        html += `</div>`;
      }
      area.innerHTML = html;
      const modeNote = browsePrint.exportMode ? ' · <strong>select cards to print</strong>' : '';
      setDeckMeta(`Browsing <strong>${total}</strong> cards across <strong>${keys.length}</strong> sub-decks${modeNote}`);
      browsePrint.wire(area);
    },
  };

  // ── Mock exam (finite, mixed, scored) ────────────────────────────────
  const exam = {
    id: 'exam', label: 'Mock exam', usesDeck: false, focusable: false,
    title: 'A timed-style mixed mock exam with a scored summary',
    start() {
      const pool = quizDeckCards();
      shuffle(pool);
      const cards = pool.slice(0, Math.min(EXAM_SIZE, pool.length));
      state.exam = { cards, quizzes: cards.map(buildQuiz), pos: 0, done: false };
    },
    pick(idx) {
      const ex = state.exam;
      if (!ex || ex.done) return;
      const q = ex.quizzes[ex.pos];
      if (q.picked >= 0) return;
      q.picked = idx;
      applyOutcome(ex.cards[ex.pos], idx === q.correctIndex ? 'easy' : 'again');
      rerender();
    },
    next() {
      const ex = state.exam;
      if (!ex) return;
      if (ex.pos + 1 >= ex.cards.length) ex.done = true;
      else ex.pos += 1;
      rerender();
    },
    render(area) {
      const ex = state.exam;
      if (!ex || !ex.cards.length) {
        setDeckMeta('');
        area.innerHTML = emptyState('Not enough quiz-ready material for a mock exam in this selection. Choose one or more subjects first, or pick more of them.');
        return;
      }
      if (ex.done) return renderResults(area);
      const card = ex.cards[ex.pos];
      const q = ex.quizzes[ex.pos];
      const feedback = q.picked >= 0
        ? `<div class="quiz-feedback ${q.picked === q.correctIndex ? 'correct' : 'wrong'}">${q.picked === q.correctIndex ? '✓ Correct' : '✗ Not quite'}</div>${renderRefs(card.refs)}`
        : '';
      const last = ex.pos + 1 >= ex.cards.length;
      area.innerHTML = `
        <div class="qa-card revealed">
          <div class="qa-deck-label">Mock exam · ${escapeHtml(card._setLabel)}</div>
          <div class="qa-question">${escapeHtml(card.q)}</div>
          <div class="quiz-choices">${renderChoices(q)}</div>
          ${feedback}
        </div>
        <div class="nav-row">
          <button class="nav-btn nav-next" id="examNextBtn" type="button" ${q.picked >= 0 ? '' : 'disabled'}>${last ? 'See results ›' : 'Next ›'}</button>
        </div>`;
      setDeckMeta(`Mock exam — question <strong>${ex.pos + 1}</strong> of <strong>${ex.cards.length}</strong>`);
      area.querySelectorAll('.quiz-choice').forEach(btn =>
        btn.addEventListener('click', () => exam.pick(Number(btn.dataset.choice))));
      const nb = area.querySelector('#examNextBtn');
      if (nb) nb.addEventListener('click', () => exam.next());
    },
  };
  function renderResults(area) {
    const ex = state.exam;
    const total = ex.cards.length;
    const correct = ex.quizzes.filter(q => q.picked === q.correctIndex).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const bySub = new Map();
    ex.cards.forEach((c, i) => {
      const key = c._setLabel || 'Other';
      const rec = bySub.get(key) || { c: 0, n: 0 };
      rec.n += 1;
      if (ex.quizzes[i].picked === ex.quizzes[i].correctIndex) rec.c += 1;
      bySub.set(key, rec);
    });
    const subHtml = [...bySub.entries()].map(([label, r]) =>
      `<div class="review-item">${escapeHtml(label)}<span style="float:right;color:var(--muted)">${r.c}/${r.n}</span></div>`).join('');
    const missed = ex.cards.map((c, i) => ({ c, q: ex.quizzes[i] })).filter(x => x.q.picked !== x.q.correctIndex);
    const missedHtml = missed.length
      ? `<div class="prog-section-title">Review these (${missed.length})</div>` + missed.map(x =>
          `<div class="review-item">${escapeHtml(x.c.q)}
             <div style="color:var(--gold-light);margin-top:4px;font-size:14px">${escapeHtml(x.q.choices[x.q.correctIndex])}</div></div>`).join('')
      : `<div class="prog-section-title">Perfect score — every question correct.</div>`;
    setDeckMeta('');
    area.innerHTML = `
      <div class="qa-card revealed exam-results">
        <div class="qa-deck-label">Mock exam · results</div>
        <div class="exam-score">${correct} / ${total} <span class="exam-score-pct">${pct}%</span></div>
        <div class="prog-section-title">By subject</div>
        ${subHtml}
        ${missedHtml}
        <div class="nav-row" style="margin-top:18px">
          <button class="nav-btn nav-next" id="examRetakeBtn" type="button">Take another ›</button>
        </div>
      </div>`;
    area.querySelector('#examRetakeBtn').addEventListener('click', () => { exam.start(); rerender(); });
  }

  // ── Catechisms (WSC / WLC full text, dropdown-driven recall) ─────────
  // Q&A straight through the public-domain Westminster catechisms: pick a
  // catechism and a question, recall the answer, tap to check yourself.
  // Non-graded; proof citations render as chips linking to the source.
  const CATECHISMS = (typeof window !== 'undefined' && window.PCA_CATECHISMS) || null;
  // The Psalms category (cat.kind === 'psalms') renders through a dedicated
  // reader (verse-toggle rows, KJV/ESV switch) instead of the flip card; the
  // catechism descriptor branches to it. Whole-psalm grading still flows through
  // the shared grade() → applyCatechismOutcome path below.
  const psalmReader = createPsalmReader({ escapeHtml, withCardAnchor, rerender });
  const CAT_KEY = 'pca_catechism_v1';
  const catState = { cat: 'wsc', n: 1, revealed: false };
  try { Object.assign(catState, JSON.parse(localStorage.getItem(CAT_KEY)) || {}); } catch (e) {}
  function saveCat() {
    try { localStorage.setItem(CAT_KEY, JSON.stringify({ cat: catState.cat, n: catState.n })); } catch (e) {}
  }
  function catItems() {
    const c = CATECHISMS && CATECHISMS[catState.cat];
    return c ? c.items : [];
  }
  // Catechism-mode progress lives under a namespaced id so it tracks separately
  // from the subject decks / week plan (these flip cards aren't in PCA_DATA).
  function catKey(catId, n) { return `cat:${catId}:${n}`; }
  function catProgress(catId, n) { return state.progress[catKey(catId, n)]; }
  function catConfirmed(catId, n) { const p = catProgress(catId, n); return !!(p && p.firstConfirmedAt); }
  function catConfirmedCount(catId, items) { return items.reduce((acc, it) => acc + (catConfirmed(catId, it.n) ? 1 : 0), 0); }
  // Reflect the ESV cache size in the catechism Settings panel and disable the
  // clear button when there's nothing to clear.
  function updateCacheCount(area) {
    const count = area.querySelector('#esvCacheCount');
    const btn = area.querySelector('#esvClearCacheBtn');
    if (!count || !btn) return;
    const n = psalmReader.cachedVerseCount();
    count.textContent = n ? `${n} / 500 verses cached` : 'No verses cached';
    btn.disabled = !n;
  }
  const catechism = {
    id: 'catechism', label: 'Catechisms', usesDeck: false, focusable: false,
    title: 'The Westminster Larger & Shorter Catechisms, question by question',
    // Re-renders run through withCardAnchor so the card's top edge stays put
    // when a long answer opens or collapses (no page jump).
    go(n) {
      const items = catItems();
      if (!items.length) return;
      catState.n = ((n - 1 + items.length) % items.length) + 1;
      catState.revealed = false;
      saveCat();
      withCardAnchor(rerender);
    },
    setCat(id) {
      if (!CATECHISMS || !CATECHISMS[id]) return;
      catState.cat = id;
      catState.n = 1;
      catState.revealed = false;
      saveCat();
      withCardAnchor(rerender);
    },
    toggle() { catState.revealed = !catState.revealed; withCardAnchor(rerender); },
    // Self-grade the current question (Hard/Uncertain/Easy), then advance — the
    // same flip-card grading as Review, but written to the catechism-only
    // progress namespace and independent of the global spaced toggle.
    grade(outcome) {
      const items = catItems();
      if (!items.length) return;
      const item = items[Math.min(catState.n, items.length) - 1];
      if (!item) return;
      applyCatechismOutcome(catKey(catState.cat, item.n), outcome);
      catechism.go(catState.n + 1);
    },
    onKey(e) {
      if (e.key === 'ArrowRight') { catechism.go(catState.n + 1); return true; }
      if (e.key === 'ArrowLeft') { catechism.go(catState.n - 1); return true; }
      if (e.key === '1') { catechism.grade('again'); return true; }
      if (e.key === '2') { catechism.grade('pass'); return true; }
      if (e.key === '3') { catechism.grade('easy'); return true; }
      if (e.code === 'Space' || e.key === 'Enter') {
        // Psalms: Space/Enter toggles reveal-all/hide-all, but the reader lets a
        // focused verse/button activate natively (returns false), so don't flip.
        const cat = CATECHISMS && CATECHISMS[catState.cat];
        if (psalmReader.isPsalms(cat)) return psalmReader.onKey(e);
        e.preventDefault();
        catechism.toggle();
        return true;
      }
      return false;
    },
    render(area) {
      if (!CATECHISMS) {
        setDeckMeta('');
        area.innerHTML = emptyState('Catechism data not loaded.');
        return;
      }
      const cat = CATECHISMS[catState.cat];
      const items = cat.items;
      const item = items[Math.min(catState.n, items.length) - 1];
      // The dropdowns and nav buttons mount once and survive re-renders; only
      // the card body is rebuilt per question. Recreating a <select> while its
      // native popup is open (e.g. open a dropdown, then hit Next) orphans the
      // popup — it stays painted over the page and can never close.
      if (!area.querySelector('#catSelect')) {
        area.innerHTML = `
          <div class="cat-controls">
            <select id="catSelect" aria-label="Catechism">${Object.values(CATECHISMS).map(c =>
              `<option value="${c.id}">${escapeHtml(c.label)}</option>`).join('')}</select>
            <select id="catQSelect" aria-label="Question"></select>
          </div>
          <div id="catBody"></div>
          <div class="nav-row">
            <button class="nav-btn nav-prev" id="catPrevBtn" type="button">‹ Prev</button>
            <button class="nav-btn nav-next" id="catNextBtn" type="button">Next ›</button>
          </div>
          <div class="cat-source" id="catSource"></div>
          <details class="utility-section cat-settings">
            <summary>Settings</summary>
            <div class="cat-settings-body">
              <p class="cat-settings-note">The optional ESV Psalms reader stores the
                verses it fetches on this device (up to 500 verses) so viewed psalms
                load instantly and work offline. Clear it to free space or refresh.</p>
              <div class="cat-settings-row">
                <button class="ctrl-btn" type="button" id="esvClearCacheBtn">Clear ESV cache</button>
                <span class="cat-cache-count" id="esvCacheCount"></span>
              </div>
            </div>
          </details>`;
        area.querySelector('#catSelect').addEventListener('change', (e) => catechism.setCat(e.target.value));
        area.querySelector('#catQSelect').addEventListener('change', (e) => catechism.go(Number(e.target.value)));
        area.querySelector('#catPrevBtn').addEventListener('click', () => catechism.go(catState.n - 1));
        area.querySelector('#catNextBtn').addEventListener('click', () => catechism.go(catState.n + 1));
        area.querySelector('#esvClearCacheBtn').addEventListener('click', () => {
          psalmReader.clearCache();
          updateCacheCount(area);
        });
      }
      updateCacheCount(area);
      const catSel = area.querySelector('#catSelect');
      const qSel = area.querySelector('#catQSelect');
      if (qSel.dataset.cat !== catState.cat) {
        // Psalms read "Psalm N"; catechism questions read "QN. <text>…".
        qSel.innerHTML = psalmReader.isPsalms(cat)
          ? items.map(it => `<option value="${it.n}">Psalm ${it.n}</option>`).join('')
          : items.map(it =>
              `<option value="${it.n}">Q${it.n}. ${escapeHtml(it.q.slice(0, 60))}${it.q.length > 60 ? '…' : ''}</option>`).join('');
        qSel.dataset.cat = catState.cat;
      }
      catSel.value = catState.cat;
      qSel.value = String(item.n);
      // Per-question status (self-graded, catechism-only namespace) — shared by
      // the catechism flip card and the psalm reader alike.
      const prog = catProgress(catState.cat, item.n);
      const pct = prog && prog.reps ? getConfidencePct(prog) : null;
      const statusBadge = catConfirmed(catState.cat, item.n)
        ? `<span class="cat-status confirmed">✓ confirmed</span>`
        : (pct != null ? `<span class="cat-status">${pct}%</span>` : '');
      // Grade buttons (mirroring Review) so the reader builds its own progress;
      // grading advances to the next question/psalm.
      const markRow = `<div class="mark-row" style="display:flex">
             <button class="mark-btn mark-again" data-outcome="again" type="button">✗ Hard</button>
             <button class="mark-btn mark-pass" data-outcome="pass" type="button">~ Uncertain</button>
             <button class="mark-btn mark-easy" data-outcome="easy" type="button">✓ Easy</button>
           </div>`;
      // ── Psalms: dedicated verse-toggle reader (not a flip card) ──────────
      // Whole-psalm grading reuses catechism.grade → applyCatechismOutcome
      // (cat:psalms:<n>); verse reveal/hide never grades.
      if (psalmReader.isPsalms(cat)) {
        const body = area.querySelector('#catBody');
        body.innerHTML = psalmReader.bodyHtml(cat, item, { total: items.length, statusBadge, markRow });
        psalmReader.wire(body, cat, item);
        area.querySelector('#catSource').textContent = psalmReader.sourceText(cat);
        area.querySelectorAll('#catBody .mark-btn').forEach(btn =>
          btn.addEventListener('click', () => catechism.grade(btn.dataset.outcome)));
        setDeckMeta(`<strong>${escapeHtml(cat.label)}</strong> · ${catConfirmedCount(catState.cat, items)}/${items.length} confirmed`);
        return;
      }
      // ── Catechisms (WSC / WLC / BCO): flip card (unchanged) ──────────────
      const paraphrase = cat.verbatim === false;
      const proofs = (item.refs && item.refs.length)
        ? `<details class="qa-full"><summary class="qa-full-toggle">${paraphrase ? 'References' : 'Scripture proofs'} (${item.refs.length})</summary>
             ${renderRefs(item.refs)}</details>`
        : '';
      const calloutCls = paraphrase ? 'qa-attribution' : 'qa-standard';
      const calloutLabel = paraphrase
        ? `${escapeHtml(cat.short)} ${item.n} — paraphrase, verify against the official text`
        : `${escapeHtml(cat.label)} A.${item.n}`;
      const answerBlock = catState.revealed
        ? `<div class="qa-divider"></div>
           <div class="qa-answer"><div class="qa-callout ${calloutCls}">
             <div class="qa-prov-label">${calloutLabel}</div>
             <p>${escapeHtml(item.a)}</p></div></div>
           ${proofs}
           <div class="qa-reveal-hint qa-tap-hint">Tap card to hide</div>`
        : `<div class="qa-reveal-hint qa-tap-hint">Tap card to reveal the answer</div>`;
      area.querySelector('#catBody').innerHTML = `
        <div class="qa-card ${catState.revealed ? 'revealed' : ''}" id="catCard" role="button" tabindex="0" aria-pressed="${catState.revealed}">
          <div class="qa-deck-label"><span>${escapeHtml(cat.short)} · Question ${item.n} of ${items.length}</span>${statusBadge}</div>
          <div class="qa-question">${escapeHtml(item.q)}</div>
          ${answerBlock}
        </div>
        ${markRow}`;
      area.querySelector('#catSource').textContent = cat.source;
      const confirmedCount = catConfirmedCount(catState.cat, items);
      setDeckMeta(`<strong>${escapeHtml(cat.label)}</strong> · ${confirmedCount}/${items.length} confirmed`);
      area.querySelector('#catCard').addEventListener('click', (e) => {
        if (e.target.closest('a, select, button, summary, details')) return;
        if (typeof getSelection === 'function' && String(getSelection()).length) return;
        catechism.toggle();
      });
      area.querySelectorAll('#catBody .mark-btn').forEach(btn =>
        btn.addEventListener('click', () => catechism.grade(btn.dataset.outcome)));
    },
  };

  const list = [review, quiz, browse, exam, catechism];
  const byId = {};
  for (const m of list) byId[m.id] = m;
  return { list, byId };
}
