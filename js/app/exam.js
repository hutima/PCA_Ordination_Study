// Mock exam mode — written-exam practice modeled on the C&C committee's
// "Study Guidelines for Licensure & Ordination Exams" (sections 1–3):
//   1. Bible Knowledge — 100 questions, mixed multiple-choice & short-answer.
//   2. Theology — work through the WCF with a Shorter Catechism focus; the
//      guide states NO fixed question count, so this is a written-answer
//      self-graded practice run (do not fabricate a count).
//   3. BCO — about 50 True/False questions on PCA polity, courts & practices.
//
// This is practice modeled on the committee guide, not an official PCA exam.
// Pools draw from the app's whole card bank (independent of the study
// selection); when a pool is smaller than the committee's target the run says
// so honestly instead of padding.
//
// Item model: { kind: 'mcq'|'tf'|'short'|'written', card, quiz?, note? }.
// mcq/tf are auto-graded choice questions; short/written show the prompt with
// an optional type-your-answer box, then reveal → self-grade (Incorrect /
// Partial / Correct → the same again/pass/easy outcomes the SRS understands).

import { DATA } from './store.js';
import { quizEligible, isShortAnswer, buildQuiz } from './quiz.js';
import { subjectLabel } from './content.js';

const BIBLE_SUBJECTS = ['bible_content', 'bible_books'];
const THEOLOGY_SUBJECTS = ['theology', 'wcf', 'shorter_catechism', 'doctrines_proofs'];

// Run options, persisted across visits:
//   length — Quick / Medium / Full; per-section question counts below (Full
//            matches the committee guide's stated numbers: 100 Bible, ~50 BCO).
//   format — 'mixed' (the guide's mix: MCQ, short answer, T/F, written) or
//            'mcq' (auto-graded only: multiple choice + True/False, no typing
//            or self-grading).
const LENGTH_KEY = 'pca_exam_length_v1';
const FORMAT_KEY = 'pca_exam_format_v1';
const LENGTHS = {
  quick:  { label: 'Quick',  bible: 25,  theology: 10, bco: 15, mix: [10, 5, 10] },
  medium: { label: 'Medium', bible: 50,  theology: 20, bco: 25, mix: [20, 10, 20] },
  full:   { label: 'Full',   bible: 100, theology: 40, bco: 50, mix: [40, 20, 40] },
};
const examOpts = { length: 'medium', format: 'mixed' };
try {
  const l = localStorage.getItem(LENGTH_KEY);
  if (LENGTHS[l]) examOpts.length = l;
  if (localStorage.getItem(FORMAT_KEY) === 'mcq') examOpts.format = 'mcq';
} catch (e) {}
function saveExamOpts() {
  try {
    localStorage.setItem(LENGTH_KEY, examOpts.length);
    localStorage.setItem(FORMAT_KEY, examOpts.format);
  } catch (e) {}
}

// Every card of the given subjects (the whole bank, not the study selection),
// tagged with its set for labels/sibling lookups like cardsForKeys does.
function subjectCards(subjectIds) {
  const out = [];
  for (const sid of subjectIds) {
    const subj = DATA.subjects.find(s => s.id === sid);
    if (!subj) continue;
    for (const k of subj.setKeys) {
      const set = DATA.sets[k];
      if (!set) continue;
      for (const c of set.cards) out.push({ ...c, _setKey: k, _setLabel: set.label });
    }
  }
  return out;
}

function authoredMcqItems(subjectIds) {
  const bank = (typeof window !== 'undefined' && window.PCA_QUIZ) || [];
  return bank.filter(q => subjectIds.includes(q.subject)).map(q => ({
    kind: 'mcq',
    card: { id: q.id, q: q.q, refs: q.refs || [], _setLabel: subjectLabel(q.subject) },
    quiz: { choices: q.choices.slice(), correctIndex: q.answerIndex, picked: -1 },
  }));
}

