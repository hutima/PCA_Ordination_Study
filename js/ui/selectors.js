// Selectors panel: builds the Sessions / Chapters / Supplementals / Advanced
// buttons inside the Study Selector overlay, and owns the toggle/deselect/load
// flow that drives runtime.selectedKeys → runtime.deck.
//
// The module reads/writes runtime state directly. Host callbacks cover the
// deck-building primitives and rendering hooks that still live in main.js
// (saveState, buildStudyDeck, getSelectedCards, etc.). Window globals
// (window.SETS, MORPHOLOGY_SETS, GRAMMAR_SETS, getMorphologyCountForKey,
// getGrammarCountForKey) come from legacy <script defer> data files and are
// read defensively in case those files haven't finished loading yet.

import { runtime } from '../state/runtime.js';
import { shuffleArray } from '../utils/helpers.js';
import { SESSION_IDLE_RESET_MS } from '../domain/srs/constants.js';
import {
  isChapterKey,
  isAdvancedKey,
  sortSetKeys,
  expandSessionSets
} from '../domain/deck/ordering.js';
import { filterHardVocabCards } from '../domain/deck/filters.js';
import { renderCard, renderChooseSessionEmptyState } from './render.js';
import { renderProgress, renderReview } from './progress.js';

let host = {
  getSessions: () => [],
  getSelectedCards: () => [],
  getDirectionalMarksStore: () => ({}),
  getDirectionalProgressStore: () => ({}),
  resetMorphAnswerState: () => {},
  getDeckStateKey: () => '',
  reorderDeckFromIds: () => null,
  buildStudyDeck: () => [],
  getDueCount: () => 0,
  resetUnspacedCycleState: () => {},
  resetStudyState: () => {},
  syncToggleButtons: () => {},
  clearSpacedUndoSnapshot: () => {},
  saveCurrentDeckStateToBank: () => {},
  markActiveDeckRef: () => {},
  saveState: () => {},
  canAccessGrammarUi: () => true,
  isMorphStepByStepActive: () => false,
  getFocusedParadigmCards: () => null
};

export function configureSelectors(deps) {
  host = { ...host, ...deps };
}

export function isSessionFullySelected(session, keys = runtime.selectedKeys) {
  const sessionKeys = expandSessionSets(session);
  return sessionKeys.length > 0 && sessionKeys.every(key => keys.includes(String(key)));
}

export function findExactSessionMatch(keys = runtime.selectedKeys) {
  const normalizedKeys = sortSetKeys((keys || []).map(String));
  return host.getSessions().find(session => {
    const sessionKeys = expandSessionSets(session);
    return sessionKeys.length === normalizedKeys.length && sessionKeys.every((key, idx) => key === normalizedKeys[idx]);
  }) || null;
}

export function setActiveSessionButton() {
  document.querySelectorAll('.session-btn').forEach(btn => {
    const session = host.getSessions().find(s => s.id === btn.dataset.sessionId);
    btn.classList.toggle('active', !!session && isSessionFullySelected(session));
  });
}

export function setActiveSetButtons() {
  document.querySelectorAll('.chapter-btn').forEach(btn => {
    const key = btn.dataset.key;
    btn.classList.toggle('active', runtime.selectedKeys.includes(key));
  });
}

export function buildSessions() {
  const grid = document.getElementById('sessionsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  host.getSessions().forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'session-btn' + (s.special ? ' special' : '');
    btn.id = 'sess-' + s.id;
    btn.dataset.sessionId = s.id;
    const summaryHtml = host.canAccessGrammarUi()
      ? `<br><span class="session-chapters">${s.summary}</span>`
      : '';
    btn.innerHTML = `<span class="session-tag">${s.tag}</span>${s.label}${summaryHtml}`;
    btn.onclick = () => toggleSession(s);
    grid.appendChild(btn);
  });

  const deselectBtn = document.createElement('button');
  deselectBtn.type = 'button';
  deselectBtn.className = 'chapter-btn supplemental-deselect-all';
  deselectBtn.textContent = 'Deselect all sessions';
  deselectBtn.onclick = () => deselectAllChapters();
  grid.appendChild(deselectBtn);

  setActiveSessionButton();
}

