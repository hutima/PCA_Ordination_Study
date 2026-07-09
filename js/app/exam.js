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

// Bible Knowledge: authored MCQs + one item per eligible card — MCQ when the
// card can carry one, otherwise (or by coin flip, for variety) a short-answer
// prompt, mirroring the guide's mixed multiple-choice / short-answer format.
function bibleItems() {
  const items = authoredMcqItems(BIBLE_SUBJECTS);
  for (const c of subjectCards(BIBLE_SUBJECTS)) {
    const mcqable = quizEligible(c);
    const shortable = isShortAnswer(c);
    if (mcqable && (!shortable || Math.random() < 0.5)) {
      items.push({ kind: 'mcq', card: c, quiz: buildQuiz(c) });
    } else if (shortable) {
      items.push({ kind: 'short', card: c });
    }
  }
  return items;
}

// Theology: written-answer prompts over the doctrine decks (WCF / WSC /
// systematic theology / doctrines & proofs). Self-graded, never forced to MCQ.
function theologyItems() {
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

  // Mixed licensure practice: a shortened sampler of all three sections.
  function mixedItems() {
    const take = (arr, n) => shuffle(arr).slice(0, n);
    return [...take(bibleItems(), 20), ...take(theologyItems(), 10), ...take(bcoItems(), 20)];
  }

  const SECTIONS = [
    {
      id: 'bible', label: 'Bible Knowledge practice', target: 100,
      kinds: '100 mixed multiple-choice & short-answer',
      build: bibleItems,
      desc: 'Scripture broadly — especially Genesis, Exodus, Psalms, Isaiah, the Gospels, Acts, Romans, Ephesians & Hebrews.',
    },
    {
      id: 'theology', label: 'Theology written practice', target: null, sample: 20,
      kinds: 'written answers, self-graded',
      build: theologyItems,
      desc: 'The Westminster Confession with a Shorter Catechism focus — Trinity, Scripture, creation, providence, sin, Christ, the ordo salutis, the Holy Spirit, the Church, death & the eschaton — supported from Scripture.',
      note: 'The committee guide states no fixed question count for Theology; each run samples 20 prompts.',
    },
    {
      id: 'bco', label: 'BCO practice', target: 50,
      kinds: 'about 50 True / False',
      build: bcoItems,
      desc: 'PCA polity, courts & practices — the five permanent committees, elements of worship, the courts, the constitution, the three parts of the BCO, discipline & censures.',
    },
    {
      id: 'mixed', label: 'Mixed licensure practice', target: null,
      kinds: 'a shortened sampler of all three sections',
      build: mixedItems,
      desc: '20 Bible Knowledge questions, 10 Theology written prompts, and 20 BCO True/False in one sitting.',
    },
  ];
  const sectionById = {};
  for (const s of SECTIONS) sectionById[s.id] = s;

  const KIND_LABEL = { mcq: 'Multiple choice', tf: 'True / False', short: 'Short answer', written: 'Written answer' };
  const isChoice = (item) => item.kind === 'mcq' || item.kind === 'tf';

  // ── Session control ────────────────────────────────────────────────
  function begin(sectionId) {
    const sec = sectionById[sectionId];
    if (!sec) return;
    let items = sec.build();
    const available = items.length;
    if (!available) return;
    shuffle(items);
    const cap = sec.target || sec.sample;
    if (cap) items = items.slice(0, cap);
    st.exam = { section: sec.id, items, pos: 0, done: false, available };
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
    if (sec.id === 'theology') return `${avail} prompts available · ${sec.sample} sampled per run`;
    if (sec.id === 'mixed') return 'up to 50 questions per run';
    const short = avail < sec.target ? `${avail} available of the` : `${avail} available ·`;
    return `${short} ${sec.target}-question written section`;
  }
  function renderChooser(area) {
    setDeckMeta('Mock exam — pick a written-exam section');
    const cards = SECTIONS.map(sec => {
      const avail = sec.build().length;
      return `<button class="exam-section-card" data-exam-section="${sec.id}" type="button" ${avail ? '' : 'disabled'}>
        <span class="exam-section-title">${escapeHtml(sec.label)}</span>
        <span class="exam-section-kinds">${escapeHtml(sec.kinds)}</span>
        <span class="exam-section-desc">${escapeHtml(sec.desc)}</span>
        <span class="exam-section-meta">${avail ? escapeHtml(availabilityLine(sec, avail)) : 'No questions available yet'}</span>
        ${sec.note ? `<span class="exam-section-note">${escapeHtml(sec.note)}</span>` : ''}
      </button>`;
    }).join('');
    area.innerHTML = `
      <p class="exam-intro">Practice modeled on the C&amp;C committee’s study guidelines for the
        written licensure exam — not an official PCA exam. Sections draw on the app’s whole
        card bank, regardless of your study selection.</p>
      <div class="exam-sections">${cards}</div>`;
    area.querySelectorAll('[data-exam-section]').forEach(btn =>
      btn.addEventListener('click', () => begin(btn.dataset.examSection)));
  }

  // ── Run rendering ──────────────────────────────────────────────────
  function renderRunMeta(ex) {
    const sec = sectionById[ex.section];
    let m = `Mock exam · ${escapeHtml(sec.label)} — question <strong>${ex.pos + 1}</strong> of <strong>${ex.items.length}</strong>`;
    if (sec.target && ex.items.length < sec.target) m += ` (target ${sec.target}; ${ex.items.length} available)`;
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
        <div class="qa-question">${escapeHtml(item.card.q)}</div>
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
    const targetNote = sec.target
      ? `Answered ${answered} of ${ex.items.length} shown · the written-exam section is ${sec.target} questions${ex.available < sec.target ? ` (${ex.available} available here)` : ''}.`
      : `Answered ${answered} of ${ex.items.length} shown · ${sec.id === 'theology' ? 'no fixed count stated in the committee guide.' : 'mixed sampler.'}`;

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
