// PCA Ordination & Licensure Study — 12-week study plan (category-structured).
//
// Models the "Schedule of Assignments" from Chapell & Meek, *Preparing for
// Licensure and Ordination Exams* (Covenant Theological Seminary). Each week of
// the syllabus assigns work across nine columns — Book Outlines, Book Contents,
// Bible Content, Doctrines & Proofs, Theology, Catechism, History, the BCO, and
// a "Hot Topic." This file lays each week out by those same columns so the
// "By week" selector renders one collapsible category per column, matching the
// printed schedule. The renderer (renderSelector in js/app/pca.js) walks a
// fixed column order (see WEEK_COLUMNS there) and renders each category.
//
// Every column is a set of selectable study decks:
//   outlines / contents : { sub, books: ['bk-…'] }  one selectable set per book
//   bible/doctrines/theology/confession/history/bco/catechism/hotTopic : { sub?, sets: ['…'] }
//   confession          : { sub, sets: ['wcf-NN'] } the Westminster Confession
//                         chapters assigned that week (js/data/subjects/wcf.js);
//                         all 33 chapters are placed across weeks 2–12, once each.
//   personal            : { sub, sets }   week 1 only (orientation)
//   focus               : '…'             a leading note (weeks 1 and 13)
//   A null/absent category is hidden for that week.
//
// Mapping notes:
//  - Book Outlines / Book Contents are per-book (each book its own bk-<slug> set).
//    Philemon (not named in the printed schedule) is read with the Prison
//    Epistles in week 11.
//  - Catechism points at the per-week Westminster Shorter Catechism sub-deck
//    (js/data/subjects/catechism_wsc.js) — the WSC questions the plan assigns,
//    as flashcards. Weeks 9 and 11 assign no new catechism.
//  - Hot Topic points at one or two per-topic Hot Topics decks
//    (js/data/subjects/hot_topics.js) — the syllabus's hot topic plus, where it
//    fits the week, one of the post-1993 Ad Interim Committee topics the guide
//    predates (women in office wk7, Christian nationalism wk8, racism wk11,
//    human sexuality wk4, domestic abuse wk5, Federal Vision wk9, Insider
//    Movements wk3). Each deck drills the competing views + the PCA position.
//  - Theology letters are shifted by one vs. the syllabus (the app folds "A.
//    Introduction" into "A. The Bible"); week 12's Theology points at Sacraments.
//  - The BCO column follows the syllabus's Preface/A–J chapter blocks; the
//    "By subject" selector groups the same decks by chapter (SUBJECT.groups in
//    bco.js). Decks spread over two weeks (NT Key Passages 9–10, NT Key Topics
//    11–12, Church History Key People 6–10) are listed in both (selection
//    de-dupes). Week 1 is orientation; week 13 is the final exam.