export function buildChapterSelector() {
  const grid = document.getElementById('chaptersGrid');
  if (!grid) return;
  grid.innerHTML = '';
  grid.classList.add('chapters-grid');

  const sets = window.SETS && typeof window.SETS === 'object' ? window.SETS : {};
  const chapterKeys = Object.keys(sets).filter(isChapterKey).sort((a, b) => Number(a) - Number(b));

  const deselectBtn = document.createElement('button');
  deselectBtn.type = 'button';
  deselectBtn.className = 'chapter-btn supplemental-deselect-all';
  deselectBtn.textContent = 'Deselect all chapters';
  deselectBtn.onclick = () => deselectAllChapters();
  grid.appendChild(deselectBtn);

  chapterKeys.forEach(key => {
    const set = sets[key];
    if (!set) return;
    const morphCount = window.getMorphologyCountForKey ? window.getMorphologyCountForKey(key) : 0;
    const grammarCount = window.getGrammarCountForKey ? window.getGrammarCountForKey(key) : 0;
    const studyCount = morphCount + grammarCount;
    const vocabCount = Array.isArray(set.cards) ? set.cards.length : 0;
    if (!vocabCount && !studyCount) return;
    if (!host.canAccessGrammarUi() && !vocabCount) return;

    const btn = document.createElement('button');
    btn.className = 'chapter-btn';
    btn.dataset.key = key;
    const countLabel = host.canAccessGrammarUi()
      ? `${vocabCount} vocab${studyCount ? ` · ${studyCount} grammar` : ''}`
      : `${vocabCount} vocab`;
    btn.innerHTML = `${set.label}<span class="chapter-count">${countLabel}</span>`;
    btn.onclick = () => toggleSet(key);
    grid.appendChild(btn);
  });

  setActiveSetButtons();
}

function getSupplementalParadigmsForKey(key) {
  const raw = String(key);
  const paradigms = [];
  const morphSet = window.MORPHOLOGY_SETS?.[raw];
  if (morphSet && Array.isArray(morphSet.items)) {
    morphSet.items.forEach((item, idx) => {
      paradigms.push({
        key: `${raw}::morph::${idx}`,
        type: 'Morphology',
        label: item.family || item.lemma || `Morphology ${idx + 1}`,
        count: Array.isArray(item.questions) ? item.questions.length : 0
      });
    });
  }

  const grammarSet = window.GRAMMAR_SETS?.[raw];
  if (grammarSet && Array.isArray(grammarSet.items)) {
    grammarSet.items.forEach((item, idx) => {
      paradigms.push({
        key: `${raw}::grammar::${idx}`,
        type: 'Grammar',
        label: item.family || item.lemma || `Grammar ${idx + 1}`,
        count: Array.isArray(item.questions) ? item.questions.length : 0
      });
    });
  }

  return paradigms.filter(paradigm => paradigm.count > 0);
}

// Selecting the flat set key for every set in a week pulls in that set's
// vocab plus all of its grammar/morph paradigms — including multi-paradigm
// sets that are otherwise only reachable via split sub-keys. Pressing the
// button a second time (when every set in the week is already flat-selected)
// clears all selections for the week, including any sub-key remnants.
function toggleAllWeekSupplementals(weekKeys) {
  const keys = (weekKeys || []).map(String);
  if (!keys.length) return;
  const allAlreadySelected = keys.every(k => runtime.selectedKeys.includes(k));
  const weekKeySet = new Set(keys);
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  const retained = runtime.selectedKeys.filter(k => {
    const base = getParadigmBaseKey(k) || k;
    return !weekKeySet.has(base);
  });
  if (allAlreadySelected) {
    runtime.selectedKeys = retained;
    if (!runtime.selectedKeys.length) {
      clearAndRenderEmpty();
      return;
    }
    loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
    return;
  }
  const nextKeys = sortSetKeys([...new Set([...retained, ...keys])]);
  loadDeckFromKeys(nextKeys, null, { clearUnspacedMarks: true });
}

export function deselectAllSupplementals() {
  const remaining = runtime.selectedKeys.filter(k => {
    const base = getParadigmBaseKey(k) || k;
    return isChapterKey(base) || isAdvancedKey(base);
  });
  if (remaining.length === runtime.selectedKeys.length) return;
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  runtime.selectedKeys = remaining;
  if (!runtime.selectedKeys.length) {
    clearAndRenderEmpty();
    return;
  }
  loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
}

