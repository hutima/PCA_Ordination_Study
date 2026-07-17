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
import { buildScore, scorePercent, gradeForPercent } from '../domain/scoring.js';
import { tallyCodes } from '../domain/examScore.js';
import { recordExamResult } from './scoreRecords.js';
import { gradeBadgeHtml, scoreHeroHtml, expectedPassNote } from './scoreUi.js';
import { playCorrect, playWrong, playResultSound, celebrateResult } from './celebration.js';

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
  quick:  { label: 'Quick',  bible: 25,  theology: 10, bco: 15 },
  medium: { label: 'Medium', bible: 50,  theology: 20, bco: 25 },
  full:   { label: 'Full',   bible: 100, theology: 40, bco: 50 },
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

// ── Persistent per-section progress ────────────────────────────────────
// Answers persist until the section's Reset button is pressed, so a section
// can be completed across many sittings with a running score:
//   sections — per section id, a map of card/bank-question id → result code:
//              'c' correct / 'w' wrong (auto-graded), 'e'/'p'/'a' self-graded
//              Correct/Partial/Incorrect. Mixed runs credit each answer to the
//              question's home section.
//   run      — the in-flight sitting ({ section, entries:[{id,kind,origin}],
//              want, length, format }), so an interrupted run resumes with the
//              same questions (already-answered ones drop out on resume).
// New draws exclude already-answered questions, so successive runs walk the
// whole bank; when nothing is left the section shows its final tabulation.
const PROGRESS_KEY = 'pca_exam_progress_v1';
const prog = { sections: {}, run: null };
try {
  const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  if (stored.sections && typeof stored.sections === 'object') prog.sections = stored.sections;
  if (stored.run && Array.isArray(stored.run.entries)) prog.run = stored.run;
} catch (e) {}
function saveProg() {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog)); } catch (e) {}
}
function answeredSet(secId) { return new Set(Object.keys(prog.sections[secId] || {})); }

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

// Item factories, shared by the pool builders and run-resume rebuilding.
function authoredItem(q) {
  return {
    kind: 'mcq',
    card: { id: q.id, q: q.q, refs: q.refs || [], _setLabel: subjectLabel(q.subject) },
    quiz: { choices: q.choices.slice(), correctIndex: q.answerIndex, picked: -1 },
  };
}
function tfItem(t) {
  return {
    kind: 'tf',
    card: { id: t.id, q: t.q, refs: t.refs || [], _setLabel: 'Book of Church Order' },
    quiz: { choices: ['True', 'False'], correctIndex: t.answer ? 0 : 1, picked: -1 },
    note: t.note || '',
  };
}
function authoredMcqItems(subjectIds) {
  const bank = (typeof window !== 'undefined' && window.PCA_QUIZ) || [];
  return bank.filter(q => subjectIds.includes(q.subject)).map(authoredItem);
}

