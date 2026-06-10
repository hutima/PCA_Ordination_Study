// Perfect-active stem flashcards: present active ↔ perfect active (1st sg.)
// with diff-highlighting via the stem-flip card layout.
//
// Goes with Week 6 (Duff chapter 16, where the perfect tense is introduced).
// Most NT-common verbs reduplicate their initial consonant + ε to form the
// perfect (λύω → λέλυκα), but a handful use Attic reduplication
// (ἀκούω → ἀκήκοα, ἔρχομαι → ἐλήλυθα) or a completely different root
// (λέγω → εἴρηκα). The irregulars are the ones that need recall practice.

(function () {
  if (typeof window.registerSupplementalVocabSet !== 'function') return;

  function entry(present, presentGloss, perfectActive, perfectGloss, note) {
    return {
      stemFlip: true,
      stemFlipAorist: 'perfect active (1st sg.)',
      g: present,
      e: presentGloss,
      aorist: perfectActive,
      aoristGloss: perfectGloss,
      stemNote: note || '',
      required: true
    };
  }

  window.registerSupplementalVocabSet('W6_PERFECT_ACTIVE_FLIP', {
    label: 'Perfect active stems — present ↔ perfect active flashcards',
    week: 6,
    cards: [
      entry('λύω', 'I untie',                  'λέλυκα', 'I have untied',              'regular reduplication λ → λε-'),
      entry('πιστεύω', 'I believe',            'πεπίστευκα', 'I have believed',        'regular reduplication π → πε-'),
      entry('γράφω', 'I write',                'γέγραφα', 'I have written',            '-α (not -κα) perfect; consonant-stem'),
      entry('κρίνω', 'I judge',                'κέκρικα', 'I have judged',             'loses the nasal -ν-'),
      entry('βάλλω', 'I throw',                'βέβληκα', 'I have thrown',             'different stem βλη-; reduplication β → βε-'),
      entry('γινώσκω', 'I know',               'ἔγνωκα', 'I have known',               'loses -ισκ-; ε-augment substitutes for reduplication'),
      entry('εὑρίσκω', 'I find',               'εὕρηκα', 'I have found',               'loses -ισκ-; rough breathing kept'),
      entry('ἀκούω', 'I hear',                 'ἀκήκοα', 'I have heard',               'Attic reduplication (ἀκη- + first two consonants repeated)'),
      entry('ὁράω', 'I see',                   'ἑώρακα', 'I have seen',                'Attic-style reduplication with rough breathing; irregular'),
      entry('λέγω', 'I say',                   'εἴρηκα', 'I have said',                'completely different root (ἐρ-); long-vowel augment in reduplication'),
      entry('λαμβάνω', 'I take',               'εἴληφα', 'I have taken',               'completely different stem (ληφ-); -α (not -κα) perfect'),
      entry('ἔρχομαι', 'I come / go',          'ἐλήλυθα', 'I have come',               'Attic reduplication + different root (ἐλυθ-); -α perfect'),
      entry('γίνομαι', 'I become',             'γέγονα', 'I have become',              '-α perfect; deponent stem γον-'),
      entry('ἀποθνῄσκω', 'I die',              'τέθνηκα', 'I have died',               'irregular τε- reduplication; lost the -σκ- suffix'),
      entry('ἀνοίγω', 'I open',                'ἀνέῳγα', 'I have opened',              'irregular vowel-augment reduplication'),
      entry('οἶδα', 'I know (perfect-as-present)', 'οἶδα', 'I know',                   'no present-tense form — οἶδα is a perfect that functions as a present'),
      entry('πάσχω', 'I suffer',               'πέπονθα', 'I have suffered',           'σχ → νθ stem change; -α perfect'),
      entry('πείθω', 'I persuade',             'πέποιθα', 'I trust (intransitive sense)', '-α perfect with stative meaning'),
      entry('πίπτω', 'I fall',                 'πέπτωκα', 'I have fallen',             'reduplication on the original π-stem')
    ]
  });
})();
