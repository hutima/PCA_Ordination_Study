// Per-lemma morphological knowledge for the parse-feedback lookup and the
// optional-forms drill extension.
//
// `impossibleTenses` / `impossibleVoices` / `impossibleMoods` are the
// "negative" inventory: combinations that CAN'T exist in real Greek for
// this lemma. When the student's picked parse violates one of these, the
// summary's YOUR PARSE line says "[no morph exists]" — a confident
// statement that the form doesn't exist in the language, not just that
// we lack data for it. Combinations that ARE possible but aren't in our
// data still render as "—" (data gap), so the negative lists should only
// enumerate genuine morphological gaps, never just-not-covered-yet ones.
//
// `extraForms` is positive form data, read as a last-resort pool by
// resolveFormForPickedDims when no card carries the form the student's
// picks resolve to. Each entry maps a Greek form to a canonical answer
// string (e.g. "future middle participle genitive singular masc./neut.")
// in the same shape `parseAnswerDimensions` consumes. The lookup is
// ALWAYS consulted regardless of any user toggle — wrong picks deserve a
// canonical-form hint even when the form isn't part of the student's
// drill rotation.
//
// `optionalFormGroups` is the drillable counterpart: each group is a
// `{ chapter, family, forms }` bundle that becomes a set of synthetic
// parsing-drill cards when the "Optional paradigm extensions" toggle is
// ON in the settings panel. `chapter` is the gate (only injected when
// the student's max selected effective chapter ≥ this value), `family`
// labels the group in the parsing UI, and `forms` is the same flat
// `{ form: parsedAnswer }` shape as extraForms. The toggle defaults OFF
// so the standard Duff-aligned card set is the baseline; opting in
// expands a paradigm with morphologically real forms the textbook
// skips.
//
// Convention: build a `forms` map once at top of file, then reference it
// from BOTH `extraForms` (so fallback always works) AND
// `optionalFormGroups` (so the drill toggle picks it up too). This
// keeps the two consumers in sync — adding a form means it appears in
// fallback AND becomes drillable on opt-in.
//
// Lemmas not listed default to "all standard combinations possible."
// Add entries here as new defective lemmas show up in the paradigm
// data, and add `optionalFormGroups` entries for any paradigm exemplar
// (λύω, λόγος, ἀγαθός, …) whose paradigm has slots Duff doesn't drill.
// Keep the bar high on `impossible*` lists: only mark something
// impossible when it genuinely doesn't exist in Greek, not when Duff
// hasn't introduced it yet.