// Card lookup across the whole bank (lazy) — used to rebuild a persisted run.
let cardIndex = null;
function cardById(id) {
  if (!cardIndex) {
    cardIndex = new Map();
    for (const subj of DATA.subjects) {
      for (const k of subj.setKeys) {
        const set = DATA.sets[k];
        if (!set) continue;
        for (const c of set.cards) cardIndex.set(c.id, { ...c, _setKey: k, _setLabel: set.label });
      }
    }
  }
  return cardIndex.get(id) || null;
}
// Rebuild one persisted run entry into a live item. Returns null when the
// question no longer exists (content updated between releases).
function rebuildItem(e) {
  if (e.kind === 'tf') {
    const t = (((typeof window !== 'undefined' && window.PCA_QUIZ_TF) || [])).find(x => x.id === e.id);
    return t ? tfItem(t) : null;
  }
  const bankQ = (((typeof window !== 'undefined' && window.PCA_QUIZ) || [])).find(x => x.id === e.id);
  if (bankQ) return authoredItem(bankQ);
  const card = cardById(e.id);
  if (!card) return null;
  if (e.kind === 'mcq') {
    return quizEligible(card)
      ? { kind: 'mcq', card, quiz: buildQuiz(card) }
      : { kind: isShortAnswer(card) ? 'short' : 'written', card };
  }
  return { kind: e.kind, card };
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
  return bank.map(tfItem);
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

  // A section's pool minus the questions already answered (persisted), so
  // successive runs walk the whole bank toward completion.
  function freshOf(secId, format) {
    const done = answeredSet(secId);
    return sectionById[secId].build(format).filter(it => !done.has(it.card.id));
  }
  function tagOrigin(items, origin) { for (const it of items) it.origin = origin; return items; }
  // All sections (random): a superset of the three individual runs, not a
  // random sample of their union — each section contributes its own
  // per-length draw (Full: 100 Bible + 40 Theology + 50 BCO = 190) from that
  // section's REMAINING questions, and the three draws are shuffled together.
  // The per-section composition is guaranteed (short only when a section's
  // bank is nearly exhausted). Answers are credited to each question's home
  // section (`origin`), so the overall score is simply the three sections'
  // saved scores combined — one linked ledger.
  function mixedItems(format) {
    const L = LENGTHS[examOpts.length];
    const part = (secId) => {
      const fresh = freshOf(secId, format);
      return tagOrigin(drawSpread(fresh, Math.min(L[secId], fresh.length)), secId);
    };
    return shuffle([...part('bible'), ...part('theology'), ...part('bco')]);
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
      id: 'mixed', label: 'All sections (random)', target: null,
      kinds: 'all three sections in one sitting, shuffled together',
      build: mixedItems,
      desc: 'One combined sitting: the full Bible Knowledge, Theology, and BCO draws for the chosen length, shuffled together, from everything you haven’t answered yet. Every answer counts toward its section, so each attempt builds the overall score below.',
    },
  ];
  const sectionById = {};
  for (const s of SECTIONS) sectionById[s.id] = s;

  // Question count for a section at the current run length. All sections
  // (random) is the three per-section counts combined — a Full run is the
  // full 190 (100 Bible + 40 Theology + 50 BCO).
  function countFor(sec) {
    const L = LENGTHS[examOpts.length];
    if (sec.id === 'mixed') return L.bible + L.theology + L.bco;
    return L[sec.id];
  }

  const KIND_LABEL = { mcq: 'Multiple choice', tf: 'True / False', short: 'Short answer', written: 'Written answer' };
  const isChoice = (item) => item.kind === 'mcq' || item.kind === 'tf';

  // ── Persistent score helpers ───────────────────────────────────────
  // Credit an answer to its home section (persisted until Reset).
  function recordAnswer(ex, item, code) {
    const secId = item.origin || ex.section;
    if (secId === 'mixed') return;
    (prog.sections[secId] = prog.sections[secId] || {})[item.card.id] = code;
    saveProg();
  }
  // Cumulative section tabulation over the CURRENT bank (stale ids from old
  // releases are simply not counted). 'mixed' = the three sections combined —
  // the overall licensure score.
  function cumulative(secId, format) {
    if (secId === 'mixed') {
      const parts = ['bible', 'theology', 'bco'].map(id => cumulative(id, format));
      const s = { bank: 0, answered: 0, correct: 0, partial: 0, wrong: 0 };
      let autoAnswered = 0, autoCorrect = 0, autoWrong = 0;
      for (const p of parts) {
        s.bank += p.bank; s.answered += p.answered;
        s.correct += p.correct; s.partial += p.partial; s.wrong += p.wrong;
        autoAnswered += p.autoAnswered; autoCorrect += p.autoCorrect; autoWrong += p.autoWrong;
      }
      s.pct = s.answered ? Math.round((s.correct / s.answered) * 100) : null;
      s.autoAnswered = autoAnswered; s.autoCorrect = autoCorrect; s.autoWrong = autoWrong;
      s.autoPct = scorePercent(autoCorrect, autoAnswered);
      s.autoGrade = gradeForPercent(s.autoPct)?.grade ?? null;
      return s;
    }
    const rec = prog.sections[secId] || {};
    const pool = sectionById[secId].build(format);
    const s = { bank: pool.length, answered: 0, c: 0, w: 0, e: 0, p: 0, a: 0 };
    const codes = [];
    for (const it of pool) {
      const code = rec[it.card.id];
      if (!code) continue;
      s.answered++; s[code] = (s[code] || 0) + 1;
      codes.push(code);
    }
    s.correct = s.c + s.e; s.partial = s.p; s.wrong = s.w + s.a;
    s.pct = s.answered ? Math.round((s.correct / s.answered) * 100) : null;
    // Auto-graded (rank-eligible) fields, derived from the codes alone —
    // independent of the combined study tabulation above.
    const tally = tallyCodes(codes);
    s.autoAnswered = tally.autoAnswered; s.autoCorrect = tally.autoCorrect; s.autoWrong = tally.autoWrong;
    s.autoPct = tally.autoPct; s.autoGrade = tally.autoGrade;
    return s;
  }
  function cumulativeLine(cum) {
    let line = `<strong>${cum.answered}</strong> of <strong>${cum.bank}</strong> answered · ✓ <strong>${cum.correct}</strong> correct`;
    if (cum.partial) line += ` · ~ <strong>${cum.partial}</strong> partial`;
    line += ` · ✗ <strong>${cum.wrong}</strong> incorrect`;
    if (cum.pct != null) line += ` · <strong>${cum.pct}%</strong>`;
    return line;
  }
  // Short auto-graded (rank-eligible) line for a cumulative tally, or '' when
  // no auto-graded questions have been answered yet.
  function autoLine(cum) {
    if (!cum.autoAnswered) return '';
    return `Auto-graded: <strong>${cum.autoCorrect}</strong>/${cum.autoAnswered} · ${cum.autoPct}% ${gradeBadgeHtml({ grade: cum.autoGrade })}`;
  }
  // Runs once per sitting (guarded by ex.rank), when the sitting ends (either
  // end-of-items or an early Finish): computes this sitting's auto-graded
  // score and, only when the sitting was fully answered, freshly drawn (not
  // resumed), and had at least one auto-graded question, records it as a
  // section/variant high score. Rendering never calls this — it only reads
  // ex.rank, so re-rendering the results screen never double-records.
  function completeSitting(ex) {
    if (ex.rank) return;
    const auto = ex.items.filter(it => isChoice(it) && it.quiz.picked >= 0);
    const autoCorrect = auto.filter(it => it.quiz.picked === it.quiz.correctIndex).length;
    const score = buildScore(autoCorrect, auto.length);
    const complete = countAnswered(ex) === ex.items.length;
    let outcome = null;
    if (complete && !ex.resumed && auto.length > 0) {
      outcome = recordExamResult(ex.section, `${ex.format}:${ex.length}`, {
        pct: score.pct, correct: score.correct, total: score.total, grade: score.grade, completedAt: Date.now(),
      });
    }
    ex.rank = { score, complete, outcome };
  }
  // Reset a section's saved answers (mixed = ALL three sections, since its
  // overall score is the three combined). The next run redraws and reshuffles
  // from the full bank.
  function resetSection(secId) {
    const sec = sectionById[secId];
    const what = secId === 'mixed'
      ? 'ALL THREE sections’ saved answers and scores (the overall score is their combination)'
      : `your saved ${sec.label} answers and score`;
    if (!confirm(`Reset ${what}? This cannot be undone.`)) return;
    if (secId === 'mixed') for (const id of ['bible', 'theology', 'bco']) delete prog.sections[id];
    else delete prog.sections[secId];
    if (prog.run && (prog.run.section === secId || secId === 'mixed')) prog.run = null;
    saveProg();
    st.exam = null;
    rerender();
  }

  // ── Session control ────────────────────────────────────────────────
  function begin(sectionId) {
    const sec = sectionById[sectionId];
    if (!sec) return;
    // Resume the persisted in-flight run for this section, if there is one:
    // rebuild its items, dropping questions answered before the interruption.
    if (prog.run && prog.run.section === sectionId) {
      const items = [];
      for (const e of prog.run.entries) {
        const homeId = e.origin || sectionId;
        if (homeId !== 'mixed' && prog.sections[homeId] && prog.sections[homeId][e.id]) continue;
        const it = rebuildItem(e);
        if (it) { if (e.origin) it.origin = e.origin; items.push(it); }
      }
      if (items.length) {
        st.exam = {
          section: sectionId, items, pos: 0, done: false, available: items.length,
          want: prog.run.want, length: prog.run.length, format: prog.run.format, resumed: true,
        };
        rerender();
        return;
      }
      prog.run = null; saveProg(); // run fully answered/stale — draw fresh below
    }
    const fresh = sec.id === 'mixed' ? sec.build(examOpts.format) : freshOf(sec.id, examOpts.format);
    if (!fresh.length) { // every question in the bank has been answered
      st.exam = { section: sec.id, complete: true, format: examOpts.format };
      rerender();
      return;
    }
    const want = countFor(sec);
    // Mixed builds its own per-section spread; the rest draw across sub-decks.
    const items = sec.id === 'mixed' ? shuffle(fresh) : drawSpread(fresh, Math.min(want, fresh.length));
    st.exam = {
      section: sec.id, items, pos: 0, done: false,
      available: fresh.length, want, length: examOpts.length, format: examOpts.format,
    };
    prog.run = {
      section: sec.id, want, length: examOpts.length, format: examOpts.format,
      entries: items.map(it => ({ id: it.card.id, kind: it.kind, origin: it.origin || null })),
    };
    saveProg();
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
      const correct = idx === item.quiz.correctIndex;
      applyOutcome(item.card, correct ? 'easy' : 'again');
      correct ? playCorrect() : playWrong();
      recordAnswer(ex, item, correct ? 'c' : 'w');
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
      recordAnswer(ex, item, { easy: 'e', pass: 'p', again: 'a' }[outcome]);
      exam.next();
    },
    next() {
      const ex = st.exam;
      if (!ex || ex.done) return;
      if (ex.pos + 1 >= ex.items.length) {
        ex.done = true;
        prog.run = null; saveProg(); // the sitting is over; the score is kept
        completeSitting(ex);
      } else ex.pos += 1;
      rerender();
    },
    finish() { // end the sitting early — answered questions stay scored, the
      const ex = st.exam;  // rest return to the section's unanswered pool
      if (!ex) return;
      ex.done = true;
      prog.run = null; saveProg();
      completeSitting(ex);
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
      if (ex.summary) return renderSummary(area, ex.format);
      if (ex.complete) return renderSectionComplete(area, sectionById[ex.section], ex.format);
      if (ex.done) return renderResults(area);
      const item = ex.items[ex.pos];
      if (!item) { st.exam = null; return renderChooser(area); }
      renderRunMeta(ex);
      if (isChoice(item)) renderChoiceItem(area, ex, item);
      else renderWrittenItem(area, ex, item);
    },
  };

  // ── Section chooser (the mode's start screen) ──────────────────────
  function availabilityLine(sec, bank, remaining) {
    if (sec.id === 'mixed') return `${bank} questions per run (${LENGTHS[examOpts.length].label})`;
    const draw = Math.min(countFor(sec), remaining);
    let line = remaining < bank
      ? `${remaining} of ${bank} remaining · ${draw} drawn at random per run`
      : `${bank} in the bank · ${draw} drawn at random per run`;
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
      const bank = sec.build(examOpts.format).length;
      const remaining = sec.id === 'mixed' ? bank : freshOf(sec.id, examOpts.format).length;
      const runHere = prog.run && prog.run.section === sec.id;
      const cum = cumulative(sec.id, examOpts.format); // mixed = overall (all three)
      const done = cum.bank > 0 && cum.answered >= cum.bank;
      const clickable = remaining > 0 || runHere || done;
      const metaLine = done ? 'Every question answered — tap for your final score'
        : remaining ? availabilityLine(sec, bank, remaining)
        : 'No questions available in this format yet';
      // Saved-progress footer: cumulative score + a Reset, outside the main
      // button (a button can't nest another button).
      let foot = '';
      if (cum.answered || runHere) {
        const bits = [];
        if (cum.answered) {
          const label = sec.id === 'mixed' ? 'Overall: ' : '';
          bits.push(done ? `${sec.id === 'mixed' ? 'All sections' : 'Section'} complete 🎉 · ${cumulativeLine(cum)}` : label + cumulativeLine(cum));
        }
        if (runHere) bits.push('run in progress — tap the section to resume');
        const auto = autoLine(cum);
        if (auto) bits.push(auto);
        foot = `<div class="exam-section-foot"><span class="exam-section-progress">${bits.join('<br>')}</span>
          <button class="ctrl-btn exam-reset-btn" data-exam-reset="${sec.id}" type="button">↻ Reset${sec.id === 'mixed' ? ' all' : ''}</button></div>`;
      }
      return `<div class="exam-section-wrap">
        <button class="exam-section-card" data-exam-section="${sec.id}" type="button" ${clickable ? '' : 'disabled'}>
          <span class="exam-section-title">${escapeHtml(sec.label)}</span>
          <span class="exam-section-kinds">${escapeHtml(sec.kinds)}</span>
          <span class="exam-section-desc">${escapeHtml(sec.desc)}</span>
          <span class="exam-section-meta">${escapeHtml(metaLine)}</span>
          ${sec.note ? `<span class="exam-section-note">${escapeHtml(sec.note)}</span>` : ''}
        </button>${foot}</div>`;
    }).join('');
    const anyProgress = ['bible', 'theology', 'bco'].some(id => cumulative(id, examOpts.format).answered);
    area.innerHTML = `
      <p class="exam-intro">Practice modeled on the C&amp;C committee’s study guidelines for the
        written licensure exam — not an official PCA exam. Sections draw on the app’s whole
        card bank, regardless of your study selection. Your answers and score persist per
        section — across runs and visits — until you press Reset.</p>
      ${anyProgress ? `<div class="nav-row" style="justify-content:center;margin-bottom:12px">
        <button class="nav-btn" id="examSummaryBtn" type="button">📊 Results summary</button></div>` : ''}
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
    area.querySelectorAll('[data-exam-reset]').forEach(btn =>
      btn.addEventListener('click', () => resetSection(btn.getAttribute('data-exam-reset'))));
    const sb = area.querySelector('#examSummaryBtn');
    if (sb) sb.addEventListener('click', () => { st.exam = { summary: true, format: examOpts.format }; rerender(); });
    area.querySelectorAll('[data-exam-length]').forEach(btn =>
      btn.addEventListener('click', () => { examOpts.length = btn.getAttribute('data-exam-length'); saveExamOpts(); renderChooser(area); }));
    area.querySelectorAll('[data-exam-format]').forEach(btn =>
      btn.addEventListener('click', () => { examOpts.format = btn.getAttribute('data-exam-format') === 'mcq' ? 'mcq' : 'mixed'; saveExamOpts(); renderChooser(area); }));
  }

  // ── Run rendering ──────────────────────────────────────────────────
  function renderRunMeta(ex) {
    const sec = sectionById[ex.section];
    const mode = `${LENGTHS[ex.length] ? LENGTHS[ex.length].label : ''}${ex.format === 'mcq' ? ' · MCQ only' : ''}${ex.resumed ? ' · resumed' : ''}`;
    let m = `Mock exam · ${escapeHtml(sec.label)} · ${mode} — question <strong>${ex.pos + 1}</strong> of <strong>${ex.items.length}</strong>`;
    if (!ex.resumed && ex.want && ex.items.length < ex.want) m += ` (only ${ex.items.length} available)`;
    setDeckMeta(m);
  }
  function finishRowHtml(ex, nextHtml) {
    const answered = countAnswered(ex);
    const finishBtn = answered && !ex.done
      ? `<button class="nav-btn nav-prev" id="examFinishBtn" type="button">Finish now</button>` : '<span></span>';
    // The run persists, so leaving for the section list is always safe —
    // answered questions stay scored and the run resumes on return.
    return `<div class="nav-row">${finishBtn}${nextHtml}</div>
      <div class="nav-row exam-back-row">
        <button class="nav-btn" id="examBackBtn" type="button">‹ Back to sections</button>
      </div>`;
  }
  function wireRun(area) {
    const fb = area.querySelector('#examFinishBtn');
    if (fb) fb.addEventListener('click', () => exam.finish());
    const nb = area.querySelector('#examNextBtn');
    if (nb) nb.addEventListener('click', () => exam.next());
    const bb = area.querySelector('#examBackBtn');
    if (bb) bb.addEventListener('click', () => { st.exam = null; rerender(); });
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
    const rank = ex.rank; // stamped once by completeSitting() when the sitting ended
    const selfG = ex.items.filter(it => !isChoice(it) && it.self);
    const selfN = (o) => selfG.filter(it => it.self === o).length;
    const answered = rank.score.total + selfG.length;

    const scoreLines = [];
    if (rank.score.total > 0) {
      const subLines = [];
      if (ex.format === 'mixed') subLines.push('The letter rank reflects only the multiple-choice and True/False questions in this sitting.');
      subLines.push(expectedPassNote());
      if (!rank.complete) subLines.push('Ended early — high scores are saved only for fully answered sittings.');
      if (ex.resumed) subLines.push('Resumed sitting — cumulative score updated; records unchanged.');
      scoreLines.push(scoreHeroHtml({
        score: rank.score,
        ratioLine: `<strong>${rank.score.correct}</strong> / ${rank.score.total} auto-graded correct`,
        isNewRecord: !!(rank.outcome && rank.outcome.isNewRecord),
        previous: rank.outcome ? rank.outcome.previous : null,
        subLines,
      }));
    } else {
      scoreLines.push('<div class="exam-self-score">No auto-graded questions were completed, so no letter rank was assigned.</div>');
    }
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

    // Cumulative, persisted section tabulation (mixed credits each answer to
    // its home section instead of keeping a tally of its own).
    let cumHtml = '';
    let continueLabel = 'Take another ›';
    if (sec.id === 'mixed') {
      const overall = cumulative('mixed', ex.format);
      const overallAuto = autoLine(overall);
      const perSection = ['bible', 'theology', 'bco'].map(id =>
        `<div class="review-item">${escapeHtml(sectionById[id].label)}
           <div class="exam-summary-line">${cumulativeLine(cumulative(id, ex.format))}</div></div>`).join('');
      cumHtml = `<div class="prog-section-title">Overall — all three sections (saved until Reset)</div>
        <div class="exam-self-score">${cumulativeLine(overall)}</div>
        ${overallAuto ? `<div class="exam-self-score">${overallAuto}</div>` : ''}
        <div class="prog-section-title">By section</div>${perSection}`;
      continueLabel = overall.answered >= overall.bank ? '' : 'Take another ›';
    } else {
      const cum = cumulative(sec.id, ex.format);
      const done = cum.answered >= cum.bank;
      const cumAuto = autoLine(cum);
      cumHtml = `<div class="prog-section-title">Section so far (saved until Reset)</div>
        <div class="exam-self-score">${cumulativeLine(cum)}</div>
        ${cumAuto ? `<div class="exam-self-score">${cumAuto}</div>` : ''}
        ${done ? '<p class="exam-target-note">Section complete — every question in the bank has been answered. 🎉</p>' : ''}`;
      continueLabel = done ? '' : 'Continue section ›';
    }
    setDeckMeta('');
    area.innerHTML = `
      <div class="qa-card revealed exam-results">
        <div class="qa-deck-label">Mock exam · ${escapeHtml(sec.label)} · results</div>
        ${scoreLines.join('')}
        <p class="exam-target-note">${escapeHtml(targetNote)}</p>
        ${cumHtml}
        ${subHtml ? `<div class="prog-section-title">By deck (this sitting)</div>${subHtml}` : ''}
        ${missedHtml}
        <div class="nav-row" style="margin-top:18px">
          <button class="nav-btn nav-prev" id="examSectionsBtn" type="button">‹ Sections</button>
          ${continueLabel ? `<button class="nav-btn nav-next" id="examRetakeBtn" type="button">${continueLabel}</button>` : ''}
        </div>
      </div>`;
    area.querySelector('#examSectionsBtn').addEventListener('click', () => { st.exam = null; rerender(); });
    const rb = area.querySelector('#examRetakeBtn');
    if (rb) rb.addEventListener('click', () => begin(ex.section));
    // ex.rank is stamped once per sitting by completeSitting(), so this fires
    // at most once per sitting even across re-renders of this screen.
    if (rank && !rank.celebrated) {
      rank.celebrated = true;
      if (rank.complete && (rank.score.grade === 'A' || rank.score.grade === 'S')) {
        playResultSound(rank.score.grade);
        celebrateResult({ grade: rank.score.grade, newRecord: !!(rank.outcome && rank.outcome.isNewRecord), hostEl: area.querySelector('.score-hero') });
      }
    }
  }

  // Interim results summary — the saved tabulation by section plus the overall
  // score, viewable any time from the chooser without finishing a run.
  function renderSummary(area, format) {
    const overall = cumulative('mixed', format);
    const overallAuto = autoLine(overall);
    const perSection = ['bible', 'theology', 'bco'].map(id => {
      const sec = sectionById[id];
      const cum = cumulative(id, format);
      const state = cum.bank && cum.answered >= cum.bank ? ' · complete 🎉'
        : prog.run && prog.run.section === id ? ' · run in progress' : '';
      const auto = autoLine(cum);
      return `<div class="review-item">${escapeHtml(sec.label)}${state}
        <div class="exam-summary-line">${cum.answered ? cumulativeLine(cum) : 'Not started'}</div>
        ${auto ? `<div class="exam-summary-line">${auto}</div>` : ''}</div>`;
    }).join('');
    setDeckMeta('Mock exam · results summary');
    area.innerHTML = `
      <div class="qa-card revealed exam-results">
        <div class="qa-deck-label">Mock exam · results summary (saved until Reset)</div>
        <div class="exam-score">${overall.correct} / ${overall.answered} <span class="exam-score-pct">${overall.pct != null ? overall.pct + '% overall' : ''}</span></div>
        <div class="exam-self-score">${cumulativeLine(overall)}</div>
        ${overallAuto ? `<div class="exam-self-score">${overallAuto}</div>` : ''}
        <div class="prog-section-title">By section</div>
        ${perSection}
        <div class="nav-row" style="margin-top:18px">
          <button class="nav-btn nav-prev" id="examSectionsBtn" type="button">‹ Sections</button>
        </div>
      </div>`;
    area.querySelector('#examSectionsBtn').addEventListener('click', () => { st.exam = null; rerender(); });
  }

  // A section whose whole bank has been answered: final tabulation + Reset.
  function renderSectionComplete(area, sec, format) {
    const cum = cumulative(sec.id, format);
    const auto = autoLine(cum);
    setDeckMeta('');
    area.innerHTML = `
      <div class="qa-card revealed exam-results">
        <div class="qa-deck-label">Mock exam · ${escapeHtml(sec.label)} · section complete</div>
        <div class="exam-score">${cum.correct} / ${cum.answered} <span class="exam-score-pct">${cum.pct != null ? cum.pct + '%' : ''}</span></div>
        <div class="exam-self-score">${cumulativeLine(cum)}</div>
        ${auto ? `<div class="exam-self-score">${auto}</div>` : ''}
        <p class="exam-target-note">You’ve answered every question in this section’s bank. 🎉
          Press Reset to clear the saved score and take the section again.</p>
        <div class="nav-row" style="margin-top:18px">
          <button class="nav-btn nav-prev" id="examSectionsBtn" type="button">‹ Sections</button>
          <button class="nav-btn nav-next" id="examResetBtn" type="button">↻ Reset section</button>
        </div>
      </div>`;
    area.querySelector('#examSectionsBtn').addEventListener('click', () => { st.exam = null; rerender(); });
    area.querySelector('#examResetBtn').addEventListener('click', () => resetSection(sec.id));
  }

  return exam;
}
