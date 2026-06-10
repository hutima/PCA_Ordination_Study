// ═══════════════════════════════════════════════════════════════════════
//  SUPPLEMENTAL REGISTRY — registration API for all supplemental sets
// ═══════════════════════════════════════════════════════════════════════
//  Exposes registerSupplementalVocabSet, registerSupplementalGrammarSet,
//  and registerSupplementalMorphologySet for use by supplemental sub-files.

(function () {
  function normalizeKey(key) {
    return String(key || '').trim();
  }

  function cloneSet(set) {
    return {
      ...set,
      cards: Array.isArray(set.cards) ? [...set.cards] : set.cards,
      items: Array.isArray(set.items) ? [...set.items] : set.items
    };
  }

  function ensureObject(name) {
    if (!window[name] || typeof window[name] !== 'object') {
      window[name] = {};
    }
    return window[name];
  }

  function ensureSupplementalSetEntry(key, set) {
    if (!window.SETS || typeof window.SETS !== 'object') return;
    if (!window.SETS[key]) {
      window.SETS[key] = {
        label: set.label || key,
        type: 'supplemental',
        supplemental: true,
        week: set.week ?? null,
        cards: []
      };
    } else {
      window.SETS[key].label = set.label || window.SETS[key].label || key;
      window.SETS[key].type = window.SETS[key].type || 'supplemental';
      window.SETS[key].supplemental = true;
      if (set.week != null) window.SETS[key].week = set.week;
      if (!Array.isArray(window.SETS[key].cards)) window.SETS[key].cards = [];
    }
  }

  function ensureAdvancedSetEntry(key, set) {
    if (!window.SETS || typeof window.SETS !== 'object') return;
    if (!window.SETS[key]) {
      window.SETS[key] = {
        label: set.label || key,
        type: 'advanced',
        advanced: true,
        bucket: set.bucket ?? null,
        rankStart: set.rankStart ?? null,
        rankEnd: set.rankEnd ?? null,
        notes: set.notes || '',
        cards: []
      };
    } else {
      window.SETS[key].label = set.label || window.SETS[key].label || key;
      window.SETS[key].type = 'advanced';
      window.SETS[key].advanced = true;
      if (set.bucket != null) window.SETS[key].bucket = set.bucket;
      if (set.rankStart != null) window.SETS[key].rankStart = set.rankStart;
      if (set.rankEnd != null) window.SETS[key].rankEnd = set.rankEnd;
      if (set.notes) window.SETS[key].notes = set.notes;
      if (!Array.isArray(window.SETS[key].cards)) window.SETS[key].cards = [];
    }
  }

  function registerSupplementalVocabSet(key, set) {
    const safeKey = normalizeKey(key);
    if (!safeKey || !set || typeof set !== 'object') return;
    ensureSupplementalSetEntry(safeKey, set);
    if (window.SETS && Array.isArray(window.SETS[safeKey]?.cards) && Array.isArray(set.cards)) {
      window.SETS[safeKey].cards.push(...set.cards);
    }
    const registry = ensureObject('SUPPLEMENTAL_VOCAB_SETS');
    registry[safeKey] = { supplemental: true, ...cloneSet(set) };
  }

  function registerSupplementalGrammarSet(key, set) {
    const safeKey = normalizeKey(key);
    if (!safeKey || !set || typeof set !== 'object') return;
    const registry = ensureObject('SUPPLEMENTAL_GRAMMAR_SETS');
    registry[safeKey] = {
      supplemental: true,
      ...cloneSet(set),
      items: Array.isArray(set.items) ? set.items : []
    };
    ensureSupplementalSetEntry(safeKey, set);
    if (typeof window.registerSupplementalGrammarSets === 'function') {
      window.registerSupplementalGrammarSets({ [safeKey]: registry[safeKey] });
    }
  }

  function registerSupplementalMorphologySet(key, set) {
    const safeKey = normalizeKey(key);
    if (!safeKey || !set || typeof set !== 'object') return;
    const registry = ensureObject('SUPPLEMENTAL_MORPHOLOGY_SETS');
    registry[safeKey] = {
      supplemental: true,
      ...cloneSet(set),
      items: Array.isArray(set.items) ? set.items : []
    };
    ensureSupplementalSetEntry(safeKey, set);
    const morphSets = window.MORPHOLOGY_SETS;
    if (morphSets && typeof morphSets === 'object') {
      if (!morphSets[safeKey]) {
        morphSets[safeKey] = registry[safeKey];
      } else {
        morphSets[safeKey].label = set.label || morphSets[safeKey].label;
        morphSets[safeKey].notes = set.notes || morphSets[safeKey].notes;
        morphSets[safeKey].supplemental = true;
        morphSets[safeKey].items = [...(morphSets[safeKey].items || []), ...(set.items || [])];
      }
    }
  }

  function registerAdvancedVocabSet(key, set) {
    const safeKey = normalizeKey(key);
    if (!safeKey || !set || typeof set !== 'object') return;
    ensureAdvancedSetEntry(safeKey, set);
    if (window.SETS && Array.isArray(window.SETS[safeKey]?.cards) && Array.isArray(set.cards)) {
      const tagged = set.cards.map(card => ({ ...card, advanced: true }));
      window.SETS[safeKey].cards.push(...tagged);
    }
    const registry = ensureObject('ADVANCED_VOCAB_SETS');
    registry[safeKey] = { advanced: true, ...cloneSet(set) };
  }

  function isAdvancedKey(key) {
    return /^ADV\d+$/i.test(String(key || ''));
  }

  window.SUPPLEMENTAL_VOCAB_SETS = ensureObject('SUPPLEMENTAL_VOCAB_SETS');
  window.SUPPLEMENTAL_GRAMMAR_SETS = ensureObject('SUPPLEMENTAL_GRAMMAR_SETS');
  window.SUPPLEMENTAL_MORPHOLOGY_SETS = ensureObject('SUPPLEMENTAL_MORPHOLOGY_SETS');
  window.ADVANCED_VOCAB_SETS = ensureObject('ADVANCED_VOCAB_SETS');
  window.registerSupplementalVocabSet = registerSupplementalVocabSet;
  window.registerSupplementalGrammarSet = registerSupplementalGrammarSet;
  window.registerSupplementalMorphologySet = registerSupplementalMorphologySet;
  window.registerAdvancedVocabSet = registerAdvancedVocabSet;
  window.isAdvancedVocabKey = isAdvancedKey;
})();