(function () {
  // εἰμί's future middle participle (ἐσόμενος, -ομένη, -όμενον). Declines
  // like λυόμενος. Pedagogically rare — Duff drills only the present
  // participle (ὤν / ὄντες) — but the future participle exists in Koine,
  // so a student picking "future participle ..." on εἰμί should see the
  // canonical form (e.g. ἐσομένου for gen. sg. masc./neut.) instead of
  // either "[no morph exists]" or a wrong-class match like ἔσομαι. Forms
  // syncretic across genders (ἐσόμενον serves masc. acc. sg. + neut. nom./
  // acc. sg.; ἐσόμενα serves neut. nom./acc. pl.) take the parse string
  // that covers the most picks; rarer alternates can be added if a user
  // reports them missing.
  const EIMI_FUTURE_MIDDLE_PARTICIPLE = {
    'ἐσόμενος':  'future middle participle nominative singular masculine',
    'ἐσομένου':  'future middle participle genitive singular masculine/neuter',
    'ἐσομένῳ':   'future middle participle dative singular masculine/neuter',
    'ἐσόμενον':  'future middle participle accusative singular masculine/neuter',
    'ἐσόμενε':   'future middle participle vocative singular masculine',
    'ἐσόμενοι':  'future middle participle nominative plural masculine',
    'ἐσομένους': 'future middle participle accusative plural masculine',
    'ἐσομένων':  'future middle participle genitive plural masculine/feminine/neuter',
    'ἐσομένοις': 'future middle participle dative plural masculine/neuter',
    'ἐσομένη':   'future middle participle nominative singular feminine',
    'ἐσομένης':  'future middle participle genitive singular feminine',
    'ἐσομένῃ':   'future middle participle dative singular feminine',
    'ἐσομένην':  'future middle participle accusative singular feminine',
    'ἐσόμεναι':  'future middle participle nominative plural feminine',
    'ἐσομέναις': 'future middle participle dative plural feminine',
    'ἐσομένας':  'future middle participle accusative plural feminine',
    'ἐσόμενα':   'future middle participle nominative/accusative plural neuter'
  };

  // εἰμί's future middle infinitive. Duff drills only the present
  // infinitive (εἶναι), but ἔσεσθαι is real Koine, so a student picking
  // "future infinitive" on εἰμί should see it instead of falling through
  // to "—". Voice is middle for the same reason as the future participle:
  // εἰμί's future is deponent.
  const EIMI_FUTURE_MIDDLE_INFINITIVE = {
    'ἔσεσθαι': 'future middle infinitive'
  };

  // εἰμί's present active imperative. Duff introduces the imperative mood
  // in Ch 7 but doesn't drill εἰμί's imperative paradigm — students who
  // pick "imperative" for εἰμί otherwise see blank (no form lookup
  // matched). ἔστων is the older classical alternate for 3pl alongside
  // the standard Koine ἔστωσαν; both are real and should resolve cleanly.
  const EIMI_PRESENT_ACTIVE_IMPERATIVE = {
    'ἴσθι':     'present active imperative second person singular',
    'ἔστω':     'present active imperative third person singular',
    'ἔστε':     'present active imperative second person plural',
    'ἔστωσαν':  'present active imperative third person plural',
    'ἔστων':    'present active imperative third person plural'
  };

  // εἰμί's optional-drill groups. Chapter gates:
  // - Ch 7: present imperative (imperative mood is introduced in Ch 7).
  // - Ch 8: future middle infinitive + future middle participle
  //   (W3_EIMI_COMPLETE introduces the future at ch 8 and the student
  //   knows εἰμί's infinitive/participle via W3_EIMI_INFINITIVE_PARTICIPLE
  //   from the same week, so the future-extension of those moods is in
  //   foundational scope).
  const EIMI_OPTIONAL_GROUPS = [
    { chapter: 7, family: 'εἰμί — present active imperative (optional)',
      forms: EIMI_PRESENT_ACTIVE_IMPERATIVE },
    { chapter: 8, family: 'εἰμί — future middle infinitive (optional)',
      forms: EIMI_FUTURE_MIDDLE_INFINITIVE },
    { chapter: 8, family: 'εἰμί — future middle participle (optional)',
      forms: EIMI_FUTURE_MIDDLE_PARTICIPLE }
  ];

  // ─── λύω (model regular ω-verb) ────────────────────────────────────
  //
  // Duff drills present/imperfect/future/aorist active indicative (W2),
  // present/imperfect/future/aorist passive indicative + perfect/
  // pluperfect active (W6), present active imperative + infinitive (W2),
  // present/aorist active participles (W5), aorist passive participle
  // (W6 λυθείς), and present passive imperative + infinitive (W6). The
  // subjunctive is touched only with scattered single-person examples
  // in grammar.js ch 17 (λύῃ 3sg, λύσωσιν 3pl); the rest of the
  // subjunctive paradigm — every other person, every voice — is real
  // Koine but undrilled. Same with non-present infinitives (future
  // active/middle/passive, perfect active and middle/passive), the
  // aorist middle imperative paradigm, and the 3rd-person present
  // middle/passive imperative. These fill the gaps.
  //
  // Notes on syncretic forms: λύῃ is morphologically the 3sg present
  // active subjunctive AND the 2sg present middle/passive subjunctive/
  // imperative — extraForms keys are unique by Greek string, so we
  // pick the parse most pedagogically prominent (the active sub-
  // junctive 3sg form a student picking subjunctive will hit first).
  // λύσῃ has similar overload between aorist active subjunctive 3sg
  // and aorist middle subjunctive 2sg + future indicative 2sg/3sg
  // (the future indicative parse stays in the drilled card pool, so
  // the fallback claim here is the subjunctive reading). λῦσαι is
  // both aorist active infinitive (drilled in W2) and aorist middle
  // imperative 2sg — drilled card wins for the infinitive parse, so
  // the middle-imperative line below resolves only when picks land on
  // the imperative reading.

  const LUO_PRESENT_ACTIVE_SUBJUNCTIVE = {
    'λύω':      'present active subjunctive first person singular',
    'λύῃς':     'present active subjunctive second person singular',
    'λύῃ':      'present active subjunctive third person singular',
    'λύωμεν':   'present active subjunctive first person plural',
    'λύητε':    'present active subjunctive second person plural',
    'λύωσι':    'present active subjunctive third person plural',
    'λύωσιν':   'present active subjunctive third person plural'
  };

  const LUO_AORIST_ACTIVE_SUBJUNCTIVE = {
    'λύσω':     'aorist active subjunctive first person singular',
    'λύσῃς':    'aorist active subjunctive second person singular',
    'λύσῃ':     'aorist active subjunctive third person singular',
    'λύσωμεν':  'aorist active subjunctive first person plural',
    'λύσητε':   'aorist active subjunctive second person plural',
    'λύσωσι':   'aorist active subjunctive third person plural',
    'λύσωσιν':  'aorist active subjunctive third person plural'
  };

  const LUO_AORIST_MIDDLE_SUBJUNCTIVE = {
    'λύσωμαι':   'aorist middle subjunctive first person singular',
    // 'λύσῃ' 2sg collides with the aorist active subjunctive 3sg key
    // above; the active reading is more pedagogically prominent, so we
    // don't shadow it here. A student picking "aorist middle subjunctive
    // 2sg" hits the data-gap "—" instead of a wrong-class match.
    'λύσηται':   'aorist middle subjunctive third person singular',
    'λυσώμεθα':  'aorist middle subjunctive first person plural',
    'λύσησθε':   'aorist middle subjunctive second person plural',
    'λύσωνται':  'aorist middle subjunctive third person plural'
  };

  const LUO_AORIST_PASSIVE_SUBJUNCTIVE = {
    'λυθῶ':     'aorist passive subjunctive first person singular',
    'λυθῇς':    'aorist passive subjunctive second person singular',
    'λυθῇ':     'aorist passive subjunctive third person singular',
    'λυθῶμεν':  'aorist passive subjunctive first person plural',
    'λυθῆτε':   'aorist passive subjunctive second person plural',
    'λυθῶσι':   'aorist passive subjunctive third person plural',
    'λυθῶσιν':  'aorist passive subjunctive third person plural'
  };

  const LUO_PRESENT_MIDDLE_PASSIVE_SUBJUNCTIVE = {
    'λύωμαι':   'present middle/passive subjunctive first person singular',
    // 'λύῃ' 2sg again collides with the present active subjunctive 3sg
    // entry; same reasoning — we don't shadow the active reading.
    'λύηται':   'present middle/passive subjunctive third person singular',
    'λυώμεθα':  'present middle/passive subjunctive first person plural',
    'λύησθε':   'present middle/passive subjunctive second person plural',
    'λύωνται':  'present middle/passive subjunctive third person plural'
  };

  // Non-present active/middle/passive infinitives. λύειν (present
  // active) and λύεσθαι (present m/p) and λῦσαι (aorist active) and
  // λυθῆναι (aorist passive) are drilled; future + perfect aren't.
  const LUO_NONPRESENT_INFINITIVES = {
    'λύσειν':       'future active infinitive',
    'λύσεσθαι':     'future middle infinitive',
    'λυθήσεσθαι':   'future passive infinitive',
    'λελυκέναι':    'perfect active infinitive',
    'λελύσθαι':     'perfect middle/passive infinitive',
    'λύσασθαι':     'aorist middle infinitive'
  };

  // Present middle/passive imperative 3rd person (the 2nd-person forms
  // are drilled in W6_LUO_PASSIVE_OTHER_MOODS). Voice tagged as the
  // syncretic m/p composite — Duff's drilled cards may say "passive"
  // only, so adding the composite covers both pickings.
  const LUO_PRESENT_MP_IMPERATIVE_3P = {
    'λυέσθω':     'present middle/passive imperative third person singular',
    'λυέσθωσαν':  'present middle/passive imperative third person plural'
  };

  // Aorist middle imperative — not drilled at all for λύω. 2sg λῦσαι
  // overlaps with the drilled aorist active infinitive; the drilled
  // card wins for the infinitive parse, but a student picking "aorist
  // middle imperative 2sg" lands on this entry via fallback.
  const LUO_AORIST_MIDDLE_IMPERATIVE = {
    'λῦσαι':       'aorist middle imperative second person singular',
    'λυσάσθω':     'aorist middle imperative third person singular',
    'λύσασθε':     'aorist middle imperative second person plural',
    'λυσάσθωσαν':  'aorist middle imperative third person plural'
  };

  // Aorist passive imperative — 2nd/3rd person all drilled (W6 + W7);
  // nothing to add here. Aorist active imperative similarly complete
  // (W2 + W7).

  // Chapter gates: ω-verb subjunctive is introduced at Ch 17 (W7).
  // Future infinitives are reasonable from Ch 6 (when future indicative
  // is taught); middle/passive future infinitives need Ch 15 (W6
  // introduces the passive system + voice contrasts). Perfect
  // infinitives need Ch 15 (W6 introduces perfect). Middle imperatives
  // are introduced at Ch 7 for the mood + Ch 15 for the voice; gate
  // at max(7,15)=15. 3rd-person m/p imperative gates at Ch 15 (passive
  // intro).
  const LUO_OPTIONAL_GROUPS = [
    { chapter: 6,  family: 'λύω — future active infinitive (optional)',
      forms: { 'λύσειν': 'future active infinitive' } },
    { chapter: 15, family: 'λύω — future middle/passive + perfect infinitives (optional)',
      forms: {
        'λύσεσθαι':    'future middle infinitive',
        'λυθήσεσθαι':  'future passive infinitive',
        'λελυκέναι':   'perfect active infinitive',
        'λελύσθαι':    'perfect middle/passive infinitive',
        'λύσασθαι':    'aorist middle infinitive'
      } },
    { chapter: 15, family: 'λύω — present middle/passive imperative 3rd person (optional)',
      forms: LUO_PRESENT_MP_IMPERATIVE_3P },
    { chapter: 15, family: 'λύω — aorist middle imperative (optional)',
      forms: LUO_AORIST_MIDDLE_IMPERATIVE },
    { chapter: 17, family: 'λύω — present active subjunctive (optional)',
      forms: LUO_PRESENT_ACTIVE_SUBJUNCTIVE },
    { chapter: 17, family: 'λύω — aorist active subjunctive (optional)',
      forms: LUO_AORIST_ACTIVE_SUBJUNCTIVE },
    { chapter: 17, family: 'λύω — aorist middle subjunctive (optional)',
      forms: LUO_AORIST_MIDDLE_SUBJUNCTIVE },
    { chapter: 17, family: 'λύω — aorist passive subjunctive (optional)',
      forms: LUO_AORIST_PASSIVE_SUBJUNCTIVE },
    { chapter: 17, family: 'λύω — present middle/passive subjunctive (optional)',
      forms: LUO_PRESENT_MIDDLE_PASSIVE_SUBJUNCTIVE }
  ];

  // Flat extraForms map for the fallback lookup. Duplicate-key
  // collisions (e.g. λύῃ across active sub + m/p sub) resolve to the
  // last spread wins — order the spreads so the most pedagogically
  // prominent reading sits last for any colliding form.
  const LUO_EXTRA_FORMS = {
    ...LUO_AORIST_MIDDLE_SUBJUNCTIVE,
    ...LUO_PRESENT_MIDDLE_PASSIVE_SUBJUNCTIVE,
    ...LUO_AORIST_PASSIVE_SUBJUNCTIVE,
    ...LUO_NONPRESENT_INFINITIVES,
    ...LUO_PRESENT_MP_IMPERATIVE_3P,
    ...LUO_AORIST_MIDDLE_IMPERATIVE,
    // Active subjunctive last so λύῃ resolves to "present active
    // subjunctive 3sg" (and λύσῃ to "aorist active subjunctive 3sg"),
    // the most common single-form readings for those Greek strings.
    ...LUO_PRESENT_ACTIVE_SUBJUNCTIVE,
    ...LUO_AORIST_ACTIVE_SUBJUNCTIVE
  };

  // ─── ῥύομαι (model middle/deponent) ───────────────────────────────
  //
  // Duff drills present/future/imperfect/aorist middle indicative (W3),
  // present + aorist middle subjunctive (W7), present + aorist middle
  // imperative 2nd person + middle infinitives (W3), and the full
  // present + aorist middle participle declensions (W5). Gaps are
  // narrow: 3rd-person imperatives (Duff stops at 2nd person for
  // ῥύομαι) and the future middle infinitive.

  const RHUOMAI_FUTURE_INFINITIVE = {
    'ῥύσεσθαι': 'future middle infinitive'
  };

  const RHUOMAI_IMPERATIVE_3RD = {
    'ῥυέσθω':      'present middle imperative third person singular',
    'ῥυέσθωσαν':   'present middle imperative third person plural',
    'ῥυσάσθω':     'aorist middle imperative third person singular',
    'ῥυσάσθωσαν':  'aorist middle imperative third person plural'
  };

  const RHUOMAI_OPTIONAL_GROUPS = [
    { chapter: 8, family: 'ῥύομαι — future middle infinitive (optional)',
      forms: RHUOMAI_FUTURE_INFINITIVE },
    { chapter: 8, family: 'ῥύομαι — 3rd-person middle imperative (optional)',
      forms: RHUOMAI_IMPERATIVE_3RD }
  ];

  const RHUOMAI_EXTRA_FORMS = {
    ...RHUOMAI_FUTURE_INFINITIVE,
    ...RHUOMAI_IMPERATIVE_3RD
  };

  // ─── βάλλω (second-aorist model) ──────────────────────────────────
  //
  // Duff drills βάλλω only for aorist active (W4: indicative all 6,
  // imperative 2sg/2pl, infinitive βαλεῖν, masc-nom-only participle
  // βαλών/βαλόντες) and uses it as a stem-pair recall verb everywhere
  // else. Real Koine has the full present/imperfect/future/aorist
  // (passive!)/perfect paradigm for βάλλω — it's an extremely common
  // verb in the NT (throw, cast, put). These fill the indicative
  // gaps, the aorist active subjunctive, the aorist passive, and the
  // perfect active. Liquid-stem future (βαλῶ, contracted) and
  // 2nd-aorist passive (ἐβλήθην with stem shift β/λ) are the
  // pedagogically tricky bits to flag.

  const BALLO_PRESENT_ACTIVE_INDICATIVE = {
    'βάλλω':     'present active indicative first person singular',
    'βάλλεις':   'present active indicative second person singular',
    'βάλλει':    'present active indicative third person singular',
    'βάλλομεν':  'present active indicative first person plural',
    'βάλλετε':   'present active indicative second person plural',
    'βάλλουσι':  'present active indicative third person plural',
    'βάλλουσιν': 'present active indicative third person plural'
  };

  const BALLO_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἔβαλλον':    'imperfect active indicative first person singular',
    // ἔβαλλον is also 3rd person plural (1sg/3pl syncretism in ω-verb
    // imperfect). The 1sg reading takes the unique key; 3pl picks
    // resolve via the drilled-card / fallback walk against any other
    // available pool. Documented to avoid silent overwrite confusion.
    'ἔβαλλες':    'imperfect active indicative second person singular',
    'ἔβαλλε':     'imperfect active indicative third person singular',
    'ἔβαλλεν':    'imperfect active indicative third person singular',
    'ἐβάλλομεν':  'imperfect active indicative first person plural',
    'ἐβάλλετε':   'imperfect active indicative second person plural'
  };

  const BALLO_FUTURE_ACTIVE_INDICATIVE = {
    'βαλῶ':     'future active indicative first person singular',
    'βαλεῖς':   'future active indicative second person singular',
    'βαλεῖ':    'future active indicative third person singular',
    'βαλοῦμεν': 'future active indicative first person plural',
    'βαλεῖτε':  'future active indicative second person plural',
    'βαλοῦσι':  'future active indicative third person plural',
    'βαλοῦσιν': 'future active indicative third person plural'
  };

  const BALLO_AORIST_PASSIVE_INDICATIVE = {
    'ἐβλήθην':   'aorist passive indicative first person singular',
    'ἐβλήθης':   'aorist passive indicative second person singular',
    'ἐβλήθη':    'aorist passive indicative third person singular',
    'ἐβλήθημεν': 'aorist passive indicative first person plural',
    'ἐβλήθητε':  'aorist passive indicative second person plural',
    'ἐβλήθησαν': 'aorist passive indicative third person plural'
  };

  const BALLO_PERFECT_ACTIVE_INDICATIVE = {
    'βέβληκα':    'perfect active indicative first person singular',
    'βέβληκας':   'perfect active indicative second person singular',
    'βέβληκε':    'perfect active indicative third person singular',
    'βέβληκεν':   'perfect active indicative third person singular',
    'βεβλήκαμεν': 'perfect active indicative first person plural',
    'βεβλήκατε':  'perfect active indicative second person plural',
    'βεβλήκασι':  'perfect active indicative third person plural',
    'βεβλήκασιν': 'perfect active indicative third person plural'
  };

  const BALLO_AORIST_ACTIVE_SUBJUNCTIVE = {
    'βάλω':    'aorist active subjunctive first person singular',
    'βάλῃς':   'aorist active subjunctive second person singular',
    'βάλῃ':    'aorist active subjunctive third person singular',
    'βάλωμεν': 'aorist active subjunctive first person plural',
    'βάλητε':  'aorist active subjunctive second person plural',
    'βάλωσι':  'aorist active subjunctive third person plural',
    'βάλωσιν': 'aorist active subjunctive third person plural'
  };

  const BALLO_PRESENT_INFINITIVE = {
    'βάλλειν': 'present active infinitive'
  };

  // 3rd-person aorist active imperative for βάλλω. The 2sg βάλε / 2pl
  // βάλετε are drilled (W4_BALLO_SECOND_AORIST); 3rd person is not.
  const BALLO_AORIST_IMPERATIVE_3RD = {
    'βαλέτω':     'aorist active imperative third person singular',
    'βαλέτωσαν':  'aorist active imperative third person plural'
  };

  // Chapter gates: βάλλω is introduced as a vocab word early but its
  // full paradigm depends on the broader tense/voice system. Gate
  // present/imperfect at ch 10 (W4 — when βάλλω itself becomes a focus
  // via second-aorist); future at ch 10; aorist subjunctive at ch 17;
  // aorist passive + perfect at ch 15 (W6 — passive + perfect intro);
  // 3rd-person aorist imperative at ch 10 (the 2sg/2pl are drilled
  // there, so the 3rd person rounds out the paradigm at the same
  // time).
  const BALLO_OPTIONAL_GROUPS = [
    { chapter: 10, family: 'βάλλω — present active indicative (optional)',
      forms: BALLO_PRESENT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'βάλλω — imperfect active indicative (optional)',
      forms: BALLO_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'βάλλω — future active indicative (liquid stem, optional)',
      forms: BALLO_FUTURE_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'βάλλω — present active infinitive (optional)',
      forms: BALLO_PRESENT_INFINITIVE },
    { chapter: 10, family: 'βάλλω — 3rd-person aorist active imperative (optional)',
      forms: BALLO_AORIST_IMPERATIVE_3RD },
    { chapter: 15, family: 'βάλλω — aorist passive indicative (optional)',
      forms: BALLO_AORIST_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'βάλλω — perfect active indicative (optional)',
      forms: BALLO_PERFECT_ACTIVE_INDICATIVE },
    { chapter: 17, family: 'βάλλω — aorist active subjunctive (optional)',
      forms: BALLO_AORIST_ACTIVE_SUBJUNCTIVE }
  ];

  const BALLO_EXTRA_FORMS = {
    ...BALLO_PRESENT_ACTIVE_INDICATIVE,
    ...BALLO_IMPERFECT_ACTIVE_INDICATIVE,
    ...BALLO_FUTURE_ACTIVE_INDICATIVE,
    ...BALLO_PRESENT_INFINITIVE,
    ...BALLO_AORIST_IMPERATIVE_3RD,
    ...BALLO_AORIST_PASSIVE_INDICATIVE,
    ...BALLO_PERFECT_ACTIVE_INDICATIVE,
    ...BALLO_AORIST_ACTIVE_SUBJUNCTIVE
  };

  // ─── γίνομαι (second-aorist deponent — ubiquitous in NT) ──────────
  //
  // Per the audit γίνομαι is drilled only for the aorist middle
  // subjunctive (W7) and as a stem-pair recall entry ("γίνομαι →
  // ἐγενόμην"). The actual indicative paradigm — including the
  // famous aorist middle ἐγένετο, perfect active γέγονα, and aorist
  // middle infinitive γενέσθαι, all extremely common in the Greek
  // NT — has no drill cards. Filling these gaps is the highest-
  // pedagogical-value addition in this batch.
  //
  // Note on voice: γίνομαι is deponent middle in the present, future,
  // imperfect, and aorist; the perfect (γέγονα) is morphologically
  // active and meaning-active. The aorist passive (ἐγενήθην) is
  // genuinely passive in form, sometimes used with active meaning in
  // Koine. We tag voices per Greek-grammar convention.

  const GINOMAI_PRESENT_MIDDLE_INDICATIVE = {
    'γίνομαι':   'present middle indicative first person singular',
    'γίνῃ':      'present middle indicative second person singular',
    'γίνεται':   'present middle indicative third person singular',
    'γινόμεθα':  'present middle indicative first person plural',
    'γίνεσθε':   'present middle indicative second person plural',
    'γίνονται':  'present middle indicative third person plural'
  };

  const GINOMAI_IMPERFECT_MIDDLE_INDICATIVE = {
    'ἐγινόμην':  'imperfect middle indicative first person singular',
    'ἐγίνου':    'imperfect middle indicative second person singular',
    'ἐγίνετο':   'imperfect middle indicative third person singular',
    'ἐγινόμεθα': 'imperfect middle indicative first person plural',
    'ἐγίνεσθε':  'imperfect middle indicative second person plural',
    'ἐγίνοντο':  'imperfect middle indicative third person plural'
  };

  const GINOMAI_FUTURE_MIDDLE_INDICATIVE = {
    'γενήσομαι':  'future middle indicative first person singular',
    'γενήσῃ':     'future middle indicative second person singular',
    'γενήσεται':  'future middle indicative third person singular',
    'γενησόμεθα': 'future middle indicative first person plural',
    'γενήσεσθε':  'future middle indicative second person plural',
    'γενήσονται': 'future middle indicative third person plural'
  };

  const GINOMAI_AORIST_MIDDLE_INDICATIVE = {
    'ἐγενόμην':   'aorist middle indicative first person singular',
    'ἐγένου':     'aorist middle indicative second person singular',
    'ἐγένετο':    'aorist middle indicative third person singular',
    'ἐγενόμεθα':  'aorist middle indicative first person plural',
    'ἐγένεσθε':   'aorist middle indicative second person plural',
    'ἐγένοντο':   'aorist middle indicative third person plural'
  };

  const GINOMAI_AORIST_PASSIVE_INDICATIVE = {
    'ἐγενήθην':   'aorist passive indicative first person singular',
    'ἐγενήθης':   'aorist passive indicative second person singular',
    'ἐγενήθη':    'aorist passive indicative third person singular',
    'ἐγενήθημεν': 'aorist passive indicative first person plural',
    'ἐγενήθητε':  'aorist passive indicative second person plural',
    'ἐγενήθησαν': 'aorist passive indicative third person plural'
  };

  const GINOMAI_PERFECT_ACTIVE_INDICATIVE = {
    'γέγονα':    'perfect active indicative first person singular',
    'γέγονας':   'perfect active indicative second person singular',
    'γέγονε':    'perfect active indicative third person singular',
    'γέγονεν':   'perfect active indicative third person singular',
    'γεγόναμεν': 'perfect active indicative first person plural',
    'γεγόνατε':  'perfect active indicative second person plural',
    'γεγόνασι':  'perfect active indicative third person plural',
    'γεγόνασιν': 'perfect active indicative third person plural'
  };

  const GINOMAI_AORIST_MIDDLE_INFINITIVE = {
    'γενέσθαι': 'aorist middle infinitive'
  };

  const GINOMAI_PRESENT_MIDDLE_INFINITIVE = {
    'γίνεσθαι': 'present middle infinitive'
  };

  const GINOMAI_AORIST_MIDDLE_IMPERATIVE = {
    'γενοῦ':       'aorist middle imperative second person singular',
    'γενέσθω':     'aorist middle imperative third person singular',
    'γένεσθε':     'aorist middle imperative second person plural',
    'γενέσθωσαν':  'aorist middle imperative third person plural'
  };

  // Chapter gates: γίνομαι is a vocab introduction-era word (it appears
  // in early chapters as a deponent verb). The present/imperfect/
  // future middle indicatives gate at ch 8 (the chapter Duff
  // introduces middle/deponent verbs alongside the W3 ῥύομαι treatment).
  // 2nd-aorist forms (ἐγενόμην series, infinitive γενέσθαι, imperative
  // γενοῦ) gate at ch 10 (W4 — second aorist intro). Perfect active
  // and aorist passive gate at ch 15 (W6 — passive + perfect intro).
  const GINOMAI_OPTIONAL_GROUPS = [
    { chapter: 8,  family: 'γίνομαι — present middle indicative (optional)',
      forms: GINOMAI_PRESENT_MIDDLE_INDICATIVE },
    { chapter: 8,  family: 'γίνομαι — imperfect middle indicative (optional)',
      forms: GINOMAI_IMPERFECT_MIDDLE_INDICATIVE },
    { chapter: 8,  family: 'γίνομαι — future middle indicative (optional)',
      forms: GINOMAI_FUTURE_MIDDLE_INDICATIVE },
    { chapter: 8,  family: 'γίνομαι — present middle infinitive (optional)',
      forms: GINOMAI_PRESENT_MIDDLE_INFINITIVE },
    { chapter: 10, family: 'γίνομαι — aorist middle indicative (2nd aorist, optional)',
      forms: GINOMAI_AORIST_MIDDLE_INDICATIVE },
    { chapter: 10, family: 'γίνομαι — aorist middle infinitive γενέσθαι (optional)',
      forms: GINOMAI_AORIST_MIDDLE_INFINITIVE },
    { chapter: 10, family: 'γίνομαι — aorist middle imperative (optional)',
      forms: GINOMAI_AORIST_MIDDLE_IMPERATIVE },
    { chapter: 15, family: 'γίνομαι — aorist passive indicative (optional)',
      forms: GINOMAI_AORIST_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'γίνομαι — perfect active indicative γέγονα (optional)',
      forms: GINOMAI_PERFECT_ACTIVE_INDICATIVE }
  ];

  const GINOMAI_EXTRA_FORMS = {
    ...GINOMAI_PRESENT_MIDDLE_INDICATIVE,
    ...GINOMAI_IMPERFECT_MIDDLE_INDICATIVE,
    ...GINOMAI_FUTURE_MIDDLE_INDICATIVE,
    ...GINOMAI_AORIST_MIDDLE_INDICATIVE,
    ...GINOMAI_AORIST_PASSIVE_INDICATIVE,
    ...GINOMAI_PERFECT_ACTIVE_INDICATIVE,
    ...GINOMAI_AORIST_MIDDLE_INFINITIVE,
    ...GINOMAI_PRESENT_MIDDLE_INFINITIVE,
    ...GINOMAI_AORIST_MIDDLE_IMPERATIVE
  };

  // ─── λαμβάνω (second-aorist active, future deponent middle) ───────
  //
  // λαμβάνω is the textbook 2nd-aorist example alongside βάλλω
  // (Mounce-style triad: γίνομαι, λαμβάνω, λείπω). Duff drills only
  // the stem-pair recall (W4_SECOND_AORIST_STEMS: λαμβάνω → ἔλαβον)
  // and uses the lemma as a stand-alone vocab word from ch 2 onward;
  // the full paradigm — present/imperfect, the middle future
  // λήμψομαι (Koine spelling with inserted μ; classical λήψομαι), the
  // 2nd-aorist indicative ἔλαβον, aorist passive ἐλήμφθην, perfect
  // active εἴληφα — is undrilled. These fill the gap and give the
  // student a full conjugation paired with the W4_LAMBANO_SECOND_AORIST
  // drill below.
  //
  // Voice note: future is middle/deponent (λήμψομαι series) but active
  // in meaning. Aorist active 2nd-aorist endings (ἔλαβον, ἔλαβες, …)
  // are syncretic between 1sg and 3pl — the 1sg reading takes the
  // unique map key, with 3pl resolving via the parsing walk against
  // the other available pool (same convention as βάλλω's imperfect).

  const LAMBANO_PRESENT_ACTIVE_INDICATIVE = {
    'λαμβάνω':     'present active indicative first person singular',
    'λαμβάνεις':   'present active indicative second person singular',
    'λαμβάνει':    'present active indicative third person singular',
    'λαμβάνομεν':  'present active indicative first person plural',
    'λαμβάνετε':   'present active indicative second person plural',
    'λαμβάνουσι':  'present active indicative third person plural',
    'λαμβάνουσιν': 'present active indicative third person plural'
  };

  const LAMBANO_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἐλάμβανον':   'imperfect active indicative first person singular',
    // ἐλάμβανον is also 3pl (1sg/3pl syncretism); 1sg takes the unique key.
    'ἐλάμβανες':   'imperfect active indicative second person singular',
    'ἐλάμβανε':    'imperfect active indicative third person singular',
    'ἐλάμβανεν':   'imperfect active indicative third person singular',
    'ἐλαμβάνομεν': 'imperfect active indicative first person plural',
    'ἐλαμβάνετε':  'imperfect active indicative second person plural'
  };

  const LAMBANO_FUTURE_MIDDLE_INDICATIVE = {
    'λήμψομαι':   'future middle indicative first person singular',
    'λήμψῃ':      'future middle indicative second person singular',
    'λήμψεται':   'future middle indicative third person singular',
    'λημψόμεθα':  'future middle indicative first person plural',
    'λήμψεσθε':   'future middle indicative second person plural',
    'λήμψονται':  'future middle indicative third person plural'
  };

  const LAMBANO_AORIST_ACTIVE_INDICATIVE = {
    'ἔλαβον':    'aorist active indicative first person singular',
    // ἔλαβον = 3pl too — 1sg keeps the unique map key.
    'ἔλαβες':    'aorist active indicative second person singular',
    'ἔλαβε':     'aorist active indicative third person singular',
    'ἔλαβεν':    'aorist active indicative third person singular',
    'ἐλάβομεν':  'aorist active indicative first person plural',
    'ἐλάβετε':   'aorist active indicative second person plural'
  };

  const LAMBANO_AORIST_ACTIVE_IMPERATIVE = {
    'λάβε':       'aorist active imperative second person singular',
    'λάβετε':     'aorist active imperative second person plural',
    'λαβέτω':     'aorist active imperative third person singular',
    'λαβέτωσαν':  'aorist active imperative third person plural'
  };

  const LAMBANO_AORIST_ACTIVE_INFINITIVE = {
    'λαβεῖν': 'aorist active infinitive'
  };

  const LAMBANO_AORIST_ACTIVE_SUBJUNCTIVE = {
    'λάβω':    'aorist active subjunctive first person singular',
    'λάβῃς':   'aorist active subjunctive second person singular',
    'λάβῃ':    'aorist active subjunctive third person singular',
    'λάβωμεν': 'aorist active subjunctive first person plural',
    'λάβητε':  'aorist active subjunctive second person plural',
    'λάβωσι':  'aorist active subjunctive third person plural',
    'λάβωσιν': 'aorist active subjunctive third person plural'
  };

  const LAMBANO_AORIST_PASSIVE_INDICATIVE = {
    'ἐλήμφθην':   'aorist passive indicative first person singular',
    'ἐλήμφθης':   'aorist passive indicative second person singular',
    'ἐλήμφθη':    'aorist passive indicative third person singular',
    'ἐλήμφθημεν': 'aorist passive indicative first person plural',
    'ἐλήμφθητε':  'aorist passive indicative second person plural',
    'ἐλήμφθησαν': 'aorist passive indicative third person plural'
  };

  const LAMBANO_PERFECT_ACTIVE_INDICATIVE = {
    'εἴληφα':    'perfect active indicative first person singular',
    'εἴληφας':   'perfect active indicative second person singular',
    'εἴληφε':    'perfect active indicative third person singular',
    'εἴληφεν':   'perfect active indicative third person singular',
    'εἰλήφαμεν': 'perfect active indicative first person plural',
    'εἰλήφατε':  'perfect active indicative second person plural',
    'εἰλήφασι':  'perfect active indicative third person plural',
    'εἰλήφασιν': 'perfect active indicative third person plural'
  };

  // Chapter gates mirror βάλλω: present/imperfect/future at ch 10
  // (W4 — second-aorist intro and the lemma takes its place as a
  // paradigm verb), aorist active indicative + imperative + infinitive
  // at ch 10, aorist passive + perfect at ch 15 (W6), aorist
  // subjunctive at ch 17 (W7).
  const LAMBANO_OPTIONAL_GROUPS = [
    { chapter: 10, family: 'λαμβάνω — present active indicative (optional)',
      forms: LAMBANO_PRESENT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λαμβάνω — imperfect active indicative (optional)',
      forms: LAMBANO_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λαμβάνω — future middle indicative λήμψομαι (optional, deponent)',
      forms: LAMBANO_FUTURE_MIDDLE_INDICATIVE },
    { chapter: 10, family: 'λαμβάνω — aorist active indicative ἔλαβον (2nd aorist, optional)',
      forms: LAMBANO_AORIST_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λαμβάνω — aorist active imperative (optional)',
      forms: LAMBANO_AORIST_ACTIVE_IMPERATIVE },
    { chapter: 10, family: 'λαμβάνω — aorist active infinitive λαβεῖν (optional)',
      forms: LAMBANO_AORIST_ACTIVE_INFINITIVE },
    { chapter: 15, family: 'λαμβάνω — aorist passive indicative ἐλήμφθην (optional)',
      forms: LAMBANO_AORIST_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'λαμβάνω — perfect active indicative εἴληφα (optional)',
      forms: LAMBANO_PERFECT_ACTIVE_INDICATIVE },
    { chapter: 17, family: 'λαμβάνω — aorist active subjunctive λάβω (optional)',
      forms: LAMBANO_AORIST_ACTIVE_SUBJUNCTIVE }
  ];

  const LAMBANO_EXTRA_FORMS = {
    ...LAMBANO_PRESENT_ACTIVE_INDICATIVE,
    ...LAMBANO_IMPERFECT_ACTIVE_INDICATIVE,
    ...LAMBANO_FUTURE_MIDDLE_INDICATIVE,
    ...LAMBANO_AORIST_ACTIVE_INDICATIVE,
    ...LAMBANO_AORIST_ACTIVE_IMPERATIVE,
    ...LAMBANO_AORIST_ACTIVE_INFINITIVE,
    ...LAMBANO_AORIST_PASSIVE_INDICATIVE,
    ...LAMBANO_PERFECT_ACTIVE_INDICATIVE,
    ...LAMBANO_AORIST_ACTIVE_SUBJUNCTIVE
  };

  // ─── λείπω (second-aorist active) ─────────────────────────────────
  //
  // Mounce's third 2nd-aorist paradigm verb (alongside γίνομαι and
  // λαμβάνω). In the NT the simple λείπω is rare — καταλείπω /
  // ὑπολείπω are more common — but Mounce uses the unprefixed root
  // because its stem-shift pattern (ει → ι in the aorist: λείπω →
  // ἔλιπον) is the cleanest example of "different stem" 2nd-aorist
  // formation. Curriculum drill currently lists only the stem pair
  // "καταλείπω → κατέλιπον" in W4_SECOND_AORIST_STEMS; the full
  // paradigm and chapter-gated drill set below give a parallel to
  // the λαμβάνω treatment above.
  //
  // The aorist passive is ἐλείφθην and the perfect active is λέλοιπα
  // (with ε → ει → οι stem grade alternation, classic for liquid +
  // labial stems).

  const LEIPO_PRESENT_ACTIVE_INDICATIVE = {
    'λείπω':     'present active indicative first person singular',
    'λείπεις':   'present active indicative second person singular',
    'λείπει':    'present active indicative third person singular',
    'λείπομεν':  'present active indicative first person plural',
    'λείπετε':   'present active indicative second person plural',
    'λείπουσι':  'present active indicative third person plural',
    'λείπουσιν': 'present active indicative third person plural'
  };

  const LEIPO_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἔλειπον':   'imperfect active indicative first person singular',
    // ἔλειπον is also 3pl (1sg/3pl syncretism).
    'ἔλειπες':   'imperfect active indicative second person singular',
    'ἔλειπε':    'imperfect active indicative third person singular',
    'ἔλειπεν':   'imperfect active indicative third person singular',
    'ἐλείπομεν': 'imperfect active indicative first person plural',
    'ἐλείπετε':  'imperfect active indicative second person plural'
  };

  const LEIPO_FUTURE_ACTIVE_INDICATIVE = {
    'λείψω':     'future active indicative first person singular',
    'λείψεις':   'future active indicative second person singular',
    'λείψει':    'future active indicative third person singular',
    'λείψομεν':  'future active indicative first person plural',
    'λείψετε':   'future active indicative second person plural',
    'λείψουσι':  'future active indicative third person plural',
    'λείψουσιν': 'future active indicative third person plural'
  };

  const LEIPO_AORIST_ACTIVE_INDICATIVE = {
    'ἔλιπον':    'aorist active indicative first person singular',
    // ἔλιπον = 3pl too — 1sg keeps the unique map key.
    'ἔλιπες':    'aorist active indicative second person singular',
    'ἔλιπε':     'aorist active indicative third person singular',
    'ἔλιπεν':    'aorist active indicative third person singular',
    'ἐλίπομεν':  'aorist active indicative first person plural',
    'ἐλίπετε':   'aorist active indicative second person plural'
  };

  const LEIPO_AORIST_ACTIVE_IMPERATIVE = {
    'λίπε':       'aorist active imperative second person singular',
    'λίπετε':     'aorist active imperative second person plural',
    'λιπέτω':     'aorist active imperative third person singular',
    'λιπέτωσαν':  'aorist active imperative third person plural'
  };

  const LEIPO_AORIST_ACTIVE_INFINITIVE = {
    'λιπεῖν': 'aorist active infinitive'
  };

  const LEIPO_AORIST_ACTIVE_SUBJUNCTIVE = {
    'λίπω':    'aorist active subjunctive first person singular',
    'λίπῃς':   'aorist active subjunctive second person singular',
    'λίπῃ':    'aorist active subjunctive third person singular',
    'λίπωμεν': 'aorist active subjunctive first person plural',
    'λίπητε':  'aorist active subjunctive second person plural',
    'λίπωσι':  'aorist active subjunctive third person plural',
    'λίπωσιν': 'aorist active subjunctive third person plural'
  };

  const LEIPO_AORIST_PASSIVE_INDICATIVE = {
    'ἐλείφθην':   'aorist passive indicative first person singular',
    'ἐλείφθης':   'aorist passive indicative second person singular',
    'ἐλείφθη':    'aorist passive indicative third person singular',
    'ἐλείφθημεν': 'aorist passive indicative first person plural',
    'ἐλείφθητε':  'aorist passive indicative second person plural',
    'ἐλείφθησαν': 'aorist passive indicative third person plural'
  };

  const LEIPO_PERFECT_ACTIVE_INDICATIVE = {
    'λέλοιπα':    'perfect active indicative first person singular',
    'λέλοιπας':   'perfect active indicative second person singular',
    'λέλοιπε':    'perfect active indicative third person singular',
    'λέλοιπεν':   'perfect active indicative third person singular',
    'λελοίπαμεν': 'perfect active indicative first person plural',
    'λελοίπατε':  'perfect active indicative second person plural',
    'λελοίπασι':  'perfect active indicative third person plural',
    'λελοίπασιν': 'perfect active indicative third person plural'
  };

  const LEIPO_OPTIONAL_GROUPS = [
    { chapter: 10, family: 'λείπω — present active indicative (optional)',
      forms: LEIPO_PRESENT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λείπω — imperfect active indicative (optional)',
      forms: LEIPO_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λείπω — future active indicative λείψω (optional)',
      forms: LEIPO_FUTURE_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λείπω — aorist active indicative ἔλιπον (2nd aorist, optional)',
      forms: LEIPO_AORIST_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λείπω — aorist active imperative (optional)',
      forms: LEIPO_AORIST_ACTIVE_IMPERATIVE },
    { chapter: 10, family: 'λείπω — aorist active infinitive λιπεῖν (optional)',
      forms: LEIPO_AORIST_ACTIVE_INFINITIVE },
    { chapter: 15, family: 'λείπω — aorist passive indicative ἐλείφθην (optional)',
      forms: LEIPO_AORIST_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'λείπω — perfect active indicative λέλοιπα (optional)',
      forms: LEIPO_PERFECT_ACTIVE_INDICATIVE },
    { chapter: 17, family: 'λείπω — aorist active subjunctive λίπω (optional)',
      forms: LEIPO_AORIST_ACTIVE_SUBJUNCTIVE }
  ];

  const LEIPO_EXTRA_FORMS = {
    ...LEIPO_PRESENT_ACTIVE_INDICATIVE,
    ...LEIPO_IMPERFECT_ACTIVE_INDICATIVE,
    ...LEIPO_FUTURE_ACTIVE_INDICATIVE,
    ...LEIPO_AORIST_ACTIVE_INDICATIVE,
    ...LEIPO_AORIST_ACTIVE_IMPERATIVE,
    ...LEIPO_AORIST_ACTIVE_INFINITIVE,
    ...LEIPO_AORIST_PASSIVE_INDICATIVE,
    ...LEIPO_PERFECT_ACTIVE_INDICATIVE,
    ...LEIPO_AORIST_ACTIVE_SUBJUNCTIVE
  };

  // ─── φιλέω (contract -έω verb) ────────────────────────────────────
  //
  // Duff drills present/imperfect/future/aorist active indicative (W2)
  // and the masculine-nominative present + aorist active participles
  // (W2). Everything else — passive system, subjunctive, imperative,
  // infinitives, full participle declensions — is undrilled. These
  // additions cover the most pedagogically critical contract-verb
  // forms (passive indicative for showing the -ε contraction across
  // voices, the active subjunctive/imperative for mood-vs-tense
  // contrast).

  const PHILEO_PRESENT_PASSIVE_INDICATIVE = {
    'φιλοῦμαι':   'present middle/passive indicative first person singular',
    'φιλῇ':       'present middle/passive indicative second person singular',
    'φιλεῖται':   'present middle/passive indicative third person singular',
    'φιλούμεθα':  'present middle/passive indicative first person plural',
    'φιλεῖσθε':   'present middle/passive indicative second person plural',
    'φιλοῦνται':  'present middle/passive indicative third person plural'
  };

  const PHILEO_IMPERFECT_PASSIVE_INDICATIVE = {
    'ἐφιλούμην':  'imperfect middle/passive indicative first person singular',
    'ἐφιλοῦ':     'imperfect middle/passive indicative second person singular',
    'ἐφιλεῖτο':   'imperfect middle/passive indicative third person singular',
    'ἐφιλούμεθα': 'imperfect middle/passive indicative first person plural',
    'ἐφιλεῖσθε':  'imperfect middle/passive indicative second person plural',
    'ἐφιλοῦντο':  'imperfect middle/passive indicative third person plural'
  };

  const PHILEO_AORIST_PASSIVE_INDICATIVE = {
    'ἐφιλήθην':   'aorist passive indicative first person singular',
    'ἐφιλήθης':   'aorist passive indicative second person singular',
    'ἐφιλήθη':    'aorist passive indicative third person singular',
    'ἐφιλήθημεν': 'aorist passive indicative first person plural',
    'ἐφιλήθητε':  'aorist passive indicative second person plural',
    'ἐφιλήθησαν': 'aorist passive indicative third person plural'
  };

  const PHILEO_PRESENT_ACTIVE_SUBJUNCTIVE = {
    'φιλῶ':      'present active subjunctive first person singular',
    'φιλῇς':     'present active subjunctive second person singular',
    'φιλῇ':      'present active subjunctive third person singular',
    'φιλῶμεν':   'present active subjunctive first person plural',
    'φιλῆτε':    'present active subjunctive second person plural',
    'φιλῶσι':    'present active subjunctive third person plural',
    'φιλῶσιν':   'present active subjunctive third person plural'
  };

  const PHILEO_AORIST_ACTIVE_SUBJUNCTIVE = {
    'φιλήσω':    'aorist active subjunctive first person singular',
    'φιλήσῃς':   'aorist active subjunctive second person singular',
    'φιλήσῃ':    'aorist active subjunctive third person singular',
    'φιλήσωμεν': 'aorist active subjunctive first person plural',
    'φιλήσητε':  'aorist active subjunctive second person plural',
    'φιλήσωσι':  'aorist active subjunctive third person plural',
    'φιλήσωσιν': 'aorist active subjunctive third person plural'
  };

  const PHILEO_PRESENT_ACTIVE_IMPERATIVE = {
    'φίλει':       'present active imperative second person singular',
    'φιλείτω':     'present active imperative third person singular',
    'φιλεῖτε':     'present active imperative second person plural',
    'φιλείτωσαν':  'present active imperative third person plural'
  };

  const PHILEO_AORIST_ACTIVE_IMPERATIVE = {
    'φίλησον':     'aorist active imperative second person singular',
    'φιλησάτω':    'aorist active imperative third person singular',
    'φιλήσατε':    'aorist active imperative second person plural',
    'φιλησάτωσαν': 'aorist active imperative third person plural'
  };

  const PHILEO_INFINITIVES = {
    'φιλεῖν':     'present active infinitive',
    'φιλῆσαι':    'aorist active infinitive',
    'φιλεῖσθαι':  'present middle/passive infinitive',
    'φιληθῆναι':  'aorist passive infinitive'
  };

  const PHILEO_OPTIONAL_GROUPS = [
    { chapter: 7,  family: 'φιλέω — present active imperative (optional)',
      forms: PHILEO_PRESENT_ACTIVE_IMPERATIVE },
    { chapter: 7,  family: 'φιλέω — aorist active imperative (optional)',
      forms: PHILEO_AORIST_ACTIVE_IMPERATIVE },
    { chapter: 7,  family: 'φιλέω — infinitives (optional)',
      forms: PHILEO_INFINITIVES },
    { chapter: 15, family: 'φιλέω — present middle/passive indicative (optional)',
      forms: PHILEO_PRESENT_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'φιλέω — imperfect middle/passive indicative (optional)',
      forms: PHILEO_IMPERFECT_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'φιλέω — aorist passive indicative (optional)',
      forms: PHILEO_AORIST_PASSIVE_INDICATIVE },
    { chapter: 17, family: 'φιλέω — present active subjunctive (optional)',
      forms: PHILEO_PRESENT_ACTIVE_SUBJUNCTIVE },
    { chapter: 17, family: 'φιλέω — aorist active subjunctive (optional)',
      forms: PHILEO_AORIST_ACTIVE_SUBJUNCTIVE }
  ];

  const PHILEO_EXTRA_FORMS = {
    ...PHILEO_PRESENT_PASSIVE_INDICATIVE,
    ...PHILEO_IMPERFECT_PASSIVE_INDICATIVE,
    ...PHILEO_AORIST_PASSIVE_INDICATIVE,
    ...PHILEO_PRESENT_ACTIVE_IMPERATIVE,
    ...PHILEO_AORIST_ACTIVE_IMPERATIVE,
    ...PHILEO_INFINITIVES,
    // Subjunctive last so φιλῇ resolves to "present active subjunctive
    // 3sg" (the most common single-form reading) rather than the m/p
    // 2sg from the present passive indicative spread above.
    ...PHILEO_PRESENT_ACTIVE_SUBJUNCTIVE,
    ...PHILEO_AORIST_ACTIVE_SUBJUNCTIVE
  };

  // ─── δίδωμι (μι-verb, "to give") ──────────────────────────────────
  //
  // Per the audit Duff drills present/imperfect/future/aorist/perfect
  // active indicative (W8), present active subj/imperative/infinitive,
  // and a nominative-only present active participle stem. Aorist
  // active subj/imperative/infinitive — the slots a Greek student
  // hits constantly via ἔδωκα/δοῦναι/δός in the NT — aren't drilled.
  // Present m/p indicative is covered by δίδομαι below (a separate
  // lemma in the inventory); aorist passive (ἐδόθην) is genuinely
  // useful.
  //
  // δίδωμι's aorist is the κ-aorist ἔδωκα (athematic), distinct from
  // ω-verb σα-aorists.

  const DIDOMI_AORIST_ACTIVE_INDICATIVE = {
    'ἔδωκα':    'aorist active indicative first person singular',
    'ἔδωκας':   'aorist active indicative second person singular',
    'ἔδωκε':    'aorist active indicative third person singular',
    'ἔδωκεν':   'aorist active indicative third person singular',
    'ἐδώκαμεν': 'aorist active indicative first person plural',
    'ἐδώκατε':  'aorist active indicative second person plural',
    'ἔδωκαν':   'aorist active indicative third person plural'
  };

  const DIDOMI_AORIST_ACTIVE_SUBJUNCTIVE = {
    'δῶ':      'aorist active subjunctive first person singular',
    'δῷς':     'aorist active subjunctive second person singular',
    'δῷ':      'aorist active subjunctive third person singular',
    'δῶμεν':   'aorist active subjunctive first person plural',
    'δῶτε':    'aorist active subjunctive second person plural',
    'δῶσι':    'aorist active subjunctive third person plural',
    'δῶσιν':   'aorist active subjunctive third person plural'
  };

  const DIDOMI_AORIST_ACTIVE_IMPERATIVE = {
    'δός':       'aorist active imperative second person singular',
    'δότω':      'aorist active imperative third person singular',
    'δότε':      'aorist active imperative second person plural',
    'δότωσαν':   'aorist active imperative third person plural'
  };

  const DIDOMI_AORIST_ACTIVE_INFINITIVE = {
    'δοῦναι': 'aorist active infinitive'
  };

  const DIDOMI_AORIST_PASSIVE_INDICATIVE = {
    'ἐδόθην':    'aorist passive indicative first person singular',
    'ἐδόθης':    'aorist passive indicative second person singular',
    'ἐδόθη':     'aorist passive indicative third person singular',
    'ἐδόθημεν':  'aorist passive indicative first person plural',
    'ἐδόθητε':   'aorist passive indicative second person plural',
    'ἐδόθησαν':  'aorist passive indicative third person plural'
  };

  const DIDOMI_OPTIONAL_GROUPS = [
    { chapter: 19, family: 'δίδωμι — aorist active indicative ἔδωκα (optional)',
      forms: DIDOMI_AORIST_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'δίδωμι — aorist active infinitive δοῦναι (optional)',
      forms: DIDOMI_AORIST_ACTIVE_INFINITIVE },
    { chapter: 19, family: 'δίδωμι — aorist active imperative δός (optional)',
      forms: DIDOMI_AORIST_ACTIVE_IMPERATIVE },
    { chapter: 19, family: 'δίδωμι — aorist active subjunctive δῶ (optional)',
      forms: DIDOMI_AORIST_ACTIVE_SUBJUNCTIVE },
    { chapter: 19, family: 'δίδωμι — aorist passive indicative ἐδόθην (optional)',
      forms: DIDOMI_AORIST_PASSIVE_INDICATIVE }
  ];

  const DIDOMI_EXTRA_FORMS = {
    ...DIDOMI_AORIST_ACTIVE_INDICATIVE,
    ...DIDOMI_AORIST_ACTIVE_INFINITIVE,
    ...DIDOMI_AORIST_ACTIVE_IMPERATIVE,
    ...DIDOMI_AORIST_ACTIVE_SUBJUNCTIVE,
    ...DIDOMI_AORIST_PASSIVE_INDICATIVE
  };

  // ─── τίθημι (μι-verb, "to put/place") ─────────────────────────────
  //
  // Duff drills only the present active system (W8). Adds imperfect/
  // future/aorist active indicative, the aorist active subjunctive/
  // imperative/infinitive (θεῖναι, θές, θῶ), and the aorist passive.
  // τίθημι's aorist is ἔθηκα (κ-aorist) but the non-indicative forms
  // use the bare θε- stem (θῶ, θές, θεῖναι). Aorist passive ἐτέθην
  // uses θε- + the standard passive marker -θη-.

  const TITHEMI_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἐτίθην':   'imperfect active indicative first person singular',
    'ἐτίθεις':  'imperfect active indicative second person singular',
    'ἐτίθει':   'imperfect active indicative third person singular',
    'ἐτίθεμεν': 'imperfect active indicative first person plural',
    'ἐτίθετε':  'imperfect active indicative second person plural',
    'ἐτίθεσαν': 'imperfect active indicative third person plural'
  };

  const TITHEMI_FUTURE_ACTIVE_INDICATIVE = {
    'θήσω':     'future active indicative first person singular',
    'θήσεις':   'future active indicative second person singular',
    'θήσει':    'future active indicative third person singular',
    'θήσομεν':  'future active indicative first person plural',
    'θήσετε':   'future active indicative second person plural',
    'θήσουσι':  'future active indicative third person plural',
    'θήσουσιν': 'future active indicative third person plural'
  };

  const TITHEMI_AORIST_ACTIVE_INDICATIVE = {
    'ἔθηκα':    'aorist active indicative first person singular',
    'ἔθηκας':   'aorist active indicative second person singular',
    'ἔθηκε':    'aorist active indicative third person singular',
    'ἔθηκεν':   'aorist active indicative third person singular',
    'ἐθήκαμεν': 'aorist active indicative first person plural',
    'ἐθήκατε':  'aorist active indicative second person plural',
    'ἔθηκαν':   'aorist active indicative third person plural'
  };

  const TITHEMI_AORIST_ACTIVE_SUBJUNCTIVE = {
    'θῶ':     'aorist active subjunctive first person singular',
    'θῇς':    'aorist active subjunctive second person singular',
    'θῇ':     'aorist active subjunctive third person singular',
    'θῶμεν':  'aorist active subjunctive first person plural',
    'θῆτε':   'aorist active subjunctive second person plural',
    'θῶσι':   'aorist active subjunctive third person plural',
    'θῶσιν':  'aorist active subjunctive third person plural'
  };

  const TITHEMI_AORIST_ACTIVE_IMPERATIVE = {
    'θές':       'aorist active imperative second person singular',
    'θέτω':      'aorist active imperative third person singular',
    'θέτε':      'aorist active imperative second person plural',
    'θέτωσαν':   'aorist active imperative third person plural'
  };

  const TITHEMI_AORIST_ACTIVE_INFINITIVE = {
    'θεῖναι': 'aorist active infinitive'
  };

  const TITHEMI_AORIST_PASSIVE_INDICATIVE = {
    'ἐτέθην':    'aorist passive indicative first person singular',
    'ἐτέθης':    'aorist passive indicative second person singular',
    'ἐτέθη':     'aorist passive indicative third person singular',
    'ἐτέθημεν':  'aorist passive indicative first person plural',
    'ἐτέθητε':   'aorist passive indicative second person plural',
    'ἐτέθησαν':  'aorist passive indicative third person plural'
  };

  const TITHEMI_OPTIONAL_GROUPS = [
    { chapter: 19, family: 'τίθημι — imperfect active indicative (optional)',
      forms: TITHEMI_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'τίθημι — future active indicative (optional)',
      forms: TITHEMI_FUTURE_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'τίθημι — aorist active indicative ἔθηκα (optional)',
      forms: TITHEMI_AORIST_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'τίθημι — aorist active infinitive θεῖναι (optional)',
      forms: TITHEMI_AORIST_ACTIVE_INFINITIVE },
    { chapter: 19, family: 'τίθημι — aorist active imperative θές (optional)',
      forms: TITHEMI_AORIST_ACTIVE_IMPERATIVE },
    { chapter: 19, family: 'τίθημι — aorist active subjunctive θῶ (optional)',
      forms: TITHEMI_AORIST_ACTIVE_SUBJUNCTIVE },
    { chapter: 19, family: 'τίθημι — aorist passive indicative ἐτέθην (optional)',
      forms: TITHEMI_AORIST_PASSIVE_INDICATIVE }
  ];

  const TITHEMI_EXTRA_FORMS = {
    ...TITHEMI_IMPERFECT_ACTIVE_INDICATIVE,
    ...TITHEMI_FUTURE_ACTIVE_INDICATIVE,
    ...TITHEMI_AORIST_ACTIVE_INDICATIVE,
    ...TITHEMI_AORIST_ACTIVE_INFINITIVE,
    ...TITHEMI_AORIST_ACTIVE_IMPERATIVE,
    ...TITHEMI_AORIST_ACTIVE_SUBJUNCTIVE,
    ...TITHEMI_AORIST_PASSIVE_INDICATIVE
  };

  // ─── ἵστημι (μι-verb, "to stand/cause to stand") ──────────────────
  //
  // ἵστημι is the trickiest μι-verb because it has two distinct aorist
  // formations with different meanings:
  //   - 1st aorist ἔστησα (transitive: "I caused to stand / I set up")
  //   - 2nd aorist ἔστην (intransitive: "I stood")
  // Both are real Koine. Duff drills only the present active system
  // (W8); both aorist paradigms are absent. The intransitive 2nd
  // aorist is statistically more common in the NT.

  const HISTEMI_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἵστην':   'imperfect active indicative first person singular',
    'ἵστης':   'imperfect active indicative second person singular',
    'ἵστη':    'imperfect active indicative third person singular',
    'ἵσταμεν': 'imperfect active indicative first person plural',
    'ἵστατε':  'imperfect active indicative second person plural',
    'ἵστασαν': 'imperfect active indicative third person plural'
  };

  const HISTEMI_FUTURE_ACTIVE_INDICATIVE = {
    'στήσω':     'future active indicative first person singular',
    'στήσεις':   'future active indicative second person singular',
    'στήσει':    'future active indicative third person singular',
    'στήσομεν':  'future active indicative first person plural',
    'στήσετε':   'future active indicative second person plural',
    'στήσουσι':  'future active indicative third person plural',
    'στήσουσιν': 'future active indicative third person plural'
  };

  const HISTEMI_FIRST_AORIST_ACTIVE_INDICATIVE = {
    'ἔστησα':    'aorist active indicative first person singular',
    'ἔστησας':   'aorist active indicative second person singular',
    'ἔστησε':    'aorist active indicative third person singular',
    'ἔστησεν':   'aorist active indicative third person singular',
    'ἐστήσαμεν': 'aorist active indicative first person plural',
    'ἐστήσατε':  'aorist active indicative second person plural',
    'ἔστησαν':   'aorist active indicative third person plural'
  };

  const HISTEMI_SECOND_AORIST_ACTIVE_INDICATIVE = {
    'ἔστην':    'aorist active indicative first person singular',
    'ἔστης':    'aorist active indicative second person singular',
    'ἔστη':     'aorist active indicative third person singular',
    'ἔστημεν':  'aorist active indicative first person plural',
    'ἔστητε':   'aorist active indicative second person plural'
    // 'ἔστησαν' 3pl collides verbatim with the 1st aorist 3pl above;
    // since both 1st and 2nd aorist syncretize at 3pl, the 1st aorist
    // reading takes the key. Documented to avoid silent overwrite.
  };

  const HISTEMI_AORIST_INFINITIVES = {
    'στῆσαι': 'aorist active infinitive',  // 1st aorist (transitive)
    'στῆναι': 'aorist active infinitive'   // 2nd aorist (intransitive)
  };

  // 2nd aorist subjunctive (intransitive) — common in the NT.
  const HISTEMI_SECOND_AORIST_SUBJUNCTIVE = {
    'στῶ':    'aorist active subjunctive first person singular',
    'στῇς':   'aorist active subjunctive second person singular',
    'στῇ':    'aorist active subjunctive third person singular',
    'στῶμεν': 'aorist active subjunctive first person plural',
    'στῆτε':  'aorist active subjunctive second person plural',
    'στῶσι':  'aorist active subjunctive third person plural',
    'στῶσιν': 'aorist active subjunctive third person plural'
  };

  // 2nd aorist active imperative (intransitive).
  const HISTEMI_SECOND_AORIST_IMPERATIVE = {
    'στῆθι':     'aorist active imperative second person singular',
    'στήτω':     'aorist active imperative third person singular',
    'στῆτε':     'aorist active imperative second person plural',
    'στήτωσαν':  'aorist active imperative third person plural'
  };

  // Aorist passive (ἐστάθην, used for "I stood / was placed") is the
  // standard passive paradigm.
  const HISTEMI_AORIST_PASSIVE_INDICATIVE = {
    'ἐστάθην':   'aorist passive indicative first person singular',
    'ἐστάθης':   'aorist passive indicative second person singular',
    'ἐστάθη':    'aorist passive indicative third person singular',
    'ἐστάθημεν': 'aorist passive indicative first person plural',
    'ἐστάθητε':  'aorist passive indicative second person plural',
    'ἐστάθησαν': 'aorist passive indicative third person plural'
  };

  // Perfect active (ἕστηκα, with present meaning "I am standing" — a
  // distinctive ἵστημι quirk).
  const HISTEMI_PERFECT_ACTIVE_INDICATIVE = {
    'ἕστηκα':    'perfect active indicative first person singular',
    'ἕστηκας':   'perfect active indicative second person singular',
    'ἕστηκε':    'perfect active indicative third person singular',
    'ἕστηκεν':   'perfect active indicative third person singular',
    'ἑστήκαμεν': 'perfect active indicative first person plural',
    'ἑστήκατε':  'perfect active indicative second person plural',
    'ἑστήκασι':  'perfect active indicative third person plural',
    'ἑστήκασιν': 'perfect active indicative third person plural'
  };

  const HISTEMI_OPTIONAL_GROUPS = [
    { chapter: 19, family: 'ἵστημι — imperfect active indicative (optional)',
      forms: HISTEMI_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'ἵστημι — future active indicative στήσω (optional)',
      forms: HISTEMI_FUTURE_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'ἵστημι — 1st aorist active ἔστησα (transitive, optional)',
      forms: HISTEMI_FIRST_AORIST_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'ἵστημι — 2nd aorist active ἔστην (intransitive, optional)',
      forms: HISTEMI_SECOND_AORIST_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'ἵστημι — aorist active infinitives στῆσαι / στῆναι (optional)',
      forms: HISTEMI_AORIST_INFINITIVES },
    { chapter: 19, family: 'ἵστημι — 2nd aorist active subjunctive στῶ (optional)',
      forms: HISTEMI_SECOND_AORIST_SUBJUNCTIVE },
    { chapter: 19, family: 'ἵστημι — 2nd aorist active imperative στῆθι (optional)',
      forms: HISTEMI_SECOND_AORIST_IMPERATIVE },
    { chapter: 19, family: 'ἵστημι — aorist passive indicative ἐστάθην (optional)',
      forms: HISTEMI_AORIST_PASSIVE_INDICATIVE },
    { chapter: 19, family: 'ἵστημι — perfect active indicative ἕστηκα (optional)',
      forms: HISTEMI_PERFECT_ACTIVE_INDICATIVE }
  ];

  const HISTEMI_EXTRA_FORMS = {
    ...HISTEMI_IMPERFECT_ACTIVE_INDICATIVE,
    ...HISTEMI_FUTURE_ACTIVE_INDICATIVE,
    ...HISTEMI_FIRST_AORIST_ACTIVE_INDICATIVE,
    ...HISTEMI_SECOND_AORIST_ACTIVE_INDICATIVE,
    ...HISTEMI_AORIST_INFINITIVES,
    ...HISTEMI_SECOND_AORIST_SUBJUNCTIVE,
    ...HISTEMI_SECOND_AORIST_IMPERATIVE,
    ...HISTEMI_AORIST_PASSIVE_INDICATIVE,
    ...HISTEMI_PERFECT_ACTIVE_INDICATIVE
  };

  // ─── δίδομαι (μι-verb middle/passive of δίδωμι) ───────────────────
  //
  // δίδομαι is the middle/passive complement of δίδωμι. Duff drills
  // only the present m/p indicative; everything else uses the δίδωμι
  // stem (the m/p paradigm is essentially "δίδωμι forms with passive
  // endings"). Common gaps: imperfect m/p, aorist passive (already
  // in δίδωμι's extras as ἐδόθην — duplicating here would create
  // confusion; we cross-reference instead), present m/p infinitive
  // (δίδοσθαι), present m/p imperative (δίδοσο), perfect m/p (δέδομαι).

  const DIDOMAI_IMPERFECT_INDICATIVE = {
    'ἐδιδόμην':   'imperfect middle/passive indicative first person singular',
    'ἐδίδοσο':    'imperfect middle/passive indicative second person singular',
    'ἐδίδοτο':    'imperfect middle/passive indicative third person singular',
    'ἐδιδόμεθα':  'imperfect middle/passive indicative first person plural',
    'ἐδίδοσθε':   'imperfect middle/passive indicative second person plural',
    'ἐδίδοντο':   'imperfect middle/passive indicative third person plural'
  };

  const DIDOMAI_PRESENT_INFINITIVE = {
    'δίδοσθαι': 'present middle/passive infinitive'
  };

  const DIDOMAI_PRESENT_IMPERATIVE = {
    'δίδοσο':      'present middle/passive imperative second person singular',
    'διδόσθω':     'present middle/passive imperative third person singular',
    'δίδοσθε':     'present middle/passive imperative second person plural',
    'διδόσθωσαν':  'present middle/passive imperative third person plural'
  };

  const DIDOMAI_PERFECT_INDICATIVE = {
    'δέδομαι':   'perfect middle/passive indicative first person singular',
    'δέδοσαι':   'perfect middle/passive indicative second person singular',
    'δέδοται':   'perfect middle/passive indicative third person singular',
    'δεδόμεθα':  'perfect middle/passive indicative first person plural',
    'δέδοσθε':   'perfect middle/passive indicative second person plural',
    'δέδονται':  'perfect middle/passive indicative third person plural'
  };

  const DIDOMAI_OPTIONAL_GROUPS = [
    { chapter: 19, family: 'δίδομαι — imperfect middle/passive indicative (optional)',
      forms: DIDOMAI_IMPERFECT_INDICATIVE },
    { chapter: 19, family: 'δίδομαι — present middle/passive infinitive δίδοσθαι (optional)',
      forms: DIDOMAI_PRESENT_INFINITIVE },
    { chapter: 19, family: 'δίδομαι — present middle/passive imperative (optional)',
      forms: DIDOMAI_PRESENT_IMPERATIVE },
    { chapter: 19, family: 'δίδομαι — perfect middle/passive indicative δέδομαι (optional)',
      forms: DIDOMAI_PERFECT_INDICATIVE }
  ];

  const DIDOMAI_EXTRA_FORMS = {
    ...DIDOMAI_IMPERFECT_INDICATIVE,
    ...DIDOMAI_PRESENT_INFINITIVE,
    ...DIDOMAI_PRESENT_IMPERATIVE,
    ...DIDOMAI_PERFECT_INDICATIVE
  };

  // ─── Distinct vocative singulars for noun paradigm exemplars ──────
  //
  // Audit finding: Duff intentionally skips vocatives across the noun
  // paradigms (only προφήτης gets its προφῆτα drilled explicitly).
  // For most nouns the vocative singular is syncretic with the
  // nominative singular (1st-decl fem, 2nd-decl neut, most 3rd-decl
  // stems), so a "vocative singular" pick on the drilled paradigm
  // resolves via the same Greek string under a different label —
  // worth adding to extraForms only where the syncretism would
  // confuse a student looking for explicit confirmation.
  //
  // The three lemmas below have DISTINCT vocative singular forms that
  // appear in the NT as direct addresses (κύριε is similar but its
  // lemma isn't in our paradigm list yet). Each entry is added to
  // extraForms only — no optionalFormGroups — because synthesizing a
  // single-form drill card for a vocative would clutter the deck.
  // Picks of "vocative singular" hit the fallback and resolve cleanly.

  const LOGOS_VOCATIVE = {
    'λόγε': 'vocative singular masculine'
  };
  // πόλις and βασιλεύς each carry one distinct vocative singular form
  // in the NT — kept separate now that the two lemmas are split into
  // their own paradigm entries (W5_POLIS / W5_BASILEUS).
  const POLIS_VOCATIVE = {
    'πόλι': 'vocative singular feminine'
  };
  const BASILEUS_VOCATIVE = {
    'βασιλεῦ': 'vocative singular masculine'
  };
  // 1st-decl masc. -ης nouns: vocative singular shortens to bare -α
  // (Mt 8:8 κύριε, ἐγὼ μαθητά … attested in NT). προφῆτα is drilled
  // in W1_PROPHETES_DECLENSION; μαθητά is the parallel form for
  // μαθητής and isn't drilled in the curriculum but appears in NT
  // direct address — surface it as an extra form so a "vocative
  // singular" pick resolves cleanly.
  const MATHETES_VOCATIVE = {
    'μαθητά': 'vocative singular masculine'
  };
  // Optional full-paradigm completions for the mixed-form / 3rd-decl.
  // ι-/ευ-stem nouns. Each group lists ONLY the forms the curriculum
  // doesn't already drill in its W*_*_DECLENSION set: the distinct
  // vocative singular for all four, plus the ν-less dative-plural
  // variant for the ι-/ευ-stems (πόλεσι alongside πόλεσι(ν);
  // βασιλεῦσι alongside βασιλεῦσι(ν)). The vocative PLURAL is omitted
  // intentionally — it's syncretic with the nominative plural already
  // drilled in the W set, so a "voc. pl." pick on προφῆται / μαθηταί
  // / πόλεις / βασιλεῖς resolves via the extraForms fallback below
  // without an extra drill card colliding with the existing nom-pl
  // one. The per-form dedup in getCardsForFocusedParadigm collapses
  // any other overlap with the curriculum cards.
  const PROPHETES_OPTIONAL_FORMS = {};
  const MATHETES_OPTIONAL_FORMS = {
    'μαθητά': 'vocative singular masculine'
  };
  const POLIS_OPTIONAL_FORMS = {
    'πόλι':   'vocative singular feminine',
    'πόλεσι': 'dative plural feminine'
  };
  const BASILEUS_OPTIONAL_FORMS = {
    'βασιλεῦ':   'vocative singular masculine',
    'βασιλεῦσι': 'dative plural masculine'
  };
  // Extra-forms-only entries (syncretic voc pl: same Greek string as
  // nom pl, so just an alternative reading of the same form — no need
  // to drill it as a separate card, but the fallback lookup should
  // resolve a "voc. pl." pick).
  const PROPHETES_VOC_PL_EXTRAS = {
    'προφῆται': 'vocative plural masculine'
  };
  const MATHETES_VOC_PL_EXTRAS = {
    'μαθηταί': 'vocative plural masculine'
  };
  const POLIS_VOC_PL_EXTRAS = {
    'πόλεις': 'vocative plural feminine'
  };
  const BASILEUS_VOC_PL_EXTRAS = {
    'βασιλεῖς': 'vocative plural masculine'
  };

  // ─── Participle full declensions ──────────────────────────────────
  //
  // Per the audit, Duff drills full declensions for λύω's present +
  // aorist active participles and ῥύομαι's present + aorist middle
  // participles, plus the aorist passive participle λυθείς. Several
  // other major participles get only their masculine nominative
  // singular as a stem-recall form (μι-verb participles, βαλών), or
  // aren't drilled at all (perfect active/middle-passive participles,
  // γίνομαι's aorist middle γενόμενος). These are all real Koine
  // forms commonly seen in the NT — γενόμενος especially is one of
  // the most frequent participles in the corpus.
  //
  // Form helpers: every participle paradigm declines on one of three
  // patterns:
  //   - Regular -ος/-η/-ον (m/p participles, future middle): like
  //     λυόμενος — 2nd-decl masc/neut, 1st-decl fem.
  //   - 3rd-decl ντ-stem masc/neut + 1st-decl fem in -ουσα/-ασα/
  //     -εῖσα/-υῖα: active participles. Masc gen sg in -οντος, dat
  //     pl in -ουσι(ν) etc. (with stem-specific vowel).
  //   - 3rd-decl κ-stem masc/neut + 1st-decl fem in -υῖα: perfect
  //     active participles (λελυκώς-type).
  //
  // Each declension below names every unique form once; truly
  // syncretic slots (masc acc sg = neut nom/acc sg for ντ-stems;
  // gen sg masc = gen sg neut, etc.) get a single entry with the
  // composite parse string ("masculine/neuter"). This mirrors how
  // EIMI_FUTURE_MIDDLE_PARTICIPLE handles its overlaps.

  // γίνομαι aorist middle participle γενόμενος — declines like
  // λυόμενος (regular -ος/-η/-ον adjectival). Extremely common in NT.
  const GINOMAI_AORIST_MIDDLE_PARTICIPLE = {
    'γενόμενος':  'aorist middle participle nominative singular masculine',
    'γενομένου':  'aorist middle participle genitive singular masculine/neuter',
    'γενομένῳ':   'aorist middle participle dative singular masculine/neuter',
    'γενόμενον':  'aorist middle participle accusative singular masculine/neuter',
    'γενόμενε':   'aorist middle participle vocative singular masculine',
    'γενόμενοι':  'aorist middle participle nominative plural masculine',
    'γενομένους': 'aorist middle participle accusative plural masculine',
    'γενομένων':  'aorist middle participle genitive plural masculine/feminine/neuter',
    'γενομένοις': 'aorist middle participle dative plural masculine/neuter',
    'γενομένη':   'aorist middle participle nominative singular feminine',
    'γενομένης':  'aorist middle participle genitive singular feminine',
    'γενομένῃ':   'aorist middle participle dative singular feminine',
    'γενομένην':  'aorist middle participle accusative singular feminine',
    'γενόμεναι':  'aorist middle participle nominative plural feminine',
    'γενομέναις': 'aorist middle participle dative plural feminine',
    'γενομένας':  'aorist middle participle accusative plural feminine',
    'γενόμενα':   'aorist middle participle nominative/accusative plural neuter'
  };

  // γίνομαι perfect active participle γεγονώς — declines like
  // λελυκώς (3rd-decl κ-stem masc/neut, 1st-decl fem in -υῖα). The
  // perfect of γίνομαι is active in form despite the present being
  // middle/deponent.
  const GINOMAI_PERFECT_ACTIVE_PARTICIPLE = {
    'γεγονώς':    'perfect active participle nominative singular masculine',
    'γεγονότος':  'perfect active participle genitive singular masculine/neuter',
    'γεγονότι':   'perfect active participle dative singular masculine/neuter',
    'γεγονότα':   'perfect active participle accusative singular masculine',
    // 'γεγονότα' also = nom/acc pl neuter; same key serves both. Take
    // the masculine sg acc reading (more common) and let neuter pl
    // picks fall to the data gap below.
    'γεγονότες':  'perfect active participle nominative plural masculine',
    'γεγονότων':  'perfect active participle genitive plural masculine/feminine/neuter',
    'γεγονόσι':   'perfect active participle dative plural masculine/neuter',
    'γεγονόσιν':  'perfect active participle dative plural masculine/neuter',
    'γεγονότας':  'perfect active participle accusative plural masculine',
    'γεγονυῖα':   'perfect active participle nominative singular feminine',
    'γεγονυίας':  'perfect active participle genitive singular feminine',
    'γεγονυίᾳ':   'perfect active participle dative singular feminine',
    'γεγονυῖαν':  'perfect active participle accusative singular feminine',
    'γεγονυῖαι':  'perfect active participle nominative plural feminine',
    'γεγονυιῶν':  'perfect active participle genitive plural feminine',
    'γεγονυίαις': 'perfect active participle dative plural feminine',
    'γεγονυίας_pl': 'perfect active participle accusative plural feminine', // SENTINEL — see below
    'γεγονός':    'perfect active participle nominative/accusative singular neuter'
  };
  // The synthetic 'γεγονυίας_pl' key above is a placeholder — Greek
  // syncretizes γεγονυίας between fem gen sg and fem acc pl, so the
  // gen-sg reading takes the real Greek key. Remove the placeholder
  // from the data shipped to consumers; the acc-pl-fem pick can fall
  // through to the data gap rather than be silently mislabeled.
  delete GINOMAI_PERFECT_ACTIVE_PARTICIPLE['γεγονυίας_pl'];

  // βάλλω aorist active participle βαλών — 2nd aorist active, ντ-stem
  // masc/neut + 1st-decl -οῦσα fem. Only the nominative is drilled
  // (W4_BALLO_SECOND_AORIST); the full declension is real and common.
  const BALLO_AORIST_ACTIVE_PARTICIPLE = {
    'βαλών':      'aorist active participle nominative singular masculine',
    'βαλόντος':   'aorist active participle genitive singular masculine/neuter',
    'βαλόντι':    'aorist active participle dative singular masculine/neuter',
    'βαλόντα':    'aorist active participle accusative singular masculine',
    'βαλόντες':   'aorist active participle nominative plural masculine',
    'βαλόντων':   'aorist active participle genitive plural masculine/feminine/neuter',
    'βαλοῦσι':    'aorist active participle dative plural masculine/neuter',
    'βαλοῦσιν':   'aorist active participle dative plural masculine/neuter',
    'βαλόντας':   'aorist active participle accusative plural masculine',
    'βαλοῦσα':    'aorist active participle nominative singular feminine',
    'βαλούσης':   'aorist active participle genitive singular feminine',
    'βαλούσῃ':    'aorist active participle dative singular feminine',
    'βαλοῦσαν':   'aorist active participle accusative singular feminine',
    'βαλοῦσαι':   'aorist active participle nominative plural feminine',
    'βαλουσῶν':   'aorist active participle genitive plural feminine',
    'βαλούσαις':  'aorist active participle dative plural feminine',
    'βαλούσας':   'aorist active participle accusative plural feminine',
    'βαλόν':      'aorist active participle nominative/accusative singular neuter'
  };

  // λύω perfect active participle λελυκώς — 3rd-decl κ-stem masc/neut
  // + 1st-decl -υῖα fem.
  const LUO_PERFECT_ACTIVE_PARTICIPLE = {
    'λελυκώς':    'perfect active participle nominative singular masculine',
    'λελυκότος':  'perfect active participle genitive singular masculine/neuter',
    'λελυκότι':   'perfect active participle dative singular masculine/neuter',
    'λελυκότα':   'perfect active participle accusative singular masculine',
    'λελυκότες':  'perfect active participle nominative plural masculine',
    'λελυκότων':  'perfect active participle genitive plural masculine/feminine/neuter',
    'λελυκόσι':   'perfect active participle dative plural masculine/neuter',
    'λελυκόσιν':  'perfect active participle dative plural masculine/neuter',
    'λελυκότας':  'perfect active participle accusative plural masculine',
    'λελυκυῖα':   'perfect active participle nominative singular feminine',
    'λελυκυίας':  'perfect active participle genitive singular feminine',
    'λελυκυίᾳ':   'perfect active participle dative singular feminine',
    'λελυκυῖαν':  'perfect active participle accusative singular feminine',
    'λελυκυῖαι':  'perfect active participle nominative plural feminine',
    'λελυκυιῶν':  'perfect active participle genitive plural feminine',
    'λελυκυίαις': 'perfect active participle dative plural feminine',
    'λελυκός':    'perfect active participle nominative/accusative singular neuter'
  };

  // λύω perfect middle/passive participle λελυμένος — regular -ος/-η/
  // -ον adjectival, like λυόμενος.
  const LUO_PERFECT_MP_PARTICIPLE = {
    'λελυμένος':  'perfect middle/passive participle nominative singular masculine',
    'λελυμένου':  'perfect middle/passive participle genitive singular masculine/neuter',
    'λελυμένῳ':   'perfect middle/passive participle dative singular masculine/neuter',
    'λελυμένον':  'perfect middle/passive participle accusative singular masculine/neuter',
    'λελυμένε':   'perfect middle/passive participle vocative singular masculine',
    'λελυμένοι':  'perfect middle/passive participle nominative plural masculine',
    'λελυμένους': 'perfect middle/passive participle accusative plural masculine',
    'λελυμένων':  'perfect middle/passive participle genitive plural masculine/feminine/neuter',
    'λελυμένοις': 'perfect middle/passive participle dative plural masculine/neuter',
    'λελυμένη':   'perfect middle/passive participle nominative singular feminine',
    'λελυμένης':  'perfect middle/passive participle genitive singular feminine',
    'λελυμένῃ':   'perfect middle/passive participle dative singular feminine',
    'λελυμένην':  'perfect middle/passive participle accusative singular feminine',
    'λελυμέναι':  'perfect middle/passive participle nominative plural feminine',
    'λελυμέναις': 'perfect middle/passive participle dative plural feminine',
    'λελυμένας':  'perfect middle/passive participle accusative plural feminine',
    'λελυμένα':   'perfect middle/passive participle nominative/accusative plural neuter'
  };

  // Optional groups for the participle additions. Chapter gates:
  // - Aorist participles (γενόμενος, βαλών): ch 12 (W5 — when aorist
  //   participles are introduced via λύσας).
  // - Perfect participles (γεγονώς, λελυκώς, λελυμένος): ch 15 (W6 —
  //   when the perfect system is introduced + ch 12 participles
  //   already in scope; max(12,15)=15).
  const GINOMAI_PARTICIPLE_OPTIONAL = [
    { chapter: 12, family: 'γίνομαι — aorist middle participle γενόμενος (optional)',
      forms: GINOMAI_AORIST_MIDDLE_PARTICIPLE },
    { chapter: 15, family: 'γίνομαι — perfect active participle γεγονώς (optional)',
      forms: GINOMAI_PERFECT_ACTIVE_PARTICIPLE }
  ];
  const BALLO_PARTICIPLE_OPTIONAL = [
    { chapter: 12, family: 'βάλλω — aorist active participle βαλών full declension (optional)',
      forms: BALLO_AORIST_ACTIVE_PARTICIPLE }
  ];
  const LUO_PARTICIPLE_OPTIONAL = [
    { chapter: 15, family: 'λύω — perfect active participle λελυκώς (optional)',
      forms: LUO_PERFECT_ACTIVE_PARTICIPLE },
    { chapter: 15, family: 'λύω — perfect middle/passive participle λελυμένος (optional)',
      forms: LUO_PERFECT_MP_PARTICIPLE }
  ];

  // 2nd-aorist active participle paradigm helper (-ών / -οῦσα / -όν,
  // ντ-stem masc/neut + 1st-decl fem). Built once from a bare stem so
  // each 2nd-aorist lemma gets a full declension without duplicating
  // the 19-form template. Mirrors aoristPassiveParticipleParadigm
  // below but for the active voice (βαλών/λαβών/λιπών-type).
  function aoristActiveParticipleParadigm(stem) {
    const s = stem;
    return {
      [`${s}ών`]:      'aorist active participle nominative singular masculine',
      [`${s}όντος`]:   'aorist active participle genitive singular masculine/neuter',
      [`${s}όντι`]:    'aorist active participle dative singular masculine/neuter',
      [`${s}όντα`]:    'aorist active participle accusative singular masculine',
      [`${s}όντες`]:   'aorist active participle nominative plural masculine',
      [`${s}όντων`]:   'aorist active participle genitive plural masculine/feminine/neuter',
      [`${s}οῦσι`]:    'aorist active participle dative plural masculine/neuter',
      [`${s}οῦσιν`]:   'aorist active participle dative plural masculine/neuter',
      [`${s}όντας`]:   'aorist active participle accusative plural masculine',
      [`${s}οῦσα`]:    'aorist active participle nominative singular feminine',
      [`${s}ούσης`]:   'aorist active participle genitive singular feminine',
      [`${s}ούσῃ`]:    'aorist active participle dative singular feminine',
      [`${s}οῦσαν`]:   'aorist active participle accusative singular feminine',
      [`${s}οῦσαι`]:   'aorist active participle nominative plural feminine',
      [`${s}ουσῶν`]:   'aorist active participle genitive plural feminine',
      [`${s}ούσαις`]:  'aorist active participle dative plural feminine',
      [`${s}ούσας`]:   'aorist active participle accusative plural feminine',
      [`${s}όν`]:      'aorist active participle nominative/accusative singular neuter'
    };
  }

  const LAMBANO_AORIST_ACTIVE_PARTICIPLE = aoristActiveParticipleParadigm('λαβ');
  const LEIPO_AORIST_ACTIVE_PARTICIPLE   = aoristActiveParticipleParadigm('λιπ');

  const LAMBANO_PARTICIPLE_OPTIONAL = [
    { chapter: 12, family: 'λαμβάνω — aorist active participle λαβών full declension (optional)',
      forms: LAMBANO_AORIST_ACTIVE_PARTICIPLE }
  ];
  const LEIPO_PARTICIPLE_OPTIONAL = [
    { chapter: 12, family: 'λείπω — aorist active participle λιπών full declension (optional)',
      forms: LEIPO_AORIST_ACTIVE_PARTICIPLE }
  ];

  // ─── μι-verb participle full declensions ──────────────────────────
  //
  // Duff drills only the bare stem form (masc nom sg + the -οῦσα/-όν
  // gender alternates) for each μι-verb participle. Full case/number
  // declensions exist and are common in the NT. All follow the same
  // ντ-stem pattern as λύων but with stem-specific vowel: ο/ου for
  // δίδωμι, ε/ει for τίθημι, α for ἵστημι.

  // δίδωμι present active participle διδούς (giving).
  const DIDOMI_PRESENT_ACTIVE_PARTICIPLE = {
    'διδούς':     'present active participle nominative singular masculine',
    'διδόντος':   'present active participle genitive singular masculine/neuter',
    'διδόντι':    'present active participle dative singular masculine/neuter',
    'διδόντα':    'present active participle accusative singular masculine',
    'διδόντες':   'present active participle nominative plural masculine',
    'διδόντων':   'present active participle genitive plural masculine/feminine/neuter',
    'διδοῦσι':    'present active participle dative plural masculine/neuter',
    'διδοῦσιν':   'present active participle dative plural masculine/neuter',
    'διδόντας':   'present active participle accusative plural masculine',
    'διδοῦσα':    'present active participle nominative singular feminine',
    'διδούσης':   'present active participle genitive singular feminine',
    'διδούσῃ':    'present active participle dative singular feminine',
    'διδοῦσαν':   'present active participle accusative singular feminine',
    'διδοῦσαι':   'present active participle nominative plural feminine',
    'διδουσῶν':   'present active participle genitive plural feminine',
    'διδούσαις':  'present active participle dative plural feminine',
    'διδούσας':   'present active participle accusative plural feminine',
    'διδόν':      'present active participle nominative/accusative singular neuter'
  };

  // δίδωμι aorist active participle δούς (having given).
  const DIDOMI_AORIST_ACTIVE_PARTICIPLE = {
    'δούς':     'aorist active participle nominative singular masculine',
    'δόντος':   'aorist active participle genitive singular masculine/neuter',
    'δόντι':    'aorist active participle dative singular masculine/neuter',
    'δόντα':    'aorist active participle accusative singular masculine',
    'δόντες':   'aorist active participle nominative plural masculine',
    'δόντων':   'aorist active participle genitive plural masculine/feminine/neuter',
    'δοῦσι':    'aorist active participle dative plural masculine/neuter',
    'δοῦσιν':   'aorist active participle dative plural masculine/neuter',
    'δόντας':   'aorist active participle accusative plural masculine',
    'δοῦσα':    'aorist active participle nominative singular feminine',
    'δούσης':   'aorist active participle genitive singular feminine',
    'δούσῃ':    'aorist active participle dative singular feminine',
    'δοῦσαν':   'aorist active participle accusative singular feminine',
    'δοῦσαι':   'aorist active participle nominative plural feminine',
    'δουσῶν':   'aorist active participle genitive plural feminine',
    'δούσαις':  'aorist active participle dative plural feminine',
    'δούσας':   'aorist active participle accusative plural feminine',
    'δόν':      'aorist active participle nominative/accusative singular neuter'
  };

  // τίθημι present active participle τιθείς (placing).
  const TITHEMI_PRESENT_ACTIVE_PARTICIPLE = {
    'τιθείς':     'present active participle nominative singular masculine',
    'τιθέντος':   'present active participle genitive singular masculine/neuter',
    'τιθέντι':    'present active participle dative singular masculine/neuter',
    'τιθέντα':    'present active participle accusative singular masculine',
    'τιθέντες':   'present active participle nominative plural masculine',
    'τιθέντων':   'present active participle genitive plural masculine/feminine/neuter',
    'τιθεῖσι':    'present active participle dative plural masculine/neuter',
    'τιθεῖσιν':   'present active participle dative plural masculine/neuter',
    'τιθέντας':   'present active participle accusative plural masculine',
    'τιθεῖσα':    'present active participle nominative singular feminine',
    'τιθείσης':   'present active participle genitive singular feminine',
    'τιθείσῃ':    'present active participle dative singular feminine',
    'τιθεῖσαν':   'present active participle accusative singular feminine',
    'τιθεῖσαι':   'present active participle nominative plural feminine',
    'τιθεισῶν':   'present active participle genitive plural feminine',
    'τιθείσαις':  'present active participle dative plural feminine',
    'τιθείσας':   'present active participle accusative plural feminine',
    'τιθέν':      'present active participle nominative/accusative singular neuter'
  };

  // τίθημι aorist active participle θείς (having placed).
  const TITHEMI_AORIST_ACTIVE_PARTICIPLE = {
    'θείς':     'aorist active participle nominative singular masculine',
    'θέντος':   'aorist active participle genitive singular masculine/neuter',
    'θέντι':    'aorist active participle dative singular masculine/neuter',
    'θέντα':    'aorist active participle accusative singular masculine',
    'θέντες':   'aorist active participle nominative plural masculine',
    'θέντων':   'aorist active participle genitive plural masculine/feminine/neuter',
    'θεῖσι':    'aorist active participle dative plural masculine/neuter',
    'θεῖσιν':   'aorist active participle dative plural masculine/neuter',
    'θέντας':   'aorist active participle accusative plural masculine',
    'θεῖσα':    'aorist active participle nominative singular feminine',
    'θείσης':   'aorist active participle genitive singular feminine',
    'θείσῃ':    'aorist active participle dative singular feminine',
    'θεῖσαν':   'aorist active participle accusative singular feminine',
    'θεῖσαι':   'aorist active participle nominative plural feminine',
    'θεισῶν':   'aorist active participle genitive plural feminine',
    'θείσαις':  'aorist active participle dative plural feminine',
    'θείσας':   'aorist active participle accusative plural feminine',
    'θέν':      'aorist active participle nominative/accusative singular neuter'
  };

  // ἵστημι present active participle ἱστάς (standing — transitive
  // "causing to stand").
  const HISTEMI_PRESENT_ACTIVE_PARTICIPLE = {
    'ἱστάς':     'present active participle nominative singular masculine',
    'ἱστάντος':  'present active participle genitive singular masculine/neuter',
    'ἱστάντι':   'present active participle dative singular masculine/neuter',
    'ἱστάντα':   'present active participle accusative singular masculine',
    'ἱστάντες':  'present active participle nominative plural masculine',
    'ἱστάντων':  'present active participle genitive plural masculine/feminine/neuter',
    'ἱστᾶσι':    'present active participle dative plural masculine/neuter',
    'ἱστᾶσιν':   'present active participle dative plural masculine/neuter',
    'ἱστάντας':  'present active participle accusative plural masculine',
    'ἱστᾶσα':    'present active participle nominative singular feminine',
    'ἱστάσης':   'present active participle genitive singular feminine',
    'ἱστάσῃ':    'present active participle dative singular feminine',
    'ἱστᾶσαν':   'present active participle accusative singular feminine',
    'ἱστᾶσαι':   'present active participle nominative plural feminine',
    'ἱστασῶν':   'present active participle genitive plural feminine',
    'ἱστάσαις':  'present active participle dative plural feminine',
    'ἱστάσας':   'present active participle accusative plural feminine',
    'ἱστάν':     'present active participle nominative/accusative singular neuter'
  };

  // ἵστημι 2nd aorist active participle στάς (having stood — intransitive).
  // Statistically more common in the NT than the 1st-aorist στήσας
  // (transitive "having set up"). 1st-aorist στήσας skipped for now —
  // a future addition if students hit gaps with it.
  const HISTEMI_SECOND_AORIST_ACTIVE_PARTICIPLE = {
    'στάς':     'aorist active participle nominative singular masculine',
    'στάντος':  'aorist active participle genitive singular masculine/neuter',
    'στάντι':   'aorist active participle dative singular masculine/neuter',
    'στάντα':   'aorist active participle accusative singular masculine',
    'στάντες':  'aorist active participle nominative plural masculine',
    'στάντων':  'aorist active participle genitive plural masculine/feminine/neuter',
    'στᾶσι':    'aorist active participle dative plural masculine/neuter',
    'στᾶσιν':   'aorist active participle dative plural masculine/neuter',
    'στάντας':  'aorist active participle accusative plural masculine',
    'στᾶσα':    'aorist active participle nominative singular feminine',
    'στάσης':   'aorist active participle genitive singular feminine',
    'στάσῃ':    'aorist active participle dative singular feminine',
    'στᾶσαν':   'aorist active participle accusative singular feminine',
    'στᾶσαι':   'aorist active participle nominative plural feminine',
    'στασῶν':   'aorist active participle genitive plural feminine',
    'στάσαις':  'aorist active participle dative plural feminine',
    'στάσας':   'aorist active participle accusative plural feminine',
    'στάν':     'aorist active participle nominative/accusative singular neuter'
  };

  // ἵστημι perfect active participle ἑστηκώς (standing — with present
  // meaning: "I am standing", matching the perfect indicative ἕστηκα).
  const HISTEMI_PERFECT_ACTIVE_PARTICIPLE = {
    'ἑστηκώς':    'perfect active participle nominative singular masculine',
    'ἑστηκότος':  'perfect active participle genitive singular masculine/neuter',
    'ἑστηκότι':   'perfect active participle dative singular masculine/neuter',
    'ἑστηκότα':   'perfect active participle accusative singular masculine',
    'ἑστηκότες':  'perfect active participle nominative plural masculine',
    'ἑστηκότων':  'perfect active participle genitive plural masculine/feminine/neuter',
    'ἑστηκόσι':   'perfect active participle dative plural masculine/neuter',
    'ἑστηκόσιν':  'perfect active participle dative plural masculine/neuter',
    'ἑστηκότας':  'perfect active participle accusative plural masculine',
    'ἑστηκυῖα':   'perfect active participle nominative singular feminine',
    'ἑστηκυίας':  'perfect active participle genitive singular feminine',
    'ἑστηκυίᾳ':   'perfect active participle dative singular feminine',
    'ἑστηκυῖαν':  'perfect active participle accusative singular feminine',
    'ἑστηκυῖαι':  'perfect active participle nominative plural feminine',
    'ἑστηκυιῶν':  'perfect active participle genitive plural feminine',
    'ἑστηκυίαις': 'perfect active participle dative plural feminine',
    'ἑστηκός':    'perfect active participle nominative/accusative singular neuter'
  };

  // Optional groups for the μι-verb participle additions. Chapter
  // gates: present participles at ch 12 (W5 — participles introduced);
  // aorist participles at ch 12 (same); perfect active participle at
  // ch 15 (perfect intro at W6).
  const DIDOMI_PARTICIPLE_OPTIONAL = [
    { chapter: 12, family: 'δίδωμι — present active participle διδούς full declension (optional)',
      forms: DIDOMI_PRESENT_ACTIVE_PARTICIPLE },
    { chapter: 12, family: 'δίδωμι — aorist active participle δούς full declension (optional)',
      forms: DIDOMI_AORIST_ACTIVE_PARTICIPLE }
  ];
  const TITHEMI_PARTICIPLE_OPTIONAL = [
    { chapter: 12, family: 'τίθημι — present active participle τιθείς full declension (optional)',
      forms: TITHEMI_PRESENT_ACTIVE_PARTICIPLE },
    { chapter: 12, family: 'τίθημι — aorist active participle θείς full declension (optional)',
      forms: TITHEMI_AORIST_ACTIVE_PARTICIPLE }
  ];
  const HISTEMI_PARTICIPLE_OPTIONAL = [
    { chapter: 12, family: 'ἵστημι — present active participle ἱστάς full declension (optional)',
      forms: HISTEMI_PRESENT_ACTIVE_PARTICIPLE },
    { chapter: 12, family: 'ἵστημι — 2nd aorist active participle στάς full declension (optional)',
      forms: HISTEMI_SECOND_AORIST_ACTIVE_PARTICIPLE },
    { chapter: 15, family: 'ἵστημι — perfect active participle ἑστηκώς full declension (optional)',
      forms: HISTEMI_PERFECT_ACTIVE_PARTICIPLE }
  ];

  // ─── φιλέω participle declensions ─────────────────────────────────
  //
  // Duff drills only the masc-nom forms (W2_PHILEO_ACTIVE_PARTICIPLE:
  // φιλῶν 1sg, φιλοῦντες 3pl, φιλήσας 1sg, φιλήσαντες 3pl). Full
  // declensions follow the standard contract -έω pattern: the ε
  // contracts with the participle suffix (ε+ο → ου, ε+α → α with
  // accent shift).

  const PHILEO_PRESENT_ACTIVE_PARTICIPLE = {
    'φιλῶν':       'present active participle nominative singular masculine',
    'φιλοῦντος':   'present active participle genitive singular masculine/neuter',
    'φιλοῦντι':    'present active participle dative singular masculine/neuter',
    'φιλοῦντα':    'present active participle accusative singular masculine',
    'φιλοῦντες':   'present active participle nominative plural masculine',
    'φιλούντων':   'present active participle genitive plural masculine/feminine/neuter',
    'φιλοῦσι':     'present active participle dative plural masculine/neuter',
    'φιλοῦσιν':    'present active participle dative plural masculine/neuter',
    'φιλοῦντας':   'present active participle accusative plural masculine',
    'φιλοῦσα':     'present active participle nominative singular feminine',
    'φιλούσης':    'present active participle genitive singular feminine',
    'φιλούσῃ':     'present active participle dative singular feminine',
    'φιλοῦσαν':    'present active participle accusative singular feminine',
    'φιλοῦσαι':    'present active participle nominative plural feminine',
    'φιλουσῶν':    'present active participle genitive plural feminine',
    'φιλούσαις':   'present active participle dative plural feminine',
    'φιλούσας':    'present active participle accusative plural feminine',
    'φιλοῦν':      'present active participle nominative/accusative singular neuter'
  };

  const PHILEO_AORIST_ACTIVE_PARTICIPLE = {
    'φιλήσας':       'aorist active participle nominative singular masculine',
    'φιλήσαντος':    'aorist active participle genitive singular masculine/neuter',
    'φιλήσαντι':     'aorist active participle dative singular masculine/neuter',
    'φιλήσαντα':     'aorist active participle accusative singular masculine',
    'φιλήσαντες':    'aorist active participle nominative plural masculine',
    'φιλησάντων':    'aorist active participle genitive plural masculine/feminine/neuter',
    'φιλήσασι':      'aorist active participle dative plural masculine/neuter',
    'φιλήσασιν':     'aorist active participle dative plural masculine/neuter',
    'φιλήσαντας':    'aorist active participle accusative plural masculine',
    'φιλήσασα':      'aorist active participle nominative singular feminine',
    'φιλησάσης':     'aorist active participle genitive singular feminine',
    'φιλησάσῃ':      'aorist active participle dative singular feminine',
    'φιλήσασαν':     'aorist active participle accusative singular feminine',
    'φιλήσασαι':     'aorist active participle nominative plural feminine',
    'φιλησασῶν':     'aorist active participle genitive plural feminine',
    'φιλησάσαις':    'aorist active participle dative plural feminine',
    'φιλησάσας':     'aorist active participle accusative plural feminine',
    'φιλῆσαν':       'aorist active participle nominative/accusative singular neuter'
  };

  const PHILEO_PARTICIPLE_OPTIONAL = [
    { chapter: 12, family: 'φιλέω — present active participle φιλῶν full declension (optional)',
      forms: PHILEO_PRESENT_ACTIVE_PARTICIPLE },
    { chapter: 12, family: 'φιλέω — aorist active participle φιλήσας full declension (optional)',
      forms: PHILEO_AORIST_ACTIVE_PARTICIPLE }
  ];

  // ─── λύω future participles (active, middle, passive) ─────────────
  //
  // Rare in NT but morphologically real. Future active follows the
  // λύων pattern (ντ-stem masc/neut + -οῦσα fem); future middle
  // follows λυόμενος (regular -ος/-η/-ον); future passive likewise
  // (-θησόμενος, basically the future middle of the passive stem).

  const LUO_FUTURE_ACTIVE_PARTICIPLE = {
    'λύσων':      'future active participle nominative singular masculine',
    'λύσοντος':   'future active participle genitive singular masculine/neuter',
    'λύσοντι':    'future active participle dative singular masculine/neuter',
    'λύσοντα':    'future active participle accusative singular masculine',
    'λύσοντες':   'future active participle nominative plural masculine',
    'λυσόντων':   'future active participle genitive plural masculine/feminine/neuter',
    'λύσουσι':    'future active participle dative plural masculine/neuter',
    'λύσουσιν':   'future active participle dative plural masculine/neuter',
    'λύσοντας':   'future active participle accusative plural masculine',
    'λύσουσα':    'future active participle nominative singular feminine',
    'λυσούσης':   'future active participle genitive singular feminine',
    'λυσούσῃ':    'future active participle dative singular feminine',
    'λύσουσαν':   'future active participle accusative singular feminine',
    'λύσουσαι':   'future active participle nominative plural feminine',
    'λυσουσῶν':   'future active participle genitive plural feminine',
    'λυσούσαις':  'future active participle dative plural feminine',
    'λυσούσας':   'future active participle accusative plural feminine',
    'λῦσον':      'future active participle nominative/accusative singular neuter'
  };

  const LUO_FUTURE_MIDDLE_PARTICIPLE = {
    'λυσόμενος':  'future middle participle nominative singular masculine',
    'λυσομένου':  'future middle participle genitive singular masculine/neuter',
    'λυσομένῳ':   'future middle participle dative singular masculine/neuter',
    'λυσόμενον':  'future middle participle accusative singular masculine/neuter',
    'λυσόμενοι':  'future middle participle nominative plural masculine',
    'λυσομένους': 'future middle participle accusative plural masculine',
    'λυσομένων':  'future middle participle genitive plural masculine/feminine/neuter',
    'λυσομένοις': 'future middle participle dative plural masculine/neuter',
    'λυσομένη':   'future middle participle nominative singular feminine',
    'λυσομένης':  'future middle participle genitive singular feminine',
    'λυσομένῃ':   'future middle participle dative singular feminine',
    'λυσομένην':  'future middle participle accusative singular feminine',
    'λυσόμεναι':  'future middle participle nominative plural feminine',
    'λυσομέναις': 'future middle participle dative plural feminine',
    'λυσομένας':  'future middle participle accusative plural feminine',
    'λυσόμενα':   'future middle participle nominative/accusative plural neuter'
  };

  const LUO_FUTURE_PASSIVE_PARTICIPLE = {
    'λυθησόμενος':  'future passive participle nominative singular masculine',
    'λυθησομένου':  'future passive participle genitive singular masculine/neuter',
    'λυθησομένῳ':   'future passive participle dative singular masculine/neuter',
    'λυθησόμενον':  'future passive participle accusative singular masculine/neuter',
    'λυθησόμενοι':  'future passive participle nominative plural masculine',
    'λυθησομένους': 'future passive participle accusative plural masculine',
    'λυθησομένων':  'future passive participle genitive plural masculine/feminine/neuter',
    'λυθησομένοις': 'future passive participle dative plural masculine/neuter',
    'λυθησομένη':   'future passive participle nominative singular feminine',
    'λυθησομένης':  'future passive participle genitive singular feminine',
    'λυθησομένῃ':   'future passive participle dative singular feminine',
    'λυθησομένην':  'future passive participle accusative singular feminine',
    'λυθησόμεναι':  'future passive participle nominative plural feminine',
    'λυθησομέναις': 'future passive participle dative plural feminine',
    'λυθησομένας':  'future passive participle accusative plural feminine',
    'λυθησόμενα':   'future passive participle nominative/accusative plural neuter'
  };

  const LUO_FUTURE_PARTICIPLE_OPTIONAL = [
    { chapter: 15, family: 'λύω — future active participle λύσων full declension (optional, rare)',
      forms: LUO_FUTURE_ACTIVE_PARTICIPLE },
    { chapter: 15, family: 'λύω — future middle participle λυσόμενος full declension (optional, rare)',
      forms: LUO_FUTURE_MIDDLE_PARTICIPLE },
    { chapter: 15, family: 'λύω — future passive participle λυθησόμενος full declension (optional, rare)',
      forms: LUO_FUTURE_PASSIVE_PARTICIPLE }
  ];

  // ─── Aorist passive participles ───────────────────────────────────
  //
  // Each major verb has an aorist passive participle following the
  // λυθείς paradigm (3rd-decl ντ-stem masc/neut with -θεις/-θεντος;
  // 1st-decl -θεῖσα fem). Stems shift per the verb's principal-part
  // formation: φιλη-θ-, βλη-θ-, γενη-θ-, δο-θ-, τε-θ-, στα-θ-. All
  // are real Koine and common in the NT (γενηθεὶς "having become",
  // δοθείς "having been given", σταθείς "having been placed/stood").
  //
  // Gated ch 15 (W6 — aorist passive system intro + ch 12 participles
  // already in scope; max gives 15).

  function aoristPassiveParticipleParadigm(stem) {
    // stem is the part before -θεις (e.g. 'φιλη', 'βλη', 'γενη', 'δο',
    // 'τε', 'στα'). Returns a flat forms object keyed by the inflected
    // Greek string, with the standard λυθείς pattern parses.
    const s = stem;
    return {
      [`${s}θείς`]:     'aorist passive participle nominative singular masculine',
      [`${s}θέντος`]:   'aorist passive participle genitive singular masculine/neuter',
      [`${s}θέντι`]:    'aorist passive participle dative singular masculine/neuter',
      [`${s}θέντα`]:    'aorist passive participle accusative singular masculine',
      [`${s}θέντες`]:   'aorist passive participle nominative plural masculine',
      [`${s}θέντων`]:   'aorist passive participle genitive plural masculine/feminine/neuter',
      [`${s}θεῖσι`]:    'aorist passive participle dative plural masculine/neuter',
      [`${s}θεῖσιν`]:   'aorist passive participle dative plural masculine/neuter',
      [`${s}θέντας`]:   'aorist passive participle accusative plural masculine',
      [`${s}θεῖσα`]:    'aorist passive participle nominative singular feminine',
      [`${s}θείσης`]:   'aorist passive participle genitive singular feminine',
      [`${s}θείσῃ`]:    'aorist passive participle dative singular feminine',
      [`${s}θεῖσαν`]:   'aorist passive participle accusative singular feminine',
      [`${s}θεῖσαι`]:   'aorist passive participle nominative plural feminine',
      [`${s}θεισῶν`]:   'aorist passive participle genitive plural feminine',
      [`${s}θείσαις`]:  'aorist passive participle dative plural feminine',
      [`${s}θείσας`]:   'aorist passive participle accusative plural feminine',
      [`${s}θέν`]:      'aorist passive participle nominative/accusative singular neuter'
    };
  }

  const PHILEO_AORIST_PASSIVE_PARTICIPLE  = aoristPassiveParticipleParadigm('φιλη');
  const BALLO_AORIST_PASSIVE_PARTICIPLE   = aoristPassiveParticipleParadigm('βλη');
  const GINOMAI_AORIST_PASSIVE_PARTICIPLE = aoristPassiveParticipleParadigm('γενη');
  const DIDOMI_AORIST_PASSIVE_PARTICIPLE  = aoristPassiveParticipleParadigm('δο');
  const TITHEMI_AORIST_PASSIVE_PARTICIPLE = aoristPassiveParticipleParadigm('τε');
  const HISTEMI_AORIST_PASSIVE_PARTICIPLE = aoristPassiveParticipleParadigm('στα');
  // λαμβάνω aorist passive participle λημφθείς (Koine; classical
  // ληφθείς), λείπω aorist passive participle λειφθείς.
  const LAMBANO_AORIST_PASSIVE_PARTICIPLE = aoristPassiveParticipleParadigm('λημφ');
  const LEIPO_AORIST_PASSIVE_PARTICIPLE   = aoristPassiveParticipleParadigm('λειφ');

  const LEMMA_INVENTORY = {
    'εἰμί': {
      // εἰμί is suppletive: it has no aorist or perfect family — Greek
      // uses other roots (γέγονα, ἐγενόμην) for those senses. Tenses
      // εἰμί does have: present, future, imperfect (and a rarely-
      // attested perfect that classical/Koine pedagogy treats as
      // absent). Voice: εἰμί is active in the present/imperfect but
      // deponent middle in the future (ἔσομαι, ἐσόμενος, ἔσεσθαι) — so
      // we can't blanket-block middle/passive at the lemma level; it'd
      // wrongly tag every future-middle pick as impossible. Until the
      // inventory shape supports tense-conditional voice gating, leave
      // voice open. Moods exist for some tenses (subjunctive ὦ,
      // imperative ἴσθι, infinitive εἶναι/ἔσεσθαι, participle ὤν/
      // ἐσόμενος) so don't blanket-mark moods here either.
      impossibleTenses: ['aorist', 'first aorist', 'second aorist', 'perfect', 'pluperfect'],
      extraForms: {
        ...EIMI_FUTURE_MIDDLE_PARTICIPLE,
        ...EIMI_FUTURE_MIDDLE_INFINITIVE,
        ...EIMI_PRESENT_ACTIVE_IMPERATIVE
      },
      optionalFormGroups: EIMI_OPTIONAL_GROUPS
    },
    'λύω': {
      extraForms: {
        ...LUO_EXTRA_FORMS,
        ...LUO_PERFECT_ACTIVE_PARTICIPLE,
        ...LUO_PERFECT_MP_PARTICIPLE,
        ...LUO_FUTURE_ACTIVE_PARTICIPLE,
        ...LUO_FUTURE_MIDDLE_PARTICIPLE,
        ...LUO_FUTURE_PASSIVE_PARTICIPLE
      },
      optionalFormGroups: [
        ...LUO_OPTIONAL_GROUPS,
        ...LUO_PARTICIPLE_OPTIONAL,
        ...LUO_FUTURE_PARTICIPLE_OPTIONAL
      ]
    },
    'ῥύομαι': {
      extraForms: RHUOMAI_EXTRA_FORMS,
      optionalFormGroups: RHUOMAI_OPTIONAL_GROUPS
    },
    'βάλλω': {
      extraForms: {
        ...BALLO_EXTRA_FORMS,
        ...BALLO_AORIST_ACTIVE_PARTICIPLE,
        ...BALLO_AORIST_PASSIVE_PARTICIPLE
      },
      optionalFormGroups: [
        ...BALLO_OPTIONAL_GROUPS,
        ...BALLO_PARTICIPLE_OPTIONAL,
        { chapter: 15, family: 'βάλλω — aorist passive participle βληθείς (optional)',
          forms: BALLO_AORIST_PASSIVE_PARTICIPLE }
      ]
    },
    'γίνομαι': {
      extraForms: {
        ...GINOMAI_EXTRA_FORMS,
        ...GINOMAI_AORIST_MIDDLE_PARTICIPLE,
        ...GINOMAI_PERFECT_ACTIVE_PARTICIPLE,
        ...GINOMAI_AORIST_PASSIVE_PARTICIPLE
      },
      optionalFormGroups: [
        ...GINOMAI_OPTIONAL_GROUPS,
        ...GINOMAI_PARTICIPLE_OPTIONAL,
        { chapter: 15, family: 'γίνομαι — aorist passive participle γενηθείς (optional)',
          forms: GINOMAI_AORIST_PASSIVE_PARTICIPLE }
      ]
    },
    'λαμβάνω': {
      extraForms: {
        ...LAMBANO_EXTRA_FORMS,
        ...LAMBANO_AORIST_ACTIVE_PARTICIPLE,
        ...LAMBANO_AORIST_PASSIVE_PARTICIPLE
      },
      optionalFormGroups: [
        ...LAMBANO_OPTIONAL_GROUPS,
        ...LAMBANO_PARTICIPLE_OPTIONAL,
        { chapter: 15, family: 'λαμβάνω — aorist passive participle λημφθείς (optional)',
          forms: LAMBANO_AORIST_PASSIVE_PARTICIPLE }
      ]
    },
    'λείπω': {
      extraForms: {
        ...LEIPO_EXTRA_FORMS,
        ...LEIPO_AORIST_ACTIVE_PARTICIPLE,
        ...LEIPO_AORIST_PASSIVE_PARTICIPLE
      },
      optionalFormGroups: [
        ...LEIPO_OPTIONAL_GROUPS,
        ...LEIPO_PARTICIPLE_OPTIONAL,
        { chapter: 15, family: 'λείπω — aorist passive participle λειφθείς (optional)',
          forms: LEIPO_AORIST_PASSIVE_PARTICIPLE }
      ]
    },
    'φιλέω': {
      extraForms: {
        ...PHILEO_EXTRA_FORMS,
        ...PHILEO_PRESENT_ACTIVE_PARTICIPLE,
        ...PHILEO_AORIST_ACTIVE_PARTICIPLE,
        ...PHILEO_AORIST_PASSIVE_PARTICIPLE
      },
      optionalFormGroups: [
        ...PHILEO_OPTIONAL_GROUPS,
        ...PHILEO_PARTICIPLE_OPTIONAL,
        { chapter: 15, family: 'φιλέω — aorist passive participle φιληθείς (optional)',
          forms: PHILEO_AORIST_PASSIVE_PARTICIPLE }
      ]
    },
    'δίδωμι': {
      extraForms: {
        ...DIDOMI_EXTRA_FORMS,
        ...DIDOMI_PRESENT_ACTIVE_PARTICIPLE,
        ...DIDOMI_AORIST_ACTIVE_PARTICIPLE,
        ...DIDOMI_AORIST_PASSIVE_PARTICIPLE
      },
      optionalFormGroups: [
        ...DIDOMI_OPTIONAL_GROUPS,
        ...DIDOMI_PARTICIPLE_OPTIONAL,
        { chapter: 19, family: 'δίδωμι — aorist passive participle δοθείς (optional)',
          forms: DIDOMI_AORIST_PASSIVE_PARTICIPLE }
      ]
    },
    'τίθημι': {
      extraForms: {
        ...TITHEMI_EXTRA_FORMS,
        ...TITHEMI_PRESENT_ACTIVE_PARTICIPLE,
        ...TITHEMI_AORIST_ACTIVE_PARTICIPLE,
        ...TITHEMI_AORIST_PASSIVE_PARTICIPLE
      },
      optionalFormGroups: [
        ...TITHEMI_OPTIONAL_GROUPS,
        ...TITHEMI_PARTICIPLE_OPTIONAL,
        { chapter: 19, family: 'τίθημι — aorist passive participle τεθείς (optional)',
          forms: TITHEMI_AORIST_PASSIVE_PARTICIPLE }
      ]
    },
    'ἵστημι': {
      extraForms: {
        ...HISTEMI_EXTRA_FORMS,
        ...HISTEMI_PRESENT_ACTIVE_PARTICIPLE,
        ...HISTEMI_SECOND_AORIST_ACTIVE_PARTICIPLE,
        ...HISTEMI_PERFECT_ACTIVE_PARTICIPLE,
        ...HISTEMI_AORIST_PASSIVE_PARTICIPLE
      },
      optionalFormGroups: [
        ...HISTEMI_OPTIONAL_GROUPS,
        ...HISTEMI_PARTICIPLE_OPTIONAL,
        { chapter: 19, family: 'ἵστημι — aorist passive participle σταθείς (optional)',
          forms: HISTEMI_AORIST_PASSIVE_PARTICIPLE }
      ]
    },
    'δίδομαι': {
      extraForms: DIDOMAI_EXTRA_FORMS,
      optionalFormGroups: DIDOMAI_OPTIONAL_GROUPS
    },
    'λόγος': {
      extraForms: LOGOS_VOCATIVE
    },
    'προφήτης': {
      extraForms: PROPHETES_VOC_PL_EXTRAS
    },
    'μαθητής': {
      extraForms: { ...MATHETES_VOCATIVE, ...MATHETES_VOC_PL_EXTRAS },
      optionalFormGroups: [
        { chapter: 8, family: 'μαθητής — vocative singular (optional)',
          forms: MATHETES_OPTIONAL_FORMS }
      ]
    },
    'πόλις': {
      extraForms: { ...POLIS_VOCATIVE, ...POLIS_OPTIONAL_FORMS, ...POLIS_VOC_PL_EXTRAS },
      optionalFormGroups: [
        { chapter: 12, family: 'πόλις — vocative sg. + ν-less dat. pl. (optional)',
          forms: POLIS_OPTIONAL_FORMS }
      ]
    },
    'βασιλεύς': {
      extraForms: { ...BASILEUS_VOCATIVE, ...BASILEUS_OPTIONAL_FORMS, ...BASILEUS_VOC_PL_EXTRAS },
      optionalFormGroups: [
        { chapter: 12, family: 'βασιλεύς — vocative sg. + ν-less dat. pl. (optional)',
          forms: BASILEUS_OPTIONAL_FORMS }
      ]
    }
    // Add more defective lemmas here (e.g. οἶδα — no present form, the
    // perfect serves as present; χρή — only third singular, etc.) when
    // the data grows to include them. For paradigm exemplars (λύω,
    // λόγος, ἀγαθός, …) whose paradigms have undrilled corners, add
    // both `extraForms` (always-on fallback) and `optionalFormGroups`
    // (toggle-gated drill cards) — reference a shared `forms` map so
    // the two stay in sync.
  };

  if (typeof window !== 'undefined') window.LEMMA_INVENTORY = LEMMA_INVENTORY;
})();
