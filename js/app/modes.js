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

export function createModes(ctx) {
  const {
    state, DATA, escapeHtml, renderAnswer, summarize, hasMoreThanSummary, renderRefs,
    buildQuiz, applyOutcome, rerender, mark, move, toggleReveal,
    effectiveSetKeys, quizDeckCards, shuffle, emptyState, navRowHtml, wireNav,
    setDeckMeta, EXAM_SIZE,
  } = ctx;

  // ── Review (self-check, progressive disclosure) ──────────────────────
  const review = {
    id: 'review', label: 'Review', usesDeck: true, focusable: true,
    title: 'Self-check flashcards: recall, reveal, grade yourself',
    render(area) {
      const card = state.deck[state.pos];
      const refsHtml = renderRefs(card.refs);
      const more = hasMoreThanSummary(card);
      // Reveal shows a short summary first; the full answer + quotations sit
      // behind a tap-to-open expander so long card backs stay scannable.
      const fullBlock = more
        ? `<details class="qa-full"><summary class="qa-full-toggle">Full answer &amp; quotations</summary>
             <div class="qa-answer">${renderAnswer(card.a)}</div></details>`
        : '';
      const answerBlock = state.revealed
        ? `<div class="qa-divider"></div>
           <div class="qa-summary">${escapeHtml(summarize(card))}</div>
           ${refsHtml}${fullBlock}
           <div class="qa-reveal-hint qa-tap-hint">Tap card to hide</div>`
        : `<div class="qa-reveal-hint qa-tap-hint">Tap card to reveal answer</div>`;
      const markRow = state.revealed
        ? `<div class="mark-row" style="display:flex">
             <button class="mark-btn mark-again" data-outcome="again" type="button">✗ Hard</button>
             <button class="mark-btn mark-pass" data-outcome="pass" type="button">~ Uncertain</button>
             <button class="mark-btn mark-easy" data-outcome="easy" type="button">✓ Easy</button>
           </div>`
        : '';
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

  // ── Browse (non-graded outline) ──────────────────────────────────────
  const browse = {
    id: 'browse', label: 'Browse', usesDeck: false, focusable: false,
    title: 'Read a subject as an outline — tap a question to expand the answer',
    render(area) {
      const keys = effectiveSetKeys();
      setDeckMeta('');
      if (!keys.length) { area.innerHTML = emptyState('Choose one or more subjects, then browse them here as an outline.'); return; }
      let total = 0;
      let html = `<div class="browse-controls">
          <button class="ctrl-btn" id="browseExpandBtn" type="button">Expand all</button>
          <button class="ctrl-btn" id="browseCollapseBtn" type="button">Collapse all</button>
        </div>`;
      for (const k of keys) {
        const set = DATA.sets[k];
        if (!set) continue;
        html += `<div class="browse-group"><div class="browse-group-title">${escapeHtml(set.label)} · ${set.cards.length}</div>`;
        for (const c of set.cards) {
          total++;
          html += `<details class="browse-item"><summary>${escapeHtml(c.q)}</summary>
            <div class="browse-a">${renderAnswer(c.a)}${renderRefs(c.refs)}</div></details>`;
        }
        html += `</div>`;
      }
      area.innerHTML = html;
      setDeckMeta(`Browsing <strong>${total}</strong> cards across <strong>${keys.length}</strong> sub-decks`);
      area.querySelector('#browseExpandBtn').addEventListener('click', () => area.querySelectorAll('details').forEach(d => { d.open = true; }));
      area.querySelector('#browseCollapseBtn').addEventListener('click', () => area.querySelectorAll('details').forEach(d => { d.open = false; }));
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
        area.innerHTML = emptyState('Not enough quiz-ready material for a mock exam in this selection. Pick more subjects, or clear the selection to draw from everything.');
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
          <button class="nav-btn" id="examNextBtn" type="button" ${q.picked >= 0 ? '' : 'disabled'}>${last ? 'See results ›' : 'Next ›'}</button>
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
          <button class="nav-btn" id="examRetakeBtn" type="button">Take another ›</button>
        </div>
      </div>`;
    area.querySelector('#examRetakeBtn').addEventListener('click', () => { exam.start(); rerender(); });
  }

  // ── Catechisms (WSC / WLC full text, dropdown-driven recall) ─────────
  // Q&A straight through the public-domain Westminster catechisms: pick a
  // catechism and a question, recall the answer, tap to check yourself.
  // Non-graded; proof citations render as chips linking to the source.
  const CATECHISMS = (typeof window !== 'undefined' && window.PCA_CATECHISMS) || null;
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
  const catechism = {
    id: 'catechism', label: 'Catechisms', usesDeck: false, focusable: false,
    title: 'The Westminster Larger & Shorter Catechisms, question by question',
    go(n) {
      const items = catItems();
      if (!items.length) return;
      catState.n = ((n - 1 + items.length) % items.length) + 1;
      catState.revealed = false;
      saveCat();
      rerender();
    },
    setCat(id) {
      if (!CATECHISMS || !CATECHISMS[id]) return;
      catState.cat = id;
      catState.n = 1;
      catState.revealed = false;
      saveCat();
      rerender();
    },
    toggle() { catState.revealed = !catState.revealed; rerender(); },
    onKey(e) {
      if (e.key === 'ArrowRight') { catechism.go(catState.n + 1); return true; }
      if (e.key === 'ArrowLeft') { catechism.go(catState.n - 1); return true; }
      if (e.code === 'Space' || e.key === 'Enter') {
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
      const catOptions = Object.values(CATECHISMS).map(c =>
        `<option value="${c.id}" ${c.id === catState.cat ? 'selected' : ''}>${escapeHtml(c.label)}</option>`).join('');
      const qOptions = items.map(it =>
        `<option value="${it.n}" ${it.n === item.n ? 'selected' : ''}>Q${it.n}. ${escapeHtml(it.q.slice(0, 60))}${it.q.length > 60 ? '…' : ''}</option>`).join('');
      const proofs = (item.refs && item.refs.length)
        ? `<details class="qa-full"><summary class="qa-full-toggle">Scripture proofs (${item.refs.length})</summary>
             ${renderRefs(item.refs)}</details>`
        : '';
      const answerBlock = catState.revealed
        ? `<div class="qa-divider"></div>
           <div class="qa-answer"><div class="qa-callout qa-standard">
             <div class="qa-prov-label">${escapeHtml(cat.label)} A.${item.n}</div>
             <p>${escapeHtml(item.a)}</p></div></div>
           ${proofs}
           <div class="qa-reveal-hint qa-tap-hint">Tap card to hide</div>`
        : `<div class="qa-reveal-hint qa-tap-hint">Tap card to reveal the answer</div>`;
      area.innerHTML = `
        <div class="cat-controls">
          <select id="catSelect" aria-label="Catechism">${catOptions}</select>
          <select id="catQSelect" aria-label="Question">${qOptions}</select>
        </div>
        <div class="qa-card ${catState.revealed ? 'revealed' : ''}" id="catCard" role="button" tabindex="0" aria-pressed="${catState.revealed}">
          <div class="qa-deck-label">${escapeHtml(cat.short)} · Question ${item.n} of ${items.length}</div>
          <div class="qa-question">${escapeHtml(item.q)}</div>
          ${answerBlock}
        </div>
        <div class="nav-row">
          <button class="nav-btn nav-prev" id="catPrevBtn" type="button">‹ Prev</button>
          <button class="nav-btn" id="catNextBtn" type="button">Next ›</button>
        </div>
        <div class="cat-source">${escapeHtml(cat.source)}</div>`;
      setDeckMeta(`<strong>${escapeHtml(cat.label)}</strong> · ${items.length} questions`);
      area.querySelector('#catSelect').addEventListener('change', (e) => catechism.setCat(e.target.value));
      area.querySelector('#catQSelect').addEventListener('change', (e) => catechism.go(Number(e.target.value)));
      area.querySelector('#catPrevBtn').addEventListener('click', () => catechism.go(catState.n - 1));
      area.querySelector('#catNextBtn').addEventListener('click', () => catechism.go(catState.n + 1));
      area.querySelector('#catCard').addEventListener('click', (e) => {
        if (e.target.closest('a, select, button, summary, details')) return;
        if (typeof getSelection === 'function' && String(getSelection()).length) return;
        catechism.toggle();
      });
    },
  };

  const list = [review, quiz, browse, exam, catechism];
  const byId = {};
  for (const m of list) byId[m.id] = m;
  return { list, byId };
}
