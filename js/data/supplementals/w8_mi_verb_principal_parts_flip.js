// μι-verb principal-parts flashcards: present ↔ aorist (or other principal
// part) for the major μι-verbs introduced in Week 8 (Duff chapters 19-20).
// μι-verbs reduplicate the initial consonant + ι in the present (δίδωμι,
// τίθημι, ἵστημι), then drop the reduplication and become much shorter in
// the aorist (ἔδωκα, ἔθηκα, ἔστησα/ἔστην) — the stem changes are dramatic
// and worth dedicated recall practice.

(function () {
  if (typeof window.registerSupplementalVocabSet !== 'function') return;

  function entry(present, presentGloss, target, targetGloss, label, note) {
    return {
      stemFlip: true,
      stemFlipAorist: label,
      g: present,
      e: presentGloss,
      aorist: target,
      aoristGloss: targetGloss,
      stemNote: note || '',
      required: true
    };
  }

  window.registerSupplementalVocabSet('W8_MI_VERB_PRINCIPAL_PARTS_FLIP', {
    label: 'μι-verb principal parts — present ↔ aorist / perfect flashcards',
    week: 8,
    cards: [
      // δίδωμι
      entry('δίδωμι', 'I give',                          'ἔδωκα', 'I gave',                       'aorist active (1st sg.)',   'reduplication lost; k-aorist (-κα)'),
      entry('δίδωμι', 'I give',                          'δώσω', 'I will give',                   'future active (1st sg.)',   'reduplication lost; -σω future on δω-stem'),
      entry('δίδωμι', 'I give',                          'δέδωκα', 'I have given',                'perfect active (1st sg.)',  'standard δε- reduplication on δω-stem'),
      entry('δίδωμι', 'I give',                          'ἐδόθην', 'I was given',                 'aorist passive (1st sg.)',  'short stem δο- + θη'),
      // τίθημι
      entry('τίθημι', 'I put / place',                   'ἔθηκα', 'I put / placed',               'aorist active (1st sg.)',   'reduplication lost; k-aorist on θη-stem'),
      entry('τίθημι', 'I put / place',                   'θήσω', 'I will put / place',            'future active (1st sg.)',   'reduplication lost; -σω future on θη-stem'),
      entry('τίθημι', 'I put / place',                   'τέθεικα', 'I have put / placed',        'perfect active (1st sg.)',  'τε- reduplication; θει-stem'),
      entry('τίθημι', 'I put / place',                   'ἐτέθην', 'I was put / placed',          'aorist passive (1st sg.)',  'short stem τε- + θη (reduplicated-looking)'),
      // ἵστημι
      entry('ἵστημι', 'I make stand / stand',            'ἔστησα', 'I made stand (1st aor.)',     'aorist active (1st sg.)',   'transitive 1st aorist on στη-stem'),
      entry('ἵστημι', 'I make stand / stand',            'ἔστην', 'I stood (2nd aor.)',           'aorist active 2nd (1st sg.)', 'intransitive 2nd aorist; athematic -ην ending'),
      entry('ἵστημι', 'I make stand / stand',            'στήσω', 'I will make stand',            'future active (1st sg.)',   'reduplication lost; στη-stem + -σω'),
      entry('ἵστημι', 'I make stand / stand',            'ἕστηκα', 'I stand (perfect-as-present)', 'perfect active (1st sg.)', 'rough-breathing reduplication; perfect carries present sense'),
      entry('ἵστημι', 'I make stand / stand',            'ἐστάθην', 'I was made to stand',        'aorist passive (1st sg.)',  'short stem στα- + θη'),
      // ἀφίημι (compound of ἵημι)
      entry('ἀφίημι', 'I send away / forgive',           'ἀφῆκα', 'I sent away / forgave',        'aorist active (1st sg.)',   'k-aorist on -η stem; ε-augment after prefix'),
      entry('ἀφίημι', 'I send away / forgive',           'ἀφήσω', 'I will send away / forgive',   'future active (1st sg.)',   'reduplication lost; -η + -σω future'),
      entry('ἀφίημι', 'I send away / forgive',           'ἀφεῖκα', 'I have sent away / forgiven', 'perfect active (1st sg.)',  'irregular ει-reduplication'),
      entry('ἀφίημι', 'I send away / forgive',           'ἀφέθην', 'I was sent away / forgiven',  'aorist passive (1st sg.)',  'short ε-stem + θη'),
      // δείκνυμι
      entry('δείκνυμι', 'I show',                        'ἔδειξα', 'I showed',                    'aorist active (1st sg.)',   'loses -νυ- suffix; κ → ξ before σ in 1st aorist'),
      entry('δείκνυμι', 'I show',                        'δείξω', 'I will show',                  'future active (1st sg.)',   'loses -νυ- suffix; -ξω future'),
      entry('δείκνυμι', 'I show',                        'δέδειχα', 'I have shown',               'perfect active (1st sg.)',  'δε- reduplication; κ → χ before -α'),
      entry('δείκνυμι', 'I show',                        'ἐδείχθην', 'I was shown',               'aorist passive (1st sg.)',  'κ → χ before θ')
    ]
  });
})();