export function buildSupplementalSelector() {
  const list = document.getElementById('supplementalGrid');
  if (!list) return;
  list.innerHTML = '';

  const sets = window.SETS && typeof window.SETS === 'object' ? window.SETS : {};
  const supplementalKeys = sortSetKeys(Object.keys(sets).filter(k => !isChapterKey(k) && !isAdvancedKey(k)));

  const deselectBtn = document.createElement('button');
  deselectBtn.type = 'button';
  deselectBtn.className = 'chapter-btn supplemental-deselect-all';
  deselectBtn.textContent = 'Deselect all supplementals';
  deselectBtn.onclick = () => deselectAllSupplementals();
  list.appendChild(deselectBtn);

  // In split mode the selector is scoped to the active half: vocab mode hides
  // grammar-only supplementals, morph mode hides vocab-only ones. Outside
  // split (or in any other mode) both halves stay visible.
  const splitVocabOnly = runtime.splitSelection && runtime.studyMode === 'vocab';
  const splitGrammarOnly = runtime.splitSelection && runtime.studyMode === 'morph';

  const weekGroups = new Map();
  supplementalKeys.forEach(key => {
    const set = sets[key];
    if (!set) return;
    const vocabCount = Array.isArray(set.cards) ? set.cards.length : 0;
    const morphCount = window.getMorphologyCountForKey ? window.getMorphologyCountForKey(key) : 0;
    const grammarCount = window.getGrammarCountForKey ? window.getGrammarCountForKey(key) : 0;
    const studyCount = morphCount + grammarCount;
    if (!vocabCount && !studyCount) return;
    if (!host.canAccessGrammarUi() && !vocabCount) return;
    if (splitVocabOnly && !vocabCount) return;
    if (splitGrammarOnly && !studyCount) return;

    const weekNum = Number.isFinite(Number(set.week)) ? Number(set.week) : null;
    if (!weekGroups.has(weekNum)) weekGroups.set(weekNum, []);
    weekGroups.get(weekNum).push({ key, set, vocabCount, studyCount });
  });

  const orderedWeeks = [...weekGroups.keys()].sort((a, b) => {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return a - b;
  });

  orderedWeeks.forEach(weekNum => {
    const entries = weekGroups.get(weekNum);
    if (!entries || !entries.length) return;
    const weekDetails = document.createElement('details');
    weekDetails.className = 'supplemental-week';
    weekDetails.open = entries.some(({ key }) =>
      runtime.selectedKeys.includes(String(key)) ||
      getSupplementalParadigmsForKey(key).some(p => runtime.selectedKeys.includes(p.key))
    );
    const weekSummary = document.createElement('summary');
    weekSummary.className = 'supplemental-week-summary';
    const totalVocab = entries.reduce((s, e) => s + e.vocabCount, 0);
    const totalStudy = entries.reduce((s, e) => s + e.studyCount, 0);
    const weekLabel = weekNum == null ? 'Other supplements' : `Week ${weekNum}`;
    const weekCount = host.canAccessGrammarUi()
      ? `${entries.length} paradigm${entries.length === 1 ? '' : 's'} · ${totalVocab} vocab${totalStudy ? ` · ${totalStudy} grammar` : ''}`
      : `${entries.length} paradigm${entries.length === 1 ? '' : 's'} · ${totalVocab} vocab`;
    weekSummary.innerHTML = `<span>${weekLabel}</span><span class="chapter-count">${weekCount}</span>`;
    weekDetails.appendChild(weekSummary);

    const weekBody = document.createElement('div');
    weekBody.className = 'supplemental-week-body';

    const weekEntryKeys = entries.map(e => String(e.key));
    const allWeekSelected = weekEntryKeys.length > 0
      && weekEntryKeys.every(k => runtime.selectedKeys.includes(k));
    const selectAllBtn = document.createElement('button');
    selectAllBtn.type = 'button';
    selectAllBtn.className = 'chapter-btn supplemental-select-all-week';
    if (allWeekSelected) selectAllBtn.classList.add('active');
    selectAllBtn.setAttribute('aria-pressed', allWeekSelected ? 'true' : 'false');
    if (allWeekSelected) {
      selectAllBtn.textContent = weekNum == null
        ? 'Deselect all other supplementals'
        : `Deselect all Week ${weekNum} supplementals`;
    } else {
      selectAllBtn.textContent = weekNum == null
        ? 'Select all other supplementals'
        : `Select all Week ${weekNum} supplementals`;
    }
    selectAllBtn.onclick = () => toggleAllWeekSupplementals(weekEntryKeys);
    weekBody.appendChild(selectAllBtn);

    entries.forEach(({ key, set, vocabCount, studyCount }) => {
      const countLabel = host.canAccessGrammarUi()
        ? `${vocabCount} vocab${studyCount ? ` · ${studyCount} grammar` : ''}`
        : `${vocabCount} vocab`;
      const paradigmList = host.canAccessGrammarUi() ? getSupplementalParadigmsForKey(key) : [];

      if (paradigmList.length <= 1) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chapter-btn supplemental-set-flat';
        btn.dataset.key = key;
        btn.innerHTML = `<span>${set.label}</span><span class="chapter-count">${countLabel}</span>`;
        btn.onclick = () => toggleSet(key);
        weekBody.appendChild(btn);
        return;
      }

      const details = document.createElement('details');
      details.className = 'supplemental-set';
      details.open = runtime.selectedKeys.includes(String(key)) || paradigmList.some(paradigm => runtime.selectedKeys.includes(paradigm.key));

      const summary = document.createElement('summary');
      summary.className = 'supplemental-summary';
      summary.innerHTML = `<span>${set.label}</span><span class="chapter-count">${countLabel}</span>`;
      details.appendChild(summary);

      const controls = document.createElement('div');
      controls.className = 'supplemental-paradigm-list';

      const allBtn = document.createElement('button');
      allBtn.className = 'chapter-btn supplemental-all-btn';
      allBtn.dataset.key = key;
      allBtn.innerHTML = `All ${set.label}<span class="chapter-count">${countLabel}</span>`;
      allBtn.onclick = () => toggleSet(key);
      controls.appendChild(allBtn);

      paradigmList.forEach(paradigm => {
        const btn = document.createElement('button');
        btn.className = 'chapter-btn supplemental-paradigm-btn';
        btn.dataset.key = paradigm.key;
        btn.innerHTML = `${paradigm.label}<span class="chapter-count">${paradigm.type} · ${paradigm.count} card${paradigm.count === 1 ? '' : 's'}</span>`;
        btn.onclick = () => toggleSet(paradigm.key);
        controls.appendChild(btn);
      });

      details.appendChild(controls);
      weekBody.appendChild(details);
    });

    weekDetails.appendChild(weekBody);
    list.appendChild(weekDetails);
  });

  setActiveSetButtons();
}

