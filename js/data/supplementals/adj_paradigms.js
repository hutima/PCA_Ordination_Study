(function () {
  const KEY = 'W1_ADJ_PARADIGMS';

  window.registerSupplementalVocabSet(KEY, {
    label: 'πολύς / μέγας-paradigm',
    week: 1,
    cards: [
      // πολύς — irregular adj. Distinct masc.-only forms first, then the
      // 2nd-decl. forms shared between masc. and neut. (gen./dat. sg. and
      // dat. pl.) and the gen. pl. shared across all three genders.
      { g: 'πολύς', e: 'much / many (masc. Nom. sg.)', required: true },
      { g: 'πολύν', e: 'much / many (masc. Acc. sg.)', required: true },
      { g: 'πολλοῦ', e: 'of much / of many (masc./neut. Gen. sg.)', required: true },
      { g: 'πολλῷ', e: 'to/for much / many (masc./neut. Dat. sg.)', required: true },
      { g: 'πολλοί', e: 'many (masc. Nom. pl.)', required: true },
      { g: 'πολλούς', e: 'many (masc. Acc. pl.)', required: true },
      { g: 'πολλῶν', e: 'of many (masc./fem./neut. Gen. pl.)', required: true },
      { g: 'πολλοῖς', e: 'to/for many (masc./neut. Dat. pl.)', required: true },
      // πολύς — fem.
      { g: 'πολλή', e: 'much / many (fem. Nom. sg.)', required: true },
      { g: 'πολλήν', e: 'much / many (fem. Acc. sg.)', required: true },
      { g: 'πολλῆς', e: 'of much / of many (fem. Gen. sg.)', required: true },
      { g: 'πολλῇ', e: 'to/for much / many (fem. Dat. sg.)', required: true },
      { g: 'πολλαί', e: 'many (fem. Nom. pl.)', required: true },
      { g: 'πολλάς', e: 'many (fem. Acc. pl.)', required: true },
      { g: 'πολλαῖς', e: 'to/for many (fem. Dat. pl.)', required: true },
      // πολύς — neut. (the distinct forms; gen./dat. sg. and gen./dat. pl.
      // are syncretic with masc. and are tagged above).
      { g: 'πολύ', e: 'much (neut. Nom./Acc. sg.)', required: true },
      { g: 'πολλά', e: 'many (neut. Nom./Acc. pl.)', required: true },
      // μέγας — same pattern as πολύς for syncretism.
      { g: 'μέγας', e: 'great (masc. Nom. sg.)', required: true },
      { g: 'μέγαν', e: 'great (masc. Acc. sg.)', required: true },
      { g: 'μεγάλου', e: 'of great (masc./neut. Gen. sg.)', required: true },
      { g: 'μεγάλῳ', e: 'to/for great (masc./neut. Dat. sg.)', required: true },
      { g: 'μεγάλοι', e: 'great (masc. Nom. pl.)', required: true },
      { g: 'μεγάλους', e: 'great (masc. Acc. pl.)', required: true },
      { g: 'μεγάλων', e: 'of great (masc./fem./neut. Gen. pl.)', required: true },
      { g: 'μεγάλοις', e: 'to/for great (masc./neut. Dat. pl.)', required: true },
      // μέγας — fem.
      { g: 'μεγάλη', e: 'great (fem. Nom. sg.)', required: true },
      { g: 'μεγάλην', e: 'great (fem. Acc. sg.)', required: true },
      { g: 'μεγάλης', e: 'of great (fem. Gen. sg.)', required: true },
      { g: 'μεγάλῃ', e: 'to/for great (fem. Dat. sg.)', required: true },
      { g: 'μεγάλαι', e: 'great (fem. Nom. pl.)', required: true },
      { g: 'μεγάλας', e: 'great (fem. Acc. pl.)', required: true },
      { g: 'μεγάλαις', e: 'to/for great (fem. Dat. pl.)', required: true },
      // μέγας — neut. (only the distinct neut. forms).
      { g: 'μέγα', e: 'great (neut. Nom./Acc. sg.)', required: true },
      { g: 'μεγάλα', e: 'great (neut. Nom./Acc. pl.)', required: true }
    ]
  });

  window.registerSupplementalGrammarSet(KEY, {
    label: 'πολύς / μέγας-paradigm',
    notes: 'Week 1 paradigm: irregular adjectives πολύς and μέγας.',
    items: [
      {
        family: 'Irregular adjective recognition',
        lemma: 'πολύς / μέγας',
        gloss: 'much/many · great',
        questions: [
          {
            form: 'πολύς',
            prompt: 'Why is this form irregular?',
            answer: 'πολύς/πολύ use short stems in nom./acc. sg. masc./neut.; all other forms use πολλ-',
            choices: [
              'πολύς/πολύ use short stems in nom./acc. sg. masc./neut.; all other forms use πολλ-',
              'It follows the 3rd declension throughout',
              'It is a contract adjective',
              'It lacks a feminine form'
            ]
          },
          {
            form: 'μέγας',
            prompt: 'Why is this form irregular?',
            answer: 'μέγας/μέγα use short stems in nom./acc. sg. masc./neut.; all other forms use μεγαλ-',
            choices: [
              'μέγας/μέγα use short stems in nom./acc. sg. masc./neut.; all other forms use μεγαλ-',
              'It is a 3rd declension adjective throughout',
              'It contracts like a verb',
              'It lacks a neuter form'
            ]
          }
        ]
      }
    ]
  });
})();
