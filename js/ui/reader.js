// Reader tab — translation drills + verses keyed to Duff chapters.
// Self-contained: per-chapter drill index lives in a module-local Map; the
// only host hooks are `noteStudyInteraction` (idle/streak tracking) and
// `setStudyMode` (to switch into reader mode).

import { shuffleArray, escapeHtml } from '../utils/helpers.js';

const readerDrillState = new Map();
let noteStudyInteractionFn = () => {};
let setStudyModeFn = () => {};

export function configureReader({ noteStudyInteraction, setStudyMode } = {}) {
  if (typeof noteStudyInteraction === 'function') noteStudyInteractionFn = noteStudyInteraction;
  if (typeof setStudyMode === 'function') setStudyModeFn = setStudyMode;
}

function getReaderDrillIdx(chapterNum) {
  return readerDrillState.get(chapterNum) || 0;
}

function setReaderDrillIdx(chapterNum, idx) {
  readerDrillState.set(chapterNum, idx);
}

function sortReaderDrillsByLevel(drills) {
  if (!Array.isArray(drills)) return [];
  return drills.map((d, i) => ({ d, i })).sort((a, b) => {
    const la = Number.isFinite(a.d && a.d.level) ? a.d.level : 99;
    const lb = Number.isFinite(b.d && b.d.level) ? b.d.level : 99;
    if (la !== lb) return la - lb;
    return a.i - b.i;
  }).map(x => x.d);
}

