// PCA Ordination & Licensure Study — BCO governance (paraphrase).
//
// Hand-authored sub-decks that fill governance areas a minister must know
// which the original 74-card deck leaves sparse: the three courts in detail,
// how the General Assembly works, subscription, membership, and worship
// practice. The BCO itself is copyrighted, so every answer here is a
// PARAPHRASE keyed to the current BCO chapter numbers — the reference chips
// link to the official text at pcaac.org; always verify wording there.
// Loads after js/data/subjects/bco.js and appends sub-decks to that subject.
(function (global) {
  const SETS = {
    'bco-gov-courts': {
      label: 'Courts & Governance in Practice',
      subject: 'bco',
      order: 5,
      cards: [
        {
          id: 'bco-gov-001-session',
          q: 'Who makes up the Session of a particular church, and what are its chief duties?',
          a: 'The Session consists of the pastor (and any associate pastors) together with the ruling elders of the church.\nIts chief duties include:\n- maintaining the spiritual government of the congregation\n- receiving, dismissing, and exercising discipline over members\n- overseeing the worship of the church (including admission to the sacraments)\n- training and examining officer nominees and overseeing the diaconate\n- appointing representatives to the higher courts\nNote: paraphrase — see the chapter on the Session for the full enumeration.',
          summary: 'The pastor (and any associates) plus the ruling elders. Duties (BCO 12):\n- The spiritual government of the congregation\n- Receiving, dismissing, and disciplining members\n- Overseeing worship and admission to the sacraments\n- Training and examining officer nominees; overseeing the diaconate\n- Appointing representatives to the higher courts',
          refs: ['BCO 12'],
        },
        {
          id: 'bco-gov-002-session-moderator',
          q: 'Who moderates the Session, and what happens when a church has no pastor?',
          a: 'The pastor is the moderator of the Session by virtue of office. When a church is without a pastor, the Session meets with a moderator arranged under presbytery oversight (for example, a minister appointed or invited for that purpose), so that the congregation never lacks lawful church government.\nNote: paraphrase — see BCO 12 for the precise provisions.',
          refs: ['BCO 12'],
        },
        {
          id: 'bco-gov-003-presbytery-composition',
          q: 'Who makes up a Presbytery?',
          a: 'A Presbytery consists of all the teaching elders within its bounds together with ruling elders representing the Sessions of its churches. It is a regional court: the churches of a defined geographic area joined for government, mission, and mutual accountability.',
          refs: ['BCO 13'],
        },
        {
          id: 'bco-gov-004-presbytery-powers',
          q: 'What are the chief powers of the Presbytery?',
          a: 'The Presbytery has oversight of ministers and churches in its bounds. In paraphrase, it has power to:\n- receive, care for, examine, license, ordain, install, transfer, judge, and (when necessary) remove teaching elders and candidates\n- organize, receive, divide, unite, visit, and dissolve churches\n- establish and dissolve pastoral relations\n- review the records of Sessions and redress whatever they have done contrary to order\n- condemn erroneous opinions that injure the purity or peace of the church\n- carry out appellate and judicial responsibilities under the Rules of Discipline',
          refs: ['BCO 13'],
        },
        {
          id: 'bco-gov-005-ga-nature',
          q: 'What is the General Assembly, and who composes it?',
          a: 'The General Assembly is the highest court of the PCA, representing in one body all the churches of the denomination. It is composed of commissioners — teaching elders and ruling elders sent from the presbyteries — and it meets annually.\nIt bears the marks of Presbyterianism at the widest level: connectional review, common standards, and shared mission, while remembering that church power everywhere remains only ministerial and declarative.',
          refs: ['BCO 14', 'BCO 3-1'],
        },
        {
          id: 'bco-gov-006-ga-work',
          q: 'How does the General Assembly carry out its work between and during meetings?',
          a: 'The Assembly works through:\n- **Committees of Commissioners** and **permanent Committees and Agencies** (e.g. for missions, administration, publications), which prepare and execute the Assembly\'s business\n- **judicial business**, which is referred to the Standing Judicial Commission\n- **overtures** from lower courts, which bring proposals and constitutional questions to the floor\nThe Assembly is a court, not a head: it has no power to bind the conscience beyond the Word, and its acts take constitutional effect only through the processes the BCO prescribes.',
          refs: ['BCO 14'],
        },
        {
          id: 'bco-gov-007-sjc',
          q: 'What is the Standing Judicial Commission (SJC)?',
          a: 'The SJC is a permanent commission of the General Assembly, composed of equal numbers of teaching and ruling elders, to which the Assembly commits its judicial cases (appeals and complaints arising from the presbyteries). Its decisions are rendered in the name of the Assembly under the procedures of the Rules of Discipline and its manual.\nNote: paraphrase — see BCO 15 for composition and the operating rules.',
          refs: ['BCO 15'],
        },
        {
          id: 'bco-gov-008-records-review',
          q: 'How does "review and control" actually operate among the courts?',
          a: 'Every court above a lower court reviews its records: Sessions submit their minutes to Presbytery, and Presbyteries submit theirs to the General Assembly, ordinarily every year. The higher court examines whether the proceedings were correct, prudent, and constitutional, and may order redress of anything done contrary to order. Review and control is the ordinary, non-judicial way the connectional church guards order — distinct from judicial process.',
          refs: ['BCO 40'],
        },
        {
          id: 'bco-gov-009-paths-to-ga',
          q: 'By what avenues can a matter come before a higher court?',
          a: '1. **Review and control** — the routine examination of a lower court\'s records\n2. **Reference** — a lower court asks the higher court for advice or to take a matter up\n3. **Appeal** — a party in a judicial case carries the case up after judgment\n4. **Complaint** — a member of the court (or one subject to it) alleges that a court\'s action (not a judicial judgment) was in error\n5. **Overture** — a lower court formally proposes action (including constitutional amendment) to the higher court',
          refs: ['BCO 40', 'BCO 41', 'BCO 42', 'BCO 43'],
        },
        {
          id: 'bco-gov-010-organizing-church',
          q: 'How is a new PCA church organized?',
          a: 'Through the Presbytery. Typically:\n1. The Presbytery (often through its church-planting work or an evangelist) gathers a **mission church**, which is governed under the Presbytery\'s oversight rather than by its own Session\n2. When the congregation is ready, it petitions the Presbytery to be **organized (particularized)** as a particular church\n3. The Presbytery\'s commission organizes it: members are enrolled, officers are elected and ordained, and the church assumes self-government under its own Session',
          refs: ['BCO 5'],
        },
        {
          id: 'bco-gov-011-evangelist',
          q: 'What is an evangelist in the BCO, and what unusual powers may he be given?',
          a: 'An evangelist is a teaching elder sent to preach the gospel and gather churches where there are none (church planting, missions). Because a mission church has no Session, the Presbytery may commission the evangelist with extraordinary powers for that work — in paraphrase: to receive and dismiss members, to train, examine, and (with the commission) ordain ruling elders and deacons for the new church, and to administer the sacraments there.',
          refs: ['BCO 8-6', 'BCO 5'],
        },
        {
          id: 'bco-gov-012-congregation-business',
          q: 'What business belongs to the congregation itself (rather than to the Session)?',
          a: 'Matters the BCO reserves to congregational vote, chiefly:\n- calling a pastor\n- electing ruling elders and deacons\n- matters touching the church\'s property\n- petitioning to be organized, or other matters the BCO assigns to the congregation\nEverything else in the spiritual government of the church belongs to the Session. A congregational meeting acts only on business properly before it.',
          refs: ['BCO 25'],
        },
      ],
    },
    'bco-gov-ministry': {
      label: 'Ministers, Members & Worship in Practice',
      subject: 'bco',
      order: 6,
      cards: [
        {
          id: 'bco-gov-013-subscription',
          q: 'What is "good faith" subscription, and how does a court handle a candidate\'s stated differences with the Standards?',
          a: 'Officers vow that they sincerely receive and adopt the Confession and Catechisms as containing the system of doctrine taught in Scripture. A candidate must state any differences he has with the Standards, and the court (not the candidate) judges each difference — in paraphrase, whether it is:\n1. merely semantic\n2. more than semantic but not out of accord with any fundamental of the system of doctrine\n3. out of accord — hostile to the system or striking at the vitals of religion\nOnly differences the court judges acceptable may be held, and the court records its judgment.',
          refs: ['BCO 21-4'],
        },
        {
          id: 'bco-gov-014-membership-vows',
          q: 'Summarize the five membership vows.',
          a: 'In paraphrase, the person professing faith acknowledges and promises:\n1. that he is a sinner before God, justly deserving His displeasure, and without hope except in His sovereign mercy\n2. that he receives and rests upon the Lord Jesus Christ alone for salvation as He is offered in the gospel\n3. that, relying on the Holy Spirit, he resolves to live as becomes a follower of Christ\n4. that he will support the church in its worship and work to the best of his ability\n5. that he submits himself to the government and discipline of the church, and promises to study its purity and peace',
          refs: ['BCO 57-5'],
        },
        {
          id: 'bco-gov-015-reception-modes',
          q: 'In what ways may a person be received into church membership?',
          a: '1. **Profession of faith** — taking the membership vows (with baptism if not already baptized)\n2. **Reaffirmation of faith** — for those previously professing believers without a valid transfer\n3. **Transfer** — by letter of dismission from another church of like faith and practice\nThe Session examines and receives in every case; covenant children are non-communing members by baptism and come to the Table upon a credible profession before the Session.',
          refs: ['BCO 57', 'BCO 46'],
        },
        {
          id: 'bco-gov-016-restoration',
          q: 'How is a censured person restored?',
          a: 'Discipline aims at restoration, and the Rules of Discipline provide for it: upon evidence of repentance, the court that imposed the censure removes it — admonition and suspension are lifted, and even the excommunicated or deposed may be restored by the court, with appropriate public acknowledgment where the offense was public. Restoration, like censure, is a judicial act of the court, done in the name of Christ.',
          refs: ['BCO 37'],
        },
        {
          id: 'bco-gov-017-without-process',
          q: 'When may a court act in a disciplinary matter without full judicial process?',
          a: 'Chiefly when the person **confesses**: if an offender comes forward and makes voluntary confession, the court may pronounce censure without the formality of a trial (the case is "without process"). The Rules also handle related situations — such as a member or minister who seeks to withdraw to escape discipline — by prescribed actions rather than trial.\nNote: paraphrase — see BCO 38 for the specific cases.',
          refs: ['BCO 38'],
        },
        {
          id: 'bco-gov-018-officer-censures',
          q: 'Which church censures apply only to officers?',
          a: 'Suspension **from office** and **deposition** (removal from office) apply only to officers, since they concern the exercise of office rather than church membership. The censures touching all members are admonition, suspension from the sacraments, and excommunication. An officer may be subject to both kinds: e.g. deposed from office and also suspended from the Lord\'s Table.',
          refs: ['BCO 30'],
        },
        {
          id: 'bco-gov-019-baptism-admin',
          q: 'How is baptism to be administered according to the Directory?',
          a: 'In paraphrase:\n- baptism is administered by a **minister of the Word**, ordinarily in the presence of the congregation in public worship\n- it is not to be unnecessarily delayed for covenant children, nor administered privately as a habit\n- the minister instructs the congregation in its meaning; parents take the baptismal vows for their children\n- it is administered with water, without superstition about the mode',
          refs: ['BCO 56'],
        },
        {
          id: 'bco-gov-020-marriage',
          q: 'What does the BCO teach about marriage and the minister\'s role in it?',
          a: 'Marriage is between **one man and one woman** — in the PCA this definition carries constitutional force. Beyond that, in paraphrase:\n- marriage is both a civil contract and, for Christians, to be solemnized "in the Lord"\n- a minister is not obligated to solemnize any particular marriage; he acts with discretion and under the Word\n- ministers should give prior instruction to those they marry',
          refs: ['BCO 59'],
        },
        {
          id: 'bco-gov-021-dfw-authority',
          q: 'Which parts of the Directory for Worship are constitutionally binding today?',
          a: 'The Directory as a whole is an approved guide with the force of sound counsel, but specific parts carry **full constitutional authority**: the chapters on the administration of baptism, profession of faith, and the Lord\'s Supper (BCO 56–58), and the provision defining marriage as between one man and one woman in BCO 59.\nNote: this updates older study materials that listed only 56–58 — verify the current scope in the BCO\'s preface to the Directory.',
          refs: ['BCO 56', 'BCO 57', 'BCO 58', 'BCO 59'],
        },
        {
          id: 'bco-gov-022-out-of-bounds',
          q: 'May a teaching elder labor outside the church or outside his presbytery\'s bounds?',
          a: 'Yes, but only under presbytery authority: a minister\'s call and labors are subject to his presbytery\'s approval, and one laboring outside the bounds of his presbytery (or in a work not under its jurisdiction, e.g. certain chaplaincies or parachurch ministries) does so with its permission and under its continued oversight and review.',
          refs: ['BCO 13', 'BCO 20'],
        },
        {
          id: 'bco-gov-023-deacon-assistants',
          q: 'May persons who are not ordained deacons assist in the work of mercy? May a church be without deacons?',
          a: 'Yes on both counts, in paraphrase:\n- the Session may select **godly men and women** of the congregation to assist the deacons in caring for the sick, the widows, the orphans, and the poor — assistance is service, not ordained office\n- where there are no deacons (or none can yet be elected), their duties devolve upon the **ruling elders / the Session** until deacons can be provided',
          refs: ['BCO 9'],
        },
      ],
    },
  };

  const data = (global.PCA_DATA = global.PCA_DATA || { subjects: [], sets: {} });
  Object.assign(data.sets, SETS);
  const subj = data.subjects.find(s => s.id === 'bco');
  if (subj) {
    for (const k of Object.keys(SETS)) {
      if (!subj.setKeys.includes(k)) subj.setKeys.push(k);
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
