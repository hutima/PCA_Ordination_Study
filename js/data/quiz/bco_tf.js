// PCA Ordination & Licensure Study — hand-authored True/False bank: Book of
// Church Order (for the Mock exam's BCO section — the committee guide describes
// about 50 True & False general questions on PCA polity, courts & practices).
//
// Registered into window.PCA_QUIZ_TF — a separate global from PCA_QUIZ so these
// never leak into the multiple-choice Quiz deck. Each:
//   { id, q (a statement), answer (true|false), refs[], note? }
// `note` is a one-line explanation shown with the feedback. All statements are
// PARAPHRASE — the BCO is copyrighted; never quote its wording at length.
(function (global) {
  const T = true, F = false;
  const Q = [
    // ── The constitution & the three parts of the BCO ──────────────────
    { id: 'qz-bcotf-01', answer: T, refs: ['BCO Preface'],
      q: 'The Constitution of the PCA consists of the Westminster Confession of Faith, the Larger and Shorter Catechisms, and the Book of Church Order.' },
    { id: 'qz-bcotf-02', answer: T, refs: ['BCO Preface'],
      q: 'The BCO has three parts: the Form of Government, the Rules of Discipline, and the Directory for the Worship of God.' },
    { id: 'qz-bcotf-03', answer: F, refs: ['BCO Preface'],
      q: 'The Rules of Discipline is the first of the three parts of the BCO.',
      note: 'The Form of Government comes first; the Rules of Discipline second; the Directory for Worship third.' },
    { id: 'qz-bcotf-04', answer: T, refs: ['BCO Preface'],
      q: 'Most of the Directory for the Worship of God serves as an approved guide, but the chapters on the administration of the sacraments and profession of faith (56–58) have full constitutional authority.' },
    { id: 'qz-bcotf-05', answer: T, refs: ['BCO Preface', 'BCO 1-3'],
      q: 'Christ alone is King and Head of the Church.' },

    // ── Church power ───────────────────────────────────────────────────
    { id: 'qz-bcotf-06', answer: T, refs: ['BCO 3-1'],
      q: 'The power of the church is only ministerial and declarative.' },
    { id: 'qz-bcotf-07', answer: F, refs: ['BCO 3-1'],
      q: 'Church courts may enforce their decisions with civil penalties, such as fines.',
      note: 'Church power is wholly moral and spiritual — never civil or coercive.' },

    // ── Courts ─────────────────────────────────────────────────────────
    { id: 'qz-bcotf-08', answer: T, refs: ['BCO 10-2'],
      q: 'The courts of the church, from lowest to highest, are the Session, the Presbytery, and the General Assembly.' },
    { id: 'qz-bcotf-09', answer: F, refs: ['BCO 10-2'],
      q: 'The PCA has a permanent court called the Synod that sits between the Presbytery and the General Assembly.',
      note: 'The PCA has three courts — Session, Presbytery, General Assembly. There is no Synod.' },
    { id: 'qz-bcotf-10', answer: T, refs: ['BCO 12-1'],
      q: 'The Session of a particular church is made up of its pastor(s) and its ruling elders.' },
    { id: 'qz-bcotf-11', answer: F, refs: ['BCO 9-2'],
      q: 'The diaconate is a court of the church, alongside the Session.',
      note: 'The deacons form a board under the Session’s oversight — an office of service, not a court.' },
    { id: 'qz-bcotf-12', answer: T, refs: ['BCO 13-1'],
      q: 'A Presbytery consists of all the teaching elders and churches within its bounds, the churches being represented by their ruling elders.' },
    { id: 'qz-bcotf-13', answer: T, refs: ['BCO 14-1'],
      q: 'The General Assembly is the highest court of the PCA.' },
    { id: 'qz-bcotf-14', answer: T, refs: ['BCO 12-5'],
      q: 'The Session has authority to receive, dismiss, and discipline the members of the local church.' },
    { id: 'qz-bcotf-15', answer: T, refs: ['BCO 13-9'],
      q: 'The Presbytery ordains, installs, and removes teaching elders.' },
    { id: 'qz-bcotf-16', answer: T, refs: ['BCO 13-9'],
      q: 'A teaching elder holds his church membership in the Presbytery, not in a local congregation.' },
    { id: 'qz-bcotf-17', answer: F,
      q: 'The Moderator of the General Assembly has the power to reverse decisions of the lower courts.',
      note: 'A moderator only presides; review of lower courts happens through the courts themselves (review and control, appeals, complaints).' },
    { id: 'qz-bcotf-18', answer: T,
      q: 'Judicial cases that reach the General Assembly are ordinarily decided by its Standing Judicial Commission.' },

    // ── Officers ───────────────────────────────────────────────────────
    { id: 'qz-bcotf-19', answer: T, refs: ['BCO 7-2'],
      q: 'The two ordinary and perpetual offices in the church are elder and deacon.' },
    { id: 'qz-bcotf-20', answer: T, refs: ['BCO 7-2'],
      q: 'Within the one office of elder there are two orders: teaching elders and ruling elders.' },
    { id: 'qz-bcotf-21', answer: T, refs: ['BCO 8-9'],
      q: 'Ruling elders and teaching elders share the same authority ("parity") in the courts of the church.' },
    { id: 'qz-bcotf-22', answer: F, refs: ['BCO 9-1'],
      q: 'The office of deacon is an office of rule over the congregation.',
      note: 'The diaconate is an office of sympathy and service, not of rule.' },
    { id: 'qz-bcotf-23', answer: T, refs: ['BCO 8-5'],
      q: 'Only a teaching elder (minister of the Word) may administer the sacraments.' },
    { id: 'qz-bcotf-24', answer: T, refs: ['BCO 7-2'],
      q: 'In the PCA the offices of elder and deacon are open to men only.' },
    { id: 'qz-bcotf-25', answer: T, refs: ['BCO 24-1'],
      q: 'Ruling elders and deacons are elected by the congregation.' },
    { id: 'qz-bcotf-26', answer: F, refs: ['BCO 24-6'],
      q: 'Ruling elders and deacons are ordained by the Presbytery.',
      note: 'The Session ordains and installs ruling elders and deacons; the Presbytery ordains teaching elders.' },

    // ── The five permanent committees ──────────────────────────────────
    { id: 'qz-bcotf-27', answer: T,
      q: 'The five permanent Assembly-level program committees of the PCA are the Administrative Committee, Discipleship Ministries, Mission to North America, Mission to the World, and Reformed University Fellowship.' },
    { id: 'qz-bcotf-28', answer: F,
      q: 'Covenant Theological Seminary is one of the five permanent committees of the General Assembly.',
      note: 'Covenant College, Covenant Theological Seminary, and Ridge Haven are agencies/institutions of the PCA, not permanent committees.' },
    { id: 'qz-bcotf-29', answer: T,
      q: 'Mission to the World is the PCA’s world (international) missions committee.' },
    { id: 'qz-bcotf-30', answer: T,
      q: 'Reformed University Fellowship is the PCA’s campus ministry.' },

    // ── Church membership ──────────────────────────────────────────────
    { id: 'qz-bcotf-31', answer: T, refs: ['BCO 6-1'],
      q: 'The members of a particular church are of two classes: communing and non-communing.' },
    { id: 'qz-bcotf-32', answer: T, refs: ['BCO 6-1'],
      q: 'The baptized children of believers are non-communing members of the church.' },
    { id: 'qz-bcotf-33', answer: F, refs: ['BCO 6-1'],
      q: 'A person may be received as a communing member without being baptized.',
      note: 'Communing members are baptized persons who have made a profession of faith and been admitted to the Lord’s Table.' },
    { id: 'qz-bcotf-34', answer: T,
      q: 'Church discipline extends to all the members of the church, including its baptized (non-communing) children.' },

    // ── Worship ────────────────────────────────────────────────────────
    { id: 'qz-bcotf-35', answer: T, refs: ['BCO 47-9'],
      q: 'The ordinary parts of public worship include the reading of Scripture, the preaching of the Word, prayer, the singing of psalms and hymns, the presentation of offerings, confessing the faith, and observing the sacraments.' },
    { id: 'qz-bcotf-36', answer: F, refs: ['BCO 47-9'],
      q: 'Drama and interpretive dance are listed among the ordinary elements of worship in the Directory for Worship.',
      note: 'They are not among the elements the Directory lists as proper parts of worship.' },
    { id: 'qz-bcotf-37', answer: T, refs: ['BCO 47-9'],
      q: 'On special occasions, the taking of oaths and vows is a proper element of public worship.' },
    { id: 'qz-bcotf-38', answer: T, refs: ['WCF 28.3'],
      q: 'Baptism is rightly administered by pouring or sprinkling; immersion is not necessary.' },

    // ── Property & the connection ──────────────────────────────────────
    { id: 'qz-bcotf-39', answer: T, refs: ['BCO 25-9'],
      q: 'A particular PCA church holds and owns its own property.' },
    { id: 'qz-bcotf-40', answer: T, refs: ['BCO 25-11'],
      q: 'A congregation remains in association with the PCA only so long as it desires — it may withdraw from the denomination.' },

    // ── Amending the constitution ──────────────────────────────────────
    { id: 'qz-bcotf-41', answer: T, refs: ['BCO 26-2'],
      q: 'Amending the Book of Church Order requires the consent of two-thirds of the presbyteries and the approval of two successive General Assemblies.' },
    { id: 'qz-bcotf-42', answer: F, refs: ['BCO 26-3'],
      q: 'The Confession of Faith and the Catechisms may be amended with the consent of a simple majority of the presbyteries.',
      note: 'Amending the doctrinal standards requires the approval of three-fourths of the presbyteries (a higher bar than the BCO’s two-thirds).' },
    { id: 'qz-bcotf-43', answer: F, refs: ['BCO 26-2'],
      q: 'The General Assembly may amend the constitution by its own vote, without the consent of the presbyteries.',
      note: 'Constitutional amendments must go down to the presbyteries for their advice and consent.' },

    // ── Discipline & censures ──────────────────────────────────────────
    { id: 'qz-bcotf-44', answer: T, refs: ['BCO 29-1'],
      q: 'An "offense," in the sense of the Rules of Discipline, is anything in the doctrines or practice of a church member professing faith that is contrary to the Word of God.' },
    { id: 'qz-bcotf-45', answer: T, refs: ['BCO 27-3'],
      q: 'The purposes of church discipline include the glory of God, the purity of the church, and the spiritual good and reclaiming of the offender.' },
    { id: 'qz-bcotf-46', answer: T, refs: ['BCO 30-1'],
      q: 'The censures of the church are admonition, suspension from the sacraments, suspension from office, excommunication, and deposition.' },
    { id: 'qz-bcotf-47', answer: T, refs: ['BCO 30-2'],
      q: 'Admonition is the lightest form of church censure.' },
    { id: 'qz-bcotf-48', answer: T, refs: ['BCO 30-3'],
      q: 'Suspension from the sacraments may be definite or indefinite in duration.' },
    { id: 'qz-bcotf-49', answer: F, refs: ['BCO 30-4'],
      q: 'Excommunication is final — an excommunicated person can never be restored to the church.',
      note: 'Even the severest censure seeks repentance; a restored penitent may be received again (Rules of Discipline on restoration).' },
    { id: 'qz-bcotf-50', answer: F,
      q: 'In a church judicial trial the accused is presumed guilty until proven innocent.',
      note: 'The accused is presumed innocent; the burden of proof rests on the prosecution.' },
    { id: 'qz-bcotf-51', answer: T, refs: ['BCO 42-4'],
      q: 'Notice of appeal in a judicial case must be filed within thirty days of the court’s decision.' },
    { id: 'qz-bcotf-52', answer: T, refs: ['BCO 43-1'],
      q: 'A complaint is a written representation against some act or decision of a court of the church.' },
  ];
  global.PCA_QUIZ_TF = (global.PCA_QUIZ_TF || []).concat(Q);
})(typeof window !== 'undefined' ? window : globalThis);