function getAdvancedSubGroups(set) {
  const cards = Array.isArray(set?.cards) ? set.cards : [];
  if (!cards.length) return [];
  const groups = new Map();
  cards.forEach((card, index) => {
    const sub = card && card.sub ? String(card.sub) : 'group';
    if (!groups.has(sub)) groups.set(sub, { sub, count: 0, firstIndex: index });
    groups.get(sub).count += 1;
  });
  return [...groups.values()].sort((a, b) => a.firstIndex - b.firstIndex);
}

export function buildAdvancedSelector() {
  const list = document.getElementById('advancedGrid');
  if (!list) return;
  list.innerHTML = '';

  const sets = window.SETS && typeof window.SETS === 'object' ? window.SETS : {};
  const advancedKeys = sortSetKeys(Object.keys(sets).filter(isAdvancedKey));

  const meta = document.getElementById('advancedSectionMeta');
  if (meta) {
    if (!advancedKeys.length) {
      meta.textContent = '';
    } else {
      const totalCards = advancedKeys.reduce((sum, key) => sum + (Array.isArray(sets[key]?.cards) ? sets[key].cards.length : 0), 0);
      meta.textContent = `${advancedKeys.length} buckets · ${totalCards.toLocaleString()} lemmas`;
    }
  }

  if (!advancedKeys.length) {
    const empty = document.createElement('div');
    empty.className = 'advanced-empty';
    empty.textContent = 'Advanced vocabulary data has not loaded yet.';
    list.appendChild(empty);
    return;
  }

  const deselectBtn = document.createElement('button');
  deselectBtn.type = 'button';
  deselectBtn.className = 'chapter-btn supplemental-deselect-all';
  deselectBtn.textContent = 'Deselect all advanced';
  deselectBtn.onclick = () => deselectAllAdvanced();
  list.appendChild(deselectBtn);

  const body = document.createElement('div');
  body.className = 'advanced-week-body';

  advancedKeys.forEach(key => {
    const set = sets[key];
    if (!set) return;
    const cardCount = Array.isArray(set.cards) ? set.cards.length : 0;
    if (!cardCount) return;
    const subGroups = getAdvancedSubGroups(set);
    const countLabel = `${cardCount} lemmas${set.notes ? '' : ''}`;

    const details = document.createElement('details');
    details.className = 'supplemental-set advanced-set';
    details.open = runtime.selectedKeys.includes(String(key));

    const summary = document.createElement('summary');
    summary.className = 'supplemental-summary advanced-summary';
    summary.innerHTML = `<span>${set.label || key}</span><span class="chapter-count">${countLabel}</span>`;
    details.appendChild(summary);

    if (set.notes) {
      const notes = document.createElement('div');
      notes.className = 'advanced-notes';
      notes.textContent = set.notes;
      details.appendChild(notes);
    }

    const controls = document.createElement('div');
    controls.className = 'supplemental-paradigm-list advanced-sub-list';

    const allBtn = document.createElement('button');
    allBtn.className = 'chapter-btn supplemental-all-btn';
    allBtn.dataset.key = key;
    allBtn.innerHTML = `All of ${set.label || key}<span class="chapter-count">${cardCount} lemmas</span>`;
    allBtn.onclick = () => toggleSet(key);
    controls.appendChild(allBtn);

    subGroups.forEach(group => {
      const btn = document.createElement('button');
      btn.className = 'chapter-btn supplemental-paradigm-btn advanced-sub-btn';
      btn.dataset.key = `${key}::sub::${group.sub}`;
      btn.innerHTML = `Sub ${group.sub}<span class="chapter-count">${group.count} lemmas</span>`;
      btn.onclick = () => toggleAdvancedSubGroup(key, group.sub);
      controls.appendChild(btn);
    });

    details.appendChild(controls);
    body.appendChild(details);
  });

  list.appendChild(body);
  setActiveSetButtons();
}