// Bible Knowledge: EVERY card of the Bible decks is in the bank — authored
// MCQs, fact-style cards as MCQ or short-answer (coin flip for variety), and
// the longer cards (book overviews, outlines, chapter summaries) as written
// self-graded prompts. Previously only MCQ-able/short cards entered the pool,
// which silently excluded all 229 Bible Book Summaries cards. In 'mcq' format
// the bank is only the auto-graded choice questions.
function bibleItems(format) {
  const items = authoredMcqItems(BIBLE_SUBJECTS);
  for (const c of subjectCards(BIBLE_SUBJECTS)) {
    const mcqable = quizEligible(c);
    if (format === 'mcq') {
      if (mcqable) items.push({ kind: 'mcq', card: c, quiz: buildQuiz(c) });
      continue;
    }
    // Mixed format: an MCQ-able card flips a coin between MCQ and its
    // recall form (short-answer if short, written prompt if long) so the run
    // keeps the guide's mix even now that (nearly) every card carries an MCQ.
    if (mcqable && Math.random() < 0.5) items.push({ kind: 'mcq', card: c, quiz: buildQuiz(c) });
    else if (isShortAnswer(c)) items.push({ kind: 'short', card: c });
    else items.push({ kind: 'written', card: c });
  }
  return items;
}

// Theology: written-answer prompts over the doctrine decks (WCF / WSC /
// systematic theology / doctrines & proofs). Self-graded, never forced to
// MCQ — except in 'mcq' format, where the section runs on the authored
// theology MCQ bank instead.
function theologyItems(format) {
  if (format === 'mcq') {
    const items = authoredMcqItems(THEOLOGY_SUBJECTS);
    for (const c of subjectCards(THEOLOGY_SUBJECTS)) {
      if (quizEligible(c)) items.push({ kind: 'mcq', card: c, quiz: buildQuiz(c) });
    }
    return items;
  }
  return subjectCards(THEOLOGY_SUBJECTS).map(c => ({ kind: 'written', card: c }));
}

// BCO: the authored True/False bank (js/data/quiz/bco_tf.js). Paraphrase only.
function bcoItems() {
  const bank = (typeof window !== 'undefined' && window.PCA_QUIZ_TF) || [];
  return bank.map(t => ({
    kind: 'tf',
    card: { id: t.id, q: t.q, refs: t.refs || [], _setLabel: 'Book of Church Order' },
    quiz: { choices: ['True', 'False'], correctIndex: t.answer ? 0 : 1, picked: -1 },
    note: t.note || '',
  }));
}

