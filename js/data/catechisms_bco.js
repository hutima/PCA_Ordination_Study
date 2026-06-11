// PCA Ordination & Licensure Study — BCO key points for memorization.
//
// Hand-authored PARAPHRASES of the Book of Church Order (the BCO itself is
// copyrighted, so nothing here is verbatim) registered as a third set in the
// Catechisms/memorization module's dropdown. Each item is a crisp Q→A for
// recall drill, keyed to current BCO chapter numbers; the reference chips
// link to the official text at pcaac.org — always verify wording there.
// Loaded after js/data/catechisms.js (window.PCA_CATECHISMS).
(function (global) {
  const ITEMS = [
    // ── The church and its power ─────────────────────────────────────
    { q: 'Who alone is the Head of the Church, and how does He govern it?',
      a: 'Christ alone is Head of the Church. He governs by His Word and Spirit, having appointed officers to order His church according to the Scriptures.', refs: ['BCO 1'] },
    { q: 'What is the Constitution of the PCA?',
      a: 'The Westminster Confession of Faith, the Larger and Shorter Catechisms, and the Book of Church Order — all subject and subordinate to the Scriptures.', refs: ['BCO Preface'] },
    { q: 'What kind of power does the church have?',
      a: 'Exclusively spiritual power — ministerial and declarative only. The church may declare and apply what Christ has revealed in Scripture; it cannot make laws that bind the conscience.', refs: ['BCO 3'] },
    { q: 'What is the visible church, and who belongs to it?',
      a: 'All those who profess faith in the Lord Jesus Christ, together with their children.', refs: ['BCO 2'] },
    { q: 'What are the two classes of members in a particular church?',
      a: 'Communing members (those admitted to the Lord’s Table on profession of faith) and non-communing members (baptized covenant children who have not yet professed faith).', refs: ['BCO 6'] },
    { q: 'How does church power differ from civil power?',
      a: 'Civil power is exercised by force over outward conduct; church power is wholly moral and spiritual, exercised by the Word, ministering to conscience and faith.', refs: ['BCO 3'] },

    // ── Officers ──────────────────────────────────────────────────────
    { q: 'What perpetual officers has Christ given His church?',
      a: 'Elders (teaching elders and ruling elders) and deacons.', refs: ['BCO 7'] },
    { q: 'What is the parity of the eldership?',
      a: 'Teaching and ruling elders share one office of elder: in the courts of the church they have the same authority and eligibility, though their functions differ.', refs: ['BCO 8'] },
    { q: 'What is the work of the ruling elder?',
      a: 'To exercise government and discipline jointly with the pastor: watching over the flock, visiting, instructing, praying with the people, and guarding the purity of the church.', refs: ['BCO 8'] },
    { q: 'What is the character of the deacon’s office?',
      a: 'An office of sympathy and service after the example of Christ — ministering to the needy, collecting and distributing the church’s mercy gifts, and caring for its property. It is not an office of rule.', refs: ['BCO 9'] },
    { q: 'What is an evangelist?',
      a: 'A teaching elder sent to preach the gospel and gather churches where there are none; for that work the presbytery may commission him with extraordinary powers in mission churches.', refs: ['BCO 8-6'] },
    { q: 'Who may administer the sacraments?',
      a: 'Only a teaching elder (minister of the Word).', refs: ['BCO 8'] },

    // ── Courts ────────────────────────────────────────────────────────
    { q: 'Name the courts of the PCA from lowest to highest.',
      a: 'The Session, the Presbytery, and the General Assembly.', refs: ['BCO 10'] },
    { q: 'What is the original jurisdiction of each court?',
      a: 'The Session has jurisdiction over the members of the local church; the Presbytery over its teaching elders and churches; the General Assembly over matters affecting the whole denomination.', refs: ['BCO 11'] },
    { q: 'Who composes the Session?',
      a: 'The pastor (with any associate pastors) and the ruling elders of the particular church.', refs: ['BCO 12'] },
    { q: 'Who composes the Presbytery?',
      a: 'All the teaching elders within its bounds and ruling elders representing its churches’ Sessions.', refs: ['BCO 13'] },
    { q: 'Who composes the General Assembly?',
      a: 'Teaching-elder and ruling-elder commissioners sent from the presbyteries; it is the highest court and meets annually.', refs: ['BCO 14'] },
    { q: 'What is the difference between a committee and a commission?',
      a: 'A committee examines and recommends — its work returns to the court for action. A commission is empowered to deliberate and conclude the business committed to it, acting for the court.', refs: ['BCO 15'] },
    { q: 'What is the Standing Judicial Commission?',
      a: 'A permanent commission of equal numbers of teaching and ruling elders to which the General Assembly commits its judicial cases.', refs: ['BCO 15'] },

    // ── Calling, licensure & ordination ──────────────────────────────
    { q: 'What two callings are required for office in the church?',
      a: 'The inward call of God experienced by the man, and the outward call — the orderly election and approval of God’s people through the courts of the church.', refs: ['BCO 16'] },
    { q: 'What is a candidate (for the ministry)?',
      a: 'A communing member who, believing himself called to preach, places himself under his presbytery’s care and oversight for training and testing of that call.', refs: ['BCO 18'] },
    { q: 'What is a licentiate?',
      a: 'A candidate whom the presbytery, after examination, has licensed to preach the gospel as a probationary step toward ordination, so the church can judge his gifts.', refs: ['BCO 19'] },
    { q: 'In what areas is a candidate for ordination examined?',
      a: 'Christian experience and inward call; theology; the Scriptures and Bible content; the sacraments; church history and the history of the PCA; the original languages; and the Book of Church Order.', refs: ['BCO 21-4'] },
    { q: 'How does the court handle a candidate’s stated differences with the Standards?',
      a: 'The candidate must state his differences; the court judges each one — whether merely semantic, more than semantic but not contrary to any fundamental of the system, or out of accord with a fundamental ("hostile to the system or striking at the vitals of religion").', refs: ['BCO 21-4'] },
    { q: 'Who establishes or dissolves a pastoral relationship?',
      a: 'The Presbytery. The congregation calls and may request dissolution, but only the Presbytery installs a pastor or dissolves the pastoral tie.', refs: ['BCO 23'] },
    { q: 'What is the difference between an associate pastor and an assistant pastor?',
      a: 'An associate pastor is called by the congregation; an assistant pastor is called by the Session. Both are teaching elders, but the assistant is not elected by the people.', refs: ['BCO 22'] },

    // ── Congregation, property & amendment ───────────────────────────
    { q: 'What business belongs to the congregation rather than the Session?',
      a: 'Chiefly calling a pastor, electing ruling elders and deacons, and matters touching the church’s property.', refs: ['BCO 25'] },
    { q: 'Who owns the property of a particular church?',
      a: 'The particular church itself — the congregation owns its property, and the BCO protects that ownership.', refs: ['BCO 25'] },
    { q: 'How is the Book of Church Order amended?',
      a: 'By approval of the General Assembly, the advice and consent of two-thirds of the presbyteries, and approval of a subsequent Assembly.', refs: ['BCO 26'] },
    { q: 'How are the doctrinal standards amended?',
      a: 'By a stricter path than the BCO: approval of the Assembly with the consent of three-fourths of the presbyteries, and approval of a subsequent Assembly.', refs: ['BCO 26'] },

    // ── Discipline ────────────────────────────────────────────────────
    { q: 'What is church discipline, and what are its aims?',
      a: 'The exercise of the authority Christ gave His church to instruct and guard its members. It aims at the glory of God, the purity of the church, and the restoration of the offender.', refs: ['BCO 27'] },
    { q: 'Name the church censures.',
      a: 'Admonition, suspension from the sacraments, suspension from office, deposition from office, and excommunication. Suspension from office and deposition apply only to officers.', refs: ['BCO 30'] },
    { q: 'Within what time must an appeal or complaint be filed?',
      a: 'Within thirty days of the court’s action.', refs: ['BCO 42', 'BCO 43'] },
    { q: 'What is the difference between an appeal and a complaint?',
      a: 'An appeal carries a judicial case (and its judgment) to a higher court by a party in the case; a complaint alleges that some other action or decision of a court was wrong.', refs: ['BCO 42', 'BCO 43'] },
    { q: 'When may censure be pronounced without a trial?',
      a: 'When the offender voluntarily confesses — the case proceeds "without process."', refs: ['BCO 38'] },
    { q: 'How is a censured person restored?',
      a: 'On evidence of repentance, by the court that imposed the censure, which removes it in the name of Christ.', refs: ['BCO 37'] },

    // ── Worship & sacraments ──────────────────────────────────────────
    { q: 'What rule governs public worship in the PCA?',
      a: 'The regulative principle: the Scriptures alone. God may be worshiped only as He has appointed in His Word.', refs: ['BCO 47'] },
    { q: 'Who admits persons to the Lord’s Supper?',
      a: 'The Session, upon a credible profession of faith.', refs: ['BCO 58'] },
    { q: 'Which parts of the Directory for Worship are constitutionally binding?',
      a: 'The chapters on baptism, profession of faith, and the Lord’s Supper (BCO 56–58), and the provision defining marriage as between one man and one woman in BCO 59.', refs: ['BCO 56', 'BCO 57', 'BCO 58', 'BCO 59'] },
    { q: 'What does the BCO teach about marriage?',
      a: 'Marriage is between one man and one woman — in the PCA this definition has constitutional force. A minister solemnizes marriages with discretion, under the Word.', refs: ['BCO 59'] },
  ];

  const cats = (global.PCA_CATECHISMS = global.PCA_CATECHISMS || {});
  cats.bco = {
    id: 'bco',
    label: 'BCO Key Points (paraphrase)',
    short: 'BCO',
    verbatim: false,
    source: 'Paraphrase of the Book of Church Order — not the official text. Verify against the current BCO at pcaac.org.',
    items: ITEMS.map((it, i) => ({ n: i + 1, q: it.q, a: it.a, refs: it.refs })),
  };
})(typeof window !== 'undefined' ? window : globalThis);