// Shared empty-state path used when a deselect leaves no selected keys.
function clearAndRenderEmpty() {
  // Deselecting everything is a "new session" event for the unspaced flow:
  // wipe the archive marks for the cards we were just studying so the next
  // selection starts fresh.
  if (!runtime.spacedRepetition) {
    const directionalMarks = host.getDirectionalMarksStore();
    (runtime.originalDeck || []).forEach(card => {
      if (card && card.id) delete directionalMarks[card.id];
    });
  }
  setActiveSessionButton();
  setActiveSetButtons();
  runtime.deck = [];
  runtime.originalDeck = [];
  runtime.activeDeckRef = null;
  runtime.marks = {};
  runtime.currentIdx = 0;
  runtime.unspacedRoundSize = 0;
  runtime.unspacedRoundMarks = 0;
  renderChooseSessionEmptyState();
  host.clearSpacedUndoSnapshot();
  host.syncToggleButtons();
  renderReview();
  host.saveState();
}

export function deselectAllAdvanced() {
  const remaining = runtime.selectedKeys.filter(k => {
    const base = getParadigmBaseKey(k) || k;
    return !isAdvancedKey(base);
  });
  if (remaining.length === runtime.selectedKeys.length) return;
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  runtime.selectedKeys = remaining;
  if (!runtime.selectedKeys.length) {
    clearAndRenderEmpty();
    return;
  }
  loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
}

export function deselectAllChapters() {
  const remaining = runtime.selectedKeys.filter(k => {
    const base = getParadigmBaseKey(k) || k;
    return !isChapterKey(base);
  });
  const sessionWasActive = !!runtime.currentSession;
  if (remaining.length === runtime.selectedKeys.length && !sessionWasActive) return;
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  runtime.selectedKeys = remaining;
  if (!runtime.selectedKeys.length) {
    clearAndRenderEmpty();
    return;
  }
  loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
}

export function deselectAll() {
  if (!runtime.selectedKeys.length && !runtime.currentSession) return;
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  runtime.selectedKeys = [];
  clearAndRenderEmpty();
}

