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
// Per-category shape:
//   outlines / contents : { sub, books: ['bk-…'] }   one selectable set per book
//                         (Bible Book Summaries is now one set per book, so a
//                          week shows exactly the books it assigns).
//   bible/doctrines/theology/history/bco : { sub, sets: ['…'] }  selectable decks
//   catechism           : 'WSC …'        memory assignment (rendered as a note)
//   hotTopic            : { topic, card, related? }  rendered as a note; `card`
//                         is the Hot Topics deck card to study for it
//   personal            : { sub, sets }   week 1 only (orientation)
//   focus               : '…'             a leading note (weeks 1 and 13)
//   A null/absent category is hidden for that week.
//
// Mapping notes:
//  - Book Outlines / Book Contents are per-book: each book is its own set
//    (bk-<slug>) under the Bible Book Summaries subject, so a week lists exactly
//    the books due that week (the schedule's column wording is preserved in
//    `sub`). Philemon (not named in the printed schedule) is read with the
//    Prison Epistles in week 11.
//  - Theology letters are shifted by one vs. the syllabus because the app folds
//    the syllabus's "A. Introduction" into "A. The Bible" (th-a). Week 12's
//    Theology column ("L. Sacraments") points at the Sacraments subject decks.
//  - The BCO column follows the syllabus's Preface/A–J chapter blocks, mapped to
//    the app's 14 BCO sub-decks in chapter order. (The "By subject" selector
//    groups the same decks differently — see SUBJECT.groups in bco.js.)
//  - Decks the syllabus spreads over two weeks are listed in BOTH weeks with a
//    range in `sub` (selection de-dupes): NT Key Passages (weeks 9–10), NT Key
//    Topics (weeks 11–12), and Church History "Key People" (weeks 6–10).
//  - Week 1 is the syllabus's orientation class (Personal Religion & Call); week
//    13 is the final exam.

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
      theology: { sub: 'A–B. Introduction & the Bible', sets: ['th-a', 'theo-wcf'] },
      catechism: 'WSC 1–3, 89–90',
      history: { sub: 'A. General', sets: ['ch-overview'] },
      bco: { sub: 'A. Preface & Principles (Preface, ch. 1)', sets: ['bco-comp-foundations'] },
      hotTopic: { topic: 'Creation', card: 'ht-001-creation' },
    },
    {
      week: 3,
      theme: 'God & His world · denominations',
      books: 'Leviticus–Deuteronomy · 1 Samuel–2 Chronicles',
      outlines: { sub: 'Leviticus–Deuteronomy', books: ['bk-leviticus', 'bk-numbers', 'bk-deuteronomy'] },
      contents: { sub: '1 Samuel–2 Chronicles', books: ['bk-1-samuel', 'bk-2-samuel', 'bk-1-kings', 'bk-2-kings', 'bk-1-chronicles', 'bk-2-chronicles'] },
      bible: { sub: 'B. OT: General — divisions of the OT & outline of OT history', sets: ['bc-whole'] },
      theology: { sub: 'C. God & His World', sets: ['th-b'] },
      catechism: 'WSC 4–11',
      history: { sub: 'B. Denominations', sets: ['ch-denominations'] },
      bco: { sub: 'B. The Church & Its Members (ch. 2–6)', sets: ['bco-officers'] },
      hotTopic: {
        topic: 'Sabbath / the Lord’s Day',
        card: 'ht-004-sabbath',
        related: [{ topic: 'Insider Movements (translating “Son of God”)', card: 'ht-022-insider-movements' }],
      },
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
      catechism: 'WSC 12–19',
      history: { sub: 'C. Events', sets: ['ch-events'] },
      bco: { sub: 'C. Church Officers (ch. 7–9)', sets: ['bco-comp-members-officers'] },
      hotTopic: { topic: 'Theonomy', card: 'ht-007-theonomy' },
    },
    {
      week: 5,
      theme: 'God’s way of salvation',
      books: 'Ezekiel–Daniel · Job–Proverbs',
      outlines: { sub: 'Ezekiel–Daniel', books: ['bk-ezekiel', 'bk-daniel'] },
      contents: { sub: 'Job–Proverbs', books: ['bk-job', 'bk-psalms', 'bk-proverbs'] },
      bible: { sub: 'D. OT: Key Passages', sets: ['bc-ot-passages'] },
      theology: { sub: 'E. God’s Way of Salvation', sets: ['th-d'] },
      catechism: 'WSC 20–28',
      history: { sub: 'D. Definitions', sets: ['ch-terms'] },
      bco: { sub: 'D. Church Courts (ch. 10–15)', sets: ['bco-comp-courts', 'bco-gov-courts'] },
      hotTopic: {
        topic: 'Divorce and Remarriage',
        card: 'ht-010-divorce-and-remarriage',
        related: [
          { topic: 'Human sexuality (same-sex attraction & identity)', card: 'ht-019-human-sexuality' },
          { topic: 'Domestic abuse & sexual assault', card: 'ht-020-domestic-abuse' },
        ],
      },
    },
    {
      week: 6,
      theme: 'Salvation accomplished · Key People',
      books: 'Matthew–Mark · Ecclesiastes–Lamentations',
      outlines: { sub: 'Matthew–Mark', books: ['bk-matthew', 'bk-mark'] },
      contents: { sub: 'Ecclesiastes, Song of Songs, Lamentations', books: ['bk-ecclesiastes', 'bk-song-of-songs', 'bk-lamentations'] },
      bible: { sub: 'E. OT: Key Events', sets: ['bc-ot-events'] },
      theology: { sub: 'F. Salvation Accomplished', sets: ['th-e'] },
      catechism: 'WSC 29–36',
      history: { sub: 'E. Key People (1–9)', sets: ['ch-people'] },
      bco: { sub: 'E. Church Orders (ch. 16–24)', sets: ['bco-comp-vocation', 'bco-courts'] },
      hotTopic: { topic: 'Charismatic Gifts', card: 'ht-002-charismatic-gifts' },
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
      catechism: 'WSC 85–87',
      history: { sub: 'E. Key People (10–17)', sets: ['ch-people'] },
      bco: { sub: 'F. Congregational Meetings; Amending the Constitution (ch. 25–26)', sets: ['bco-gov-ministry'] },
      hotTopic: {
        topic: 'The Role of Women in the Church',
        card: 'ht-005-role-of-women-in-the-church',
        related: [{ topic: 'Women in church office (elders & deacons)', card: 'ht-016-women-in-office' }],
      },
    },
    {
      week: 8,
      theme: 'The Christian life',
      books: 'Acts · Jonah–Habakkuk',
      outlines: { sub: 'Acts', books: ['bk-acts'] },
      contents: { sub: 'Jonah–Habakkuk', books: ['bk-jonah', 'bk-micah', 'bk-nahum', 'bk-habakkuk'] },
      bible: { sub: 'G. NT: Key People', sets: ['bc-nt-people'] },
      theology: { sub: 'H. The Christian Life', sets: ['th-g'] },
      catechism: 'WSC 39, 82–84',
      history: { sub: 'E. Key People (18–25)', sets: ['ch-people'] },
      bco: { sub: 'G. Principles of Discipline (ch. 27–30)', sets: ['bco-comp-discipline'] },
      hotTopic: {
        topic: 'Civil Disobedience',
        card: 'ht-008-civil-disobedience',
        related: [
          { topic: 'Christian nationalism', card: 'ht-017-christian-nationalism' },
          { topic: 'Racism & racial reconciliation', card: 'ht-018-racism' },
        ],
      },
    },
    {
      week: 9,
      theme: 'The Church · discipline',
      books: 'Romans · Zephaniah–Malachi',
      outlines: { sub: 'Romans', books: ['bk-romans'] },
      contents: { sub: 'Zephaniah–Malachi', books: ['bk-zephaniah', 'bk-haggai', 'bk-zechariah', 'bk-malachi'] },
      bible: { sub: 'H. NT: Key Passages (1–30)', sets: ['bc-nt-passages'] },
      theology: { sub: 'I. The Church', sets: ['th-h'] },
      history: { sub: 'E. Key People (26–34)', sets: ['ch-people'] },
      bco: { sub: 'H. The Process of Discipline (ch. 31–38)', sets: ['bco-discipline'] },
      hotTopic: {
        topic: 'Confessional Subscription',
        card: 'ht-011-confessional-subscription',
        related: [{ topic: 'The Federal Vision controversy', card: 'ht-021-federal-vision' }],
      },
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
      catechism: 'WSC 37–38',
      history: { sub: 'E. Key People (35–41)', sets: ['ch-people'] },
      bco: { sub: 'I. Review & Control; Jurisdiction (ch. 39–46)', sets: ['bco-comp-review'] },
      hotTopic: { topic: 'The Regulative Principle of Worship', card: 'ht-003-regulative-principle' },
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
      hotTopic: { topic: 'Re-Baptism', card: 'ht-006-re-baptism' },
    },
    {
      week: 12,
      theme: 'The Sacraments',
      books: 'Hebrews, Revelation · 1–3 John, Jude',
      outlines: { sub: 'Hebrews, Revelation', books: ['bk-hebrews', 'bk-revelation'] },
      contents: { sub: '1–3 John, Jude', books: ['bk-1-john', 'bk-2-john', 'bk-3-john', 'bk-jude'] },
      bible: { sub: 'I. NT: Key Topics (16–30)', sets: ['bc-nt-topics'] },
      theology: { sub: 'L. Sacraments', sets: ['sac-general', 'sac-baptism', 'sac-supper'] },
      catechism: 'WSC 88, 91–98',
      hotTopic: { topic: 'Paedo-Communion', card: 'ht-009-paedo-communion' },
    },
    {
      week: 13,
      theme: 'Final exam',
      books: '',
      focus: 'Review every preceding week; the final exam draws questions from all of them.',
      hotTopic: { topic: 'Fencing the Lord’s Table', card: 'ht-012-fencing-the-lord-s-table' },
    },
  ];

  if (typeof global !== 'undefined') global.PCA_WEEKS = WEEKS;
})(typeof globalThis !== 'undefined' ? globalThis : window);