(function (global) {
  const WEEKS = [
    {
      week: 1,
      theme: 'Orientation & your call to ministry',
      books: '',
      focus: 'Read the requirements for licensure and ordination (BCO 18–21) and begin reading through the Westminster Confession and Catechisms. Start memorizing the Doctrines & Proofs (the five points, the ordo salutis, and a gospel outline) until you have them "down pat."',
      personal: { sub: 'Office qualifications, inward/outward call, BCO 18–21', sets: ['pc-call'] },
    },
    {
      week: 2,
      theme: 'Whole Bible · Scripture & God',
      books: 'Genesis–Exodus · Joshua–Ruth',
      outlines: { sub: 'Genesis–Exodus', books: ['bk-genesis', 'bk-exodus'] },
      contents: { sub: 'Joshua–Ruth', books: ['bk-joshua', 'bk-judges', 'bk-ruth'] },
      bible: { sub: 'A. Whole Bible', sets: ['bc-whole'] },
      theology: { sub: 'A–B. Introduction & the Bible', sets: ['th-a'] },
      confession: { sub: 'WCF 1–2 · Scripture; God & the Trinity', sets: ['wcf-01', 'wcf-02'] },
      catechism: { sub: 'WSC 1–3, 89–90', sets: ['wsc-wk2'] },
      history: { sub: 'A. General', sets: ['ch-overview'] },
      bco: { sub: 'A. Preface & Principles (Preface, ch. 1)', sets: ['bco-comp-foundations'] },
      hotTopic: { sets: ['ht-creation'] },
    },
    {
      week: 3,
      theme: 'God & His world · denominations',
      books: 'Leviticus–Deuteronomy · 1 Samuel–2 Chronicles',
      outlines: { sub: 'Leviticus–Deuteronomy', books: ['bk-leviticus', 'bk-numbers', 'bk-deuteronomy'] },
      contents: { sub: '1 Samuel–2 Chronicles', books: ['bk-1-samuel', 'bk-2-samuel', 'bk-1-kings', 'bk-2-kings', 'bk-1-chronicles', 'bk-2-chronicles'] },
      bible: { sub: 'B. OT: General — divisions of the OT & outline of OT history', sets: ['bc-whole'] },
      theology: { sub: 'C. God & His World', sets: ['th-b'] },
      confession: { sub: 'WCF 3–5 · Decree, Creation, Providence', sets: ['wcf-03', 'wcf-04', 'wcf-05'] },
      catechism: { sub: 'WSC 4–11', sets: ['wsc-wk3'] },
      history: { sub: 'B. Denominations', sets: ['ch-denominations'] },
      bco: { sub: 'B. The Church & Its Members (ch. 2–6)', sets: ['bco-officers'] },
      hotTopic: { sets: ['ht-sabbath', 'ht-insider-movements'] },
    },
    {
      week: 4,
      theme: 'Humankind · the Five Points (TULIP)',
      books: 'Isaiah–Jeremiah · Ezra–Esther',
      outlines: { sub: 'Isaiah–Jeremiah', books: ['bk-isaiah', 'bk-jeremiah'] },
      contents: { sub: 'Ezra–Esther', books: ['bk-ezra', 'bk-nehemiah', 'bk-esther'] },
      bible: { sub: 'C. OT: Key People', sets: ['bc-ot-people'] },
      doctrines: { sub: 'TULIP — the Five Points', sets: ['dp-tulip'] },
      theology: { sub: 'D. Humankind', sets: ['th-c'] },
      confession: { sub: 'WCF 6, 9 · Sin & Free Will', sets: ['wcf-06', 'wcf-09'] },
      catechism: { sub: 'WSC 12–19', sets: ['wsc-wk4'] },
      history: { sub: 'C. Events', sets: ['ch-events'] },
      bco: { sub: 'C. Church Officers (ch. 7–9)', sets: ['bco-comp-members-officers'] },
      hotTopic: { sets: ['ht-theonomy', 'ht-sexuality'] },
    },
    {
      week: 5,
      theme: 'God’s way of salvation',
      books: 'Ezekiel–Daniel · Job–Proverbs',
      outlines: { sub: 'Ezekiel–Daniel', books: ['bk-ezekiel', 'bk-daniel'] },
      contents: { sub: 'Job–Proverbs', books: ['bk-job', 'bk-psalms', 'bk-proverbs'] },
      bible: { sub: 'D. OT: Key Passages', sets: ['bc-ot-passages'] },
      theology: { sub: 'E. God’s Way of Salvation', sets: ['th-d'] },
      confession: { sub: 'WCF 7–8 · Covenant & Christ the Mediator', sets: ['wcf-07', 'wcf-08'] },
      catechism: { sub: 'WSC 20–28', sets: ['wsc-wk5'] },
      history: { sub: 'D. Definitions', sets: ['ch-terms'] },
      bco: { sub: 'D. Church Courts (ch. 10–15)', sets: ['bco-comp-courts', 'bco-gov-courts'] },
      hotTopic: { sets: ['ht-divorce', 'ht-abuse'] },
    },
    {
      week: 6,
      theme: 'Salvation accomplished · Key People',
      books: 'Matthew–Mark · Ecclesiastes–Lamentations',
      outlines: { sub: 'Matthew–Mark', books: ['bk-matthew', 'bk-mark'] },
      contents: { sub: 'Ecclesiastes, Song of Songs, Lamentations', books: ['bk-ecclesiastes', 'bk-song-of-songs', 'bk-lamentations'] },
      bible: { sub: 'E. OT: Key Events', sets: ['bc-ot-events'] },
      theology: { sub: 'F. Salvation Accomplished', sets: ['th-e'] },
      confession: { sub: 'WCF 10–13 · Calling, Justification, Adoption, Sanctification', sets: ['wcf-10', 'wcf-11', 'wcf-12', 'wcf-13'] },
      catechism: { sub: 'WSC 29–36', sets: ['wsc-wk6'] },
      history: { sub: 'E. Key People (1–9)', sets: ['ch-people'] },
      bco: { sub: 'E. Church Orders (ch. 16–24)', sets: ['bco-comp-vocation', 'bco-courts'] },
      hotTopic: { sets: ['ht-gifts'] },
    },
    {
      week: 7,
      theme: 'Salvation applied · the Ordo Salutis',
      books: 'Luke–John · Hosea–Obadiah',
      outlines: { sub: 'Luke–John', books: ['bk-luke', 'bk-john'] },
      contents: { sub: 'Hosea–Obadiah', books: ['bk-hosea', 'bk-joel', 'bk-amos', 'bk-obadiah'] },
      bible: { sub: 'F. NT: General', sets: ['bc-nt-general'] },
      doctrines: { sub: 'ORDO — the Ordo Salutis', sets: ['dp-ordo'] },
      theology: { sub: 'G. Salvation Applied', sets: ['th-f'] },
      confession: { sub: 'WCF 14–18 · Faith, Repentance, Good Works, Perseverance, Assurance', sets: ['wcf-14', 'wcf-15', 'wcf-16', 'wcf-17', 'wcf-18'] },
      catechism: { sub: 'WSC 85–87', sets: ['wsc-wk7'] },
      history: { sub: 'E. Key People (10–17)', sets: ['ch-people'] },
      bco: { sub: 'F. Congregational Meetings; Amending the Constitution (ch. 25–26)', sets: ['bco-gov-ministry'] },
      hotTopic: { sets: ['ht-women-role', 'ht-women-office'] },
    },
    {
      week: 8,
      theme: 'The Christian life',
      books: 'Acts · Jonah–Habakkuk',
      outlines: { sub: 'Acts', books: ['bk-acts'] },
      contents: { sub: 'Jonah–Habakkuk', books: ['bk-jonah', 'bk-micah', 'bk-nahum', 'bk-habakkuk'] },
      bible: { sub: 'G. NT: Key People', sets: ['bc-nt-people'] },
      theology: { sub: 'H. The Christian Life', sets: ['th-g'] },
      confession: { sub: 'WCF 19–24 · Law, Liberty, Worship, Vows, Magistrate, Marriage', sets: ['wcf-19', 'wcf-20', 'wcf-21', 'wcf-22', 'wcf-23', 'wcf-24'] },
      catechism: { sub: 'WSC 39, 82–84', sets: ['wsc-wk8'] },
      history: { sub: 'E. Key People (18–25)', sets: ['ch-people'] },
      bco: { sub: 'G. Principles of Discipline (ch. 27–30)', sets: ['bco-comp-discipline'] },
      hotTopic: { sets: ['ht-civil', 'ht-christian-nationalism'] },
    },
    {
      week: 9,
      theme: 'The Church · discipline',
      books: 'Romans · Zephaniah–Malachi',
      outlines: { sub: 'Romans', books: ['bk-romans'] },
      contents: { sub: 'Zephaniah–Malachi', books: ['bk-zephaniah', 'bk-haggai', 'bk-zechariah', 'bk-malachi'] },
      bible: { sub: 'H. NT: Key Passages (1–30)', sets: ['bc-nt-passages'] },
      theology: { sub: 'I. The Church', sets: ['th-h'] },
      confession: { sub: 'WCF 25–26, 30–31 · Church, Communion, Censures, Synods', sets: ['wcf-25', 'wcf-26', 'wcf-30', 'wcf-31'] },
      history: { sub: 'E. Key People (26–34)', sets: ['ch-people'] },
      bco: { sub: 'H. The Process of Discipline (ch. 31–38)', sets: ['bco-discipline'] },
      hotTopic: { sets: ['ht-subscription', 'ht-federal-vision'] },
    },
    {
      week: 10,
      theme: 'Last things · the gospel (evangelism)',
      books: '1–2 Corinthians, Galatians · Thessalonians, Pastorals',
      outlines: { sub: '1–2 Corinthians, Galatians', books: ['bk-1-corinthians', 'bk-2-corinthians', 'bk-galatians'] },
      contents: { sub: '1–2 Thessalonians, the Pastoral Epistles', books: ['bk-1-thessalonians', 'bk-2-thessalonians', 'bk-1-timothy', 'bk-2-timothy', 'bk-titus'] },
      bible: { sub: 'H. NT: Key Passages (31–59)', sets: ['bc-nt-passages'] },
      doctrines: { sub: 'Evangelism Plan — explain the gospel', sets: ['dp-gospel'] },
      theology: { sub: 'J. The Last Things', sets: ['th-i'] },
      confession: { sub: 'WCF 32–33 · State after Death, Resurrection, Last Judgment', sets: ['wcf-32', 'wcf-33'] },
      catechism: { sub: 'WSC 37–38', sets: ['wsc-wk10'] },
      history: { sub: 'E. Key People (35–41)', sets: ['ch-people'] },
      bco: { sub: 'I. Review & Control; Jurisdiction (ch. 39–46)', sets: ['bco-comp-review'] },
      hotTopic: { sets: ['ht-rpw'] },
    },
    {
      week: 11,
      theme: 'The Holy Spirit & apologetics · worship · PCA history',
      books: 'Ephesians–Colossians (+ Philemon) · James, Peter',
      outlines: { sub: 'Ephesians–Colossians, Philemon', books: ['bk-ephesians', 'bk-philippians', 'bk-colossians', 'bk-philemon'] },
      contents: { sub: 'James, 1–2 Peter', books: ['bk-james', 'bk-1-peter', 'bk-2-peter'] },
      bible: { sub: 'I. NT: Key Topics (1–15)', sets: ['bc-nt-topics'] },
      theology: { sub: 'K. Other Questions (Holy Spirit & apologetics)', sets: ['th-k'] },
      history: { sub: 'F. The History of the PCA', sets: ['ch-pca'] },
      bco: { sub: 'J. The Directory for Worship (ch. 47–63)', sets: ['bco-comp-worship-principles', 'bco-comp-sacraments-pastoral', 'bco-worship'] },
      hotTopic: { sets: ['ht-rebaptism', 'ht-racism'] },
    },
    {
      week: 12,
      theme: 'The Sacraments',
      books: 'Hebrews, Revelation · 1–3 John, Jude',
      outlines: { sub: 'Hebrews, Revelation', books: ['bk-hebrews', 'bk-revelation'] },
      contents: { sub: '1–3 John, Jude', books: ['bk-1-john', 'bk-2-john', 'bk-3-john', 'bk-jude'] },
      bible: { sub: 'I. NT: Key Topics (16–30)', sets: ['bc-nt-topics'] },
      theology: { sub: 'L. Sacraments', sets: ['sac-general', 'sac-baptism', 'sac-supper'] },
      confession: { sub: 'WCF 27–29 · Sacraments, Baptism, the Lord’s Supper', sets: ['wcf-27', 'wcf-28', 'wcf-29'] },
      catechism: { sub: 'WSC 88, 91–98', sets: ['wsc-wk12'] },
      hotTopic: { sets: ['ht-paedocommunion'] },
    },
    {
      week: 13,
      theme: 'Final exam',
      books: '',
      focus: 'Review every preceding week; the final exam draws questions from all of them.',
      hotTopic: { sets: ['ht-fencing'] },
    },
  ];

  if (typeof global !== 'undefined') global.PCA_WEEKS = WEEKS;
})(typeof globalThis !== 'undefined' ? globalThis : window);