// Heuristic translation-difficulty score for a Greek verse. Higher = harder.
// Mixes length with rough morphology cues; intended only for relative ranking
// within a chapter, not absolute pedagogical placement.
const SUBORDINATOR_RE = /(?:^|[\s·,.;:])(ὅτι|ἵνα|ἐάν|ὡς|ὅπως|καθώς|καθὼς|ἐπεί|ἐπειδή|ἕως|πρίν|ὅπου|ὅταν|ἀφ['ʼ’]οὗ|μέχρι|ὅθεν)(?=$|[\s·,.;:])/giu;
const PARTICIPLE_RE = /(μενος|μενον|μένη|μένου|μένων|μένῳ|μένοις|μέναις|μέναι|νοντος|νοντες|νοντι|νόντων|σαντος|σαντες|σαντι|σάντων|θέντος|θέντες|θέντι|θέντων|θεῖσα|θείς|θέν)$/iu;
const INFINITIVE_RE = /(ειν|εῖν|σθαι|σθῆναι|θῆναι|σαι|ναι)$/iu;
// High-frequency narrative discourse participles ("said", "answered", "going",
// "taking") — present in nearly every gospel pericope. They satisfy the
// participle regex but rarely add real translation difficulty, so they're
// counted with a smaller weight.
const DISCOURSE_PARTICIPLES = new Set([
  'λέγων', 'λέγοντες', 'λέγουσα', 'λέγουσαι', 'λέγοντος', 'λέγοντι',
  'εἰπών', 'εἰποῦσα', 'εἰπόντες', 'εἰπόντος',
  'ἀποκριθείς', 'ἀποκριθεὶς', 'ἀποκριθεῖσα', 'ἀποκριθέντες',
  'ἐλθών', 'ἐλθὼν', 'ἐλθόντες', 'ἐλθοῦσα', 'ἐλθόντος',
  'ἀπελθών', 'ἀπελθὼν', 'ἀπελθόντες', 'ἀπελθοῦσα',
  'λαβών', 'λαβὼν', 'λαβόντες', 'λαβοῦσα',
  'ἰδών', 'ἰδὼν', 'ἰδόντες', 'ἰδοῦσα',
  'ἀκούσας', 'ἀκούσαντες', 'ἀκούσασα',
  'προσελθών', 'προσελθὼν', 'προσελθόντες', 'προσελθοῦσα',
  'ἀναστάς', 'ἀναστὰς',
]);
// Words that end in -ναι / -σαι / -ειν but aren't infinitives. Vocatives like
// Γύναι and pronominal/adjectival forms like πᾶσαι show up in NT prose.
const INFINITIVE_FALSE_POSITIVES = new Set([
  'γύναι', 'ναί', 'οὐχί', 'πᾶσαι', 'αὐταί', 'αὗται', 'τινες', 'ἥτις',
]);

function stripAccentsLower(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function tokenizeGreekVerse(text) {
  if (!text) return [];
  return String(text)
    .replace(/[·,.;:!?“”"()]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function computeVerseDifficulty(greekText) {
  const raw = String(greekText || '');
  if (!raw) return 0;
  const words = tokenizeGreekVerse(raw);
  if (!words.length) return 0;

  let score = words.length * 1.0;

  const subordinators = (raw.match(SUBORDINATOR_RE) || []).length;
  score += subordinators * 2.0;

  let participleScore = 0;
  for (const w of words) {
    if (!PARTICIPLE_RE.test(w)) continue;
    participleScore += DISCOURSE_PARTICIPLES.has(w) ? 0.4 : 1.4;
  }
  score += participleScore;

  const infinitives = words.filter(w => {
    if (!INFINITIVE_RE.test(w)) return false;
    return !INFINITIVE_FALSE_POSITIVES.has(stripAccentsLower(w));
  }).length;
  score += infinitives * 1.2;

  const longWords = words.filter(w => w.length >= 9).length;
  score += longWords * 0.5;

  // Clause breaks only signal complexity in longer verses — a comma between
  // three words isn't real subordination, just punctuation.
  if (words.length >= 8) {
    const clauseBreaks = (raw.match(/[·;]|,(?=\s)/g) || []).length;
    score += clauseBreaks * 0.4;
  }

  if (/ἂν\b/u.test(raw)) score += 1.0; // potential / contingent constructions

  return score;
}

function assignVerseDifficultyRanks(verses) {
  if (!Array.isArray(verses) || !verses.length) return [];
  const scored = verses.map((v, i) => ({ v, i, s: computeVerseDifficulty(v && v.g) }));
  scored.sort((a, b) => (a.s - b.s) || (a.i - b.i));

  const n = scored.length;
  // Single verse: skip a band (no relative comparison to make).
  if (n === 1) return [{ verse: scored[0].v, band: null }];

  return scored.map((row, rank) => {
    const pct = rank / (n - 1);
    let band;
    if (pct <= 1 / 3) band = 'e';
    else if (pct <= 2 / 3) band = 'm';
    else band = 'h';
    return { verse: row.v, band };
  });
}

export function renderReaderModule() {
  const area = document.getElementById('cardArea');
  if (!area) return;
  const chapters = Array.isArray(window.READER_CHAPTERS) ? window.READER_CHAPTERS : [];
  const drillSets = (window.READER_TRANSLATION_SETS && typeof window.READER_TRANSLATION_SETS === 'object')
    ? window.READER_TRANSLATION_SETS
    : {};

  const drillChapters = Object.keys(drillSets)
    .map(k => Number(k))
    .filter(n => Number.isFinite(n));
  const verseChapters = chapters.map(ch => ch.chapter);
  const allChapterNums = Array.from(new Set([...drillChapters, ...verseChapters])).sort((a, b) => a - b);

  if (!allChapterNums.length) {
    area.innerHTML = '<div class="empty-state"><div class="big">βίβλος</div>Reader data not available.</div>';
    return;
  }

  const verseByChapter = new Map(chapters.map(ch => [ch.chapter, ch.verses || []]));

  let html = '<div class="reader-wrap"><div class="reader-intro">Work through translation drills (one at a time, in increasing difficulty) for each Duff chapter, then read the Textus Receptus verses unlocked by that chapter. Drills use only vocabulary and grammar introduced through the chapter; tap any verse to reveal a literal translation.</div>';

  for (const chapterNum of allChapterNums) {
    const drillsRaw = drillSets[chapterNum] && Array.isArray(drillSets[chapterNum].sentences)
      ? drillSets[chapterNum].sentences
      : [];
    const verses = verseByChapter.get(chapterNum) || [];

    if (!drillsRaw.length && !verses.length) continue;

    const drills = sortReaderDrillsByLevel(drillsRaw);
    const summaryBits = [];
    if (drills.length) summaryBits.push(`${drills.length} drill${drills.length === 1 ? '' : 's'}`);
    if (verses.length) summaryBits.push(`${verses.length} verse${verses.length === 1 ? '' : 's'}`);

    html += `<details class="reader-chapter"><summary class="reader-chapter-header"><span class="reader-ch-label">After Chapter ${chapterNum}</span><span class="reader-ch-count">${summaryBits.join(' · ')}</span><span class="reader-ch-arrow" aria-hidden="true">▶</span></summary>`;

    if (drills.length) {
      html += renderReaderDrillSectionHtml(chapterNum, drills);
    }

    if (verses.length) {
      const versesWithTranslations = verses.filter(v => v && v.literal).length;
      const verseLabel = versesWithTranslations
        ? `Verses (${verses.length}, ${versesWithTranslations} with translation)`
        : `Verses (${verses.length})`;
      html += `<details class="reader-verses-block" open><summary class="reader-verses-header">${verseLabel}</summary><div class="reader-verse-list">`;
      const ranked = assignVerseDifficultyRanks(verses);
      ranked.forEach((entry, vIdx) => {
        html += renderReaderVerseHtml(chapterNum, vIdx, entry.verse, entry.band);
      });
      html += '</div></details>';
    }

    html += '</details>';
  }
  html += '</div>';
  area.innerHTML = html;
}

function readerDrillId(chapterNum, idx) {
  return `reader-drill-ch${chapterNum}-${idx}`;
}

function readerDrillSectionId(chapterNum) {
  return `reader-drill-section-ch${chapterNum}`;
}

function readerVerseRevealId(chapterNum, vIdx) {
  return `reader-verse-reveal-ch${chapterNum}-${vIdx}`;
}

function renderReaderDrillSectionHtml(chapterNum, drillsSorted) {
  const sectionId = readerDrillSectionId(chapterNum);
  const total = drillsSorted.length;
  if (!total) {
    return `<div class="reader-drill-section" id="${sectionId}"><div class="reader-section-label">Translation drills</div></div>`;
  }
  const idx = Math.max(0, Math.min(getReaderDrillIdx(chapterNum), total - 1));
  setReaderDrillIdx(chapterNum, idx);
  const drill = drillsSorted[idx];
  const drillHtml = renderReaderDrillHtml(chapterNum, idx, drill);
  const prevDisabled = idx === 0 ? 'disabled' : '';
  const nextDisabled = idx === total - 1 ? 'disabled' : '';
  return `<div class="reader-drill-section" id="${sectionId}">
    <div class="reader-drill-section-head">
      <div class="reader-section-label">Translation drills</div>
      <div class="reader-drill-progress">Drill ${idx + 1} of ${total}</div>
    </div>
    ${drillHtml}
    <div class="reader-drill-nav">
      <button class="reader-drill-nav-btn" type="button" ${prevDisabled} onclick="advanceReaderDrill(${chapterNum}, -1)">← Previous</button>
      <button class="reader-drill-nav-btn" type="button" ${nextDisabled} onclick="advanceReaderDrill(${chapterNum}, 1)">Next →</button>
    </div>
  </div>`;
}

export function advanceReaderDrill(chapterNum, delta) {
  const drillSets = (window.READER_TRANSLATION_SETS && typeof window.READER_TRANSLATION_SETS === 'object')
    ? window.READER_TRANSLATION_SETS : {};
  const drillsRaw = drillSets[chapterNum] && Array.isArray(drillSets[chapterNum].sentences)
    ? drillSets[chapterNum].sentences : [];
  const drills = sortReaderDrillsByLevel(drillsRaw);
  if (!drills.length) return;

  const cur = getReaderDrillIdx(chapterNum);
  const next = Math.max(0, Math.min(drills.length - 1, cur + delta));
  if (next === cur) return;

  setReaderDrillIdx(chapterNum, next);
  const sectionEl = document.getElementById(readerDrillSectionId(chapterNum));
  if (!sectionEl) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderReaderDrillSectionHtml(chapterNum, drills);
  const replacement = wrapper.firstElementChild;
  if (replacement) sectionEl.replaceWith(replacement);
}

function renderReaderDrillHtml(chapterNum, idx, drill) {
  const id = readerDrillId(chapterNum, idx);
  const choices = Array.isArray(drill.choices) ? shuffleArray([...drill.choices]) : [];
  const level = Number.isFinite(drill.level) ? drill.level : null;
  const levelLabel = level === 1 ? 'Easy'
    : level === 2 ? 'Mixed order'
    : level === 3 ? 'Greek-style order'
    : '';
  const levelClass = level === 1 ? 'level-1'
    : level === 2 ? 'level-2'
    : level === 3 ? 'level-3'
    : '';
  const choiceButtons = choices.map((choice, cIdx) => {
    const safeChoice = escapeHtml(choice);
    return `<button class="reader-choice-btn" type="button" data-drill="${id}" data-idx="${cIdx}" onclick="selectReaderDrillChoice('${id}', ${cIdx})">${safeChoice}</button>`;
  }).join('');
  const noteHtml = drill.note ? `<div class="reader-drill-note" id="${id}-note" style="display:none">${escapeHtml(drill.note)}</div>` : '';
  return `
    <div class="reader-drill" id="${id}" data-answer="${escapeHtml(drill.en || '')}">
      <div class="reader-drill-head">
        ${levelLabel ? `<span class="reader-difficulty ${levelClass}">${levelLabel}</span>` : ''}
        <span class="reader-drill-prompt">Translate</span>
      </div>
      <div class="reader-drill-greek">${escapeHtml(drill.g)}</div>
      <div class="reader-choices">${choiceButtons}</div>
      <div class="reader-drill-result" id="${id}-result"></div>
      ${noteHtml}
    </div>`;
}

function difficultyBadgeHtml(band) {
  if (!band) return '';
  const letter = band === 'e' ? 'E' : band === 'm' ? 'M' : 'H';
  const titleMap = { e: 'Easier in this chapter', m: 'Moderate in this chapter', h: 'Harder in this chapter' };
  const title = titleMap[band] || '';
  return `<span class="reader-verse-difficulty reader-verse-difficulty-${band}" title="${title}" aria-label="${title}">${letter}</span>`;
}

function renderReaderVerseHtml(chapterNum, vIdx, verse, band) {
  if (!verse) return '';
  const greek = escapeHtml(verse.g || '');
  const ref = escapeHtml(verse.r || '');
  const literal = verse.literal;
  const literalText = typeof literal === 'string'
    ? literal
    : (literal && typeof literal === 'object' ? (literal.en || '') : '');
  const noteText = (literal && typeof literal === 'object') ? (literal.note || '') : '';
  const badge = difficultyBadgeHtml(band);

  if (!literalText) {
    return `<div class="reader-verse"><span class="reader-verse-greek">${badge}${greek}</span><span class="reader-verse-ref">${ref}</span></div>`;
  }

  const id = readerVerseRevealId(chapterNum, vIdx);
  const noteHtml = noteText ? `<div class="reader-drill-note">${escapeHtml(noteText)}</div>` : '';
  return `
    <div class="reader-verse reader-verse-with-drill">
      <div class="reader-verse-row">
        <span class="reader-verse-greek">${badge}${greek}</span>
        <span class="reader-verse-ref">${ref}</span>
      </div>
      <details class="reader-verse-reveal" id="${id}">
        <summary class="reader-verse-reveal-summary">Tap to reveal translation</summary>
        <div class="reader-verse-literal-text">${escapeHtml(literalText)}</div>
        ${noteHtml}
      </details>
    </div>`;
}

export function selectReaderDrillChoice(drillId, choiceIdx) {
  const root = document.getElementById(drillId);
  if (!root) return;
  noteStudyInteractionFn();
  const buttons = Array.from(root.querySelectorAll('.reader-choice-btn'));
  if (!buttons.length) return;
  const expected = root.getAttribute('data-answer') || '';
  const chosen = buttons[choiceIdx];
  if (!chosen || chosen.disabled) return;
  const chosenText = chosen.textContent || '';
  const isCorrect = chosenText === expected;

  buttons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.remove('correct', 'incorrect');
    if ((btn.textContent || '') === expected) btn.classList.add('correct');
  });
  if (!isCorrect) chosen.classList.add('incorrect');

  const resultEl = document.getElementById(`${drillId}-result`);
  if (resultEl) {
    resultEl.textContent = isCorrect
      ? 'Correct.'
      : `Not quite. Answer: ${expected}`;
    resultEl.className = `reader-drill-result ${isCorrect ? 'correct' : 'incorrect'}`;
  }

  const noteEl = document.getElementById(`${drillId}-note`);
  if (noteEl) noteEl.style.display = '';
}

export function openReaderTab() {
  setStudyModeFn('reader');
}
