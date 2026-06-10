// Aorist-passive stem flashcards: each card shows the present active form
// with its English gloss on one face and the aorist passive (1st sg.) with
// its passive-sense English gloss on the other. Diff-highlights the stem
// change between the two forms via the renderer's stem-flip layout.
//
// Goes with Week 6 (Duff chapters 15-16, where the aorist passive is
// introduced). Many NT-common verbs have irregular θη-stems — ὁράω → ὤφθην
// uses an entirely different root, ἀποστέλλω → ἀπεστάλην drops σ and goes
// to η, λαμβάνω → ἐλήμφθην inserts a μ — and they need recall practice
// against plausible distractors.

(function () {
  if (typeof window.registerSupplementalVocabSet !== 'function') return;

  function entry(present, presentGloss, aoristPassive, passiveGloss, note) {
    return {
      stemFlip: true,
      stemFlipAorist: 'aorist passive (1st sg.)',
      g: present,
      e: presentGloss,
      aorist: aoristPassive,
      aoristGloss: passiveGloss,
      stemNote: note || '',
      required: true
    };
  }

  window.registerSupplementalVocabSet('W6_AORIST_PASSIVE_FLIP', {
    label: 'Aorist passive stems — present ↔ aorist passive flashcards',
    week: 6,
    cards: [
      entry('λύω', 'I untie',                  'ἐλύθην', 'I was untied',                'regular θη-stem; ε-augment + -θην'),
      entry('ἀκούω', 'I hear',                 'ἠκούσθην', 'I was heard',               'regular pattern; α → η augment, ς inserted'),
      entry('πιστεύω', 'I believe',            'ἐπιστεύθην', 'I was believed',          'regular; -θην directly on stem'),
      entry('βαπτίζω', 'I baptize',            'ἐβαπτίσθην', 'I was baptized',          'ζ → σ before θ'),
      entry('διδάσκω', 'I teach',              'ἐδιδάχθην', 'I was taught',             'κ → χ before θ (assimilation)'),
      entry('κηρύσσω', 'I preach / proclaim',  'ἐκηρύχθην', 'I was preached',           'σσ → χ before θ'),
      entry('σώζω', 'I save',                  'ἐσώθην', 'I was saved',                 'ζ drops out entirely'),
      entry('εὑρίσκω', 'I find',               'εὑρέθην', 'I was found',               'loses -ισκ- suffix; rough breathing kept'),
      entry('γινώσκω', 'I know',               'ἐγνώσθην', 'I was known',              'loses -ισκ- suffix; ς inserted'),
      entry('κρίνω', 'I judge',                'ἐκρίθην', 'I was judged',              'loses the nasal -ν-'),
      entry('ἐγείρω', 'I raise',               'ἠγέρθην', 'I was raised',              'liquid stem; ε → η augment'),
      entry('ἀποστέλλω', 'I send',             'ἀπεστάλην', 'I was sent',              '2nd aorist passive (η-stem, no θ); double λ → single λ'),
      entry('γράφω', 'I write',                'ἐγράφην', 'I was written',             '2nd aorist passive (η-stem, no θ)'),
      entry('λαμβάνω', 'I take',               'ἐλήμφθην', 'I was taken',              'lost -αν- suffix; μ inserted before φ'),
      entry('βάλλω', 'I throw',                'ἐβλήθην', 'I was thrown',              'completely different stem βλη-'),
      entry('λέγω', 'I say',                   'ἐρρέθην', 'I was said',                'completely different root (ῥε-) with reduplicated ρ'),
      entry('ὁράω', 'I see',                   'ὤφθην', 'I was seen / I appeared',     'completely different root (ὀπ-)'),
      entry('φέρω', 'I carry / bear',          'ἠνέχθην', 'I was carried',             'completely different root (ἐνεγκ-)'),
      entry('ἔρχομαι', 'I come / go',          'ἦλθον', 'I came',                      '(deponent; 2nd aor active form, not θη-stem — listed for reference)'),
      entry('ἀνοίγω', 'I open',                'ἠνεῴχθην', 'I was opened',             'double augment (η + ε) + θη')
    ]
  });
})();
