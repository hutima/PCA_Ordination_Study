// Liquid-future verb flashcards: present form on one face (with its English
// gloss), the liquid future on the other (1st sg.). Liquid-stem verbs (stems
// ending in λ, μ, ν, ρ) build their future WITHOUT a sigma — instead the stem
// often shortens (ει → ε, λλ → λ) and the ending contracts onto a circumflex
// (μενῶ, μενεῖς …), so the future can look surprisingly close to the present
// except for the accent. The renderer diff-highlights the differing
// characters (see render.js's stem-flip branch) so the shift is obvious.
//
// Mirrors second_aorist_flip.js exactly: cards keep the standard vocab-card
// shape plus the stemFlip flag, but reuse the stem-flip "other form" slot
// (`aorist`/`aoristGloss`) for the FUTURE and override the back-face label to
// "Future (1st sg.)". Both faces also print the verbal (future) stem after a
// comma — the same stem on each side — so the pair is anchored to the stem
// that connects them (e.g. μένω, μεν- ↔ μενῶ, μεν-). keyVerb flags the
// high-frequency verbs the student's professor singled out.

(function () {
  if (typeof window.registerSupplementalVocabSet !== 'function') return;

  function entry(present, presentGloss, future, futureGloss, stem, note, keyVerb) {
    return {
      stemFlip: true,
      g: present,
      e: presentGloss,
      aorist: future,             // reuse the stem-flip "other form" slot
      aoristGloss: futureGloss,
      stem: stem || '',
      stemFlipAorist: 'Future (1st sg.)',
      stemNote: note || '',
      keyVerb: !!keyVerb,
      required: true
    };
  }

  window.registerSupplementalVocabSet('W4_LIQUID_FUTURE_FLIP', {
    label: 'Liquid-future verbs — present ↔ future flashcards',
    week: 4,
    cards: [
      entry('μένω', 'I remain',          'μενῶ', 'I will remain',       'μεν-',      'liquid stem (-ν): no σ; ending contracts to a circumflex (μενῶ, μενεῖς…)', true),
      entry('κρίνω', 'I judge',          'κρινῶ', 'I will judge',       'κριν-',     'liquid stem (-ν): no σ; circumflex ending', true),
      entry('ἀποστέλλω', 'I send',       'ἀποστελῶ', 'I will send',     'ἀποστελ-',  'liquid stem: λλ → λ; circumflex ending'),
      entry('αἴρω', 'I lift up, take away', 'ἀρῶ', 'I will lift up',    'ἀρ-',       'liquid stem (-ρ): stem contracts, no σ'),
      entry('ἐγείρω', 'I raise',         'ἐγερῶ', 'I will raise',       'ἐγερ-',     'liquid stem (-ρ): ει → ε; circumflex ending'),
      entry('ἀποκτείνω', 'I kill',       'ἀποκτενῶ', 'I will kill',     'ἀποκτεν-',  'liquid stem (-ν): ει → ε; circumflex ending'),
      entry('σπείρω', 'I sow',           'σπερῶ', 'I will sow',         'σπερ-',     'liquid stem (-ρ): ει → ε; circumflex ending'),
      entry('ἀγγέλλω', 'I announce',     'ἀγγελῶ', 'I will announce',   'ἀγγελ-',    'liquid stem: λλ → λ; circumflex ending'),
      entry('βάλλω', 'I throw',          'βαλῶ', 'I will throw',        'βαλ-',      'liquid stem: λλ → λ; circumflex ending (also a 2nd-aorist verb — ἔβαλον)'),
      entry('ἀποθνῄσκω', 'I die',        'ἀποθανοῦμαι', 'I will die',   'ἀποθαν-',   'deponent (middle) liquid future; no σ, circumflex ending (also a 2nd-aorist verb — ἀπέθανον)')
    ]
  });
})();