export function toggleAdvancedSubGroup(setKey, subKey) {
  // Sub-groups load only the cards in that sub-bucket. We model this as a
  // pseudo-key that getAdvancedSubKeyCards expands at deck-build time.
  const pseudoKey = `${setKey}::sub::${subKey}`;
  toggleSet(pseudoKey);
}

export function loadDeckFromKeys(keys, sessionId = null, options = {}) {
  host.saveCurrentDeckStateToBank();
  host.clearSpacedUndoSnapshot();

  // "New session selected" path: clear unspaced archive marks for the cards
  // we were just studying so the next deck starts fresh. The first request
  // explicitly asked for marks to persist until reset or a new session, and
  // session-selection callers pass clearUnspacedMarks: true for that. Spaced
  // mode is intentionally exempt; it derives behaviour from SRS progress, not
  // these marks.
  if (options.clearUnspacedMarks && !runtime.spacedRepetition) {
    const directionalMarks = host.getDirectionalMarksStore();
    (runtime.originalDeck || []).forEach(card => {
      if (card && card.id) delete directionalMarks[card.id];
    });
    runtime.marks = directionalMarks;
  }

  runtime.selectedKeys = sortSetKeys(keys.map(String));
  runtime.currentSession = sessionId
    ? host.getSessions().find(s => s.id === sessionId) || findExactSessionMatch(runtime.selectedKeys)
    : findExactSessionMatch(runtime.selectedKeys);

  const selectedCards = host.getSelectedCards(runtime.selectedKeys);
  let scopedCards = runtime.requiredOnly ? selectedCards.filter(card => card.required) : selectedCards;
  if (runtime.hardVocabReviewMode && runtime.studyMode === 'vocab') {
    scopedCards = filterHardVocabCards(scopedCards, host.getDirectionalProgressStore());
  }
  // Step-by-step morphology drill: narrow the deck to the focused paradigm's
  // forms (lemma-matched, gated by max selected chapter/week). Falls through
  // to the standard scoped deck if nothing's focused yet.
  if (host.isMorphStepByStepActive()) {
    const focusedCards = host.getFocusedParadigmCards();
    if (Array.isArray(focusedCards)) scopedCards = focusedCards;
  }
  runtime.originalDeck = scopedCards;
  host.resetMorphAnswerState();

  const savedDeckState = runtime.deckStates[host.getDeckStateKey(runtime.selectedKeys, runtime.requiredOnly)] || null;
  runtime.marks = host.getDirectionalMarksStore();
  const restoredDeck = savedDeckState ? host.reorderDeckFromIds(runtime.originalDeck, savedDeckState.deckIds) : null;
  // A bank entry whose ids don't line up with the current deck is a stale
  // cross-mode save — ignore its cursor rather than clamp a meaningless index.
  if (restoredDeck) {
    // Resume this deck's banked three-pile session when the user is merely
    // coming back to it — a mode switch or an option toggle — within the 5 h
    // session window. The due/middle pile then keeps waiting (it only joins
    // active when active drains, on a manual reshuffle, or after the idle
    // gap) instead of being reshuffled into active on every switch.
    // Three cases still start fresh:
    //  - an explicit session/chapter pick (clearUnspacedMarks) — choosing a
    //    session is a deliberate "new round" event,
    //  - parsing mode, which deliberately resamples its deck on every load,
    //  - a bank entry older than the idle window (stale session).
    const savedAtMs = Number(savedDeckState.savedAt) || 0;
    const resumeSession = options.clearUnspacedMarks !== true
      && !host.isMorphStepByStepActive()
      && savedAtMs > 0
      && (Date.now() - savedAtMs) <= SESSION_IDLE_RESET_MS;
    if (runtime.spacedRepetition) {
      // Hand buildStudyDeck the banked active pile (and the banked order via
      // runtime.deck): its continue-session branch preserves the active
      // section as-is, with everything else due waiting in middle. When not
      // resuming, the cleared id list makes freshStart fire naturally, which
      // collapses all due cards into active and honours the shuffle toggle.
      runtime.deck = restoredDeck;
      runtime.spacedActiveIds = resumeSession && Array.isArray(savedDeckState.spacedActiveIds)
        ? [...savedDeckState.spacedActiveIds]
        : [];
      runtime.deck = host.buildStudyDeck(runtime.originalDeck);
    } else {
      // Unspaced: partition into [active, middle, archived]. Within the
      // session window the banked middle membership and active order are
      // restored intact; otherwise the round resets — middle collapses back
      // into active and the unmarked pile reshuffles.
      runtime.unspacedMiddleIds = resumeSession && Array.isArray(savedDeckState.unspacedMiddleIds)
        ? new Set(savedDeckState.unspacedMiddleIds)
        : new Set();
      const middleIds = runtime.unspacedMiddleIds;
      const restoredActive = restoredDeck.filter(card => runtime.marks[card.id] !== 'known' && !middleIds.has(card.id));
      const restoredMiddle = restoredDeck.filter(card => runtime.marks[card.id] !== 'known' && middleIds.has(card.id));
      const restoredKnown = restoredDeck.filter(card => runtime.marks[card.id] === 'known');
      const orderedActive = (runtime.shuffled && !resumeSession) ? shuffleArray([...restoredActive]) : [...restoredActive];
      runtime.deck = [...orderedActive, ...restoredMiddle, ...restoredKnown];
      runtime.unspacedMiddleCount = restoredMiddle.length;
      runtime.activeDeckCount = restoredActive.length;
    }
    // The saved cursor only means something while the banked order survives;
    // against a fresh build it would just skip a random prefix of the pile.
    // A fresh start begins at 0 — except an unspaced deck whose active pile
    // is empty (everything archived), which parks at the end so renderCard
    // shows the "all confirmed" state instead of an archived card. (Spaced
    // parks naturally: 0 >= activeDeckCount when nothing is due.)
    const freshStartIdx = (!runtime.spacedRepetition && runtime.activeDeckCount === 0) ? runtime.deck.length : 0;
    runtime.currentIdx = resumeSession && Number.isInteger(savedDeckState.currentIdx)
      ? Math.min(Math.max(savedDeckState.currentIdx, 0), runtime.spacedRepetition ? runtime.activeDeckCount : runtime.deck.length)
      : freshStartIdx;
    runtime.unspacedPendingRecycle = resumeSession && !runtime.spacedRepetition && !!savedDeckState.unspacedPendingRecycle;
    host.resetUnspacedCycleState();
    runtime.isFlipped = false;
  } else {
    host.resetStudyState();
    runtime.deck = host.buildStudyDeck(runtime.originalDeck);
  }
  host.markActiveDeckRef();

  setActiveSessionButton();
  setActiveSetButtons();

  host.syncToggleButtons();

  host.resetMorphAnswerState();
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

export function loadSession(session) {
  runtime.currentSession = session;
  loadDeckFromKeys(expandSessionSets(session), session.id, { clearUnspacedMarks: true });
}

export function toggleSession(session) {
  host.saveCurrentDeckStateToBank();

  const sessionKeys = expandSessionSets(session);
  if (!sessionKeys.length) return;

  const alreadySelected = isSessionFullySelected(session);
  const nextKeys = alreadySelected
    ? runtime.selectedKeys.filter(key => !sessionKeys.includes(key))
    : sortSetKeys([...new Set([...runtime.selectedKeys, ...sessionKeys])]);

  runtime.currentSession = null;

  if (!nextKeys.length) {
    runtime.selectedKeys = [];
    runtime.marks = host.getDirectionalMarksStore();
    clearAndRenderEmpty();
    return;
  }

  loadDeckFromKeys(nextKeys, null, { clearUnspacedMarks: true });
}

export function getParadigmBaseKey(key) {
  const match = String(key).match(/^(.+)::(grammar|morph)::\d+$/);
  if (match) return match[1];
  const subMatch = String(key).match(/^(.+)::sub::.+$/);
  return subMatch ? subMatch[1] : null;
}

export function toggleSet(key) {
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  const raw = String(key);
  const baseKey = getParadigmBaseKey(raw);
  if (runtime.selectedKeys.includes(raw)) {
    runtime.selectedKeys = runtime.selectedKeys.filter(k => k !== raw);
  } else if (baseKey) {
    runtime.selectedKeys = [...runtime.selectedKeys.filter(k => k !== baseKey), raw];
  } else {
    runtime.selectedKeys = [...runtime.selectedKeys.filter(k => getParadigmBaseKey(k) !== raw), raw];
  }

  if (!runtime.selectedKeys.length) {
    clearAndRenderEmpty();
    return;
  }

  loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
}
