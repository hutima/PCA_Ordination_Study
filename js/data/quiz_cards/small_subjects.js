// PCA Ordination & Licensure Study — per-card MCQ overlay: small_subjects.
// Hand-authored multiple-choice for cards that can't auto-generate one, keyed
// by card id and merged into window.PCA_CARD_QUIZ (consumed by
// js/app/quiz.js cardQuiz()). Kept OUTSIDE the generated subject files so a
// builder re-run never wipes these. Each entry:
//   'card-id': { q?: 'sharper question override', choices: [4], answerIndex }
// Distractors must match the correct answer in length and grammatical shape
// (dev/validate.mjs giveaway check + manual discipline).
(function (global) {
  const Q = {
    // ── personal_call ──────────────────────────────────────────────────
    'pc-001': { q: 'What best characterizes the biblical qualifications for an elder/overseer in 1 Timothy 3 and Titus 1?', choices: [
      'Overwhelmingly character, with one ability requirement — being able to teach',
      'Overwhelmingly seminary training, with one character requirement — being humble',
      'Overwhelmingly preaching skill, with one family requirement — having children',
      'Overwhelmingly congregational popularity, with one age requirement — being older',
    ], answerIndex: 0 },
    'pc-002': { q: 'What is the deacon’s office chiefly one of, per Acts 6 and 1 Timothy 3:8–13?', choices: [
      'Sympathy and service, especially ministering to the poor and distressed',
      'Teaching and rule, especially instructing new converts in doctrine',
      'Discipline and oversight, especially examining candidates for membership',
      'Evangelism and missions, especially planting new congregations abroad',
    ], answerIndex: 0 },
    'pc-003': { q: 'Per 1 Peter 5:1–4, how are elders charged to shepherd the flock?', choices: [
      'Willingly and eagerly, as examples rather than domineering over the flock',
      'Cautiously and formally, as officials rather than friends of the flock',
      'Firmly and sternly, as rulers rather than servants of the flock',
      'Quietly and privately, as advisors rather than visible leaders of the flock',
    ], answerIndex: 0 },
    'pc-004': { q: 'What two aspects together make up a true call to gospel ministry, per Reformed practice?', choices: [
      'The inward call of the Spirit-given desire and the outward call of the church',
      'The inward call of a private vision and the outward call of family approval',
      'The inward call of seminary admission and the outward call of ordination fees',
      'The inward call of financial need and the outward call of a job opening',
    ], answerIndex: 0 },
    'pc-005': { q: 'Besides Bible content, theology, and church government, what else do PCA ordination trials (BCO 21-4) examine?', choices: [
      'Experiential religion and character, biblical languages and sacraments and history',
      'Preaching style and pulpit presence, plus fluency in modern apologetics',
      'Administrative skill and budgeting, plus experience in committee leadership',
      'Musical ability and liturgical taste, plus familiarity with hymn selection',
    ], answerIndex: 0 },
    'pc-006': { q: 'Why can the personal questions about a candidate’s religion and call not simply be memorized?', choices: [
      'They call for honest self-examination, since each candidate must answer for himself',
      'They are randomly generated, so no fixed set of answers could cover them',
      'They are legally binding, so a memorized answer would be considered perjury',
      'They are purely ceremonial, so presbytery does not weigh the actual answers',
    ], answerIndex: 0 },

    // ── doctrines_proofs ───────────────────────────────────────────────
    'dp-tulip-000': { q: 'What historical event produced the "five points of Calvinism" (TULIP)?', choices: [
      'The Synod of Dort’s reply to the five articles of the Arminian Remonstrance',
      'The Council of Trent’s reply to the ninety-five theses of Martin Luther',
      'The Westminster Assembly’s reply to the errors of the Socinian party',
      'The Marburg Colloquy’s reply to the sacramental views of Huldrych Zwingli',
    ], answerIndex: 0 },
    'dp-tulip-t': { q: 'What does "Total Depravity" mean, more precisely stated?', choices: [
      'Total inability — sin has corrupted every faculty so man cannot turn to God unaided',
      'Total wickedness — every person is in practice as evil as it is possible to be',
      'Total ignorance — man cannot know right from wrong without special revelation',
      'Total isolation — sin has severed every relationship between man and his neighbor',
    ], answerIndex: 0 },
    'dp-tulip-u': { q: 'On what ground does God choose His elect, per Unconditional Election?', choices: [
      'His mere good pleasure, not any foreseen faith or works or worth in them',
      'Their foreseen faith, since God elects those He knows will freely believe',
      'Their future works, since God elects those He knows will persevere',
      'Their inherited status, since God elects the descendants of believing parents',
    ], answerIndex: 0 },
    'dp-tulip-l': { q: 'What is the better label for "Limited Atonement," and what does it mean?', choices: [
      'Particular redemption — Christ’s death secured rather than merely enabled his people’s salvation',
      'General redemption — Christ’s death made salvation merely possible for every person',
      'Partial redemption — Christ’s death paid for some sins but left others uncovered',
      'Provisional redemption — Christ’s death took effect only once a person is baptized',
    ], answerIndex: 0 },
    'dp-tulip-i': { q: 'What is the better label for "Irresistible Grace," and what does it mean?', choices: [
      'Effectual calling — the Spirit’s work infallibly draws the sinner and cannot finally fail',
      'Common grace — every hearer is equally moved but may freely reject the gospel call',
      'Prevenient grace — grace restores free will so the sinner can choose to cooperate',
      'Sacramental grace — the sacraments alone convey the Spirit’s regenerating power',
    ], answerIndex: 0 },
    'dp-tulip-p': { q: 'What does "Perseverance of the Saints" affirm about those God has effectually called and justified?', choices: [
      'He keeps them by His power so they can neither totally nor finally fall away',
      'He warns them that they may still totally and finally fall away from grace',
      'He leaves their final salvation dependent on their own unaided strength',
      'He renews the call again each time a believer commits a serious sin',
    ], answerIndex: 0 },
    'dp-ordo-001': { q: 'What is the *ordo salutis*, and what anchors both its order and certainty?', choices: [
      'The logical order the Spirit applies redemption, anchored by the golden chain of Romans 8:29–30',
      'The chronological order believers experience emotions, anchored by the beatitudes of Matthew 5',
      'The liturgical order a worship service follows, anchored by the pattern of Isaiah 6',
      'The historical order redemptive covenants were made, anchored by the covenants of Genesis 12',
    ], answerIndex: 0 },
    'dp-ordo-002': { q: 'In the order of salvation, which precedes the other — regeneration or faith?', choices: [
      'Regeneration precedes faith, since the dead sinner must be made alive before he can believe',
      'Faith precedes regeneration, since believing is what prompts the Spirit to act',
      'They occur in no fixed order, since Scripture treats the two as interchangeable',
      'Faith replaces regeneration entirely, since believing itself constitutes new birth',
    ], answerIndex: 0 },
    'dp-gospel-001': { q: 'What four-point outline structures a clear gospel explanation to an unbeliever?', choices: [
      'God the holy Judge, man’s guilt, Christ’s death and resurrection, and the call to respond',
      'Creation, fall, redemption, and restoration, told as four eras of world history',
      'Law, gospel, sacrament, and church, told as four marks of the visible church',
      'Election, calling, justification, and glorification, told as four acts of God alone',
    ], answerIndex: 0 },
    'dp-gospel-002': { q: 'How does the Heidelberg Catechism state a believer’s only comfort in life and death?', choices: [
      'That I belong, body and soul, to my faithful Savior Jesus Christ, who paid for all my sins',
      'That I have kept the law, resisted every temptation, and earned a right standing before God',
      'That my good works, sincere efforts, and religious devotion will outweigh my sins in judgment',
      'That my church membership, family heritage, and outward morality guarantee my safety before God',
    ], answerIndex: 0 },

    // ── sacraments ─────────────────────────────────────────────────────
    'sac-001-what-is-a-sacrament-explain-in-layman-s': { q: 'Per the WSC, what is a sacrament?', choices: [
      'A holy ordinance wherein sensible signs represent, seal, and apply Christ’s benefits to believers',
      'A holy custom wherein spoken words recall, retell, and remind believers of Christ’s example',
      'A holy tradition wherein church leaders bless, dispense, and confer merit through good works',
      'A holy ceremony wherein believers publicly vow, pledge, and swear allegiance to their congregation',
    ], answerIndex: 0 },
    'sac-002-why-did-god-give-us-sacraments-wcf-27-1': { q: 'Per WCF 27.1, why did God give the church the sacraments?', choices: [
      'As signs and seals of the covenant of grace that mark the church off from the world',
      'As rewards for obedience that guarantee a believer’s final perseverance to glory',
      'As replacements for preaching that make the spoken Word no longer necessary',
      'As civic rituals that unite the church with the governing authorities of the state',
    ], answerIndex: 0 },
    'sac-003-how-many-sacraments-are-there-defend-you': { q: 'How many sacraments does Scripture institute through Christ, per this card?', choices: [
      'Two — baptism and the Lord’s Supper',
      'Seven — including confirmation and penance',
      'Three — baptism, confirmation, and the Supper',
      'One — the Lord’s Supper alone',
    ], answerIndex: 0 },
    'sac-004-does-anything-really-happen-in-a-sacrame': { q: 'Does anything really happen in a sacrament, per this card?', choices: [
      'Yes — by faith it is a means of grace, the Spirit nourishing and assuring the believer',
      'No — a sacrament is merely a memorial, with no spiritual effect at all',
      'Yes — the elements themselves possess an inherent power apart from faith',
      'No — a sacrament only benefits those already assured of their salvation',
    ], answerIndex: 0 },
    'sac-005-what-nt-references-show-parallels-betwee': { q: 'Which New Testament passage draws a direct parallel between OT circumcision and NT baptism?', choices: [
      'Colossians 2:11–12 — believers are circumcised with Christ, buried with him in baptism',
      '1 Corinthians 11:23–26 — Paul recounts the words of institution for the Lord’s Supper',
      'Ephesians 2:8–9 — salvation is by grace through faith, not a result of works',
      'Acts 2:38 — Peter calls the crowd at Pentecost to repent and be baptized',
    ], answerIndex: 0 },
    'sac-006-of-what-is-baptism-a-sign-and-seal': { q: 'Of what is baptism a sign and seal, per this card’s four points?', choices: [
      'Union with Christ, remission of sins, regeneration/adoption, and the outpoured Spirit',
      'Church membership, financial giving, weekly attendance, and public confession',
      'Physical healing, material prosperity, family unity, and long earthly life',
      'Ordination to office, ministerial authority, doctrinal soundness, and church discipline',
    ], answerIndex: 0 },
    'sac-007-what-is-a-sign-and-what-is-a-seal': { q: 'How does a sacramental sign differ from a sacramental seal?', choices: [
      'A sign displays the covenant’s realities visibly; a seal applies them personally by faith',
      'A sign applies the covenant’s realities personally; a seal displays them visibly to onlookers',
      'A sign is limited to the New Testament; a seal is limited to the Old Testament',
      'A sign requires a minister to perform it; a seal may be performed by any believer',
    ], answerIndex: 0 },
    'sac-008-where-in-scripture-are-these-terms-used': { q: 'Where does Scripture use the terms "sign" and "seal" of baptism?', choices: [
      'Romans 4:11–12 and Ephesians 1:13',
      'Matthew 28:19 and Mark 16:16',
      'Acts 8:36–38 and Acts 10:47',
      '1 Corinthians 6:9–11 and Titus 3:4–5',
    ], answerIndex: 0 },
    'sac-009-how-does-the-latter-term-relate-to-paedo': { q: 'How does baptism as a sign and seal relate to infant baptism?', choices: [
      'Baptism is the New Covenant’s sign and seal, as circumcision was the Old Covenant’s',
      'Baptism replaces circumcision entirely, so the two carry no theological relation',
      'Baptism was never applied to infants, unlike circumcision under the Old Covenant',
      'Baptism seals only adult faith, while circumcision sealed only infant status',
    ], answerIndex: 0 },
    'sac-010-how-is-baptism-rightly-administered-defe': { q: 'How is baptism rightly administered, per this card?', choices: [
      'With water, by sprinkling, in the name of the Trinity, by a minister of the gospel',
      'With oil, by anointing, in the name of the Trinity, by any baptized believer',
      'With water, by full immersion only, in Jesus’s name alone, by a deacon',
      'With water, by sprinkling, in the church’s name, by an elected elder',
    ], answerIndex: 0 },
    'sac-011-four-views-on-baptism': { q: 'Which view holds that baptism is a sign and seal — a means of grace, administered by sprinkling to believers and their children?', choices: [
      'The Reformed view',
      'The Lutheran view',
      'The Church of Christ view',
      'The Baptist/Anabaptist view',
    ], answerIndex: 0 },
    'sac-012-how-does-one-improve-his-or-her-baptism': { q: 'Per WLC 167, what does "improving our baptism" involve?', choices: [
      'Thankful reflection, humility over sin, growing assurance, and drawing strength from Christ',
      'Annual re-baptism, formal renewal vows, and a renewed public testimony each year',
      'Financial giving to missions, attendance at baptism classes, and doctrinal exams',
      'Choosing godparents, selecting a baptism date, and preparing festive celebrations',
    ], answerIndex: 0 },
    'sac-013-would-you-under-any-circumstances-baptiz': { q: 'Would you baptize someone by immersion under any circumstances?', choices: [
      'Yes — there is no prohibition, though sprinkling is preferred and immersion unusual',
      'No — Scripture commands immersion alone, so sprinkling is actually invalid',
      'No — the Westminster Standards forbid immersion under any circumstance',
      'Yes — immersion is in fact the preferred method, not sprinkling',
    ], answerIndex: 0 },
    'sac-014-who-is-to-be-baptized-defend-your-answer': { q: 'Who is to be baptized, per this card?', choices: [
      'Professing believers and the infants of members of the visible church',
      'Only adults who have completed a full course of catechetical instruction',
      'Only infants, since adult conversion does not itself warrant baptism',
      'Anyone who requests it, regardless of any profession or church membership',
    ], answerIndex: 0 },

    'sac-015-how-would-you-deal-with-a-family-in-your': { q: 'How should a pastor respond to a family reluctant to have their child baptized?', choices: [
      'Approach humbly, discern their concerns, and patiently teach the covenant promises',
      'Refuse discussion, demand immediate compliance, and threaten discipline at once',
      'Agree at once, skip any conversation, and administer the baptism without delay',
      'Report the family, bypass the session, and refer the case straight to presbytery',
    ], answerIndex: 0 },
    'sac-016-does-baptism-actually-save-the-person-ba': { q: 'Does baptism itself save the person baptized, per this card?', choices: [
      'No — it is a means of grace received by faith and not the cause of salvation',
      'Yes — the water itself washes away sin apart from any prior faith',
      'Yes — but only when administered by full immersion rather than sprinkling',
      'No — baptism has no spiritual significance and functions as a bare formality',
    ], answerIndex: 0 },
    'sac-017-can-a-person-be-baptized-more-than-once': { q: 'Can a person be baptized more than once, per this card?', choices: [
      'Not ordinarily — unless the first baptism was not a valid Christian baptism',
      'Yes — a believer should be re-baptized whenever his faith feels renewed',
      'Yes — every change of congregation calls for a fresh Christian baptism',
      'No — not even a plainly invalid first baptism may ever be repeated',
    ], answerIndex: 0 },
    'sac-018-how-would-you-handle-a-request-for-bapti': { q: 'How should a pastor handle a baptism request from a previously baptized former theological liberal?', choices: [
      'Seek to understand their reasoning, and not re-baptize unless the first was not Christian',
      'Deny the request outright, since any prior baptism can never be reconsidered',
      'Grant the request automatically, since any doubt alone warrants re-baptism',
      'Refer the matter to the civil courts before any pastoral conversation occurs',
    ], answerIndex: 0 },
    'sac-019-how-would-you-handle-a-request-for-bapti': { q: 'How should a pastor handle a baptism request from a previously "baptized" Mormon?', choices: [
      'Baptize them in the name of the Trinity, since they lack a prior Christian baptism',
      'Decline, since a Mormon baptism already counts as a valid Christian baptism',
      'Wait for General Assembly to first rule on the case before proceeding',
      'Baptize them only if the request comes by immersion rather than sprinkling',
    ], answerIndex: 0 },
    'sac-020-what-is-the-meaning-of-the-lord-s-supper': { q: 'What is the meaning of the Lord’s Supper, per this card?', choices: [
      'A sign and seal of Christ’s death and a means of grace, uniting us to Him',
      'A civic meal that unites the congregation with the surrounding community',
      'A memorial only, carrying no spiritual benefit beyond remembrance',
      'A private devotional act, unrelated to the gathered worship of the church',
    ], answerIndex: 0 },
    'sac-021-what-happens-in-the-lord-s-supper': { q: 'Which view of the Lord’s Supper holds to Christ’s "real/spiritual presence" as a means of grace, more than a memorial?', choices: [
      'The Reformed view',
      'The Roman Catholic view',
      'The Lutheran view',
      'The Zwinglian view',
    ], answerIndex: 0 },
    'sac-022-is-christ-in-any-sense-present-in-the-lo': { q: 'Is Christ present in the Lord’s Supper, per this card?', choices: [
      'Yes — but not carnally, and with no change of substance in the elements',
      'No — Christ is bodily absent in every sense during the Supper',
      'Yes — His physical body becomes present in the bread and wine',
      'Yes — but only for those baptized, and only by full immersion',
    ], answerIndex: 0 },
    'sac-023-how-should-believers-celebrate-the-lord': { q: 'How should believers celebrate the Lord’s Supper, per this card?', choices: [
      'Discerning the Lord’s body, feeding on Him by faith, in repentance, love, and new obedience',
      'Fasting the entire day, remaining silent, and avoiding all conversation beforehand',
      'Standing rather than being seated, as a sign of readiness for Christ’s return',
      'Inviting only ordained officers to partake, with members observing quietly',
    ], answerIndex: 0 },
    'sac-024-how-is-fencing-the-table-practiced-durin': { q: 'How is "fencing the table" practiced during communion, per this card?', choices: [
      'Professing believers approved by session; the ignorant and scandalous are barred',
      'Every attendee, believer or not, is invited to partake without qualification',
      'Only ordained officers are permitted to receive the elements',
      'Attendance alone qualifies a person, regardless of any profession of faith',
    ], answerIndex: 0 },
    'sac-025-how-do-the-sacraments-agree-how-are-they': { q: 'How do baptism and the Lord’s Supper agree, per this card?', choices: [
      'God is the author and Christ the benefit, sealing one covenant until He returns',
      'Both use identical elements administered with the same frequency',
      'Both are administered once in a believer’s life, never to be repeated',
      'Neither requires a minister of the gospel to be validly administered',
    ], answerIndex: 0 },
    'sac-026-administration-of-baptism': { q: 'Per this card, what belongs to the administration of infant baptism?', choices: [
      'Reading the covenant promises, dedicating child and parents, and baptizing in the triune name',
      'Reading the Ten Commandments, examining the infant, and baptizing in the pastor’s name',
      'Singing a psalm, collecting a special offering, and baptizing without any prayer',
      'Interviewing the godparents alone, then baptizing without the congregation present',
    ], answerIndex: 0 },
    'sac-027-administrating-lord-s-supper': { q: 'Per this card, what belongs to administrating the Lord’s Supper?', choices: [
      'Explaining the institution, fencing the table, prayer, and distribution',
      'Collecting tithes, reading announcements, and distributing the elements silently',
      'Examining each communicant individually before distributing the elements',
      'Singing the doxology, then distributing the elements without further comment',
    ], answerIndex: 0 },

    // ── shorter_catechism ────────────────────────────────────────────────
    'wsc-1': { choices: [
      'To glorify God, and to enjoy him for ever',
      'To obey God’s law, and to inherit eternal life',
      'To love God, and to serve his church for ever',
      'To fear God, and to avoid his wrath for ever',
    ], answerIndex: 0 },
    'wsc-2': { choices: [
      'The word of God, contained in the Old and New Testament scriptures',
      'The traditions of the church, handed down through the ages',
      'The light of nature, discerned by reason within every man',
      'The decrees of councils, ratified by the assembled church',
    ], answerIndex: 0 },
    'wsc-3': { choices: [
      'What man is to believe concerning God, and what duty God requires of man',
      'What man is to know about creation, and what glory God deserves from man',
      'What man must do to earn merit, and what grace God bestows on man',
      'What man is to fear about judgment, and what mercy God shows to man',
    ], answerIndex: 0 },
    'wsc-89': { choices: [
      'The Spirit makes the reading, and especially the preaching, of the word effectual to convert sinners',
      'The church makes the reading, and especially the singing, of the word effectual to instruct sinners',
      'The minister makes the preaching, and especially the sacraments, effectual to comfort sinners',
      'The believer makes the hearing, and especially the memorizing, of the word effectual to reform sinners',
    ], answerIndex: 0 },
    'wsc-90': { choices: [
      'With diligence, preparation, and prayer, receiving it with faith and love, and practising it',
      'With haste, curiosity, and debate, receiving it with doubt and criticism, and forgetting it',
      'With reluctance, distraction, and silence, receiving it with fear and dread, and ignoring it',
      'With formality, memorization, and recitation, receiving it with pride, and displaying it',
    ], answerIndex: 0 },
    'wsc-4': { choices: [
      'A Spirit, infinite, eternal, and unchangeable in his being, wisdom, power, holiness, justice, and truth',
      'A being, finite in power but infinite in mercy, goodness, patience, and steadfast love',
      'A person, eternal and unchangeable in his justice, wrath, holiness, and righteous anger',
      'A spirit, unlimited in knowledge but limited in his power, wisdom, and providence',
    ], answerIndex: 0 },
    'wsc-5': { choices: [
      'There is but one only, the living and true God',
      'There are three, each equally living and true in nature',
      'There is one supreme, among many lesser spiritual beings',
      'There are two, one good and one evil, opposed eternally',
    ], answerIndex: 0 },
    'wsc-6': { choices: [
      'Three persons — Father, Son, and Holy Ghost — one God, equal in power and glory',
      'Three persons — Father, Son, and the Church — one God, equal in wisdom and truth',
      'Two persons — Father and Son alone — one God, equal in power and eternal glory',
      'Three persons — Father, Son, and the angels — one God, equal in holiness',
    ], answerIndex: 0 },
    'wsc-7': { choices: [
      'His eternal purpose, according to the counsel of his will, foreordaining whatsoever comes to pass',
      'His eternal mercy, according to the prayers of the saints, forestalling whatsoever comes to pass',
      'His eternal patience, according to the sins of men, forgiving whatsoever comes to pass',
      'His eternal justice, according to the works of men, rewarding whatsoever comes to pass',
    ], answerIndex: 0 },
    'wsc-8': { choices: [
      'In the works of creation and providence',
      'In the works of judgment and mercy',
      'In the works of law and gospel',
      'In the works of election and reprobation',
    ], answerIndex: 0 },
    'wsc-9': { choices: [
      'God’s making all things of nothing, by his word of power, in six days, all very good',
      'God’s making all things from existing matter, by his word of power, in six days, very good',
      'God’s making all things of nothing, by his angels’ labor, in six days, mostly good',
      'God’s making all things of nothing, by his word of power, in one day, all very good',
    ], answerIndex: 0 },
    'wsc-10': { choices: [
      'Male and female, after his own image, in knowledge, righteousness, and holiness, with dominion',
      'Male and female, after the angels’ image, in strength, courage, and wisdom, with dominion',
      'Male alone at first, after his own image, in knowledge, mercy, and patience, with dominion',
      'Male and female, after his own image, in beauty, strength, and glory, without dominion',
    ], answerIndex: 0 },
    'wsc-11': { choices: [
      'His most holy, wise, and powerful preserving and governing all his creatures and their actions',
      'His most holy, wise, and powerful creating and judging all his creatures and their sins',
      'His most gracious, patient, and merciful forgiving and restoring all his creatures and their falls',
      'His most just, holy, and powerful punishing and correcting all his creatures and their errors',
    ], answerIndex: 0 },
    'wsc-12': { choices: [
      'A covenant of life, upon condition of perfect obedience, forbidding him the tree on pain of death',
      'A covenant of grace, upon condition of persevering faith, forbidding him pride on pain of exile',
      'A covenant of works, upon condition of continual sacrifice, forbidding him idols on pain of curse',
      'A covenant of peace, upon condition of daily worship, forbidding him anger on pain of shame',
    ], answerIndex: 0 },
    'wsc-13': { choices: [
      'No — being left to the freedom of their own will, they fell by sinning against God',
      'Yes — being upheld by the strength of God’s grace, they never once sinned against him',
      'No — being deceived by an irresistible power, they could not help but sin against God',
      'Yes — being guided by their perfect knowledge, they resisted every temptation to sin',
    ], answerIndex: 0 },
    'wsc-14': { choices: [
      'Any want of conformity unto, or transgression of, the law of God',
      'Any want of knowledge concerning, or ignorance of, the will of God',
      'Any lack of feeling toward, or indifference to, the mercy of God',
      'Any failure to worship, or forgetfulness of, the name of God',
    ], answerIndex: 0 },
    'wsc-15': { choices: [
      'Their eating the forbidden fruit',
      'Their doubting of God’s promised word',
      'Their refusing to name the animals',
      'Their neglecting the garden’s upkeep',
    ], answerIndex: 0 },
    'wsc-16': { choices: [
      'Yes — the covenant was made with Adam for his posterity, so all descending from him sinned and fell in him',
      'No — the covenant was made with Adam alone, so only he personally sinned and fell by his own transgression',
      'Yes — the covenant was made with Eve for her posterity, so all descending from her sinned and fell in her',
      'No — the covenant was made with Adam for his descendants only if they too disobeyed the same command',
    ], answerIndex: 0 },
    'wsc-17': { choices: [
      'An estate of sin and misery',
      'An estate of fear and confusion',
      'An estate of shame and exile',
      'An estate of toil and sorrow',
    ], answerIndex: 0 },
    'wsc-18': { choices: [
      'The guilt of Adam’s first sin, the loss of original righteousness, and the corruption of our whole nature',
      'The guilt of our own first sin, the loss of angelic status, and the corruption of the created world',
      'The guilt of Eve’s first sin alone, the loss of Eden itself, and the corruption of the animal kingdom',
      'The guilt of unbelief only, the loss of common grace, and the corruption of civil government',
    ], answerIndex: 0 },
    'wsc-19': { choices: [
      'Lost communion with God, under his wrath and curse, and liable to miseries, death, and hell for ever',
      'Lost their inheritance on earth, under God’s silence and delay, liable to labor, sickness, and grief',
      'Lost their innocence before men, under society’s scorn and shame, liable to exile, poverty, and want',
      'Lost their access to Eden, under an angel’s watch and sword, liable to hunger, thirst, and toil',
    ], answerIndex: 0 },
    'wsc-20': { choices: [
      'No — of his mere good pleasure God elected some to life, entering a covenant of grace to save them',
      'Yes — of his strict justice God left all mankind to perish, reserving no covenant of grace for any',
      'No — of his foreseen approval God elected those who would freely choose him, granting them grace',
      'Yes — of his settled decree God abandoned all mankind, offering a covenant of works instead',
    ], answerIndex: 0 },
    'wsc-21': { choices: [
      'The Lord Jesus Christ, the eternal Son of God, who became man, God and man in one person for ever',
      'The archangel Michael, an exalted spirit, who took on flesh, angel and man in one nature for ever',
      'The prophet Moses, a chosen mediator, who received the law, man and lawgiver in one office for ever',
      'The Holy Spirit, the eternal breath of God, who indwells believers, God and church in one body for ever',
    ], answerIndex: 0 },
    'wsc-22': { choices: [
      'By taking a true body and a reasonable soul, conceived by the Holy Ghost in the Virgin Mary, yet without sin',
      'By taking the appearance of flesh only, formed by angelic power in a heavenly womb, yet without a soul',
      'By taking a glorified body at once, created directly from nothing, yet retaining no human soul',
      'By taking a borrowed body from Adam’s line, conceived by natural generation, yet inheriting no guilt',
    ], answerIndex: 0 },
    'wsc-23': { choices: [
      'A prophet, a priest, and a king, in both his humiliation and exaltation',
      'A teacher, a healer, and a judge, in both his ministry and his return',
      'A servant, a sacrifice, and a shepherd, in both his life and his death',
      'A witness, an advocate, and a ruler, in both his suffering and his glory',
    ], answerIndex: 0 },
    'wsc-24': { choices: [
      'By revealing to us, by his word and Spirit, the will of God for our salvation',
      'By offering to us, by his blood and cross, a sacrifice for our sins',
      'By subduing to us, by his power and rule, all our spiritual enemies',
      'By granting to us, by his grace and gifts, the offices of the church',
    ], answerIndex: 0 },
    'wsc-25': { choices: [
      'In once offering himself to satisfy divine justice, and in making continual intercession for us',
      'In once revealing the will of God to us, and in continually instructing us in his word',
      'In once conquering our enemies by force, and in continually ruling and defending us',
      'In once dying as an example to us, and in continually inspiring our good works',
    ], answerIndex: 0 },
    'wsc-26': { choices: [
      'In subduing us to himself, ruling and defending us, and restraining and conquering our enemies',
      'In teaching us his word, correcting our errors, and instructing us in doctrine and duty',
      'In interceding for us before the Father, pleading his blood, and securing our pardon',
      'In revealing to us God’s will, enlightening our minds, and convincing us of sin',
    ], answerIndex: 0 },
    'wsc-27': { choices: [
      'Being born in a low condition, made under the law, undergoing misery, wrath, and the cursed death of the cross',
      'Being born in royal splendor, exempt from the law, undergoing praise, honor, and a triumphant public welcome',
      'Being born of angels, made above the law, undergoing comfort, ease, and a painless earthly life',
      'Being born a mere man, made under Rome’s law, undergoing exile, poverty, and a quiet natural death',
    ], answerIndex: 0 },
    'wsc-28': { choices: [
      'Rising from the dead, ascending to heaven, sitting at the Father’s right hand, and coming to judge the world',
      'Remaining in the tomb, descending further into death, and awaiting a future resurrection at the end',
      'Appearing briefly to disciples, returning at once to the grave, and awaiting the Father’s further decree',
      'Rising in spirit only, remaining bodily in the earth, and sending the Spirit in his place forever',
    ], answerIndex: 0 },
    'wsc-29': { choices: [
      'By the effectual application of it to us by his Holy Spirit',
      'By the outward observance of the church’s sacraments alone',
      'By the natural inheritance of Adam’s original righteousness',
      'By the personal merit of our own good works and prayers',
    ], answerIndex: 0 },
    'wsc-30': { choices: [
      'By working faith in us, and thereby uniting us to Christ in our effectual calling',
      'By working fear in us, and thereby separating us from Christ until judgment',
      'By working knowledge in us, and thereby preparing us for a later calling',
      'By working sorrow in us, and thereby reminding us of Christ’s sufferings',
    ], answerIndex: 0 },
    'wsc-31': { choices: [
      'The Spirit’s work convincing us of sin, enlightening our minds, and persuading us to embrace Christ',
      'The Spirit’s work granting us wealth, enlightening our minds, and rewarding our embrace of virtue',
      'The church’s work convincing us of doctrine, enlightening our minds, and requiring our embrace of order',
      'The law’s work convincing us of guilt, enlightening our minds, and condemning our embrace of sin',
    ], answerIndex: 0 },
    'wsc-32': { choices: [
      'Justification, adoption, and sanctification, with the benefits that accompany or flow from them',
      'Glorification, perfection, and exaltation, with the rewards that accompany or flow from them',
      'Election, predestination, and reprobation, with the decrees that accompany or flow from them',
      'Baptism, confirmation, and ordination, with the offices that accompany or flow from them',
    ], answerIndex: 0 },
    'wsc-33': { choices: [
      'An act of free grace pardoning our sins and accepting us as righteous for Christ’s righteousness, by faith alone',
      'An act of free grace erasing our memory of sin and declaring us sinless in our own conduct, by works alone',
      'An act of free grace delaying our sins’ punishment and accepting us as probationary, by hope alone',
      'An act of free grace excusing our sins as inevitable and accepting us as blameless, by ignorance alone',
    ], answerIndex: 0 },
    'wsc-34': { choices: [
      'An act of free grace whereby we are received into the number and rights of the sons of God',
      'An act of free grace whereby we are exempted from the number and duties of the church',
      'An act of free grace whereby we are restored to the innocence and rights of unfallen Adam',
      'An act of free grace whereby we are promoted to the number and ranks of the holy angels',
    ], answerIndex: 0 },
    'wsc-35': { choices: [
      'The work of free grace renewing us in the whole man, enabling us to die unto sin and live unto righteousness',
      'The work of free grace renewing only our outward conduct, enabling us to avoid public scandal and shame',
      'The work of free grace renewing our legal standing, enabling us to appear righteous before other men',
      'The work of free grace renewing our physical bodies, enabling us to resist sickness and weakness',
    ], answerIndex: 0 },
    'wsc-36': { choices: [
      'Assurance of God’s love, peace of conscience, joy in the Holy Ghost, increase of grace, and perseverance',
      'Freedom from all temptation, exemption from all suffering, immediate glorification, and worldly comfort',
      'Public honor among men, increase of wealth, exemption from death, and freedom from all further trial',
      'Perfect sinlessness at once, complete knowledge of doctrine, and release from all further sanctification',
    ], answerIndex: 0 },
    'wsc-85': { choices: [
      'Faith in Jesus Christ and repentance unto life, with diligent use of the outward means of grace',
      'Perfect obedience to the law and daily sacrifice, with faithful attendance at the temple courts',
      'Sincere sorrow for sin and good intentions, with occasional prayer offered in times of need',
      'Strict fasting and self-denial and pilgrimage, with diligent giving of alms to the poor',
    ], answerIndex: 0 },
    'wsc-86': { choices: [
      'A saving grace whereby we receive and rest upon Christ alone for salvation, as offered in the gospel',
      'A saving grace whereby we receive and imitate Christ’s example for salvation, as taught in the law',
      'A saving grace whereby we receive and obey Christ’s commands for salvation, as required by the church',
      'A saving grace whereby we receive and admire Christ’s character for salvation, as shown in his miracles',
    ], answerIndex: 0 },
    'wsc-87': { choices: [
      'A saving grace whereby a sinner, sensing his sin and God’s mercy, turns from it unto God with new obedience',
      'A saving grace whereby a sinner, sensing his shame and men’s scorn, hides his sin from the gathered church',
      'A saving grace whereby a sinner, sensing his guilt and the law’s claim, resolves to earn his own pardon',
      'A saving grace whereby a sinner, sensing his weakness and fear, waits passively for a future assurance',
    ], answerIndex: 0 },
    'wsc-39': { choices: [
      'Obedience to his revealed will',
      'Assent to his hidden decrees',
      'Submission to the church’s rulers',
      'Agreement with every believer’s conscience',
    ], answerIndex: 0 },
    'wsc-82': { choices: [
      'No mere man since the fall can perfectly keep God’s commandments, but daily breaks them in thought, word, and deed',
      'Yes, every regenerate man since conversion can perfectly keep God’s commandments, without any remaining sin',
      'No mere man before the fall could perfectly keep God’s commandments, since even Adam was created imperfect',
      'Yes, some especially holy men throughout history have perfectly kept God’s commandments in this life',
    ], answerIndex: 0 },
    'wsc-83': { choices: [
      'No — some sins, by reason of several aggravations, are more heinous in God’s sight than others',
      'Yes — every sin carries an identical weight of guilt, regardless of circumstance, motive, or intent',
      'No — sins committed in ignorance are in fact more heinous than sins committed knowingly',
      'Yes — only sins committed publicly are heinous, while private sins carry no real guilt',
    ], answerIndex: 0 },
    'wsc-84': { choices: [
      'God’s wrath and curse, both in this life and in that which is to come',
      'God’s patient warning, both in this life and in that which is to come',
      'God’s temporary displeasure, resolved fully within this present life',
      'God’s silent disappointment, felt only within the sinner’s own conscience',
    ], answerIndex: 0 },
    'wsc-37': { choices: [
      'Their souls are made perfect in holiness and pass into glory; their bodies rest in the grave till the resurrection',
      'Their souls sleep in an unconscious state; their bodies are dissolved entirely and await new creation',
      'Their souls await a final purifying fire; their bodies rest in the grave until fully cleansed',
      'Their souls are made perfect at once; their bodies are raised immediately without any grave',
    ], answerIndex: 0 },
    'wsc-38': { choices: [
      'Raised in glory, openly acknowledged and acquitted in judgment, and made perfectly blessed for ever',
      'Raised in weakness, quietly acknowledged but not acquitted, and made partially blessed for a time',
      'Raised in mortal flesh, publicly examined before acquittal, and made blessed only after further trial',
      'Raised in spirit only, acknowledged privately by God alone, and made blessed apart from the body',
    ], answerIndex: 0 },
    'wsc-88': { choices: [
      'His ordinances, especially the word, sacraments, and prayer, effectual to the elect for salvation',
      'His providence, especially health, wealth, and peace, effectual to every person for salvation',
      'His creation, especially nature, conscience, and reason, effectual to the elect for salvation',
      'His angels, especially visions, dreams, and voices, effectual to the elect for salvation',
    ], answerIndex: 0 },
    'wsc-91': { choices: [
      'Not from any virtue in them or the administrator, but only by Christ’s blessing and the Spirit’s work in believers',
      'From an inherent virtue in the elements themselves, effectual regardless of the recipient’s own faith',
      'From the personal holiness of the minister administering them, effectual in proportion to his piety',
      'From the size and solemnity of the congregation gathered, effectual in proportion to public witness',
    ], answerIndex: 0 },
    'wsc-92': { choices: [
      'A holy ordinance instituted by Christ wherein sensible signs represent, seal, and apply the new covenant’s benefits',
      'A holy tradition developed by the church wherein spoken vows represent, seal, and apply membership’s privileges',
      'A holy custom inherited from Israel wherein written texts represent, seal, and apply the law’s requirements',
      'A holy ceremony devised by councils wherein solemn oaths represent, seal, and apply ordination’s authority',
    ], answerIndex: 0 },
    'wsc-93': { choices: [
      'Baptism, and the Lord’s supper',
      'Baptism, confirmation, and the Lord’s supper',
      'The Lord’s supper, and holy matrimony',
      'Baptism, and ordination to office',
    ], answerIndex: 0 },
    'wsc-94': { choices: [
      'Washing with water in the Trinity’s name, signifying our ingrafting into Christ and engagement to be the Lord’s',
      'Anointing with oil in the Father’s name, signifying our healing in Christ and engagement to serve the poor',
      'Washing with water in the minister’s name, signifying our membership and engagement to attend worship',
      'Sprinkling with ashes in the Spirit’s name, signifying our mourning and engagement to fast regularly',
    ], answerIndex: 0 },
    'wsc-95': { choices: [
      'Not to those outside the visible church till they profess faith, but to the infants of church members',
      'To every infant born within the nation, whether or not their parents belong to the visible church',
      'Only to adults who have completed years of catechetical instruction and public examination',
      'To any person who requests it, regardless of profession of faith or church membership',
    ], answerIndex: 0 },
    'wsc-96': { choices: [
      'Giving and receiving bread and wine, showing forth Christ’s death, and by faith partaking of his body and blood',
      'Giving and receiving bread alone, showing forth Christ’s birth, and by works partaking of his righteousness',
      'Giving and receiving wine alone, showing forth Christ’s ascension, and by hope partaking of his glory',
      'Giving and receiving bread and wine, showing forth Christ’s teaching, and by memory partaking of his words',
    ], answerIndex: 0 },
    'wsc-97': { choices: [
      'Self-examination of knowledge, faith, repentance, love, and new obedience, lest they eat and drink judgment',
      'Self-examination of wealth, status, family, and reputation, lest they appear unworthy before the church',
      'Public confession before the congregation of every sin committed since the last communion service',
      'A written testimony submitted to the session, verifying sound doctrine before every communion service',
    ], answerIndex: 0 },
    'wsc-98': { choices: [
      'An offering up of our desires to God for things agreeable to his will, with confession and thanksgiving',
      'An offering up of our achievements to God for public recognition, with pride and celebration',
      'An offering up of our questions to God for immediate answers, with impatience and demand',
      'An offering up of our silence to God for private meditation, without confession or petition',
    ], answerIndex: 0 },

    // ── hot_topics — Creation ────────────────────────────────────────────
    'ht-001-creation': { q: 'Per the 28th GA (2000) Creation Study Committee, what is the PCA’s position on creation views?', choices: [
      'Four views (Calendar-Day, Day-Age, Framework, Analogical Day) are acceptable, given full historicity',
      'Only the Calendar-Day (24-hour) view is acceptable, while Day-Age, Framework, and Analogical Day are ruled out',
      'Evolution is affirmed as compatible, provided a historical Adam and Eve is still held',
      'No study committee report exists, so each presbytery sets its own binding requirement',
    ], answerIndex: 0 },
    'ht-001a-24-hour-day': { q: 'Which creation theory reads Genesis 1 as sequential and literal, each “day” a literal 24 hours, with most supporters affirming a young earth?', choices: [
      'The 24-hour day view',
      'The Day-age view',
      'The Prior Creation view',
      'The Two-phase view',
    ], answerIndex: 0 },
    'ht-001b-day-age': { q: 'Which creation theory views creation as unfolding over six eras, treating “day” as “age”?', choices: [
      'The Day-age view',
      'The 24-hour day view',
      'The Literary approach view',
      'The Two-phase view',
    ], answerIndex: 0 },
    'ht-001c-literary-approach': { q: 'Which creation theory treats the seven-day sequence as a literary structure oriented toward Sabbath theology, saying nothing about time?', choices: [
      'The Literary approach view',
      'The Day-age view',
      'The Prior Creation view',
      'The 24-hour day view',
    ], answerIndex: 0 },
    'ht-001d-prior-creation': { q: 'Which creation theory suggests a previously created world existed before Genesis 1, absorbing most scientific ages while keeping Genesis 1’s days at 24 hours?', choices: [
      'The Prior Creation view',
      'The Two-phase view',
      'The Day-age view',
      'The Literary approach view',
    ], answerIndex: 0 },
    'ht-001e-two-phase': { q: 'Which creation theory holds that chapters 1 and 2 describe two distinct phases of creation, separated by a long gap between 2:3 and 2:4?', choices: [
      'The Two-phase view',
      'The Prior Creation view',
      'The 24-hour day view',
      'The Day-age view',
    ], answerIndex: 0 },
    'ht-001f-literary-framework-support': { q: 'What two lines of evidence support the Literary Framework view of creation, per this card?', choices: [
      'Days 1–3 (forming) parallel days 4–6 (filling), and the narrative lengths pair off, climaxing at days 3 and 6',
      'Days 1–3 (forming) parallel days 4–6 (filling), and the seventh day parallels the entire following chapter',
      'Days 1–3 (filling) parallel days 4–6 (forming), and the narrative lengths pair off, climaxing at days 1 and 4',
      'Days 1–3 record miracles while days 4–6 record ordinary providence, and the lengths pair off evenly',
    ], answerIndex: 0 },

    // ── hot_topics — Charismatic Gifts ───────────────────────────────────
    'ht-002-charismatic-gifts': { q: 'Per the PCA’s 1974 Pastoral Letter on the Holy Spirit, what is its position on spiritual gifts?', choices: [
      'A soft cessationism — the revelatory/sign gifts tied to the closed canon have ceased, though God still heals',
      'A strict continuationism — every gift, including new revelation, remains fully operative in the church today',
      'A hard cessationism — even physical healing in answer to prayer has entirely ceased in the present age',
      'An agnostic silence — the Assembly declined to state any position, leaving each session to decide alone',
    ], answerIndex: 0 },
    'ht-002a-cessationism': { q: 'Which view holds that the revelatory and sign gifts ceased with the close of the apostolic age and the completed canon?', choices: [
      'The cessationist view',
      'The continuationist view',
      'The open-but-cautious view',
      'The classic Pentecostal view',
    ], answerIndex: 0 },
    'ht-002b-continuationism': { q: 'Which view holds that all the spiritual gifts continue and are normative until Christ returns, with no NT text teaching their cessation?', choices: [
      'The continuationist view',
      'The cessationist view',
      'The open-but-cautious view',
      'The classic Pentecostal view',
    ], answerIndex: 0 },
    'ht-002c-open-but-cautious': { q: 'Which view holds that no text decisively proves the gifts have ceased, so one stays open to them while remaining cautious about charismatic excess?', choices: [
      'The open-but-cautious view',
      'The cessationist view',
      'The continuationist view',
      'The classic Pentecostal view',
    ], answerIndex: 0 },

    // ── hot_topics — The Regulative Principle of Worship ─────────────────
    'ht-003-regulative-principle': { q: 'Per WCF 21.1, how does the Regulative Principle state the limits of acceptable worship?', choices: [
      'God may not be worshiped according to human imagination, but only in ways prescribed in Holy Scripture',
      'God may be worshiped in any way that does not directly contradict Scripture’s explicit commands',
      'God may be worshiped according to the customs of each culture, so long as they honor Christ sincerely',
      'God may be worshiped in any way commended by church tradition, provided Scripture does not forbid it',
    ], answerIndex: 0 },
    'ht-003a-regulative': { q: 'Which principle of worship distinguishes fixed “elements” (commanded by Scripture) from “circumstances” (ordered by Christian prudence), permitting only what Scripture warrants?', choices: [
      'The regulative principle',
      'The normative principle',
      'The Roman Catholic principle',
      'The pragmatic principle',
    ], answerIndex: 0 },
    'ht-003b-normative': { q: 'Which principle of worship permits whatever Scripture does not forbid, giving the church liberty to add edifying forms not commanded?', choices: [
      'The normative principle',
      'The regulative principle',
      'The Roman Catholic principle',
      'The pragmatic principle',
    ], answerIndex: 0 },

    // ── hot_topics — The Sabbath / Lord’s Day ─────────────────────────────
    'ht-004-sabbath': { q: 'What does semisabbatarianism hold, as distinct from strict/literal sabbatarianism, per this card?', choices: [
      'The same demands as strict sabbatarianism, but transferred from the seventh day to the first day of the week',
      'Looser demands than strict sabbatarianism, permitting ordinary labor on Sunday if one attends worship',
      'The same demands as strict sabbatarianism, but transferred from the first day to a floating weekday',
      'No demands at all beyond attending worship once a month, however the calendar happens to fall',
    ], answerIndex: 0 },
    'ht-004a-puritan': { q: 'Which view holds the fourth commandment is moral and perpetual, requiring rest from recreations as well as work on the Lord’s Day?', choices: [
      'The Puritan / Westminster view',
      'The Continental Reformed view',
      'The non-Sabbatarian (fulfillment) view',
      'The seventh-day (Saturday) Sabbatarian view',
    ], answerIndex: 0 },
    'ht-004b-continental': { q: 'Which view honors the Lord’s Day for worship and rest, but treats its ceremonial Old-Covenant specifics as fulfilled in Christ, without a strict ban on recreations?', choices: [
      'The Continental Reformed view',
      'The Puritan / Westminster view',
      'The non-Sabbatarian (fulfillment) view',
      'The seventh-day (Saturday) Sabbatarian view',
    ], answerIndex: 0 },
    'ht-004c-fulfillment': { q: 'Which view holds the weekly Sabbath was a ceremonial shadow fulfilled and abrogated in Christ, so no particular day binds the conscience?', choices: [
      'The non-Sabbatarian (fulfillment) view',
      'The Puritan / Westminster view',
      'The Continental Reformed view',
      'The seventh-day (Saturday) Sabbatarian view',
    ], answerIndex: 0 },

    // ── hot_topics — Role of Women, Re-Baptism, Theonomy, Civil Disobedience ─
    'ht-005-role-of-women-in-the-church': { q: 'Per this card, on what ground does Scripture restrict the office of elder to men?', choices: [
      'The creation order — Adam was formed first, and Eve’s leading him into sin reversed that order',
      'Cultural custom only — first-century propriety, with no abiding creation-order rationale given',
      'Intellectual capacity — women are said to lack the reasoning ability required to teach sound doctrine',
      'Physical strength — women are said to lack the bodily stamina required to defend the flock',
    ], answerIndex: 0 },
    'ht-006-re-baptism': { q: 'Per the PCA’s baptism position paper, should someone baptized as an infant by parents later judged to lack a credible profession be re-baptized?', choices: [
      'No — they have nevertheless received Christian baptism and ought not to be re-baptized',
      'Yes — a credible profession by the parents is required for the baptism to have been valid at all',
      'Yes — but only if the parents themselves later come to a credible profession of faith',
      'No — but the child must still be formally received back into full membership by profession',
    ], answerIndex: 0 },
    'ht-006a-broad-validity': { q: 'Which view holds a baptism is valid if it has water, the Trinitarian name, and intent to seal union with Christ — so even Roman Catholic baptism counts and should not be repeated?', choices: [
      'The broad view (Hodge / Old Princeton)',
      'The narrow view (Thornwell)',
      'The Landmark (Baptist) view',
      'The Orthodox “economy” view',
    ], answerIndex: 0 },
    'ht-006b-narrow-validity': { q: 'Which view holds that Rome’s apostasy voids its “baptism” entirely, so a convert’s Trinitarian baptism in a true church is a first baptism, not a re-baptism?', choices: [
      'The narrow view (Thornwell)',
      'The broad view (Hodge / Old Princeton)',
      'The Landmark (Baptist) view',
      'The Orthodox “economy” view',
    ], answerIndex: 0 },
    'ht-007-theonomy': { q: 'Per this card’s critique, what is the main problem with theonomy’s use of the Old Testament judicial law?', choices: [
      'It overemphasizes continuity between the covenants, though Israel was uniquely God’s chosen nation',
      'It overemphasizes discontinuity between the covenants, ignoring that Israel’s laws still bind Gentiles',
      'It rightly applies every penal sanction literally, since Paul confirms stoning in 1 Corinthians 5',
      'It correctly treats America as a New Israel, since Deuteronomy 7:6 addresses all Christian nations',
    ], answerIndex: 0 },
    'ht-007a-theonomy': { q: 'Which view holds the Old Testament judicial law, including its penal sanctions, remains morally binding on civil governments unless the New Testament abrogates it?', choices: [
      'The theonomic / reconstructionist view',
      'The general equity (confessional) view',
      'The two-kingdoms (natural-law) view',
      'The Anabaptist (separatist) view',
    ], answerIndex: 0 },
    'ht-007b-general-equity': { q: 'Which view (WCF 19.4) holds Israel’s judicial laws expired with that body politic, binding modern states now only in their “general equity”?', choices: [
      'The general equity (confessional) view',
      'The theonomic / reconstructionist view',
      'The two-kingdoms (natural-law) view',
      'The Anabaptist (separatist) view',
    ], answerIndex: 0 },
    'ht-008-civil-disobedience': { q: 'Per this card, when does a Christian’s duty shift from obeying the state to disobeying it?', choices: [
      'When the state commands what God forbids, our duty is to obey God rather than the authorities',
      'When the state’s laws seem unwise, our duty is to organize peaceful protest against the authorities',
      'When the state’s leaders lack personal godliness, our duty is to withdraw all civic cooperation',
      'When the state’s taxes seem unjust, our duty is to withhold payment until laws are reformed',
    ], answerIndex: 0 },

    // ── hot_topics — Paedo-Communion ──────────────────────────────────────
    'ht-009-paedo-communion': { q: 'Per Murray’s argument (cited on this card), why is the Passover-infant analogy for paedocommunion weak?', choices: [
      'There is no evidence infants took the Passover, and its diet was hardly suitable for them',
      'There is clear evidence infants took the Passover, but only ate a specially prepared portion',
      'The Passover was open to any onlooker regardless of age, so the analogy proves too much',
      'The Passover required years of prior fasting, which infants obviously could not perform',
    ], answerIndex: 0 },
    'ht-009a-paedocommunion': { q: 'Which view holds covenant children should be admitted to the Lord’s Supper from infancy, without a separate profession of faith?', choices: [
      'The paedocommunion view',
      'The PCA / “discerning the body” view',
      'The Baptist (credobaptist) view',
      'The Roman Catholic “age of reason” view',
    ], answerIndex: 0 },
    'ht-009b-discerning': { q: 'Which view holds the Supper is only for those able to examine themselves and discern the Lord’s body, so children commune only after a session-examined profession?', choices: [
      'The PCA / “discerning the body” view',
      'The paedocommunion view',
      'The Baptist (credobaptist) view',
      'The Roman Catholic “age of reason” view',
    ], answerIndex: 0 },

    // ── hot_topics — Divorce & Remarriage ──────────────────────────────────
    'ht-010-divorce-and-remarriage': { q: 'Per this card, when is remarriage permitted?', choices: [
      'Only after a spouse’s death or a biblically justified divorce, and not for the offending party',
      'After any divorce for any reason, so long as both former spouses eventually consent',
      'Only after a spouse’s death, since Scripture permits no remarriage following any divorce',
      'After a biblically justified divorce, even for the offending party, if genuinely repentant',
    ], answerIndex: 0 },
    'ht-010a-no-remarriage': { q: 'Which view holds the marriage bond is dissolved only by death, so remarriage while a divorced spouse lives is adultery, even after a permitted separation?', choices: [
      'The permanence / no-remarriage view',
      'The Westminster (adultery & desertion) view',
      'The expanded-grounds (constructive desertion) view',
      'The loose (no-fault) view',
    ], answerIndex: 0 },
    'ht-010b-westminster': { q: 'Which view (WCF 24.5-6) holds the innocent party may divorce and remarry on two grounds — adultery and irremediable willful desertion?', choices: [
      'The Westminster (adultery & desertion) view',
      'The permanence / no-remarriage view',
      'The expanded-grounds (constructive desertion) view',
      'The loose (no-fault) view',
    ], answerIndex: 0 },
    'ht-010c-abuse': { q: 'Which view reads “desertion” broadly to include grave abuse or willful non-support that effectively deserts the marriage, freeing the innocent party?', choices: [
      'The expanded-grounds (constructive desertion) view',
      'The permanence / no-remarriage view',
      'The Westminster (adultery & desertion) view',
      'The loose (no-fault) view',
    ], answerIndex: 0 },

    // ── hot_topics — Confessional Subscription ─────────────────────────────
    'ht-011-confessional-subscription': { q: 'Per BCO 21-5’s ordination vow, what must a candidate do if he later finds himself out of accord with a fundamental of the system of doctrine?', choices: [
      'On his own initiative, make known to his presbytery the change that has taken place in his views',
      'Resign his office immediately, without any further hearing before his presbytery',
      'Say nothing unless directly asked, since the vow only binds him at the moment of ordination',
      'Publish his change of views openly before the whole denomination for public debate',
    ], answerIndex: 0 },
    'ht-011a-strict': { q: 'Which view of subscription requires the officer to affirm every doctrine and proposition of the Westminster Standards, with no exceptions?', choices: [
      'Strict subscription',
      'Good-faith subscription',
      'System subscription',
      'Loose subscription',
    ], answerIndex: 0 },
    'ht-011b-good-faith': { q: 'Which view — the PCA’s adopted practice since 2002 — has the candidate state his differences for the court to judge as none, merely semantic, or an allowable exception?', choices: [
      'Good-faith subscription',
      'Strict subscription',
      'System subscription',
      'Loose subscription',
    ], answerIndex: 0 },
    'ht-011c-system': { q: 'Which view has the officer subscribe to the “system of doctrine” as a whole rather than to every individual proposition, allowing scruples on non-essentials?', choices: [
      'System subscription',
      'Strict subscription',
      'Good-faith subscription',
      'Loose subscription',
    ], answerIndex: 0 },
    'ht-011d-loose': { q: 'Which view — rejected by the PCA as tending toward latitudinarianism — has the officer subscribe only to the Standards’ general substance or spirit, with wide latitude?', choices: [
      'Loose subscription',
      'Strict subscription',
      'Good-faith subscription',
      'System subscription',
    ], answerIndex: 0 },

    // ── hot_topics — Fencing the Lord’s Table ──────────────────────────────
    'ht-012-fencing-the-lord-s-table': { q: 'Per BCO 58-4b (settled at the 1993 GA), what must the pre-Supper warning require of communicants?', choices: [
      'That they be enrolled as members of an evangelical church, not merely a profession of the true religion',
      'That they be examined individually by the session before every celebration of the Supper',
      'That they be members of the local PCA congregation specifically, not any evangelical church',
      'That they simply make a public profession of faith, regardless of any church membership',
    ], answerIndex: 0 },
    'ht-012a-open': { q: 'Which practice admits any professing Christian who examines himself, without any church-membership requirement?', choices: [
      'Open communion',
      'Close communion',
      'Closed communion',
      'Paedocommunion',
    ], answerIndex: 0 },
    'ht-012b-close': { q: 'Which practice — the PCA’s ordinary practice — admits communicants in good standing of any evangelical church, fenced by invitation and warning rather than by interviewing visitors?', choices: [
      'Close communion',
      'Open communion',
      'Closed communion',
      'Paedocommunion',
    ], answerIndex: 0 },
    'ht-012c-closed': { q: 'Which practice restricts admission to members of the local congregation or denomination, requiring visitors to be approved by the session beforehand?', choices: [
      'Closed communion',
      'Open communion',
      'Close communion',
      'Paedocommunion',
    ], answerIndex: 0 },

    // ── hot_topics — post-1993 GA committee topics ────────────────────────
    'ht-016-women-in-office': { q: 'Per BCO 7-2, who may be ordained as ruling elder, teaching elder, or deacon in the PCA?', choices: [
      'Qualified men only, though a Session may appoint men and women as unordained assistants to the deacons',
      'Qualified men and women equally, since BCO 9-7 opened all three offices to both sexes',
      'Qualified men only, with no provision anywhere in the BCO for women’s service of any kind',
      'Qualified women only for deacon, while elder remains restricted to qualified men alone',
    ], answerIndex: 0 },
    'ht-017-christian-nationalism': { q: 'Per the PCA’s Ad Interim Committee’s interim report (2026), what does it uphold regarding church and state?', choices: [
      'The spirituality of the church — church and state are distinct spheres, so the church does not wield the sword',
      'A fusion of church and state — the civil magistrate should enforce the church’s doctrinal standards',
      'A strict separation with no address to the state at all, even in cases the Standards call extraordinary',
      'An endorsement of ethnic nationalism, provided it is tempered by broadly Christian civic values',
    ], answerIndex: 0 },
    'ht-018-racism': { q: 'What did the PCA’s 44th GA (2016) Overture 43 do?', choices: [
      'Confessed and repented of corporate historical sins of the civil-rights era, such as segregating worship',
      'Declined any corporate confession, referring the matter instead to individual congregations',
      'Commended the church’s civil-rights-era record as a faithful application of biblical principle',
      'Postponed any statement pending a further decade of study by a new committee',
    ], answerIndex: 0 },
    'ht-019-human-sexuality': { q: 'Per the Ad Interim Committee on Human Sexuality’s Twelve Statements, how should believers regard same-sex attraction?', choices: [
      'As an expression of indwelling sin to be repented of and mortified, not a neutral identity',
      'As a morally neutral orientation, provided it is never acted upon in practice',
      'As a unique calling to celibate “Side B” partnership within the church’s fellowship',
      'As a matter left entirely to each officer’s private conscience, without any confessional guidance',
    ], answerIndex: 0 },
    'ht-020-domestic-abuse': { q: 'Per the Ad Interim Committee on Domestic Abuse and Sexual Assault, what may abuse-driven abandonment constitute?', choices: [
      'Biblical desertion (1 Cor 7:15), which may furnish grounds for divorce',
      'Merely a private pastoral matter, never grounds for divorce under any circumstance',
      'Automatic grounds for immediate excommunication of the abusive spouse alone',
      'A civil matter only, outside the concern or jurisdiction of the church courts',
    ], answerIndex: 0 },
    'ht-021-federal-vision': { q: 'What did the PCA’s 35th GA (2007) do regarding the Federal Vision report?', choices: [
      'Adopted nine declarations upholding justification by faith alone and Christ’s imputed righteousness',
      'Declined to adopt any declarations, leaving the questions open to each presbytery',
      'Adopted the Federal Vision’s covenant theology as an allowable exception to the Standards',
      'Postponed judgment, referring the whole matter back for a decade of further study',
    ], answerIndex: 0 },
    'ht-022-insider-movements': { q: 'What does the PCA’s “A Call to Faithful Witness” require of Bible translation?', choices: [
      'Preserving the literal familial terms “Father” and “Son” for the persons of the Trinity',
      'Preferring non-familial terms for “Father” and “Son” to avoid offense among Muslim readers',
      'Leaving the choice of familial or non-familial terms to each individual translator’s judgment',
      'Requiring converts to abandon their birth religious community before any Bible translation is used',
    ], answerIndex: 0 },

    // ── hot_topics — Reference Lists ───────────────────────────────────────
    'ht-013-what-were-created-on-the-seven-day': { q: 'On the seven days of creation, what happens on Day 4, per this card?', choices: [
      'The light bearers — sun, moon, and stars — are created, filling what Day 1 had formed',
      'Light and darkness are separated, forming what Day 4 would later come to fill',
      'Birds of the air, fish of the seas, and every water creature are created, filling what Day 2 had formed',
      'Land creatures and humankind are created, filling what Day 3 had formed',
    ], answerIndex: 0 },
    'ht-014-ten-plagues-exodus-7-12': { q: 'Which of the ten plagues (Exodus 7–12) left the Israelites in light while Egypt lay in darkness?', choices: [
      'The plague of darkness',
      'The plague of hail',
      'The plague on livestock',
      'The plague of boils',
    ], answerIndex: 0 },
    'ht-015a-kings-of-israel': { q: 'Which dynasty ruled Israel the longest, per this card — spanning Jehu through Zechariah?', choices: [
      'The house of Jehu',
      'The house of Omri',
      'The house of Jeroboam',
      'The house of Menahem',
    ], answerIndex: 0 },
    'ht-015b-kings-of-judah': { q: 'Which two kings of Judah does this card mark “G” (godly), unlike most others marked “B”?', choices: [
      'Hezekiah and Josiah',
      'Asa and Jehoshaphat',
      'Uzziah and Jotham',
      'Manasseh and Amon',
    ], answerIndex: 0 },
  };
  global.PCA_CARD_QUIZ = Object.assign(global.PCA_CARD_QUIZ || {}, Q);
})(typeof window !== 'undefined' ? window : globalThis);