export function createExamMode(ctx) {
  const {
    state: st, escapeHtml, renderAnswer, summarize, hasMoreThanSummary, directAnswer,
    renderRefs, resolveCardDetail, applyOutcome, rerender, setDeckMeta, shuffle,
  } = ctx;

  // Random draw spread across sub-decks: shuffle within each set, then deal
  // round-robin from a shuffled rotation of sets, so a short run samples the
  // whole span (Genesis to Revelation, every BCO block) instead of letting a
  // few large decks dominate. Returns a final shuffle of the drawn items.
  function drawSpread(items, n) {
    const groups = new Map();
    for (const it of items) {
      const k = (it.card && (it.card._setKey || it.card._setLabel)) || 'other';
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(it);
    }
    const buckets = shuffle([...groups.values()].map(g => shuffle(g)));
    const out = [];
    while (out.length < n && buckets.length) {
      for (let i = buckets.length - 1; i >= 0 && out.length < n; i--) {
        out.push(buckets[i].pop());
        if (!buckets[i].length) buckets.splice(i, 1);
      }
    }
    return shuffle(out);
  }

  // Mixed licensure practice: a sampler of all three sections, sized by the
  // current run length.
  function mixedItems(format) {
    const [b, t, c] = LENGTHS[examOpts.length].mix;
    return [
      ...drawSpread(bibleItems(format), b),
      ...drawSpread(theologyItems(format), t),
      ...drawSpread(bcoItems(format), c),
    ];
  }

  const SECTIONS = [
    {
      id: 'bible', label: 'Bible Knowledge practice', target: 100,
      kinds: 'mixed multiple-choice & short-answer (guide: 100 questions)',
      build: bibleItems,
      desc: 'Scripture broadly — especially Genesis, Exodus, Psalms, Isaiah, the Gospels, Acts, Romans, Ephesians & Hebrews. Every card in the Bible decks is in the bank: fact cards as multiple choice or short answer, book overviews & outlines as written self-graded prompts.',
    },
    {
      id: 'theology', label: 'Theology written practice', target: null,
      kinds: 'written answers, self-graded',
      build: theologyItems,
      desc: 'The Westminster Confession with a Shorter Catechism focus — Trinity, Scripture, creation, providence, sin, Christ, the ordo salutis, the Holy Spirit, the Church, death & the eschaton — supported from Scripture.',
      note: 'The committee guide states no fixed question count for Theology.',
    },
    {
      id: 'bco', label: 'BCO practice', target: 50,
      kinds: 'True / False (guide: about 50 questions)',
      build: bcoItems,
      desc: 'PCA polity, courts & practices — the five permanent committees, elements of worship, the courts, the constitution, the three parts of the BCO, discipline & censures.',
    },
    {
      id: 'mixed', label: 'Mixed licensure practice', target: null,
      kinds: 'all three sections in one sitting',
      build: mixedItems,
      desc: 'Bible Knowledge, Theology written prompts, and BCO True/False together, sized by the run length.',
    },
  ];
  const sectionById = {};
  for (const s of SECTIONS) sectionById[s.id] = s;

  // Question count for a section at the current run length.
  function countFor(sec) {
    const L = LENGTHS[examOpts.length];
    if (sec.id === 'mixed') return L.mix[0] + L.mix[1] + L.mix[2];
    return L[sec.id];
  }

  const KIND_LABEL = { mcq: 'Multiple choice', tf: 'True / False', short: 'Short answer', written: 'Written answer' };
  const isChoice = (item) => item.kind === 'mcq' || item.kind === 'tf';

  // ── Session control ────────────────────────────────────────────────
  function begin(sectionId) {
    const sec = sectionById[sectionId];
    if (!sec) return;
    const pool = sec.build(examOpts.format);
    const available = pool.length;
    if (!available) return;
    const want = countFor(sec);
    // Mixed builds its own per-section spread; the rest draw across sub-decks.
    const items = sec.id === 'mixed' ? shuffle(pool) : drawSpread(pool, Math.min(want, available));
    st.exam = {
      section: sec.id, items, pos: 0, done: false,
      available, want, length: examOpts.length, format: examOpts.format,
    };
    rerender();
  }

  const exam = {
    id: 'exam', label: 'Mock exam', usesDeck: false, focusable: false,
    title: 'Written-exam practice modeled on your committee’s study guidelines — Bible Knowledge, Theology, and BCO sections',
    start() { st.exam = null; }, // entering the mode always lands on the chooser

    // Auto-graded choice questions (MCQ and True/False).
    pick(idx) {
      const ex = st.exam;
      if (!ex || ex.done) return;
      const item = ex.items[ex.pos];
      if (!item || !isChoice(item) || item.quiz.picked >= 0) return;
      item.quiz.picked = idx;
      applyOutcome(item.card, idx === item.quiz.correctIndex ? 'easy' : 'again');
      rerender();
    },
    // Short/written items: capture whatever was typed, then show the answer.
    reveal() {
      const ex = st.exam;
      if (!ex || ex.done) return;
      const item = ex.items[ex.pos];
      if (!item || isChoice(item) || item.revealed) return;
      const input = document.getElementById('examAnswerInput');
      item.typed = input ? input.value.trim() : '';
      item.revealed = true;
      rerender();
    },
    // Self-grade a revealed short/written item, then advance.
    grade(outcome) {
      const ex = st.exam;
      if (!ex || ex.done) return;
      const item = ex.items[ex.pos];
      if (!item || isChoice(item) || !item.revealed || item.self) return;
      item.self = outcome; // 'again' | 'pass' | 'easy'
      applyOutcome(item.card, outcome);
      exam.next();
    },
    next() {
      const ex = st.exam;
      if (!ex || ex.done) return;
      if (ex.pos + 1 >= ex.items.length) ex.done = true;
      else ex.pos += 1;
      rerender();
    },
    finish() { // end early and score what's been answered so far
      const ex = st.exam;
      if (!ex) return;
      ex.done = true;
      rerender();
    },

    onKey(e) {
      const ex = st.exam;
      if (!ex || ex.done) return false;
      const item = ex.items[ex.pos];
      if (!item) return false;
      const tag = e.target && e.target.tagName;
      const advanceKey = e.code === 'Space' || e.key === 'Enter' || e.key === 'ArrowRight';
      if (isChoice(item)) {
        if (item.quiz.picked < 0) {
          if (item.kind === 'tf' && /^[tf]$/i.test(e.key)) { exam.pick(e.key.toLowerCase() === 't' ? 0 : 1); return true; }
          if (/^[1-9]$/.test(e.key)) {
            const i = Number(e.key) - 1;
            if (i < item.quiz.choices.length) { exam.pick(i); return true; }
          }
          return false;
        }
        if (advanceKey) {
          if (/BUTTON|A/.test(tag)) return false; // let a focused button click natively
          e.preventDefault(); exam.next(); return true;
        }
        return false;
      }
      if (!item.revealed) {
        if (e.code === 'Space' || e.key === 'Enter') {
          if (/BUTTON|A|TEXTAREA/.test(tag)) return false;
          e.preventDefault(); exam.reveal(); return true;
        }
        return false;
      }
      if (e.key === '1') { exam.grade('again'); return true; }
      if (e.key === '2') { exam.grade('pass'); return true; }
      if (e.key === '3') { exam.grade('easy'); return true; }
      return false;
    },

    render(area) {
      const ex = st.exam;
      if (!ex) return renderChooser(area);
      if (ex.done) return renderResults(area);
      const item = ex.items[ex.pos];
      if (!item) { st.exam = null; return renderChooser(area); }
      renderRunMeta(ex);
      if (isChoice(item)) renderChoiceItem(area, ex, item);
      else renderWrittenItem(area, ex, item);
    },
  };

  // ── Section chooser (the mode's start screen) ──────────────────────
  function availabilityLine(sec, avail) {
    if (sec.id === 'mixed') return `${avail} questions per run (${LENGTHS[examOpts.length].label})`;
    let line = `${avail} in the bank · ${Math.min(countFor(sec), avail)} drawn at random per run`;
    if (sec.target) line += ` · guide’s written section: ${sec.target}`;
    return line;
  }
  function optRow(label, attr, options, current) {
    const btns = options.map(([value, text, title]) =>
      `<button class="theme-btn ${current === value ? 'active' : ''}" ${attr}="${value}" type="button"${title ? ` title="${escapeHtml(title)}"` : ''}>${text}</button>`).join('');
    return `<div class="exam-opt-row" role="group" aria-label="${label}">
      <span class="exam-opt-label">${label}</span><div class="theme-switcher">${btns}</div></div>`;
  }
  function renderChooser(area) {
    setDeckMeta('Mock exam — pick a written-exam section');
    const cards = SECTIONS.map(sec => {
      const avail = sec.build(examOpts.format).length;
      return `<button class="exam-section-card" data-exam-section="${sec.id}" type="button" ${avail ? '' : 'disabled'}>
        <span class="exam-section-title">${escapeHtml(sec.label)}</span>
        <span class="exam-section-kinds">${escapeHtml(sec.kinds)}</span>
        <span class="exam-section-desc">${escapeHtml(sec.desc)}</span>
        <span class="exam-section-meta">${avail ? escapeHtml(availabilityLine(sec, avail)) : 'No questions available in this format yet'}</span>
        ${sec.note ? `<span class="exam-section-note">${escapeHtml(sec.note)}</span>` : ''}
      </button>`;
    }).join('');
    area.innerHTML = `
      <p class="exam-intro">Practice modeled on the C&amp;C committee’s study guidelines for the
        written licensure exam — not an official PCA exam. Sections draw on the app’s whole
        card bank, regardless of your study selection.</p>
      ${optRow('Length', 'data-exam-length',
        [['quick', 'Quick'], ['medium', 'Medium'], ['full', 'Full', 'Full matches the committee guide’s counts: 100 Bible Knowledge, ~50 BCO True/False']],
        examOpts.length)}
      ${optRow('Format', 'data-exam-format',
        [['mixed', 'Mixed', 'The guide’s mix — multiple choice, short answer, True/False, and written prompts'],
         ['mcq', 'MCQ only', 'Auto-graded questions only: multiple choice and True/False — no typing or self-grading']],
        examOpts.format)}
      <div class="exam-sections">${cards}</div>`;
    area.querySelectorAll('[data-exam-section]').forEach(btn =>
      btn.addEventListener('click', () => begin(btn.dataset.examSection)));
    area.querySelectorAll('[data-exam-length]').forEach(btn =>
      btn.addEventListener('click', () => { examOpts.length = btn.getAttribute('data-exam-length'); saveExamOpts(); renderChooser(area); }));
    area.querySelectorAll('[data-exam-format]').forEach(btn =>
      btn.addEventListener('click', () => { examOpts.format = btn.getAttribute('data-exam-format') === 'mcq' ? 'mcq' : 'mixed'; saveExamOpts(); renderChooser(area); }));
  }

  // ── Run rendering ──────────────────────────────────────────────────
  function renderRunMeta(ex) {
    const sec = sectionById[ex.section];
    const mode = `${LENGTHS[ex.length] ? LENGTHS[ex.length].label : ''}${ex.format === 'mcq' ? ' · MCQ only' : ''}`;
    let m = `Mock exam · ${escapeHtml(sec.label)} · ${mode} — question <strong>${ex.pos + 1}</strong> of <strong>${ex.items.length}</strong>`;
    if (ex.want && ex.items.length < ex.want) m += ` (only ${ex.items.length} available)`;
    setDeckMeta(m);
  }
  function finishRowHtml(ex, nextHtml) {
    const answered = countAnswered(ex);
    const finishBtn = answered && !ex.done
      ? `<button class="nav-btn nav-prev" id="examFinishBtn" type="button">Finish now</button>` : '<span></span>';
    return `<div class="nav-row">${finishBtn}${nextHtml}</div>`;
  }
  function wireRun(area) {
    const fb = area.querySelector('#examFinishBtn');
    if (fb) fb.addEventListener('click', () => exam.finish());
    const nb = area.querySelector('#examNextBtn');
    if (nb) nb.addEventListener('click', () => exam.next());
  }

  function renderChoices(quiz, tf) {
    const btns = quiz.choices.map((choice, idx) => {
      let cls = 'quiz-choice';
      if (quiz.picked >= 0) {
        if (idx === quiz.correctIndex) cls += ' correct';
        else if (idx === quiz.picked) cls += ' wrong';
        else cls += ' dim';
      }
      return `<button class="${cls}" data-choice="${idx}" type="button" ${quiz.picked >= 0 ? 'disabled' : ''}>${escapeHtml(choice)}</button>`;
    }).join('');
    return `<div class="quiz-choices${tf ? ' quiz-choices-tf' : ''}">${btns}</div>`;
  }
  function renderChoiceItem(area, ex, item) {
    const q = item.quiz;
    const feedback = q.picked >= 0
      ? `<div class="quiz-feedback ${q.picked === q.correctIndex ? 'correct' : 'wrong'}">${q.picked === q.correctIndex ? '✓ Correct' : '✗ Not quite'}</div>
         ${item.note ? `<div class="quiz-note">${escapeHtml(item.note)}</div>` : ''}
         ${renderRefs(item.card.refs)}`
      : '';
    const last = ex.pos + 1 >= ex.items.length;
    const nextBtn = `<button class="nav-btn nav-next" id="examNextBtn" type="button" ${q.picked >= 0 ? '' : 'disabled'}>${last ? 'See results ›' : 'Next ›'}</button>`;
    area.innerHTML = `
      <div class="qa-card revealed">
        <div class="qa-deck-label">${escapeHtml(item.card._setLabel)} · ${KIND_LABEL[item.kind]}</div>
        <div class="qa-question">${escapeHtml(q.prompt || item.card.q)}</div>
        ${renderChoices(q, item.kind === 'tf')}
        ${feedback}
      </div>
      ${finishRowHtml(ex, nextBtn)}`;
    area.querySelectorAll('.quiz-choice').forEach(btn =>
      btn.addEventListener('click', () => exam.pick(Number(btn.dataset.choice))));
    wireRun(area);
  }

  // Review-style answer body (WCF-detail aware): short answers render in full,
  // long ones as summary + a "full answer" expander.
  function answerHtml(card) {
    const rc = resolveCardDetail(card);
    const direct = directAnswer(rc) || rc._wcfFull || !hasMoreThanSummary(rc);
    if (direct) return `<div class="qa-answer">${renderAnswer(rc.a)}</div>`;
    const fullLabel = rc._wcfSummaryMode ? 'Full WCF text' : 'Full answer &amp; quotations';
    return `<div class="qa-summary">${renderAnswer(summarize(rc))}</div>
      <details class="qa-full"><summary class="qa-full-toggle">${fullLabel}</summary>
        <div class="qa-answer">${renderAnswer(rc.a)}</div></details>`;
  }
  function renderWrittenItem(area, ex, item) {
    const card = item.card;
    let body;
    if (!item.revealed) {
      body = `
        <textarea id="examAnswerInput" class="exam-answer-input" rows="4"
          placeholder="Type your answer (optional), then reveal to self-grade…">${escapeHtml(item.typed || '')}</textarea>
        ${finishRowHtml(ex, '<button class="nav-btn nav-next" id="examRevealBtn" type="button">Reveal answer</button>')}`;
    } else {
      const typed = item.typed
        ? `<div class="exam-typed"><span class="exam-typed-label">Your answer</span>${escapeHtml(item.typed)}</div>` : '';
      body = `
        ${typed}
        <div class="qa-divider"></div>
        ${answerHtml(card)}
        ${renderRefs(card.refs)}
        <div class="mark-row" style="display:flex">
          <button class="mark-btn mark-again" data-outcome="again" type="button">✗ Incorrect</button>
          <button class="mark-btn mark-pass" data-outcome="pass" type="button">~ Partial</button>
          <button class="mark-btn mark-easy" data-outcome="easy" type="button">✓ Correct</button>
        </div>`;
    }
    area.innerHTML = `
      <div class="qa-card revealed">
        <div class="qa-deck-label">${escapeHtml(card._setLabel)} · ${KIND_LABEL[item.kind]}${item.kind === 'written' ? ' (self-graded)' : ''}</div>
        <div class="qa-question">${escapeHtml(card.q)}</div>
        ${body}
      </div>
      ${item.revealed ? finishRowHtml(ex, '<span></span>') : ''}`;
    const rb = area.querySelector('#examRevealBtn');
    if (rb) rb.addEventListener('click', () => exam.reveal());
    area.querySelectorAll('.mark-btn').forEach(btn =>
      btn.addEventListener('click', () => exam.grade(btn.dataset.outcome)));
    wireRun(area);
  }

  // ── Results ────────────────────────────────────────────────────────
  function countAnswered(ex) {
    return ex.items.filter(it => isChoice(it) ? it.quiz.picked >= 0 : !!it.self).length;
  }
  function renderResults(area) {
    const ex = st.exam;
    const sec = sectionById[ex.section];
    const auto = ex.items.filter(it => isChoice(it) && it.quiz.picked >= 0);
    const autoCorrect = auto.filter(it => it.quiz.picked === it.quiz.correctIndex).length;
    const selfG = ex.items.filter(it => !isChoice(it) && it.self);
    const selfN = (o) => selfG.filter(it => it.self === o).length;
    const answered = auto.length + selfG.length;
    const pct = auto.length ? Math.round((autoCorrect / auto.length) * 100) : null;

    const scoreLines = [];
    if (auto.length) scoreLines.push(`<div class="exam-score">${autoCorrect} / ${auto.length} <span class="exam-score-pct">${pct}% auto-graded</span></div>`);
    if (selfG.length) scoreLines.push(`<div class="exam-self-score">Self-graded: <strong>${selfN('easy')}</strong> correct · <strong>${selfN('pass')}</strong> partial · <strong>${selfN('again')}</strong> incorrect</div>`);
    const lenLabel = (LENGTHS[ex.length] ? LENGTHS[ex.length].label : 'Custom') + (ex.format === 'mcq' ? ', MCQ only' : '');
    const targetNote = sec.target
      ? `Answered ${answered} of ${ex.items.length} shown (${lenLabel} run) · the committee guide’s written section is ${sec.target} questions.`
      : `Answered ${answered} of ${ex.items.length} shown (${lenLabel} run)${sec.id === 'theology' ? ' · no fixed count stated in the committee guide.' : '.'}`;

    const bySub = new Map();
    for (const it of ex.items) {
      const ok = isChoice(it) ? (it.quiz.picked >= 0 ? it.quiz.picked === it.quiz.correctIndex : null)
        : (it.self ? it.self === 'easy' : null);
      if (ok === null) continue;
      const rec = bySub.get(it.card._setLabel) || { c: 0, n: 0 };
      rec.n += 1; if (ok) rec.c += 1;
      bySub.set(it.card._setLabel, rec);
    }
    const subHtml = [...bySub.entries()].map(([label, r]) =>
      `<div class="review-item">${escapeHtml(label)}<span style="float:right;color:var(--muted)">${r.c}/${r.n}</span></div>`).join('');

    const missed = ex.items.filter(it => isChoice(it)
      ? (it.quiz.picked >= 0 && it.quiz.picked !== it.quiz.correctIndex)
      : it.self === 'again');
    const missedHtml = missed.length
      ? `<div class="prog-section-title">Review these (${missed.length})</div>` + missed.map(it =>
          `<div class="review-item">${escapeHtml(it.card.q)}
             <div style="color:var(--gold-light);margin-top:4px;font-size:14px">${isChoice(it)
               ? escapeHtml(it.quiz.choices[it.quiz.correctIndex]) : 'Self-marked incorrect — revisit this card in Review.'}</div></div>`).join('')
      : (answered ? `<div class="prog-section-title">Nothing missed — well done.</div>` : '');

    setDeckMeta('');
    area.innerHTML = `
      <div class="qa-card revealed exam-results">
        <div class="qa-deck-label">Mock exam · ${escapeHtml(sec.label)} · results</div>
        ${scoreLines.join('') || '<div class="exam-self-score">No questions answered.</div>'}
        <p class="exam-target-note">${escapeHtml(targetNote)}</p>
        ${subHtml ? `<div class="prog-section-title">By deck</div>${subHtml}` : ''}
        ${missedHtml}
        <div class="nav-row" style="margin-top:18px">
          <button class="nav-btn nav-prev" id="examSectionsBtn" type="button">‹ Sections</button>
          <button class="nav-btn nav-next" id="examRetakeBtn" type="button">Take another ›</button>
        </div>
      </div>`;
    area.querySelector('#examSectionsBtn').addEventListener('click', () => { st.exam = null; rerender(); });
    area.querySelector('#examRetakeBtn').addEventListener('click', () => begin(ex.section));
  }

  return exam;
}
