// PCA Ordination & Licensure Study — per-card MCQ overlay: bco_comprehensive.
// Hand-authored multiple-choice for cards that can't auto-generate one, keyed
// by card id and merged into window.PCA_CARD_QUIZ (consumed by
// js/app/quiz.js cardQuiz()). Kept OUTSIDE the generated subject files so a
// builder re-run never wipes these. Each entry:
//   'card-id': { q?: 'sharper question override', choices: [4], answerIndex }
// Distractors must match the correct answer in length and grammatical shape
// (dev/validate.mjs giveaway check + manual discipline).
(function (global) {
  const Q = {
    'bco-comp-001': { choices: [
      'Christ alone is King and Head of the church, and church order must submit to His Word.',
      'The General Assembly alone is Lawgiver in Zion, and church order flows from its own resolutions.',
      'Church officers jointly are Lawgiver in Zion, and government adapts freely to tradition.',
      'Civil magistrates alone are Lawgiver in Zion, and worship follows the state’s directives.'
    ], answerIndex: 0 },
    'bco-comp-002': { choices: [
      'Courts may enact new rules of conscience whenever pastoral wisdom sees a need.',
      'Courts apply and declare Scripture’s teaching; they do not create binding law of their own.',
      'Courts function mainly to preserve denominational tradition rather than apply Scripture.',
      'Courts derive their authority from the consent of the governed congregation alone.'
    ], answerIndex: 1 },
    'bco-comp-003': { choices: [
      'The Constitution is the Westminster Standards and the Book of Church Order, subordinate to Scripture in final authority.',
      'The Constitution is General Assembly resolutions and local church bylaws, subordinate to Scripture in final authority.',
      'The Constitution is the Directory for Worship and congregational bylaws, subordinate to Scripture in final authority.',
      'The Constitution is the Westminster Standards and the Book of Church Order, equal to Scripture in final authority.'
    ], answerIndex: 0 },
    'bco-comp-004': { choices: [
      'Doctrine, worship, discipline, mission, and finance.',
      'Session, Presbytery, Synod, Assembly, and committee.',
      'Scripture, confession, catechism, liturgy, and canon.',
      'Church, members, officers, courts, and orders.'
    ], answerIndex: 3 },
    'bco-comp-005': { choices: [
      'It is Christ’s visible kingdom of grace, gathering and perfecting the saints across every age.',
      'It is a voluntary society formed by believers for mutual encouragement and fellowship.',
      'It is a regional federation of congregations bound by a common confession alone.',
      'It is an invisible fellowship known only to God, without any earthly organization.'
    ], answerIndex: 0 },
    'bco-comp-006': { choices: [
      'Examined communicant members only, together with their adult sponsors.',
      'Professing believers in every nation, together with their children.',
      'Enrolled voting members of one congregation, together with their staff.',
      'Ordained officers of the church, together with their households.'
    ], answerIndex: 1 },
    'bco-comp-007': { choices: [
      'Teaching elders, deacons, and trustees, according to congregational bylaw.',
      'Teaching elders, ruling elders, and deacons, according to Scripture.',
      'Bishops, priests, and deacons, according to denominational custom.',
      'Pastors, elders, and trustees, according to civil incorporation law.'
    ], answerIndex: 1 },
    'bco-comp-008': { choices: [
      'Because each congregation must ratify the decisions of every neighboring congregation.',
      'Because Presbytery may overrule Session only after a unanimous congregational vote.',
      'Because the General Assembly directly appoints every local church’s officers.',
      'Because jurisdiction is joint power exercised by courts that remain mutually related in one church.'
    ], answerIndex: 3 },
    'bco-comp-009': { choices: [
      'No, presbytery perfects the visible church’s order but is not essential to its existence.',
      'Yes, without presbytery no gathering of believers can be a true church at all.',
      'No, presbytery is merely a historical custom with no scriptural warrant at all.',
      'Yes, presbytery is required equally with Word and Sacrament for a true church.'
    ], answerIndex: 0 },
    'bco-comp-010': { choices: [
      'As true branches only when they adopt the PCA’s exact form of government and courts.',
      'As true branches of Christ’s church wherever Word and Sacrament are kept with integrity.',
      'As mission fields requiring full reorganization under Presbyterian courts and oversight.',
      'As essentially unchristian bodies unless they formally adopt the Westminster Standards.'
    ], answerIndex: 1 },
    'bco-comp-011': { choices: [
      'The power of tradition, held by Session, and the power of custom, held by Presbytery.',
      'The power of the keys, held only by teaching elders ordained to preach.',
      'Order, exercised individually by officers, and jurisdiction, exercised jointly by courts.',
      'The power of persuasion, used privately, and the power of law, used civilly.'
    ], answerIndex: 2 },
    'bco-comp-012': { choices: [
      'To enact, publish, and collect civil statutes for the support of public order.',
      'To adjudicate, record, and finalize property disputes between congregations.',
      'To certify, license, and register candidates for civil office in its district.',
      'To proclaim, administer, and enforce the law of Christ revealed in Scripture.'
    ], answerIndex: 3 },
    'bco-comp-013': { choices: [
      'Church power is wholly spiritual, while civil power may rightly employ force.',
      'Church power includes the sword, while civil power is limited to persuasion.',
      'Church power and state power are identical in source and constitution.',
      'Church power derives from reason and providence, like civil power does.'
    ], answerIndex: 0 },
    'bco-comp-014': { choices: [
      'A regional gathering of many congregations meeting only for annual conference.',
      'A local congregation of professing Christians ordered under Christ’s lawful government.',
      'A voluntary club of believers gathered without need for ordained officers.',
      'A parachurch ministry that operates independently of any church court.'
    ], answerIndex: 1 },
    'bco-comp-015': { choices: [
      'In the Board of Deacons, who oversee both mercy and government matters.',
      'In the congregation itself, voting directly on every governing decision.',
      'In the Session, made up of the pastor(s) and the church’s ruling elders.',
      'In the Presbytery, which governs each congregation’s day-to-day affairs.'
    ], answerIndex: 2 },
    'bco-comp-016': { choices: [
      'Church suppers, building maintenance, and annual denominational conferences.',
      'Civic holidays, congregational picnics, and voluntary mission trips abroad.',
      'Committee meetings, budget votes, and denominational lobbying efforts.',
      'Prayer, praise, Scripture reading, preaching, sacraments, discipline, and ordination.'
    ], answerIndex: 3 },
    'bco-comp-017': { choices: [
      'It lacks a permanent governing body, relying instead on Presbytery’s temporary oversight.',
      'It has a permanent Session, though it currently lacks any ordained deacons.',
      'It is governed by a bishop, appointed directly by the General Assembly itself.',
      'It cannot call a pastor, being barred from doing so for its first fifty years.'
    ], answerIndex: 0 },
    'bco-comp-018': { choices: [
      'The General Assembly, whether by direct action, standing committee, or delegated agency.',
      'Presbytery, whether on its own initiative, through a Session, or by petition.',
      'A single teaching elder, whether by personal initiative, invitation, or self-appointment.',
      'The denomination’s mission board, whether by grant, referral, or direct assignment.'
    ], answerIndex: 1 },
    'bco-comp-019': { choices: [
      'A permanent bishop, an appointed diocesan council, or a synod-appointed regional administrator.',
      'A rotating congregational committee, an elected chairman, or a temporary moderator.',
      'An evangelist, a mother-daughter Session arrangement, or a commission acting as temporary Session.',
      'A denominational trustee, a regional treasurer, or an appointed outside consultant.'
    ], answerIndex: 2 },
    'bco-comp-020': { choices: [
      'An organizing commission, a petition to Presbytery, officer nomination, and ordination of officers.',
      'A denominational audit, a petition to Presbytery, an organizing commission, and ordination of officers.',
      'Officer nomination, a letter to the Stated Clerk, an organizing commission, and ordination of officers.',
      'Officer nomination, a petition to Presbytery, an organizing commission, and ordination of officers.'
    ], answerIndex: 3 },
    'bco-comp-021': { choices: [
      'The baptized children of believers, members by covenant though not yet at the Table.',
      'Unbaptized visitors at worship, attendees though not yet examined by the Session.',
      'Transferring adult members, newcomers though not yet received by the Session.',
      'Long-absent former members, names though not yet restored to the roll.'
    ], answerIndex: 0 },
    'bco-comp-022': { choices: [
      'Those who were baptized as infants, attend regularly, and await profession of faith.',
      'Those who have professed faith, been baptized, and been admitted to the Table.',
      'Those who attend worship, give financially, and serve on committees.',
      'Those who hold office, teach Sunday school, and lead the congregation’s singing.'
    ], answerIndex: 1 },
    'bco-comp-023': { choices: [
      'Any regular attender, unadmitted by profession, baptism, or Session action.',
      'Non-communing members, recognized without profession, baptism, or Session action.',
      'Only communing members, admitted by profession, baptism, and Session action.',
      'Associate members, received without profession, baptism, or Session action.'
    ], answerIndex: 2 },
    'bco-comp-024': { choices: [
      'Bishops and priests, with priests further divided into rectors and curates.',
      'Pastors and trustees, with trustees managing all spiritual oversight.',
      'Evangelists and missionaries, ordained apart from any local Session.',
      'Elders and deacons, with the eldership including teaching and ruling elders.'
    ], answerIndex: 3 },
    'bco-comp-025': { choices: [
      'Elders jointly govern and teach, while deacons serve needs and do not rule.',
      'Elders serve mercy needs, while deacons govern and exercise church discipline.',
      'Elders and deacons share identical duties and differ only in ordination date.',
      'Elders handle finances alone, while deacons handle preaching and sacraments.'
    ], answerIndex: 0 },
    'bco-comp-026': { choices: [
      'Any title at all, including volunteer or committee-member, is forbidden.',
      'Titles belonging to ordained office, such as elder or deacon, should not be given.',
      'Titles of honor, such as reverend or doctor, may never be used by anyone.',
      'Titles used in other denominations, but PCA titles may be freely borrowed.'
    ], answerIndex: 1 },
    'bco-comp-027': { choices: [
      'Seminary education, a minimum age of forty, prior military service, and denominational tenure.',
      'Denominational tenure, congregational popularity, business wealth, and civic reputation.',
      'Sound learning, blameless life, sound doctrine, teaching aptitude, and a well-ruled household.',
      'Physical strength, confident public speaking, personal wealth, and a large extended household.'
    ], answerIndex: 2 },
    'bco-comp-028': { choices: [
      'Preaching the Word exclusively, administering sacraments, and leaving all other oversight to deacons.',
      'Managing church property and finances, keeping records, and leaving spiritual oversight to the pastor alone.',
      'Recruiting new members, running outreach programs, and leaving doctrine and discipline to the deacons.',
      'Watching over doctrine and morals, exercising discipline, visiting the flock, and offering instruction and prayer.'
    ], answerIndex: 3 },
    'bco-comp-029': { choices: [
      'Reading, expounding, and preaching the Word, and administering the sacraments.',
      'Visiting, comforting, and distributing mercy funds to needy households.',
      'Recording, auditing, and preparing the church’s annual financial budget.',
      'Recruiting, training, and ordaining new ruling elders for the Session.'
    ], answerIndex: 0 },
    'bco-comp-030': { choices: [
      'Teaching elders alone may vote in Presbytery; ruling elders may only observe.',
      'Both hold one office with equal court authority, though their functions differ.',
      'Ruling elders outrank teaching elders in every court above the Session.',
      'Teaching elders are ordained for life, while ruling elders serve fixed terms.'
    ], answerIndex: 1 },
    'bco-comp-031': { choices: [
      'Moderate Presbytery permanently, appoint elders, and in extraordinary cases dissolve churches.',
      'Overrule Session decisions, appoint deacons, and in extraordinary cases install a pastor.',
      'Preach, administer sacraments, and in extraordinary cases ordain officers for a mission church.',
      'Appoint his own successor, collect offerings, and in extraordinary cases certify candidates.'
    ], answerIndex: 2 },
    'bco-comp-032': { choices: [
      'A temporary, provisional office marked by administration, oversight, and vacancy-filling.',
      'An honorary, ceremonial office marked by title, recognition, and no active duty.',
      'A governing, ruling office marked by authority, oversight, and church discipline.',
      'An ordinary, perpetual office marked by sympathy, service, and mutual care.'
    ], answerIndex: 3 },
    'bco-comp-033': { choices: [
      'Ministering to the needy, promoting liberality, and caring for church property.',
      'Preaching the Word, administering sacraments, and instructing new members.',
      'Examining candidates, ordaining ruling elders, and moderating the Session.',
      'Moderating Presbytery, certifying commissioners, and reviewing Session records.'
    ], answerIndex: 0 },
    'bco-comp-034': { choices: [
      'As individual agents, with the clerk advisory, reporting activity to the Assembly.',
      'As a Board of Deacons, with the pastor advisory, reporting minutes to the Session.',
      'As a Presbytery committee, with an elder advisory, reporting findings to Presbytery.',
      'As a women’s auxiliary, with a chairwoman advisory, reporting activity to the congregation.'
    ], answerIndex: 1 },
    'bco-comp-035': { choices: [
      'No, only ordained officers may ever assist with mercy ministry tasks.',
      'Yes, but only ordained ruling elders may be appointed as assistants.',
      'Yes, the Session may appoint unordained men and women to assist in mercy work.',
      'No, deacons must perform every task of mercy ministry personally alone.'
    ], answerIndex: 2 },
    'bco-comp-036': { choices: [
      'The Consistory, the Classis, and the Synod of Bishops.',
      'The Vestry, the Diocese, and the National Convention.',
      'The Council, the Region, and the World Assembly.',
      'The Session, the Presbytery, and the General Assembly.'
    ], answerIndex: 3 },
    'bco-comp-037': { choices: [
      'A moderator and a clerk, with the pastor ordinarily moderating the Session.',
      'A treasurer and an auditor, elected annually by congregational ballot.',
      'A bishop and a chancellor, appointed by the General Assembly directly.',
      'A president and a secretary, chosen from outside the court’s membership.'
    ], answerIndex: 0 },
    'bco-comp-038': { choices: [
      'Civil and spiritual jointly, covering statutes, penalties, and taxation, always enforceable.',
      'Moral and spiritual only, covering doctrine, worship, and discipline, never civil.',
      'Purely advisory, covering suggestions, encouragement, and counsel, never binding.',
      'Property-related only, covering titles, deeds, and disputes, never doctrinal.'
    ], answerIndex: 1 },
    'bco-comp-039': { choices: [
      'Session governs a district, Presbytery one church, and Assembly the whole church.',
      'Session governs the whole church, Presbytery a district, and Assembly one church.',
      'Session governs one church, Presbytery a district, and Assembly the whole church.',
      'Session, Presbytery, and Assembly all govern the same single congregation.'
    ], answerIndex: 2 },
    'bco-comp-040': { choices: [
      'The pastor, the elected trustees, and the church’s deacons.',
      'The deacons, the church treasurer, and the congregation’s pastor.',
      'The oldest members, the founding families, and the church’s pastor.',
      'The pastor, any associate pastors, and the church’s ruling elders.'
    ], answerIndex: 3 },
    'bco-comp-041': { choices: [
      'Pastor plus two ruling elders if there are four or more; otherwise pastor plus one.',
      'Pastor plus three ruling elders regardless of how many elders serve.',
      'Any two ruling elders, whether or not the pastor is present.',
      'Pastor alone, since one officer may constitute a quorum for the Session.'
    ], answerIndex: 0 },
    'bco-comp-042': { choices: [
      'Two ruling elders if there are five or more; otherwise any single elder alone suffices.',
      'Three ruling elders if there are five or more; otherwise two, with one alone insufficient.',
      'Four ruling elders if there are eight or more; otherwise three, with two alone insufficient.',
      'Five ruling elders if there are ten or more; otherwise three, with one alone sufficient.'
    ], answerIndex: 1 },
    'bco-comp-043': { choices: [
      'Ordaining teaching elders, licensing candidates, and organizing new congregations.',
      'Electing GA commissioners, reviewing Presbytery records, and hearing appeals.',
      'Receiving and disciplining members, examining officers, and approving the budget.',
      'Amending the BCO, ratifying Westminster Standards changes, and electing the Moderator.'
    ], answerIndex: 2 },
    'bco-comp-044': { choices: [
      'At least weekly, with minutes submitted monthly for Assembly review.',
      'Only when a discipline case arises, with no regular review required.',
      'At least annually, with minutes reviewed once every decade.',
      'At least quarterly, with minutes submitted annually for Presbytery review.'
    ], answerIndex: 3 },
    'bco-comp-045': { choices: [
      'The teaching elders and churches within its bounds, meeting with elected ruling elders.',
      'Only the teaching elders within its bounds, since ruling elders never sit as members.',
      'Only the ruling elders within its bounds, elected annually by their home Sessions.',
      'The deacons and teaching elders within its bounds, without ruling elder members.'
    ], answerIndex: 0 },
    'bco-comp-046': { choices: [
      'One ruling elder per church regardless of the congregation’s size.',
      'Two ruling elders per church for the first 350 communicants, plus one per additional 500.',
      'Three ruling elders per church for the first 100 communicants, plus one per 1,000.',
      'Ruling elder representation is fixed at exactly five per congregation.'
    ], answerIndex: 1 },
    'bco-comp-047': { choices: [
      'Ten teaching elders and at least five ruling elders.',
      'One teaching elder and any number of ruling elders present.',
      'Three teaching elders and at least three ruling elders.',
      'A majority of all teaching elders under Presbytery’s care.'
    ], answerIndex: 2 },
    'bco-comp-048': { choices: [
      'Overseeing foreign missions, local budgets, and church property, apart from officers.',
      'Amending the Westminster Standards, the BCO, and GA rules, without Presbytery input.',
      'Electing the Stated Clerk, the Moderator, and the Treasurer, each year by ballot.',
      'Overseeing ministers, Sessions, and churches, including licensure, ordination, and review.'
    ], answerIndex: 3 },
    'bco-comp-049': { choices: [
      'On experience, character, theology, sacraments, government, and stated differences.',
      'Only on preaching skill, pulpit presence, and a single trial sermon delivered live.',
      'Only on doctrinal views, without character, government, or sacramental questions.',
      'Not examined at all, since transfer requires only a letter and automatic approval.'
    ], answerIndex: 0 },
    'bco-comp-050': { choices: [
      'An advisory body with no constitutional standing above Presbytery.',
      'The PCA’s highest court, the bond of union among all its congregations.',
      'A committee of the Presbytery, subordinate to regional oversight.',
      'A voluntary association that member congregations may freely leave.'
    ], answerIndex: 1 },
    'bco-comp-051': { choices: [
      'Only teaching elders, chosen by seniority within their Presbyteries.',
      'Delegates appointed directly by the Stated Clerk’s office each year.',
      'Teaching elders in good standing and ruling elders elected by Sessions.',
      'Deacons and ruling elders, without any teaching elder representation.'
    ], answerIndex: 2 },
    'bco-comp-052': { choices: [
      '50 commissioners, all teaching elders and no ruling elders, from a third of Presbyteries.',
      '200 commissioners, two-thirds ruling elders and one-third teaching elders, from every Presbytery.',
      '25 commissioners, evenly split between elders, representing half of all Presbyteries.',
      '100 commissioners, half teaching elders and half ruling elders, from a third of Presbyteries.'
    ], answerIndex: 3 },
    'bco-comp-053': { choices: [
      'Appeals, doctrinal controversies, Presbytery review, agency oversight, and amendments.',
      'Budgets, financial audits, property titles, staff hiring, and facility maintenance.',
      'Correspondence, treaties, diplomatic visits, translation projects, and travel grants.',
      'Moderator elections, parliamentary rulings, name badges, seating charts, and minutes.'
    ], answerIndex: 0 },
    'bco-comp-054': { choices: [
      'Deliverances bind every future Assembly decision, leaving no room for reconsideration.',
      'Deliverances merit serious weight, and judicial decisions bind the parties involved.',
      'Deliverances are purely symbolic, carrying no weight in any lower or higher court.',
      'Judicial decisions bind only the Stated Clerk, leaving the parties unaffected entirely.'
    ], answerIndex: 1 },
    'bco-comp-055': { choices: [
      'A committee decides finally; a commission may only advise the court.',
      'A committee and a commission are simply two names for the same body.',
      'A committee reports back; a commission is empowered to decide the matter itself.',
      'A committee serves Presbytery only; a commission serves Session only.'
    ], answerIndex: 2 },
    'bco-comp-056': { choices: [
      'Amending the BCO, electing GA commissioners, and revising the budget process.',
      'Electing representatives, certifying credentials, and ratifying GA minutes.',
      'Setting budgets, auditing finances, and approving building projects.',
      'Taking testimony, ordaining or installing ministers, and organizing new churches.'
    ], answerIndex: 3 },
    'bco-comp-057': { choices: [
      'At least two teaching elders and two ruling elders.',
      'At least one teaching elder and five ruling elders.',
      'At least three teaching elders and no ruling elders.',
      'At least four ruling elders and no teaching elders.'
    ], answerIndex: 0 },
    'bco-comp-058': { choices: [
      'A temporary Session committee of six elders handling only local property disputes.',
      'A permanent Assembly commission of twenty-four elders handling most GA judicial matters.',
      'A Presbytery panel of twelve elders that reviews annual church budget submissions.',
      'An advisory board of eighteen laypeople carrying no binding judicial authority.'
    ], answerIndex: 1 },
    'bco-comp-059': { choices: [
      'A private conviction, a public announcement, and no further court involvement.',
      'A seminary diploma, a passing exam score, and a letter from the registrar.',
      'An inward call of the Spirit, recognition by the people, and judgment of a court.',
      'An appointment by the Stated Clerk, a notice to Presbytery, and a filed record.'
    ], answerIndex: 2 },
    'bco-comp-060': { choices: [
      'Yes, a Presbytery may install any candidate without a congregational vote.',
      'Yes, a Session may appoint elders without ever presenting them for election.',
      'Yes, provided the General Assembly issues a direct appointment letter.',
      'No, ordinary vocation includes election by the body he will serve.'
    ], answerIndex: 3 },
    'bco-comp-061': { choices: [
      'The authoritative admission to office by prayer and laying on of hands after examination.',
      'A ceremonial title conferred automatically upon graduation from an accredited seminary.',
      'A congregational vote alone, cast without any examination by a lawful church court.',
      'An honorary recognition granted after many years of faithful congregational service.'
    ], answerIndex: 0 },
    'bco-comp-062': { choices: [
      'Yes, ordination must be repeated every time an officer changes his charge.',
      'No, ordination is to office and is not repeated; installation follows for a new charge.',
      'Yes, but only if the new charge is in a different Presbytery.',
      'No, and installation is likewise never repeated for any officer.'
    ], answerIndex: 1 },
    'bco-comp-063': { choices: [
      'Any baptized person, whether or not he has professed faith personally.',
      'Any licensed ruling elder who has served at least three years.',
      'A communing member who senses a call to preach and comes under Presbytery’s care.',
      'Any seminary applicant, regardless of his standing in a local church.'
    ], answerIndex: 2 },
    'bco-comp-064': { choices: [
      'Seminary enrollment, a passing GPA, faculty recommendation, and a five-year residency.',
      'Nomination by ministers, a unanimous vote, formal installation, and a public announcement.',
      'A written thesis, Stated Clerk approval, a filing fee, and a background check.',
      'Membership, Session endorsement, timely application, and personal examination by Presbytery.'
    ], answerIndex: 3 },
    'bco-comp-065': { choices: [
      'Presbytery’s permission for a candidate to preach regularly as a step toward ordination.',
      'A permanent status equivalent to ordination, requiring no further Presbytery action.',
      'A Session’s authorization for a candidate to administer both sacraments locally.',
      'A congregational vote granting a candidate full voting rights and office access.'
    ], answerIndex: 0 },
    'bco-comp-066': { choices: [
      'A written sermon, a psychological evaluation, and a police background check.',
      'Christian experience, theology, English Bible, the BCO, oral exams, and a sermon.',
      'Greek translation, Hebrew translation, church history, and a written thesis exam.',
      'A psychological evaluation, three deacon references, and a facility tour.'
    ], answerIndex: 1 },
    'bco-comp-067': { choices: [
      'A one-week orientation required before a candidate may be licensed.',
      'An optional program that Presbytery may waive without any conditions.',
      'A trial period of at least one year testing a candidate’s ministerial gifts.',
      'A lifetime appointment that replaces the need for later ordination.'
    ], answerIndex: 2 },
    'bco-comp-068': { choices: [
      'The Session, by vote in a called meeting, without Presbytery’s involvement.',
      'The Presbytery, by vote in a stated meeting, without the congregation’s input.',
      'The outgoing pastor, by naming a successor, without any congregational vote.',
      'The congregation, by vote in a properly called meeting, with Presbytery’s approval.'
    ], answerIndex: 3 },
    'bco-comp-069': { choices: [
      'A congregational committee that seeks and recommends a candidate for the call.',
      'A Presbytery panel that selects a pastor without congregational input.',
      'A Session subcommittee empowered to finalize the call on its own.',
      'A denominational agency that assigns pastors to vacant congregations.'
    ], answerIndex: 0 },
    'bco-comp-070': { choices: [
      'A unanimous congregational vote, with no exceptions ever permitted.',
      'A congregational ballot, ordinarily requiring a simple majority.',
      'A two-thirds vote of the Session, without any congregational ballot.',
      'A Presbytery vote alone, taken without any congregational involvement.'
    ], answerIndex: 1 },
    'bco-comp-071': { choices: [
      'A sermon, a testimony, a reference letter, and a background check by Session.',
      'A theology exam, a Session interview, a facility tour, and a filed application.',
      'Experience, theology, sacraments, government, Bible, history, languages, and sermon.',
      'Greek translation, Hebrew translation, a background check, and a filed petition.'
    ], answerIndex: 2 },
    'bco-comp-072': { choices: [
      'The candidate alone judges whether his difference is semantic, minor, or fundamental.',
      'Any stated difference is automatically ruled minor, semantic, or non-fundamental.',
      'The Stated Clerk alone judges whether a difference is semantic, minor, or fundamental.',
      'The court judges whether a stated difference is semantic, minor, or contrary to a fundamental.'
    ], answerIndex: 3 },
    'bco-comp-073': { choices: [
      'He affirms Scripture’s inerrancy and adopts the Westminster Standards as Scripture’s system of doctrine.',
      'He affirms only his own personal experience as the final and sufficient rule of faith.',
      'He affirms the Westminster Standards but remains free to reject Scripture’s inerrancy.',
      'He affirms denominational bylaws alone, without addressing Scripture or doctrine at all.'
    ], answerIndex: 0 },
    'bco-comp-074': { choices: [
      'Independence from his brethren, silence on truth, and minimal pastoral service.',
      'Submission to his brethren, zeal for truth and peace, and faithful pastoral service.',
      'Loyalty to his seminary, silence on peace, and minimal congregational service.',
      'Ambition for advancement, zeal for status, and selective pastoral service.'
    ], answerIndex: 1 },
    'bco-comp-075': { choices: [
      'To obey him absolutely, silence dissent, deny appeal, and forgo any support.',
      'To fund him generously, withhold encouragement, limit access, and skip meetings.',
      'To receive him, submit to him in the Lord, encourage him, and provide support.',
      'To elect him for a term, renew by vote, review yearly, and withhold tenure.'
    ], answerIndex: 2 },
    'bco-comp-076': { choices: [
      'All three are called identically by a vote of the Presbytery alone.',
      'Session calls the pastor; the congregation calls the assistant pastor.',
      'Only the pastor is ordained; associate and assistant pastors are not.',
      'Congregation calls pastor and associate pastor; Session calls assistant pastor.'
    ], answerIndex: 3 },
    'bco-comp-077': { choices: [
      'Presbytery, ordinarily after the pastor, the congregation, or both request it.',
      'The Session, ordinarily after the deacons, the trustees, or both request it.',
      'The congregation, ordinarily after a majority, the deacons, or both agree.',
      'The pastor, ordinarily after the clerk, the Session, or both are notified.'
    ], answerIndex: 0 },
    'bco-comp-078': { choices: [
      'Session appointment, private review, brief notice, then automatic installation.',
      'Public notice, nominations, Session examination, then congregational election.',
      'Presbytery appointment, a background check, brief notice, then installation.',
      'Random selection, a lottery drawing, brief notice, then immediate ordination.'
    ], answerIndex: 1 },
    'bco-comp-079': { choices: [
      'Attendance records, giving history, tenure length, and committee service record.',
      'Financial giving, family size, employment status, and denominational tenure.',
      'Character, knowledge of doctrine and government, office duties, and willingness to vow.',
      'Public speaking, a trial address, congregational popularity, and physical stamina.'
    ], answerIndex: 2 },
    'bco-comp-080': { choices: [
      'Affirming bylaws, congregational loyalty, and annual dues, without addressing doctrine.',
      'Confessing sin, professing faith, and attending worship, as every member must.',
      'Believing the creed, attending worship, and singing hymns, without any ordination vow.',
      'Affirming Scripture and the Standards, accepting office, and promising faithful, submissive service.'
    ], answerIndex: 3 },
    'bco-comp-081': { choices: [
      'Communing members in good and regular standing.',
      'Any adult attender who regularly worships with the congregation.',
      'Non-communing members once they reach the age of accountability.',
      'Only officers of the church, whether elders or deacons.'
    ], answerIndex: 0 },
    'bco-comp-082': { choices: [
      'No notice is required, and any business may be raised from the floor.',
      'At least one week’s public notice, with business limited to what was noticed.',
      'At least one month’s notice, with unlimited business allowed.',
      'Notice given only to officers, with members informed afterward.'
    ], answerIndex: 1 },
    'bco-comp-083': { choices: [
      'The Presbytery, which holds title on behalf of every member church.',
      'The General Assembly, which may reassign property at its discretion.',
      'The particular church itself, through its corporation or proper representatives.',
      'The founding pastor personally, until a successor is installed.'
    ], answerIndex: 2 },
    'bco-comp-084': { choices: [
      'GA majority proposes, a simple majority of Presbyteries consents, and the same GA enacts it.',
      'GA two-thirds proposes, all Presbyteries consent, and the next GA enacts by two-thirds.',
      'GA three-fourths proposes, three-fourths of Presbyteries consent, and the next GA enacts by three-fourths.',
      'GA majority proposes, two-thirds of Presbyteries consent, and the next GA enacts by majority.'
    ], answerIndex: 3 },
    'bco-comp-085': { choices: [
      'Three-fourths of GA proposes, three-fourths of Presbyteries consent, and the next GA enacts by three-fourths.',
      'A majority of GA proposes, two-thirds of Presbyteries consent, and the next GA enacts by majority.',
      'A majority of Presbytery proposes, a majority of Sessions consent, and GA merely ratifies.',
      'Any amendment requires unanimous consent of GA, and no Presbytery vote is needed at all.'
    ], answerIndex: 0 },
    'bco-comp-086': { choices: [
      'Only the formal judicial process of trial, censure, appeal, and record-keeping.',
      'Church authority to instruct and govern, including shepherding care and judicial process.',
      'Only informal pastoral counsel and encouragement, without any judicial dimension.',
      'Only civil enforcement of church rules, carried out through outside legal authorities.'
    ], answerIndex: 1 },
    'bco-comp-087': { choices: [
      'Only ordained officers, as leaders of the church, face formal discipline.',
      'Only communing members, as full members, face formal discipline.',
      'All baptized persons, as members of the church, are subject to discipline.',
      'Only covenant signers, as formal members, face formal discipline.'
    ], answerIndex: 2 },
    'bco-comp-088': { choices: [
      'Denominational reputation, financial stability, and legal protection.',
      'Congregational harmony alone, apart from any concern for truth.',
      'Officer authority, membership growth, and administrative efficiency.',
      'God’s glory, the church’s purity, and the reclaiming of disobedient sinners.'
    ], answerIndex: 3 },
    'bco-comp-089': { choices: [
      'A remedial, merciful spirit aimed at building up and restoring the offender.',
      'A strictly punitive spirit focused chiefly on public shaming.',
      'A detached, bureaucratic spirit that avoids pastoral involvement.',
      'An adversarial spirit treating the offender as a permanent outsider.'
    ], answerIndex: 0 },
    'bco-comp-090': { choices: [
      'Court action first, private admonition, then witnesses, before any instruction.',
      'Instruction in the Word, private admonition, then witnesses, before the court acts.',
      'Public announcement, private admonition, then instruction, before any witnesses.',
      'A written complaint, private admonition, then witnesses, before any instruction.'
    ], answerIndex: 1 },
    'bco-comp-091': { choices: [
      'Through a formal trial before the Session, identical to process for adult members.',
      'Through automatic suspension from privileges until they reach communicant age.',
      'Primarily through their parents, with the Session providing oversight and instruction.',
      'Through direct Presbytery intervention, entirely bypassing the local Session’s role.'
    ], answerIndex: 2 },
    'bco-comp-092': { choices: [
      'Any action that a majority of the congregation finds personally offensive.',
      'Any violation of denominational custom, whether or not scriptural.',
      'Any disagreement with a court’s prudential, non-binding advice.',
      'Anything in doctrine or practice contrary to the Word of God.'
    ], answerIndex: 3 },
    'bco-comp-093': { choices: [
      'Ordinarily only after the personal steps of Matthew 18 have failed.',
      'Immediately, before any personal steps are attempted between parties.',
      'Only after the offender has left the congregation entirely.',
      'Only when the civil authorities have already brought formal charges.'
    ], answerIndex: 0 },
    'bco-comp-094': { choices: [
      'Warning, probation, transfer, and mandatory counseling.',
      'Admonition, suspension, deposition from office, and excommunication.',
      'Fines, community service, restitution, and public apology.',
      'Reprimand, demotion, relocation, and temporary reassignment.'
    ], answerIndex: 1 },
    'bco-comp-095': { choices: [
      'A private conversation, carrying no record and calling for no formal response.',
      'A permanent removal, carrying no warning and calling for no repentance.',
      'A formal reproof by a court, warning the offender and calling him to repentance.',
      'A financial penalty, carrying public notice and calling for restitution.'
    ], answerIndex: 2 },
    'bco-comp-096': { choices: [
      'Permanent exclusion from the sacraments, office, or both, with no path back.',
      'A brief delay in ordination, licensure, or both, imposed for all candidates.',
      'A formal transfer of membership, standing, or both, to a nearby congregation.',
      'Temporary exclusion from sacraments, office, or both, as the case requires.'
    ], answerIndex: 3 },
    'bco-comp-097': { choices: [
      'Deposition removes an officer from office; excommunication excludes from communion.',
      'Deposition excludes from communion; excommunication removes from office.',
      'Deposition and excommunication both refer only to removal from office.',
      'Deposition and excommunication both refer only to loss of voting rights.'
    ], answerIndex: 0 },
    'bco-comp-098': { choices: [
      'Two private members, through an informal hearing, and the court itself.',
      'The church, through an appointed prosecutor, and the accused member.',
      'The Session, through a joint hearing, and the Presbytery itself.',
      'The accused, through his own attorney, and no church prosecutor.'
    ], answerIndex: 1 },
    'bco-comp-099': { choices: [
      'Institute formal process immediately, without any prior investigation at all.',
      'Wait indefinitely for a civil court ruling before taking any church action.',
      'Diligently seek explanation of reports, instituting process on strong presumption of guilt.',
      'Refer every report automatically, without local investigation, to the General Assembly.'
    ], answerIndex: 2 },
    'bco-comp-100': { choices: [
      'The charge states an opinion; no facts, times, or circumstances are ever needed.',
      'The charge states a name; specifications give a date, place, and denomination.',
      'The charge lists witnesses; specifications give names, addresses, and phone numbers.',
      'The charge states the offense; specifications give facts, times, and circumstances.'
    ], answerIndex: 3 },
    'bco-comp-101': { choices: [
      'Notice, time to prepare, objection to members, evidence, and the right to appeal.',
      'Moderator selection, private counsel, closed hearings, and unlimited postponements.',
      'Permanent confidentiality, sealed records, no public notice, and no cross-examination.',
      'An outside jury, a private venue, no church prosecutor, and no right to appeal.'
    ], answerIndex: 0 },
    'bco-comp-102': { choices: [
      'The case is automatically dismissed, no citation is needed, and refusal is irrelevant.',
      'After proper citation, the court may proceed, and refusal may affect the case.',
      'The court must wait indefinitely, no citation compels him, and refusal is expected.',
      'The accused is immediately excommunicated, no citation applies, and refusal is moot.'
    ], answerIndex: 1 },
    'bco-comp-103': { choices: [
      'No standard applies, since any ordained member may sit on any case.',
      'Only friendship with the accused disqualifies a member from sitting.',
      'Impartiality, with objections to a member’s sitting decided by the court.',
      'Only prior service as prosecutor disqualifies a member from sitting.'
    ], answerIndex: 2 },
    'bco-comp-104': { choices: [
      'A process reserved entirely to Presbytery, since Sessions try no members at all.',
      'A purely advisory hearing, holding no power to impose censure of any kind.',
      'A process requiring prior General Assembly approval before any hearing begins.',
      'The Session’s original jurisdiction over members, with Presbytery able to intervene.'
    ], answerIndex: 3 },
    'bco-comp-105': { choices: [
      'The Presbytery of which he is a member, except where the BCO provides otherwise.',
      'The Session of the church where he serves, except where the BCO provides otherwise.',
      'The General Assembly, which alone tries ministers, except in extraordinary cases.',
      'A special tribunal of outside elders, except where the Presbytery objects.'
    ], answerIndex: 0 },
    'bco-comp-106': { choices: [
      'A minister may never be restricted in any way before a final verdict.',
      'Presbytery may impose temporary restrictions when charges or circumstances require it.',
      'Only the Session where he serves may impose any temporary restriction.',
      'Only the General Assembly may impose restrictions during Presbytery process.'
    ], answerIndex: 1 },
    'bco-comp-107': { choices: [
      'Only sworn affidavits, records, and depositions, provided a notary is present.',
      'Only physical evidence, photographs, and exhibits, provided they are catalogued.',
      'Witness testimony, records, and documents, provided they are relevant and fair.',
      'Only evidence, statements, and letters from the accused, provided none originate elsewhere.'
    ], answerIndex: 2 },
    'bco-comp-108': { choices: [
      'Exactly one, though a signed statement alone is never sufficient.',
      'At least three, though a smaller number is never accepted at all.',
      'None at all, though a private confession must still be recorded.',
      'More than one, though a single witness plus corroboration may suffice.'
    ], answerIndex: 3 },
    'bco-comp-109': { choices: [
      'Witnesses testify under solemn duty and may be examined and cross-examined.',
      'Witnesses may testify anonymously, without any duty to tell the truth.',
      'Witnesses are barred from cross-examination to protect their privacy.',
      'Only the accused may question witnesses; the court may not.'
    ], answerIndex: 0 },
    'bco-comp-110': { choices: [
      'With public announcement, harshness, and haste, regardless of the offender’s good.',
      'With prayer, tenderness, and solemnity, suited to the offense and offender’s good.',
      'With strict formality, silence, and distance, avoiding any pastoral address.',
      'With written notice, mailed forms, and no hearing, regardless of the offense.'
    ], answerIndex: 1 },
    'bco-comp-111': { choices: [
      'Automatically, once a fixed period of time has elapsed without any court action.',
      'Only by a unanimous vote of the entire congregation, without any court action.',
      'Upon repentance and evidence of it, by action of the court with jurisdiction.',
      'Only by direct action of the General Assembly, regardless of which court convicted.'
    ], answerIndex: 2 },
    'bco-comp-112': { choices: [
      'Judicial trials conducted informally, without charges, specifications, or a verdict.',
      'Cases where the accused waives hearing, appeal, and any right to representation.',
      'Cases referred automatically to civil courts, bypassing every church court entirely.',
      'Non-judicial matters like dismissal, erasure, or divestiture, without formal trial.'
    ], answerIndex: 3 },
    'bco-comp-113': { choices: [
      'Removal from office without censure, when a man is no longer able to serve.',
      'A disciplinary censure imposed without removal, when a man remains able to serve.',
      'A voluntary resignation requiring no court action, when a man simply steps down.',
      'A temporary suspension lifted automatically, when one year has fully elapsed.'
    ], answerIndex: 0 },
    'bco-comp-114': { choices: [
      'A formal censure requiring a full judicial trial before Presbytery.',
      'A Session’s removal of a name from the roll for cases like prolonged absence.',
      'An action only the General Assembly may take, never a Session.',
      'A punishment reserved exclusively for ordained officers, not members.'
    ], answerIndex: 1 },
    'bco-comp-115': { choices: [
      'Only appeals, since references, complaints, and review are outside the BCO.',
      'Only budget review, since references, appeals, and complaints are unregulated.',
      'General review and control, references, appeals, complaints, and jurisdiction matters.',
      'Only direct investigation, since references, appeals, and complaints are barred.'
    ], answerIndex: 2 },
    'bco-comp-116': { choices: [
      'A lower court’s power to overturn any higher court’s final judicial ruling.',
      'An annual audit of church finances, performed independently by civil accountants.',
      'A one-time review, conducted only when a member files a formal written complaint.',
      'A higher court’s regular review of lower-court records for regularity and equity.'
    ], answerIndex: 3 },
    'bco-comp-117': { choices: [
      'Note exceptions, require correction, or issue injunctions to redress the error.',
      'Dissolve the court, remove its officers, or reassign its members entirely.',
      'Take no action, offer no comment, or file the matter without response.',
      'Refer the matter, forward the file, or notify civil authorities directly.'
    ], answerIndex: 0 },
    'bco-comp-118': { choices: [
      'A higher court’s order compelling a lower court to act a certain way.',
      'A lower court’s written request to a higher court for advice or action.',
      'A private letter of recommendation for a candidate’s ordination.',
      'A citation of legal precedent used only in civil court proceedings.'
    ], answerIndex: 1 },
    'bco-comp-119': { choices: [
      'Only after a case is closed, decided, or finally resolved by that same court.',
      'Only when a complaint is formal, filed, or already pending against that court.',
      'When a matter is novel, difficult, or reaches beyond the lower court’s sphere.',
      'Whenever a court is reluctant, uncertain, or unwilling to decide at all.'
    ], answerIndex: 2 },
    'bco-comp-120': { choices: [
      'A request for advice, submitted well before any judgment has ever been made.',
      'A complaint, filed only against a non-judicial administrative decision made.',
      'An automatic review, occurring only whenever a censure has been imposed.',
      'The transfer of a case to a higher court, made after judgment has been rendered.'
    ], answerIndex: 3 },
    'bco-comp-121': { choices: [
      'Procedural irregularity, improper evidence, undue haste, or manifest injustice.',
      'Personal dislike, minor inconvenience, hurt feelings, or wounded pride.',
      'Disagreement with the verdict, a divided vote, lengthy recesses, or changed court membership.',
      'Perceived leniency, insufficient publicity, short deliberation, or low attendance.'
    ], answerIndex: 0 },
    'bco-comp-122': { choices: [
      'Within seven days after the meeting of the court being appealed.',
      'Within thirty days after the meeting of the court being appealed.',
      'Within ninety days after the meeting of the court being appealed.',
      'Within one year after the meeting of the court being appealed.'
    ], answerIndex: 1 },
    'bco-comp-123': { choices: [
      'Affirm or reverse only, dismiss, decline, or table the matter indefinitely.',
      'Dismiss, decline, table, or refer the matter back without any decision.',
      'Affirm, reverse, render the proper decision, or remand for a new trial.',
      'Refer, restart, retry, or dismiss the matter for a fresh set of charges.'
    ], answerIndex: 2 },
    'bco-comp-124': { choices: [
      'A personal grievance filed against another individual church member.',
      'A formal charge initiating judicial process against an officer.',
      'A request for a lower court’s advice on a pending case.',
      'A written representation against an act or decision of a church court.'
    ], answerIndex: 3 },
    'bco-comp-125': { choices: [
      'Within thirty days after the meeting of the court complained against.',
      'Within ten days after the meeting of the court complained against.',
      'Within sixty days after the meeting of the court complained against.',
      'Within six months after the meeting of the court complained against.'
    ], answerIndex: 0 },
    'bco-comp-126': { choices: [
      'Appeal challenges a court’s act; complaint belongs to a party after judgment.',
      'Appeal belongs to a judicial party after judgment; complaint challenges a court’s act.',
      'Both terms refer to exactly the same procedure under the BCO.',
      'Appeal applies only to Sessions; complaint applies only to Presbyteries.'
    ], answerIndex: 1 },
    'bco-comp-127': { choices: [
      'Formal charges, filed to initiate a new case, with specifications listing facts.',
      'Suspending motions, filed to delay a court’s action, with a bond posted.',
      'Ways to record disagreement, with a protest also stating the member’s reasons.',
      'Private letters, sent to the Stated Clerk, with no entry in the court’s record.'
    ], answerIndex: 2 },
    'bco-comp-128': { choices: [
      'Jurisdiction ends immediately once the certificate of dismissal is signed.',
      'The receiving church gains jurisdiction before the member has even arrived.',
      'No court retains jurisdiction at all during the period between the two churches.',
      'The dismissing Session retains jurisdiction until a regular connection forms elsewhere.'
    ], answerIndex: 3 },
    'bco-comp-129': { choices: [
      'A believer temporarily away from home who joins locally, keeping his home membership.',
      'A member who has been suspended, though he still retains full voting privileges.',
      'A permanent member who has transferred fully, joining without any home church left.',
      'A non-communing member who has reached accountability, though not yet examined.'
    ], answerIndex: 0 },
    'bco-comp-130': { choices: [
      'Ordinarily not longer than thirty days, with no exceptions allowed.',
      'Ordinarily not longer than one year, absent a providential hindrance.',
      'Ordinarily not longer than five years, renewable upon request.',
      'Indefinitely, since a certificate never expires once it is issued.'
    ], answerIndex: 1 },
    'bco-comp-131': { choices: [
      'Jurisdiction transfers instantly the moment the certificate is signed.',
      'The minister remains under no Presbytery’s jurisdiction during transfer.',
      'The dismissing Presbytery retains jurisdiction until the other Presbytery receives him.',
      'The receiving Presbytery must first hold a formal trial before receiving him.'
    ], answerIndex: 2 },
    'bco-comp-132': { choices: [
      'A binding law, equal in force, authority, and effect to the BCO itself.',
      'A purely optional document, lacking force, authority, or standing in the Constitution.',
      'A set of civil regulations, enforceable by courts, sessions, or presbyteries alone.',
      'An approved guide, though only BCO 56, 57, 58, and 59-3 bind constitutionally.'
    ], answerIndex: 3 },
    'bco-comp-133': { choices: [
      'The Holy Scriptures, the only infallible rule of faith and practice.',
      'Historic denominational tradition, apart from any scriptural warrant.',
      'The personal preference of the presiding teaching elder.',
      'Regional custom, adapted freely by each local congregation.'
    ], answerIndex: 0 },
    'bco-comp-134': { choices: [
      'Announcements, fellowship time, and a closing benediction alone.',
      'Prayer, praise, Scripture reading and preaching, the sacraments, and offerings.',
      'Committee reports, budget review, and congregational business items.',
      'Special music programs and denominational fundraising appeals.'
    ], answerIndex: 1 },
    'bco-comp-135': { choices: [
      'The congregation, voting weekly on preaching, music, and property use.',
      'The Presbytery, which sets worship, preaching, and property policy churchwide.',
      'The Session, which oversees worship, preaching, and church property use.',
      'The music director, who sets worship, preaching, and property schedules alone.'
    ], answerIndex: 2 },
    'bco-comp-136': { choices: [
      'A day like any other, requiring no worship, rest, or works of mercy.',
      'A day for private devotion only, without worship, rest, or public mercy.',
      'A day for rest only, without worship, necessity, or works of mercy.',
      'Sanctified by worship, works of necessity and mercy, and rest from labor.'
    ], answerIndex: 3 },
    'bco-comp-137': { choices: [
      'Ordered by Scripture, for edification, reverence, and understanding.',
      'Ordered by preference, for comfort, familiarity, and visitor appeal.',
      'Ordered by popularity, for excitement, novelty, and crowd size.',
      'Ordered by uniformity, for sameness, tradition, and denominational rule.'
    ], answerIndex: 0 },
    'bco-comp-138': { choices: [
      'Any member who simply volunteers, entirely apart from Session oversight.',
      'Those appointed by the Session, since reading is an element under its oversight.',
      'Only the teaching elder himself, never any ruling elder or ordinary member.',
      'Only visiting ministers, never any member of the local congregation itself.'
    ], answerIndex: 1 },
    'bco-comp-139': { choices: [
      'Only trained choirs may sing, with congregational singing discouraged.',
      'Singing is optional and may be omitted from worship without concern.',
      'The congregation sings with understanding and grace, under the Session’s oversight.',
      'Singing is governed by Presbytery, not by the local church’s Session.'
    ], answerIndex: 2 },
    'bco-comp-140': { choices: [
      'Petitions, requests, wishes, and hopes offered in the worshiper’s own words.',
      'Thanksgiving, gratitude, praise, and delight offered apart from confession.',
      'Intercession, advocacy, pleading, and requests offered for civil leaders alone.',
      'Adoration, confession, thanksgiving, and intercession offered through Christ.'
    ], answerIndex: 3 },
    'bco-comp-141': { choices: [
      'A chief means of grace, explaining and applying Scripture for conversion and growth.',
      'A minor element, secondary to music, drama, and other visual elements of worship.',
      'An optional addition, included only on holidays and other special occasions.',
      'A purely academic lecture, detached from pastoral care and personal application.'
    ], answerIndex: 0 },
    'bco-comp-142': { choices: [
      'Any communing member who simply feels personally called to preach that day.',
      'Only men qualified under Scripture and the BCO, as the Session must ensure.',
      'Any licensed layperson at all, without requiring any Session approval first.',
      'Any visiting speaker at all, regardless of his denominational affiliation.'
    ], answerIndex: 1 },
    'bco-comp-143': { choices: [
      'As a formality, void of any worship meaning or spiritual significance.',
      'As an obligation, enforced strictly by the church’s governing board.',
      'As acts of worship and mercy, not merely administrative fundraising.',
      'As a private matter, unrelated to the congregation’s corporate worship.'
    ], answerIndex: 2 },
    'bco-comp-144': { choices: [
      'It satisfies a civil requirement, eases registration, and skips congregational input.',
      'It replaces preaching, shortens the service, and removes exposition entirely.',
      'It shortens the sermon, saves preparation time, and simplifies Sunday planning.',
      'Public confession strengthens unity, teaches doctrine, and unites the congregation.'
    ], answerIndex: 3 },
    'bco-comp-145': { choices: [
      'Christian prudence, applying Scripture’s general rules for reverence and edification.',
      'Personal preference, applying the presiding officer’s taste for a given Sunday.',
      'Denominational custom, applying whatever neighboring churches happen to practice.',
      'Congregational vote, applying whatever the members adopt at an annual meeting.'
    ], answerIndex: 0 },
    'bco-comp-146': { choices: [
      'Treating it as a binding civil statute enforceable by outside courts.',
      'Treating it as either optional fluff or as mechanical, rigid rubrics.',
      'Ignoring it entirely, since it carries no constitutional weight at all.',
      'Applying it only to Sunday morning, never to other worship services.'
    ], answerIndex: 1 },
    'bco-comp-147': { choices: [
      'Any ordained ruling elder, acting whenever no teaching elder is present at all.',
      'Any baptized member in good standing, acting only in cases of urgent necessity.',
      'A minister of the Word, lawfully called and authorized to administer sacraments.',
      'Any deacon, acting under the Session’s direct authorization in an emergency.'
    ], answerIndex: 2 },
    'bco-comp-148': { choices: [
      'Only adults who can articulate a full doctrinal confession of faith.',
      'Only infants, since adult believers are baptized by profession alone.',
      'Only those formally examined and admitted to the Lord’s Table.',
      'Previously unbaptized believers and the infant children of believing parents.'
    ], answerIndex: 3 },
    'bco-comp-149': { choices: [
      'They acknowledge the child’s need, claim the covenant, and promise Christian nurture.',
      'They pledge building funds, annual dues, and support for church maintenance.',
      'They promise denominational schooling, uniforms, and required attendance fees.',
      'They vow early examination, membership within a year, and full church dues.'
    ], answerIndex: 0 },
    'bco-comp-150': { choices: [
      'To assume full legal guardianship of the child if needed.',
      'To assist the parents in the child’s Christian nurture.',
      'To fund the child’s future seminary education if called to ministry.',
      'To require the child’s baptism be repeated at communicant age.'
    ], answerIndex: 1 },
    'bco-comp-151': { choices: [
      'By Presbytery examination alone, entirely apart from any Session involvement.',
      'Automatically upon reaching a fixed age the congregation sets by local custom.',
      'By Session examination, after a profession of faith and membership vows.',
      'By a congregational vote, taken formally at each stated quarterly meeting.'
    ], answerIndex: 2 },
    'bco-comp-152': { choices: [
      'Affirming denominational loyalty, tithing regularly, attending weekly, serving on committees, and voting in meetings.',
      'Confessing sin publicly, joining a small group, serving monthly, giving generously, and praying daily.',
      'Believing the creed personally, attending worship weekly, serving as an officer, giving generously, and witnessing publicly.',
      'Acknowledging sin, trusting Christ, resolving obedience, supporting the church, and submitting to government.'
    ], answerIndex: 3 },
    'bco-comp-153': { choices: [
      'By profession of faith, reaffirmation of faith, or letter of transfer.',
      'By transfer letter, denominational referral, or Presbytery assignment.',
      'By fresh baptism, renewed confession, or repeated church membership.',
      'By Presbytery action, direct appointment, or Stated Clerk certification.'
    ], answerIndex: 0 },
    'bco-comp-154': { choices: [
      'Any baptized visitor, regardless of standing in another church.',
      'Not the ignorant or scandalous; the Session governs the practice of invitation.',
      'Only lifelong PCA members, excluding all other evangelical believers.',
      'Anyone present in the congregation, without any restriction at all.'
    ], answerIndex: 1 },
    'bco-comp-155': { choices: [
      'A warning that latecomers forfeit elements, seating, and the closing prayer.',
      'A reminder that offerings, announcements, and greetings follow immediately.',
      'Fencing the Table with invitation, warning, and a call to self-examination.',
      'A notice that children, visitors, and infants must leave before it begins.'
    ], answerIndex: 2 },
    'bco-comp-156': { choices: [
      'It must be administered weekly, with no exception the Session may grant.',
      'It must be administered annually, only once, on Easter Sunday each year.',
      'Presbytery sets a fixed frequency, binding on every church within its bounds.',
      'The Session sets frequency, administering it often enough for edification.'
    ], answerIndex: 3 },
    'bco-comp-157': { choices: [
      'A union of one man and one woman, holding full constitutional authority in the PCA.',
      'A civil arrangement the church merely observes, offering no teaching of its own.',
      'A covenant whose definition is left to each Session to determine locally.',
      'A relationship the Directory leaves entirely to each state’s civil law.'
    ], answerIndex: 0 },
    'bco-comp-158': { choices: [
      'Requiring only a license, skipping instruction, and ignoring biblical concerns.',
      'Ensuring eligibility, instructing the couple, and avoiding unscriptural unions.',
      'Deferring to the couple, skipping instruction, and avoiding pastoral involvement.',
      'Requiring approval in advance, skipping instruction, and adding administrative delay.'
    ], answerIndex: 1 },
    'bco-comp-159': { choices: [
      'Record-keeping, roll updates, address verification, and mailing-list maintenance.',
      'Eligibility review, paperwork, income verification, and assistance approval.',
      'Comfort, prayer, Scripture, and preparation of the person in faith and hope.',
      'Testimony-gathering, note-taking, evidence review, and case-file preparation.'
    ], answerIndex: 2 },
    'bco-comp-160': { choices: [
      'With elaborate ceremony, tributes, and eulogies to worldly achievement.',
      'Without Scripture, prayer, or hope, keeping the service strictly secular.',
      'According to family custom, tradition, and whatever culture prescribes.',
      'With simplicity, dignity, Scripture, and hope in the resurrection.'
    ], answerIndex: 3 },
    'bco-comp-161': { choices: [
      'Special occasions for humiliation and prayer, or grateful acknowledgment of mercies.',
      'Mandatory weekly observances, required without exception of every member.',
      'Civil holidays the church must formally ignore, observing no worship at all.',
      'Occasions reserved for officers alone, excluding the rest of the congregation.'
    ], answerIndex: 0 },
    'bco-comp-162': { choices: [
      'Only the General Assembly, since no Session or Presbytery holds this power.',
      'Church courts within their own bounds, observing civil occasions religiously.',
      'Only civil authorities, since no church court holds any such spiritual power.',
      'Only individual members, acting entirely apart from any church court’s authority.'
    ], answerIndex: 1 },
    'bco-comp-163': { choices: [
      'Home religion is private, personal, and outside the church’s proper concern.',
      'Family worship binds officers, not members, and rarely applies at all.',
      'The home is a sphere of discipleship through worship, instruction, and example.',
      'Home discipleship is optional, temporary, and ends at communicant status.'
    ], answerIndex: 2 },
    'bco-comp-164': { choices: [
      'They are the only chapters requiring word-for-word candidate memorization.',
      'They are merely advisory, unlike the rest of the Directory’s chapters.',
      'They govern only music, singing, and the choice of hymns in worship.',
      'They hold full authority, governing Baptism, admission, and the Supper.'
    ], answerIndex: 3 },
    'bco-comp-165': { choices: [
      'Baptism marks membership, Session examination admits to the Table, and discipline can bar access.',
      'Sacraments are separate, membership independent, examination unrelated, and discipline irrelevant.',
      'Membership follows Communion, Baptism follows examination, and discipline follows the Table.',
      'The Session’s role ends at Baptism, examination is automatic, and discipline is unrelated.'
    ], answerIndex: 0 }
  };
  global.PCA_CARD_QUIZ = Object.assign(global.PCA_CARD_QUIZ || {}, Q);
})(typeof window !== 'undefined' ? window : globalThis);
