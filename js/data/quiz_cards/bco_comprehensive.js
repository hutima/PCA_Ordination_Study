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
      'Christ alone is King and Head of the church, and all church order must submit to His Word.',
      'The Assembly alone holds authority to define the church’s doctrine and worship.',
      'Church officers may set doctrine and government as tradition and need require.',
      'Civil magistrates share authority with the church in ordering worship and doctrine.'
    ], answerIndex: 0 },
    'bco-comp-002': { choices: [
      'Courts may enact new rules of conscience whenever pastoral wisdom sees a need.',
      'Courts apply and declare Scripture’s teaching; they do not create binding law of their own.',
      'Courts function mainly to preserve denominational tradition rather than apply Scripture.',
      'Courts derive their authority from the consent of the governed congregation alone.'
    ], answerIndex: 1 },
    'bco-comp-003': { choices: [
      'The Constitution consists only of General Assembly resolutions adopted year by year.',
      'The Constitution is limited to the Directory for Worship and local church bylaws.',
      'The Constitution, subordinate to Scripture, holds the Westminster Standards and the Book of Church Order.',
      'The Constitution ranks the Book of Church Order above Scripture in final authority.'
    ], answerIndex: 2 },
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
      'Only adult believers who have been examined and admitted to communicant status.',
      'All who profess faith in Christ in every nation, together with their children.',
      'Only those formally enrolled as voting members of a particular congregation.',
      'Only ordained officers and their households within a given denomination.'
    ], answerIndex: 1 },
    'bco-comp-007': { choices: [
      'Teaching elders alone, assisted informally by unordained volunteers.',
      'Deacons and trustees, who together direct the church’s spiritual affairs.',
      'Teaching elders, ruling elders, and deacons, according to Scripture.',
      'A single bishop assisted by a council of appointed advisors.'
    ], answerIndex: 2 },
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
      'As true branches only if they share the PCA’s exact form of government.',
      'As true branches of Christ’s church wherever Word and Sacrament are kept with integrity.',
      'As mission fields needing reorganization under Presbyterian courts.',
      'As essentially unchristian unless they adopt the Westminster Standards.'
    ], answerIndex: 1 },
    'bco-comp-011': { choices: [
      'The power of tradition, held by Session, and the power of custom, held by Presbytery.',
      'The power of the keys, held only by teaching elders ordained to preach.',
      'Order, exercised individually by officers, and jurisdiction, exercised jointly by courts.',
      'The power of persuasion, used privately, and the power of law, used civilly.'
    ], answerIndex: 2 },
    'bco-comp-012': { choices: [
      'To enact civil statutes and levy taxes for the support of public order.',
      'To adjudicate property disputes between neighboring congregations only.',
      'To certify candidates for civil office within its bounds and district.',
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
      'It lacks a permanent governing body and is temporarily overseen by Presbytery, a mother Session, or an evangelist.',
      'It has a permanent Session but no ordained deacons serving its members.',
      'It is governed by a bishop appointed directly by the General Assembly.',
      'It cannot ever call a pastor until fifty years after its founding date.'
    ], answerIndex: 0 },
    'bco-comp-018': { choices: [
      'The General Assembly, acting directly without any Presbytery involvement.',
      'Presbytery, whether on its own initiative, through a Session, or by petition.',
      'A single teaching elder, acting entirely on his own personal authority.',
      'The denomination’s mission board, apart from any regional church court.'
    ], answerIndex: 1 },
    'bco-comp-019': { choices: [
      'A permanent bishop, a diocesan council, or a synod-appointed administrator.',
      'A rotating congregational committee elected annually by the members present.',
      'An evangelist, a mother-daughter Session relationship, or a commission serving as temporary Session.',
      'A denominational trustee, a regional treasurer, or an outside consultant.'
    ], answerIndex: 2 },
    'bco-comp-020': { choices: [
      'A congregational vote alone, without any involvement from Presbytery.',
      'A denominational audit followed by automatic recognition after one year.',
      'A letter to the Stated Clerk, with no examination of prospective officers.',
      'Officer nomination, a petition to Presbytery, an organizing commission, and ordination of officers.'
    ], answerIndex: 3 },
    'bco-comp-021': { choices: [
      'The baptized children of believers, members by covenant though not yet at the Table.',
      'Visitors attending worship who have not yet been baptized or examined.',
      'Adults who transferred membership but have not yet met with the Session.',
      'Former members who were removed from the roll for prolonged absence.'
    ], answerIndex: 0 },
    'bco-comp-022': { choices: [
      'Those baptized as infants who have not yet made a personal profession.',
      'Those who have professed faith, been baptized, and been admitted to the Table.',
      'Those who merely attend worship regularly without formal church admission.',
      'Those serving as officers, whether or not they have professed faith.'
    ], answerIndex: 1 },
    'bco-comp-023': { choices: [
      'Any regular attender who contributes financially to the congregation.',
      'Non-communing members, once they reach the age of accountability.',
      'Only communing members, admitted by profession, baptism, and the Session.',
      'Associate members, regardless of their standing at their home church.'
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
      'Formal seminary education, a minimum age of forty, and prior military service.',
      'Denominational tenure of ten years and unanimous congregational popularity.',
      'Sound learning, blameless life, sound doctrine, teaching aptitude, and a well-ruled household.',
      'Wealth sufficient to fund the church budget and a background in business.'
    ], answerIndex: 2 },
    'bco-comp-028': { choices: [
      'Preaching exclusively, with all other pastoral duties reserved to deacons.',
      'Managing church property and finances, apart from any spiritual oversight.',
      'Recruiting new members through advertising and community outreach programs.',
      'Watching over doctrine and morals, exercising discipline, visiting, instructing, and praying for the flock.'
    ], answerIndex: 3 },
    'bco-comp-029': { choices: [
      'Reading, expounding, and preaching the Word, and administering the sacraments.',
      'Visiting the sick and distributing mercy funds to needy households.',
      'Keeping the church’s financial books and preparing the annual budget.',
      'Recruiting and training new ruling elders for eventual ordination.'
    ], answerIndex: 0 },
    'bco-comp-030': { choices: [
      'Teaching elders alone may vote in Presbytery; ruling elders may only observe.',
      'Both hold one office with equal court authority, though their functions differ.',
      'Ruling elders outrank teaching elders in every court above the Session.',
      'Teaching elders are ordained for life, while ruling elders serve fixed terms.'
    ], answerIndex: 1 },
    'bco-comp-031': { choices: [
      'Serve as permanent moderator of Presbytery for as long as he is ordained.',
      'Overrule Session decisions in any established, fully organized church.',
      'Preach, administer sacraments, and in extraordinary cases ordain officers for a mission church.',
      'Appoint his own successor without any action by the Presbytery itself.'
    ], answerIndex: 2 },
    'bco-comp-032': { choices: [
      'A temporary office held only until a congregation calls its first pastor.',
      'An honorary office carrying no ongoing spiritual responsibility at all.',
      'A governing office equal in ruling authority to the teaching elder.',
      'An ordinary, perpetual office marked by sympathy, service, and mutual care.'
    ], answerIndex: 3 },
    'bco-comp-033': { choices: [
      'Ministering to the needy, promoting giving, and caring for church property.',
      'Preaching the Word and administering the sacraments to the congregation.',
      'Examining and ordaining ruling elders on behalf of the Session.',
      'Moderating Presbytery meetings and certifying commissioner credentials.'
    ], answerIndex: 0 },
    'bco-comp-034': { choices: [
      'As individual agents, each reporting directly to the General Assembly.',
      'As a Board of Deacons, with the pastor advisory, reporting minutes to the Session.',
      'As a standing Presbytery committee, independent of the local church.',
      'As an elected auxiliary of the congregation’s women’s ministry.'
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
      'Civil and spiritual jointly, allowing courts to enforce criminal penalties.',
      'Moral and spiritual, covering doctrine, worship, and discipline, never civil.',
      'Purely advisory, with no binding authority over ministers or members.',
      'Limited strictly to property disputes among member congregations.'
    ], answerIndex: 1 },
    'bco-comp-039': { choices: [
      'Session governs the whole church, while Presbytery handles only finances.',
      'Presbytery governs one church, while Session oversees an entire district.',
      'Session governs one church, Presbytery a district, and Assembly the whole church.',
      'All three courts share identical, overlapping jurisdiction everywhere.'
    ], answerIndex: 2 },
    'bco-comp-040': { choices: [
      'The pastor alone, together with the congregation’s elected trustees.',
      'The deacons and the pastor, without any ruling elders included.',
      'The congregation’s oldest members, regardless of ordination status.',
      'The pastor, any associate pastors, and the church’s ruling elders.'
    ], answerIndex: 3 },
    'bco-comp-041': { choices: [
      'Pastor plus two ruling elders if there are four or more; otherwise pastor plus one.',
      'Pastor plus three ruling elders regardless of how many elders serve.',
      'Any two ruling elders, whether or not the pastor is present.',
      'Pastor alone, since one officer may constitute a quorum for the Session.'
    ], answerIndex: 0 },
    'bco-comp-042': { choices: [
      'Any single ruling elder, who alone may constitute the Session’s quorum.',
      'Three ruling elders if there are five or more; otherwise two, with one alone insufficient.',
      'Four ruling elders regardless of how many elders the church has.',
      'The clerk of Presbytery, sitting in place of the vacant pastorate.'
    ], answerIndex: 1 },
    'bco-comp-043': { choices: [
      'Ordaining teaching elders and licensing candidates for the ministry.',
      'Electing commissioners to the General Assembly’s Standing Judicial Commission.',
      'Receiving and disciplining members, examining officers, and approving the budget.',
      'Amending the Book of Church Order and the Westminster Standards.'
    ], answerIndex: 2 },
    'bco-comp-044': { choices: [
      'At least weekly, with minutes submitted monthly for Assembly review.',
      'Only when a discipline case arises, with no regular review required.',
      'At least annually, with minutes reviewed once every decade.',
      'At least quarterly, with minutes submitted annually for Presbytery review.'
    ], answerIndex: 3 },
    'bco-comp-045': { choices: [
      'The teaching elders and churches within its bounds, meeting with elected ruling elders.',
      'Only teaching elders, since ruling elders never sit in Presbytery.',
      'Only ruling elders, elected annually by their home congregations.',
      'Deacons and teaching elders, without any ruling elder representation.'
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
      'Overseeing only foreign missions, apart from any local church matters.',
      'Amending the Westminster Standards without General Assembly involvement.',
      'Electing the Stated Clerk of the General Assembly each year.',
      'Overseeing ministers, Sessions, and churches, including licensure, ordination, and review.'
    ], answerIndex: 3 },
    'bco-comp-049': { choices: [
      'On experience, character, theology, sacraments, government, and any stated differences.',
      'Only on their preaching ability, judged by a single trial sermon.',
      'Only on their doctrinal views, without any character examination.',
      'Not examined at all, since transfer is automatic upon request.'
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
      '50 commissioners, all teaching elders, from any number of Presbyteries.',
      '200 commissioners, two-thirds ruling elders, from every Presbytery.',
      '25 commissioners, evenly split, representing half of the Presbyteries.',
      '100 commissioners, half teaching elders and half ruling elders, from a third of Presbyteries.'
    ], answerIndex: 3 },
    'bco-comp-053': { choices: [
      'Appeals, doctrinal controversies, Presbytery review, agency oversight, and amendments.',
      'Only the annual budget, leaving doctrine entirely to the Presbyteries.',
      'Only foreign correspondence, leaving discipline entirely to Sessions.',
      'Only electing the moderator, with no other constitutional business.'
    ], answerIndex: 0 },
    'bco-comp-054': { choices: [
      'Deliverances bind every future Assembly decision without exception.',
      'Deliverances merit serious weight, and judicial decisions bind the parties involved.',
      'Deliverances are purely symbolic and carry no weight in any court.',
      'Judicial decisions bind only the Stated Clerk, not the parties.'
    ], answerIndex: 1 },
    'bco-comp-055': { choices: [
      'A committee decides finally; a commission may only advise the court.',
      'A committee and a commission are simply two names for the same body.',
      'A committee reports back; a commission is empowered to decide the matter itself.',
      'A committee serves Presbytery only; a commission serves Session only.'
    ], answerIndex: 2 },
    'bco-comp-056': { choices: [
      'Amending the Book of Church Order on Presbytery’s own authority.',
      'Electing Presbytery’s representatives to the General Assembly.',
      'Setting the annual budget for every church within its bounds.',
      'Taking testimony, ordaining or installing ministers, and organizing new churches.'
    ], answerIndex: 3 },
    'bco-comp-057': { choices: [
      'At least two teaching elders and two ruling elders.',
      'At least one teaching elder and five ruling elders.',
      'At least three teaching elders and no ruling elders.',
      'At least four ruling elders and no teaching elders.'
    ], answerIndex: 0 },
    'bco-comp-058': { choices: [
      'A temporary Session committee that handles only local property disputes.',
      'A permanent Assembly commission of twenty-four elders handling most GA judicial matters.',
      'A Presbytery panel of six elders that reviews annual church budgets.',
      'An advisory board of laypeople with no judicial authority at all.'
    ], answerIndex: 1 },
    'bco-comp-059': { choices: [
      'A private conviction alone, requiring no recognition by any church court.',
      'A seminary diploma combined with a passing score on a written exam.',
      'An inward call of the Spirit, recognition by the people, and judgment of a lawful court.',
      'An appointment made solely by the Stated Clerk of the Presbytery.'
    ], answerIndex: 2 },
    'bco-comp-060': { choices: [
      'Yes, a Presbytery may install any candidate without a congregational vote.',
      'Yes, a Session may appoint elders without ever presenting them for election.',
      'Yes, provided the General Assembly issues a direct appointment letter.',
      'No, ordinary vocation includes election by the body he will serve.'
    ], answerIndex: 3 },
    'bco-comp-061': { choices: [
      'The authoritative admission to office by prayer and laying on of hands after examination.',
      'A ceremonial title conferred automatically upon seminary graduation.',
      'A congregational vote alone, without any examination by a court.',
      'An honorary recognition granted after many years of faithful service.'
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
      'A completed seminary degree and five years of prior teaching experience.',
      'Nomination by three ordained ministers and a unanimous Assembly vote.',
      'A written doctrinal thesis submitted directly to the Stated Clerk.',
      'Membership, Session endorsement, timely application, and personal examination by Presbytery.'
    ], answerIndex: 3 },
    'bco-comp-065': { choices: [
      'Presbytery’s permission for a candidate to preach regularly as a step toward ordination.',
      'A permanent status equivalent to ordination, requiring no further steps.',
      'A Session’s authorization for a candidate to administer the sacraments.',
      'A congregational vote granting full voting rights to a candidate.'
    ], answerIndex: 0 },
    'bco-comp-066': { choices: [
      'Only a written sermon and a background check by local police.',
      'Christian experience, theology, English Bible, the BCO, oral exams, and a sermon.',
      'Only Greek and Hebrew translation, without any theology component.',
      'Only a psychological evaluation and a reference from three deacons.'
    ], answerIndex: 1 },
    'bco-comp-067': { choices: [
      'A one-week orientation required before a candidate may be licensed.',
      'An optional program that Presbytery may waive without any conditions.',
      'A trial period of at least one year testing a candidate’s ministerial gifts.',
      'A lifetime appointment that replaces the need for later ordination.'
    ], answerIndex: 2 },
    'bco-comp-068': { choices: [
      'The Session alone, without any congregational meeting being required.',
      'The Presbytery alone, without any input from the local congregation.',
      'The outgoing pastor, who names his own successor before departing.',
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
      'Only a sermon and a written statement of personal testimony.',
      'Only a theology exam and an interview with the Session.',
      'Experience, theology, sacraments, government, Bible, history, languages, and sermon/papers.',
      'Only Greek translation and a background check by Presbytery.'
    ], answerIndex: 2 },
    'bco-comp-072': { choices: [
      'The candidate alone decides which differences are acceptable to hold.',
      'Any stated difference automatically disqualifies a man from ordination.',
      'Differences are never discussed once a candidate signs the ordination vows.',
      'The court judges whether a stated difference is semantic, minor, or contrary to a fundamental.'
    ], answerIndex: 3 },
    'bco-comp-073': { choices: [
      'He affirms Scripture’s inerrancy and adopts the Westminster Standards as Scripture’s system of doctrine.',
      'He affirms only personal experience as the final rule of faith and practice.',
      'He affirms the Standards but is free to reject Scripture’s inerrancy.',
      'He affirms denominational bylaws without needing to address doctrine at all.'
    ], answerIndex: 0 },
    'bco-comp-074': { choices: [
      'Independence from his brethren and freedom from any court’s oversight.',
      'Submission to his brethren, zeal for truth and peace, and faithful, pastoral service.',
      'Loyalty to his seminary above loyalty to the congregation he serves.',
      'A promise to seek personal advancement within denominational structures.'
    ], answerIndex: 1 },
    'bco-comp-075': { choices: [
      'To obey him absolutely, without any right of appeal to Presbytery.',
      'To fund him generously but withhold any personal encouragement.',
      'To receive him, submit to him in the Lord, encourage him, and provide support.',
      'To elect him for a fixed term, renewable only by unanimous vote.'
    ], answerIndex: 2 },
    'bco-comp-076': { choices: [
      'All three are called identically by a vote of the Presbytery alone.',
      'Session calls the pastor; the congregation calls the assistant pastor.',
      'Only the pastor is ordained; associate and assistant pastors are not.',
      'Congregation calls pastor and associate pastor; Session calls assistant pastor.'
    ], answerIndex: 3 },
    'bco-comp-077': { choices: [
      'Presbytery, ordinarily after the pastor, congregation, or both request it.',
      'The Session, acting entirely without any Presbytery involvement.',
      'The congregation alone, by a simple majority vote at any meeting.',
      'The pastor alone, by submitting a letter of resignation to the clerk.'
    ], answerIndex: 0 },
    'bco-comp-078': { choices: [
      'Session appointment alone, without any congregational nomination process.',
      'Public notice, nominations, Session examination, then congregational election.',
      'Presbytery appointment, followed by a brief congregational announcement.',
      'Random selection from the membership roll, followed by ordination.'
    ], answerIndex: 1 },
    'bco-comp-079': { choices: [
      'Only their attendance record over the preceding calendar year.',
      'Only their financial giving history to the congregation’s budget.',
      'Character, knowledge of doctrine and government, office duties, and willingness to take vows.',
      'Only their public speaking ability, judged through a trial address.'
    ], answerIndex: 2 },
    'bco-comp-080': { choices: [
      'Affirming only personal conviction, without reference to any confession.',
      'Promising financial support alone, without any doctrinal affirmation.',
      'Promising obedience to the pastor rather than to the church’s Standards.',
      'Affirming Scripture and the Standards, accepting office, and promising faithful service.'
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
      'A single General Assembly may amend the BCO by simple majority alone.',
      'Any Session may amend the BCO for its own congregation by local vote.',
      'Amendments require unanimous consent of every teaching elder in the PCA.',
      'GA majority proposes, two-thirds of Presbyteries consent, and the next GA enacts by majority.'
    ], answerIndex: 3 },
    'bco-comp-085': { choices: [
      'Three-fourths of GA proposes, three-fourths of Presbyteries consent, and the next GA enacts by three-fourths.',
      'A simple majority of one General Assembly is sufficient to amend the Standards.',
      'Amendments require only Presbytery approval, without any General Assembly vote.',
      'The Standards may never be amended under any circumstances whatsoever.'
    ], answerIndex: 0 },
    'bco-comp-086': { choices: [
      'Only the formal judicial process of trial, censure, and appeal.',
      'Church authority to instruct and govern, including both shepherding care and formal judicial process.',
      'Only informal pastoral counsel, without any judicial dimension at all.',
      'Only the civil enforcement of church rules through outside authorities.'
    ], answerIndex: 1 },
    'bco-comp-087': { choices: [
      'Only ordained officers, since ordinary members are exempt from discipline.',
      'Only communing members, since baptized children are exempt entirely.',
      'All baptized persons, as members of the church, are subject to discipline.',
      'Only those who have signed a formal church membership covenant.'
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
      'Immediate court action, skipping any private admonition beforehand.',
      'Instruction in the Word, private admonition, then witnesses, before the court acts.',
      'Public announcement to the congregation, then private admonition.',
      'A written complaint to Presbytery, filed before any local contact.'
    ], answerIndex: 1 },
    'bco-comp-091': { choices: [
      'Through formal trial before the Session, exactly as for adult members.',
      'Through automatic suspension until they reach communicant age.',
      'Primarily through their parents, with the Session providing oversight and instruction.',
      'Through direct Presbytery intervention, bypassing the local Session.'
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
      'A private conversation with no formal standing in church records.',
      'A permanent removal from church membership without any warning.',
      'A formal reproof by a court, warning the offender and calling him to repentance.',
      'A financial penalty imposed alongside a public congregational notice.'
    ], answerIndex: 2 },
    'bco-comp-096': { choices: [
      'Permanent exclusion from the sacraments, with no path to restoration.',
      'A brief delay in ordination, imposed automatically for all candidates.',
      'A formal transfer of membership to another congregation nearby.',
      'Temporary exclusion from sacramental privileges, office, or both, as the case requires.'
    ], answerIndex: 3 },
    'bco-comp-097': { choices: [
      'Deposition removes an officer from office; excommunication excludes from communion.',
      'Deposition excludes from communion; excommunication removes from office.',
      'Deposition and excommunication both refer only to removal from office.',
      'Deposition and excommunication both refer only to loss of voting rights.'
    ], answerIndex: 0 },
    'bco-comp-098': { choices: [
      'Two private members, with the court serving only as a neutral witness.',
      'The church, through an appointed prosecutor, and the accused member.',
      'The Session and the Presbytery, disputing jurisdiction over the case.',
      'The accused and his own attorney, without any church prosecutor.'
    ], answerIndex: 1 },
    'bco-comp-099': { choices: [
      'Institute formal process immediately upon receiving any complaint.',
      'Wait for a civil court ruling before taking any action at all.',
      'Diligently seek explanation of reports, instituting process only on strong presumption of guilt.',
      'Refer every report automatically to the General Assembly for review.'
    ], answerIndex: 2 },
    'bco-comp-100': { choices: [
      'The charge alone suffices; no supporting facts need be stated.',
      'Only the accused’s name and the date of his original ordination.',
      'A list of witnesses only, without any statement of the offense itself.',
      'The charge states the offense; specifications give facts, times, and circumstances.'
    ], answerIndex: 3 },
    'bco-comp-101': { choices: [
      'Notice, time to prepare, objection to members, evidence, and the right to appeal.',
      'The right to select the court’s moderator for his own trial.',
      'The right to have all proceedings kept permanently confidential.',
      'The right to a jury of members chosen from outside the church.'
    ], answerIndex: 0 },
    'bco-comp-102': { choices: [
      'The case is automatically dismissed for lack of the accused’s presence.',
      'After proper citation, the court may proceed, and persistent refusal may affect the case.',
      'The court must wait indefinitely until the accused agrees to appear.',
      'The accused is immediately excommunicated without further proceedings.'
    ], answerIndex: 1 },
    'bco-comp-103': { choices: [
      'No standard applies, since any ordained member may sit on any case.',
      'Only friendship with the accused disqualifies a member from sitting.',
      'Impartiality, with objections to a member’s sitting decided by the court.',
      'Only prior service as prosecutor disqualifies a member from sitting.'
    ], answerIndex: 2 },
    'bco-comp-104': { choices: [
      'A process reserved to Presbytery, since Sessions may never try members.',
      'A purely advisory hearing, with no power to impose any censure.',
      'A process requiring General Assembly approval before it may begin.',
      'The Session’s original jurisdiction over its members, with Presbytery able to intervene if needed.'
    ], answerIndex: 3 },
    'bco-comp-105': { choices: [
      'The Presbytery of which he is a member, except where the BCO provides otherwise.',
      'The Session of the church where he currently serves as pastor.',
      'The General Assembly, which alone may try any ordained minister.',
      'A special tribunal composed of elders from outside his Presbytery.'
    ], answerIndex: 0 },
    'bco-comp-106': { choices: [
      'A minister may never be restricted in any way before a final verdict.',
      'Presbytery may impose temporary restrictions when charges or circumstances require it.',
      'Only the Session where he serves may impose any temporary restriction.',
      'Only the General Assembly may impose restrictions during Presbytery process.'
    ], answerIndex: 1 },
    'bco-comp-107': { choices: [
      'Only sworn written affidavits, since oral testimony is never permitted.',
      'Only physical evidence, since witness testimony is inadmissible.',
      'Witness testimony, records, and documents, provided they are relevant and fairly received.',
      'Only evidence supplied directly by the accused, none from the church.'
    ], answerIndex: 2 },
    'bco-comp-108': { choices: [
      'A single uncorroborated witness is always sufficient to establish guilt.',
      'At least three witnesses are required in every case without exception.',
      'No witnesses are required if the accused has already confessed privately.',
      'More than one, though a single witness plus corroboration may suffice.'
    ], answerIndex: 3 },
    'bco-comp-109': { choices: [
      'Witnesses testify under solemn duty and may be examined and cross-examined.',
      'Witnesses may testify anonymously, without any duty to tell the truth.',
      'Witnesses are barred from cross-examination to protect their privacy.',
      'Only the accused may question witnesses; the court may not.'
    ], answerIndex: 0 },
    'bco-comp-110': { choices: [
      'With public announcement alone, apart from any prayer or tenderness.',
      'With prayer, tenderness, and solemnity, suited to the offense and the offender’s good.',
      'With strict formality only, avoiding any personal pastoral address.',
      'With written notice sent by mail, without any court proceeding.'
    ], answerIndex: 1 },
    'bco-comp-111': { choices: [
      'Automatically, after a fixed period of time has elapsed.',
      'Only by a unanimous vote of the entire congregation.',
      'Upon repentance and satisfactory evidence, by action of the court with jurisdiction.',
      'Only by direct action of the General Assembly in every case.'
    ], answerIndex: 2 },
    'bco-comp-112': { choices: [
      'Judicial trials conducted without any charges or specifications filed.',
      'Cases where the accused waives his right to any court hearing.',
      'Cases automatically referred to civil courts instead of church courts.',
      'Non-judicial matters like dismissal, erasure, or divestiture, handled without a formal trial.'
    ], answerIndex: 3 },
    'bco-comp-113': { choices: [
      'Removal from office without disciplinary censure, when a man is no longer able to serve.',
      'A disciplinary censure imposed without any removal from office.',
      'A voluntary resignation that requires no action by any court.',
      'A temporary suspension automatically lifted after one year.'
    ], answerIndex: 0 },
    'bco-comp-114': { choices: [
      'A formal censure requiring a full judicial trial before Presbytery.',
      'A Session’s removal of a name from the roll for cases like prolonged absence.',
      'An action only the General Assembly may take, never a Session.',
      'A punishment reserved exclusively for ordained officers, not members.'
    ], answerIndex: 1 },
    'bco-comp-115': { choices: [
      'Only appeals, since references and complaints are not part of the BCO.',
      'Only annual budget review, apart from any judicial proceedings.',
      'General review and control, references, appeals, complaints, and jurisdiction matters.',
      'Only direct General Assembly investigation, without any lower-court role.'
    ], answerIndex: 2 },
    'bco-comp-116': { choices: [
      'A lower court’s power to overturn any higher court’s final ruling.',
      'An annual audit of church finances performed by civil accountants.',
      'A one-time review conducted only when a formal complaint is filed.',
      'A higher court’s regular review of lower-court records for regularity and equity.'
    ], answerIndex: 3 },
    'bco-comp-117': { choices: [
      'Note exceptions, require correction, or issue injunctions to redress the error.',
      'Dissolve the lower court immediately, without any further process.',
      'Take no action, since higher courts may not comment on lower records.',
      'Refer the matter automatically to civil authorities for correction.'
    ], answerIndex: 0 },
    'bco-comp-118': { choices: [
      'A higher court’s order compelling a lower court to act a certain way.',
      'A lower court’s written request to a higher court for advice or action.',
      'A private letter of recommendation for a candidate’s ordination.',
      'A citation of legal precedent used only in civil court proceedings.'
    ], answerIndex: 1 },
    'bco-comp-119': { choices: [
      'Only after a case has already been finally decided by that court.',
      'Only when a complaint has already been filed against the court.',
      'When a matter is novel, difficult, or has consequences beyond the lower court’s sphere.',
      'Whenever a court simply wishes to avoid making any decision.'
    ], answerIndex: 2 },
    'bco-comp-120': { choices: [
      'A request for advice submitted before any judgment has been made.',
      'A complaint filed against a non-judicial administrative decision.',
      'An automatic review that occurs whenever a censure is imposed.',
      'The transfer of a judicial case to a higher court after judgment has been rendered.'
    ], answerIndex: 3 },
    'bco-comp-121': { choices: [
      'Procedural irregularity, improper evidence, undue haste, or manifest injustice.',
      'Personal dislike of the verdict, without any procedural objection.',
      'Disagreement with the court’s choice of moderator for the trial.',
      'The accused’s belief that the censure imposed was too lenient.'
    ], answerIndex: 0 },
    'bco-comp-122': { choices: [
      'Within seven days after the meeting of the court being appealed.',
      'Within thirty days after the meeting of the court being appealed.',
      'Within ninety days after the meeting of the court being appealed.',
      'Within one year after the meeting of the court being appealed.'
    ], answerIndex: 1 },
    'bco-comp-123': { choices: [
      'Only affirm or reverse, without any power to remand for a new trial.',
      'Only dismiss the appeal, leaving the lower court’s ruling untouched.',
      'Affirm, reverse, render the proper decision, or remand for a new trial.',
      'Only refer the matter back for a completely fresh set of charges.'
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
      'Formal charges filed to initiate a new case of judicial process.',
      'Motions that automatically suspend a court’s action until reviewed.',
      'Ways a court member records disagreement, with a protest also stating reasons.',
      'Private letters sent to the Stated Clerk outside the court’s record.'
    ], answerIndex: 2 },
    'bco-comp-128': { choices: [
      'Jurisdiction ends the moment the certificate of dismissal is issued.',
      'The receiving church gains jurisdiction before the member ever arrives.',
      'No court retains jurisdiction during the period between churches.',
      'The dismissing Session retains jurisdiction until a regular connection is formed elsewhere.'
    ], answerIndex: 3 },
    'bco-comp-129': { choices: [
      'A believer temporarily away from home who joins locally without losing his home membership.',
      'A member who has been suspended but retains full voting privileges.',
      'A permanent member who has transferred fully from another congregation.',
      'A non-communing member who has reached the age of accountability.'
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
      'A binding law equal to the Book of Church Order in every chapter.',
      'A purely optional document with no standing in the Constitution at all.',
      'A set of civil regulations enforceable by denominational courts alone.',
      'An approved guide taken seriously, though only BCO 56, 57, 58, and 59-3 bind constitutionally.'
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
      'The congregation, voting directly on every worship detail each week.',
      'The Presbytery, which sets worship order for every church in its bounds.',
      'The Session, which exercises authority over worship, preaching, and church property use.',
      'The music director, acting independently of the Session’s oversight.'
    ], answerIndex: 2 },
    'bco-comp-136': { choices: [
      'A day like any other, with no scriptural distinction from weekdays.',
      'A day reserved solely for private devotion, without public worship.',
      'A day set aside only for rest, without any requirement of worship.',
      'Sanctified by worship, works of necessity and mercy, and rest from worldly employments.'
    ], answerIndex: 3 },
    'bco-comp-137': { choices: [
      'Worship should be ordered by Scripture, for edification, reverence, and understanding.',
      'Worship should be ordered mainly to accommodate visitor preferences.',
      'Worship should be ordered by whatever style attracts the largest crowd.',
      'Worship should be ordered identically in every PCA congregation.'
    ], answerIndex: 0 },
    'bco-comp-138': { choices: [
      'Any member who volunteers, without any Session involvement at all.',
      'Those appointed by the Session, since public reading is an element under its oversight.',
      'Only the teaching elder personally, never a ruling elder or member.',
      'Only visiting ministers, never members of the local congregation.'
    ], answerIndex: 1 },
    'bco-comp-139': { choices: [
      'Only trained choirs may sing, with congregational singing discouraged.',
      'Singing is optional and may be omitted from worship without concern.',
      'The congregation sings with understanding and grace, under the Session’s oversight.',
      'Singing is governed by Presbytery, not by the local church’s Session.'
    ], answerIndex: 2 },
    'bco-comp-140': { choices: [
      'Only petitions for personal needs, without praise or confession.',
      'Only thanksgiving, since confession belongs to private devotion alone.',
      'Only intercession for civil leaders, apart from the congregation’s needs.',
      'Adoration, confession, thanksgiving, and intercession offered through Christ.'
    ], answerIndex: 3 },
    'bco-comp-141': { choices: [
      'A chief means of grace, explaining and applying Scripture for conversion and edification.',
      'A minor element, secondary to music in the order of worship.',
      'An optional addition, included only on special occasions.',
      'A purely academic lecture, detached from pastoral application.'
    ], answerIndex: 0 },
    'bco-comp-142': { choices: [
      'Any communing member who feels personally called to preach.',
      'Only men sufficiently qualified under Scripture and the BCO, as the Session ensures.',
      'Any licensed layperson, without any Session approval required.',
      'Any visiting speaker, regardless of denominational affiliation.'
    ], answerIndex: 1 },
    'bco-comp-143': { choices: [
      'As a purely optional formality with no worship significance.',
      'As a civil obligation enforced by the church’s governing board.',
      'As acts of worship and mercy, not merely administrative fundraising.',
      'As a private matter unrelated to the congregation’s worship service.'
    ], answerIndex: 2 },
    'bco-comp-144': { choices: [
      'It satisfies a civil requirement for religious organizations.',
      'It replaces the need for preaching in a typical worship service.',
      'It is included mainly to shorten the length of the sermon.',
      'Public confession strengthens unity, teaches doctrine, and unites the congregation’s profession.'
    ], answerIndex: 3 },
    'bco-comp-145': { choices: [
      'Christian prudence applying Scripture’s general rules, serving reverence and edification.',
      'Whatever the presiding officer personally prefers on a given Sunday.',
      'Whatever practice is most common among neighboring denominations.',
      'Whatever the congregation votes to adopt at its annual meeting.'
    ], answerIndex: 0 },
    'bco-comp-146': { choices: [
      'Treating it as a binding civil statute enforceable by outside courts.',
      'Treating it as either optional fluff or as mechanical, rigid rubrics.',
      'Ignoring it entirely, since it carries no constitutional weight at all.',
      'Applying it only to Sunday morning, never to other worship services.'
    ], answerIndex: 1 },
    'bco-comp-147': { choices: [
      'Any ordained ruling elder, acting without a teaching elder present.',
      'Any baptized member in good standing, in cases of urgent need.',
      'A minister of the Word lawfully called and authorized to administer the sacraments.',
      'Any deacon, acting under the direct authorization of the Session.'
    ], answerIndex: 2 },
    'bco-comp-148': { choices: [
      'Only adults who can articulate a full doctrinal confession of faith.',
      'Only infants, since adult believers are baptized by profession alone.',
      'Only those formally examined and admitted to the Lord’s Table.',
      'Previously unbaptized believers and the infant children of believing parents.'
    ], answerIndex: 3 },
    'bco-comp-149': { choices: [
      'They acknowledge the child’s need of Christ, claim the covenant, and promise Christian nurture.',
      'They promise financial support for the church’s building fund.',
      'They pledge that the child will attend a denominational school.',
      'They vow the child will be examined for membership within a year.'
    ], answerIndex: 0 },
    'bco-comp-150': { choices: [
      'To assume full legal guardianship of the child if needed.',
      'To assist the parents in the child’s Christian nurture.',
      'To fund the child’s future seminary education if called to ministry.',
      'To require the child’s baptism be repeated at communicant age.'
    ], answerIndex: 1 },
    'bco-comp-151': { choices: [
      'By Presbytery examination alone, without any Session involvement.',
      'Automatically upon reaching a fixed age set by the congregation.',
      'By Session examination and admission after a profession of faith and membership vows.',
      'By a congregational vote taken at each quarterly meeting.'
    ], answerIndex: 2 },
    'bco-comp-152': { choices: [
      'Affirming denominational loyalty, tithing, attendance, service, and evangelism.',
      'Confessing sin, joining a small group, serving, giving, and praying daily.',
      'Believing the creed, attending worship, serving as an officer, and giving.',
      'Acknowledging sin, trusting Christ, resolving obedience, supporting the church, and submitting to its government.'
    ], answerIndex: 3 },
    'bco-comp-153': { choices: [
      'By profession of faith, reaffirmation of faith, or letter of transfer.',
      'Only by letter of transfer from another PCA congregation.',
      'Only by a fresh baptism, regardless of prior baptismal history.',
      'Only by direct action of Presbytery, never by the local Session.'
    ], answerIndex: 0 },
    'bco-comp-154': { choices: [
      'Any baptized visitor, regardless of standing in another church.',
      'Not the ignorant or scandalous; the Session governs the practice of invitation.',
      'Only lifelong PCA members, excluding all other evangelical believers.',
      'Anyone present in the congregation, without any restriction at all.'
    ], answerIndex: 1 },
    'bco-comp-155': { choices: [
      'A warning that late arrivals will not be permitted to receive elements.',
      'A reminder that the offering will be collected immediately afterward.',
      'Fencing the Table with invitation, warning to the impenitent, and a call to self-examination.',
      'A notice that children must leave the sanctuary before it begins.'
    ], answerIndex: 2 },
    'bco-comp-156': { choices: [
      'It must be administered every week, without any exceptions permitted.',
      'It must be administered only once a year, on Easter Sunday.',
      'Presbytery sets a fixed frequency binding on every church in its bounds.',
      'The Session determines frequency, administered often enough for the congregation’s edification.'
    ], answerIndex: 3 },
    'bco-comp-157': { choices: [
      'A union of one man and one woman, with full constitutional authority in the PCA.',
      'A civil arrangement the church merely observes without any teaching.',
      'A covenant whose definition each Session may set for itself.',
      'A relationship the Directory leaves entirely to state law to define.'
    ], answerIndex: 0 },
    'bco-comp-158': { choices: [
      'Requiring a civil license only, with no biblical instruction expected.',
      'Ensuring lawful eligibility, instructing the couple, and avoiding unions contrary to Scripture.',
      'Deferring entirely to the couple’s own judgment about eligibility.',
      'Requiring Presbytery’s advance approval for every wedding performed.'
    ], answerIndex: 1 },
    'bco-comp-159': { choices: [
      'Administrative record-keeping for the church’s membership roll.',
      'Verifying eligibility for continued church financial assistance.',
      'Pastoral comfort, prayer, Scripture, and preparing the person in faith and hope.',
      'Collecting testimony for a pending judicial process, if any exists.'
    ], answerIndex: 2 },
    'bco-comp-160': { choices: [
      'With elaborate ceremony emphasizing the deceased’s earthly achievements.',
      'Without any Scripture reading, to keep the service strictly secular.',
      'According to whatever customs the family’s home culture prescribes.',
      'With simplicity, dignity, Scripture, and Christian hope in the resurrection.'
    ], answerIndex: 3 },
    'bco-comp-161': { choices: [
      'Special occasions for solemn humiliation and prayer, or grateful acknowledgment of mercies.',
      'Mandatory weekly observances required of every communicant member.',
      'Civil holidays the church is required to ignore entirely.',
      'Occasions reserved solely for officers, not for the whole congregation.'
    ], answerIndex: 0 },
    'bco-comp-162': { choices: [
      'Only the General Assembly, never a Session or Presbytery.',
      'Church courts for their own bounds, while civil occasions are observed religiously under God.',
      'Only civil authorities, since the church has no such authority.',
      'Only individual members, acting apart from any church court.'
    ], answerIndex: 1 },
    'bco-comp-163': { choices: [
      'Home religion is a private matter outside the church’s proper concern.',
      'Family worship is required only of ordained officers, not other members.',
      'The home is a primary sphere of discipleship through worship, instruction, and godly example.',
      'Home discipleship is optional once children reach communicant status.'
    ], answerIndex: 2 },
    'bco-comp-164': { choices: [
      'They are the only chapters candidates need to memorize verbatim.',
      'They are advisory only, unlike every other Directory chapter.',
      'They govern only music and singing in the worship service.',
      'They hold full constitutional authority, governing Baptism, admission, and the Lord’s Supper.'
    ], answerIndex: 3 },
    'bco-comp-165': { choices: [
      'Baptism marks covenant membership, Session examination admits to the Table, and discipline can bar access.',
      'Sacraments are entirely separate from any question of church membership.',
      'Membership is granted only after a person has received the Lord’s Supper.',
      'The Session’s role ends once Baptism has been administered to a person.'
    ], answerIndex: 0 }
  };
  global.PCA_CARD_QUIZ = Object.assign(global.PCA_CARD_QUIZ || {}, Q);
})(typeof window !== 'undefined' ? window : globalThis);
