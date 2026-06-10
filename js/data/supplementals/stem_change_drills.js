// Auto-generates stem-change recall cards from stem-pair vocab sets (entries
// whose Greek field contains "X → Y" or "X → Y → Z"). Each stem-pair becomes
// a pair (or more) of MC questions:
//
//   forward:  "What is the 1st-singular {tense} of {present}?"  → target
//   reverse:  "{target} is the {tense} of which present-tense verb?" → present
//
// Distractors are pulled from other entries in the same set, so every wrong
// choice is a real Greek form that the student must distinguish.
//
// Adding a new tense-pair set (e.g. a future "Perfect stems" vocab block in
// a later week) is a one-line entry in STEM_DRILL_CONFIG.

(function () {
  if (typeof window.registerSupplementalMorphologySet !== 'function') return;

  const STEM_ARROW_REGEX = /\s*→\s*/;

  // Each config:
  //   vocabKey      — source SUPPLEMENTAL_VOCAB_SETS key (must contain
  //                   "→"-delimited Greek forms)
  //   drillKey      — new MORPHOLOGY_SETS key to register under
  //   label         — set label shown in the dropdown/source line
  //   lemma         — group lemma used by paradigm_focus.js for category
  //                   placement and the focused-paradigm dropdown
  //   transforms    — names of the columns *after* the present form, in
  //                   order. For "present → future → aorist" use
  //                   ['future', 'aorist'].
  //   gloss         — short string shown under the dropdown entry
  //   notes         — set-level note (appears with the question)
  //   week          — week tag for chapter gating
  const STEM_DRILL_CONFIG = [
    {
      vocabKey: 'W4_SECOND_AORIST_STEMS',
      drillKey: 'W4_SECOND_AORIST_STEMS_DRILL',
      label:    'Second-aorist stem changes',
      lemma:    'Second-aorist stems',
      gloss:    'present ↔ 1st-sg aorist',
      transforms: ['aorist'],
      notes:    'Recall the 1st-singular aorist given the present (and the present given the aorist).',
      week:     4
    },
    {
      vocabKey: 'W4_FUTURE_LIQUID_STEMS',
      drillKey: 'W4_FUTURE_LIQUID_STEMS_DRILL',
      label:    'Liquid-future stem changes',
      lemma:    'Liquid-stem futures',
      gloss:    'present ↔ future ↔ aorist',
      transforms: ['future', 'aorist'],
      notes:    'Recall the future and aorist 1st-sg given the present (and the present given each form).',
      week:     4
    }
    // Add future entries here when perfect-stem or μι-verb stem-pair vocab
    // sets land. e.g.:
    //   { vocabKey: 'W6_PERFECT_STEMS', drillKey: ..., transforms: ['perfect'], ... }
  ];

  function extractTuples(set, expectedColumns) {
    // Returns array of [present, ...transforms] arrays, one per parseable
    // stem-pair card. Cards with fewer columns are skipped (the data is
    // sometimes inconsistent — e.g. some rows might only have present →
    // aorist while the set expects 3 columns).
    const out = [];
    (set.cards || []).forEach((card) => {
      const greek = String(card && card.g ? card.g : '').trim();
      const parts = greek.split(STEM_ARROW_REGEX).map((s) => s.trim()).filter(Boolean);
      if (parts.length < expectedColumns) return;
      out.push(parts.slice(0, expectedColumns));
    });
    return out;
  }

  function buildQuestions(set, transforms) {
    const tuples = extractTuples(set, transforms.length + 1);
    if (tuples.length < 2) return null;

    const questions = [];
    tuples.forEach((row) => {
      const present = row[0];
      transforms.forEach((tName, idx) => {
        const target = row[idx + 1];
        if (!target) return;
        // Forward: given the present, recall the transformed form.
        questions.push({
          form: present,
          answer: target,
          prompt: `What is the 1st-singular ${tName} of ${present}?`,
          dimensional: false,
          reversible: false
        });
        // Reverse: given the transformed form, recall the present lemma.
        questions.push({
          form: target,
          answer: present,
          prompt: `${target} — what is the present-tense lemma?`,
          dimensional: false,
          reversible: false
        });
      });
    });
    return questions;
  }

  const vocabSets = window.SUPPLEMENTAL_VOCAB_SETS || {};

  STEM_DRILL_CONFIG.forEach((cfg) => {
    const sourceSet = vocabSets[cfg.vocabKey];
    if (!sourceSet) return;
    const questions = buildQuestions(sourceSet, cfg.transforms);
    if (!questions) return;
    window.registerSupplementalMorphologySet(cfg.drillKey, {
      label: cfg.label,
      week:  cfg.week,
      notes: cfg.notes,
      items: [
        {
          family: cfg.label,
          lemma:  cfg.lemma,
          gloss:  cfg.gloss,
          questions
        }
      ]
    });
  });
})();
