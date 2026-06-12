#!/usr/bin/env python3
"""Build js/data/subjects/theology.js from the Theology sections (A–I) of the
big licensure guide (doc_2). Section J (Sacraments) is excluded — it's covered
by the dedicated Sacraments subject.

Structure is clean and outline-shaped:
  Section:   "   A. The Bible (WCF 1; …)"          → sub-deck th-a … th-i
  Question:  "     1. Define and distinguish …"     → one card (number not 0-padded)
  Answer:    "        a. …", "        b. …",          → lettered list
             "          01. …", "          02. …"     → numbered list (0-padded)
             plus Westminster quotes / prose.
Continuation lines (more-indented, no marker) join their parent item.

Run: python3 dev/build_theology.py
"""
import re, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from curation import apply_curation
# The source answers "length of the days of creation" with "See chart below,"
# pointing at the creation-theories chart that lives in the Hot Topics
# section — reuse the hand-rebuilt table from that builder.
from build_hot_topics import CREATION_TABLE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source_materials/extracted/bible_content_theology.txt')
OUT = os.path.join(ROOT, 'js/data/subjects/theology.js')

SECTION_RE = re.compile(r'^\s{2,4}([A-J])\.\s+(.+?)\s*\((WCF|WLC|WSC).*\)?\s*$')
QUESTION_RE = re.compile(r'^\s{3,7}([1-9]\d?)\.\s+(.*)$')   # not zero-padded
LETTER_RE = re.compile(r'^\s{6,9}([a-z])\.\s+(.*)$')
NUM_SUB_RE = re.compile(r'^\s{8,}(0\d|\d{2})\.\s+(.*)$')     # zero/2-padded
REF_RE = re.compile(r'W(?:CF|LC|SC)\s*[\dIVXLC]+(?:[.:]\d+)?(?:[-–]\d+)?')
FOOTNOTE_RE = re.compile(r'\[\d+\]')
# Roman-numeral sub-items ("i. … ii. …", i–xx) nested under a lettered/numbered
# item. Two or more become a Markdown bullet list instead of being run into the
# prose ("i. God exists. ii. God is omnipotent. …").
ROMAN_RE = re.compile(r'^\s{10,}(xx|xix|xvi{0,3}|xv|xiv|xi{0,3}|ix|iv|vi{0,3}|v|i{1,3})\.\s+(.*)$', re.I)
# Word-export bullet debris: level-1 bullets came through as ".", level-2
# (Wingdings circles) as a bare "o" — usually a Scripture proof under a sub-item.
BULLET_SRC_RE = re.compile(r'^\s{8,}([.o])\s+(\S.*)$')

SECTION_LABELS = {
    'A': 'A. The Bible', 'B': 'B. God & His World', 'C': 'C. Humankind',
    'D': "D. God's Way of Salvation", 'E': 'E. Salvation Accomplished',
    'F': 'F. Salvation Applied', 'G': 'G. The Christian Life',
    'H': 'H. The Church', 'I': 'I. Last Things',
}

def clean(t):
    t = FOOTNOTE_RE.sub('', t.replace('&amp;', '&'))
    return re.sub(r'\s+', ' ', t).strip()

def slugify(q, n):
    s = re.sub(r'[^a-z0-9]+', '-', q.lower()).strip('-')[:34].rstrip('-')
    return f'th-{n:03d}-{s}' if s else f'th-{n:03d}'

def extract_refs(text):
    refs = []
    for m in REF_RE.findall(text):
        r = re.sub(r'\s+', ' ', m).strip()
        if r not in refs: refs.append(r)
    return refs

def normalize_answer(lines):
    """lines: (indent, marker, text) tuples. Emit Markdown."""
    out = []
    for kind, text in lines:
        if kind == 'letter':
            out.append(f'{text}')          # already "a. …"
        elif kind == 'num':
            out.append(f'{text}')          # already "1. …"
        else:
            out.append(text)
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(out)).strip()

def gather_sub(region, i):
    """Gather an item's continuation lines from i until the next answer/question/
    section marker. Returns (flat, lead, romans, bullets, next_i):
      flat    – every line folded with its markers kept (the legacy form);
      lead    – non-roman/non-bullet text that wraps the parent's first line
                (whatever appears before the first roman/bullet sub-item);
      romans  – roman-numeral sub-items, each with its "."-bullet proof(s)
                folded in after an em dash;
      bullets – standalone "."/"o" Word-bullet items (when no roman precedes).
    """
    flat = ''
    lead = ''
    romans = []
    bullets = []
    while i < len(region) and region[i].strip() and not LETTER_RE.match(region[i]) \
            and not NUM_SUB_RE.match(region[i]) and not QUESTION_RE.match(region[i]) \
            and not SECTION_RE.match(region[i]):
        s = region[i].strip()
        flat += (' ' if flat else '') + s
        mr = ROMAN_RE.match(region[i])
        mb = BULLET_SRC_RE.match(region[i])
        if mr:
            romans.append(clean(mr.group(2)))
        elif mb:
            proof = clean(mb.group(2))
            if romans:
                romans[-1] = re.sub(r':\s*$', '', romans[-1]) + ' — ' + proof
            else:
                bullets.append(proof)
        elif romans:
            romans[-1] = clean(romans[-1] + ' ' + s)
        elif bullets:
            bullets[-1] = clean(bullets[-1] + ' ' + s)
        else:
            lead += (' ' if lead else '') + s
        i += 1
    return flat, clean(lead), romans, bullets, i


def emit_item(cur, kind, marker, first, region, i):
    """Append an answer item (plus any roman/bullet sub-list) for a marker line
    whose own text is `first`; continuation starts at region[i]. Two or more
    roman items (or any standalone bullets) render as a Markdown list rather than
    being run together; otherwise the legacy inline form is preserved exactly."""
    _flat, lead, romans, bullets, i = gather_sub(region, i)
    head = f'{first} {lead}'.strip() if lead else first
    sub = romans + bullets        # in practice only one of the two is populated
    if len(sub) >= 2:
        cur['items'].append((kind, marker + clean(head)))
        cur['items'].append(('sub', '\n'.join(f'- {it}' for it in sub)))
    elif len(sub) == 1:
        # A lone sub-item is not a list — inline it (dropping the bare "i."
        # marker) after an em dash, so no orphan marker or " . " debris remains.
        cur['items'].append((kind, marker + clean(re.sub(r':\s*$', '', head) + ' — ' + sub[0])))
    else:
        cur['items'].append((kind, marker + clean(head)))
    return i


# ── Curation layer (see dev/curation.py) ─────────────────────────────────
# Two compound prompts arrive as single monster cards (25k chars); split each
# lettered sub-question into its own card — that is the unit an examiner asks.
# Also: drop a PDF table that flattened past recognition (the ordo salutis
# overview), strip a stray trailing header, and add authored summaries.

def _nat(letter, q, **kw):
    """A natures-of-Christ sub-card descriptor (id slug from the letter+q)."""
    slug = re.sub(r'[^a-z0-9]+', '-', q.lower()).strip('-')[:34].rstrip('-')
    d = {'at': None, 'id': f'th-055{letter}-{slug}', 'q': q}
    d.update(kw)
    return d

CURATE = {
    # Dangling cross-references: the source answers these with "See below"
    # (pointing at the Hot Topics section of the same document). Give each a
    # real answer drawn from that section.
    'th-020-briefly-discuss-the-length-of-the': {
        'a': ('The five main theories (each is drilled on its own card in the Hot Topics '
              'deck):\n\n' + CREATION_TABLE),
        'summary': ('Five main theories: 24-hour day (sequential and literal — most hold a '
                    '"young earth"), Day-age (each day an era), Literary approach (a '
                    'framework oriented to Sabbath theology), Prior creation (a created '
                    'world before Gen 1), and Two-phase (chapters 1 & 2 as two phases with '
                    'a gap between).'),
    },
    'th-093-what-is-theonomy-evaluate-it-bibli': {
        'a': ('a. Theonomy ("the law of God") is the school of thought also called '
              'Christian Reconstruction (Rushdoony, Bahnsen, North): it stresses the '
              'continued normativity not only of the moral law but also of the judicial '
              'law of Old Testament Israel, including its penal sanctions, and holds that '
              'the judicial law binds all nations — so that civil government today should '
              'enforce it.\n'
              'b. Biblical evaluation:\n'
              '1. Theonomy overemphasizes the continuity between the Old and New Covenants '
              'at the expense of their discontinuity.\n'
              '2. Israel, unlike any modern nation, was God\'s chosen nation in a unique '
              'way (Deut 7:6); its civil law must be applied today with that uniqueness in '
              'view.\n'
              '3. In 1 Corinthians 5:1-13 Paul quotes the Old Testament penal sanction '
              '"expel the wicked man from among you" (Deut 17:7) — but where the OT '
              'context called for death by stoning, Paul applies it as excommunication, '
              'equating the penal sanction of death with being put out of the church.'),
        'summary': ('Theonomy (Christian Reconstruction: Rushdoony, Bahnsen, North): the OT '
                    'judicial law and its penal sanctions still bind all nations. Critique: '
                    'it overstresses covenant continuity — Israel was uniquely God\'s '
                    'nation (Deut 7:6), and Paul turns a death-penalty text into '
                    'excommunication (1 Cor 5:13 quoting Deut 17:7).'),
    },
    'th-123-may-women-serve-as-officers-in-the': {
        'a': ('a. No — in the PCA the offices of elder and deacon are open to men only '
              '(BCO 7-2). Scripture restricts the teaching/ruling office to men in '
              '1 Timothy 2:8-15 and 1 Corinthians 14:33-36; the former grounds the '
              'restriction not in culture but in the creation order (Adam was formed '
              'first) and its usurpation at the fall.\n'
              'b. Men and women are equal in worth and dignity in the sight of God '
              '(Gen 1:27): a differentiation of roles does not imply inferiority, as the '
              'example of the Trinity shows.\n'
              'c. Positively, women have vital ministries: prophecy (Miriam, Deborah, '
              'Huldah), teaching (Titus 2:3-4; Col 3:16; Priscilla with Aquila instructing '
              'Apollos, Acts 18:26), service and diaconal mercy (Phoebe, Rom 16:1-2), '
              'missions (Junia, Rom 16:7), and labor in the gospel (Rom 16:6, 12; '
              'Phil 4:2-3).'),
        'summary': ('No — the offices of elder and deacon are restricted to men '
                    '(1 Tim 2:8-15, grounded in the creation order; 1 Cor 14:33-36; '
                    'BCO 7-2). Yet men and women are equal in worth and dignity '
                    '(Gen 1:27), and women have vital ministries of prophecy, teaching, '
                    'service, missions, and gospel labor.'),
    },
    'th-124-what-is-subscription': {
        'a': ('a. "Subscription" is receiving and adopting the Confession of Faith and '
              'Catechisms of the church "as containing the system of doctrine taught in '
              'the Holy Scriptures" — the second ordination vow (BCO 21-5).\n'
              'b. Why is there disagreement? The vow does not define how closely one must '
              'adhere. Four possible views:\n'
              '1. "Substance of the doctrine" — correct doctrine is contained somewhere in '
              'the standards (not an acceptable position in the PCA).\n'
              '2. "Vital to the system" — subscription to the essential and necessary '
              'articles; presbytery judges whether a stated difference touches them (the '
              '"loose" view).\n'
              '3. "Very doctrines of the Word" — no exceptions to the substance of any '
              'doctrine of the standards (the "strict" view).\n'
              '4. "Very word of doctrine" — ruled out, since it would set the standards on '
              'a par with Scripture.\n'
              'c. The live debate is between views 2 and 3. The PCA practices "good faith" '
              'subscription (BCO 21-4): the candidate states every difference, and the '
              'presbytery judges whether each is merely semantic, more than semantic but '
              'not hostile to the system, or out of accord with a fundamental of the '
              'system of doctrine.'),
        'summary': ('Receiving and adopting the Westminster standards "as containing the '
                    'system of doctrine taught in the Holy Scriptures" (BCO 21-5). Views '
                    'range from "substance of doctrine" to "very word of doctrine"; the '
                    'debate is between system subscription ("loose") and full subscription '
                    '("strict") — the PCA practices "good faith" subscription (BCO 21-4).'),
    },
    'th-052-how-is-the-covenant-of-grace-relat': {'split': [
        {'at': 'a. The Abrahamic Covenant?',
         'id': 'th-052a-cog-and-abrahamic-covenant',
         'q': 'How is the Covenant of Grace related to the Abrahamic Covenant?',
         'summary': ('The covenant of grace was formally established with Abraham (Gen 3:15 '
                     'held its elements, but no formal transaction): the beginning of an '
                     'institutional church, man responding to promise by faith — the stage of '
                     'covenant revelation most normative for the New Testament era (Gal 3).')},
        {'at': 'b. The Mosaic Covenant?',
         'id': 'th-052b-cog-and-mosaic-covenant',
         'q': 'How is the Covenant of Grace related to the Mosaic Covenant?',
         'summary': ('Sinai was essentially the same covenant as Abraham\'s, in national form. '
                     'The law was made subservient to grace — increasing the consciousness of '
                     'sin (Rom 3:20) and tutoring unto Christ (Gal 3:24) — and served as '
                     'moral, civil, and ceremonial rule of life; Israel mistook it for a '
                     'covenant of works.')},
        {'at': 'c. The Noahic Covenant?',
         'id': 'th-052c-cog-and-noahic-covenant',
         'q': 'How is the Covenant of Grace related to the Noahic Covenant?',
         'summary': ('The Noahic covenant confers natural blessings ("covenant of common '
                     'grace") universally; it differs from the covenant of grace (earthly vs '
                     'spiritual blessings, all creation vs believers and their seed) yet '
                     'originated in God\'s grace and rests on the covenant of grace '
                     '(Gen 6:9; 9:9).')},
    ]},
    'th-055-briefly-discuss-the-natures-of-chr': {'split': [
        dict(_nat('a', 'Was Christ a human person?'), at='a. Was Christ a human person?'),
        dict(_nat('b', 'Does Christ have a soul?'), at='b. Does Christ have a soul?'),
        dict(_nat('c', 'What is kenosis?'), at='c. What is kenosis?'),
        dict(_nat('d', 'Did Christ lay aside any of His divine attributes at the incarnation?',
                  summary=('No — "in Christ all the fullness of the Deity lives in bodily form" (Col 2:9; '
                           'WCF VIII.3). Yet a body is local, which raises the communicatio idiomatum '
                           'controversy with the Lutherans; Berkhof says Christ gave up omniscience and '
                           'omnipresence, while Grudem denies this.')),
             at='d. Did Christ lay aside any of His divine attributes at the incarnation?'),
        dict(_nat('e', 'Explain and defend against the early Christological heresies: Docetism, Arius, Nestorius, Apollinarius, Eutyches.',
                  summary=('- Docetism — Christ only seemed to be a man (vs John 20:24ff)\n'
                           '- Arius — the Son a creature, heteroousios (condemned at Nicea, 325)\n'
                           '- Nestorius — two persons (condemned at Ephesus, 431)\n'
                           '- Apollinarius — divine Logos in place of a human soul (condemned at '
                           'Constantinople, 381)\n'
                           '- Eutyches — one blended nature: monophysitism (condemned at Chalcedon)')),
             at='e. Briefly explain and defend against the challenges to orthodox Christology posed by:'),
        dict(_nat('f', 'Are any of the early heresies regarding the natures of Christ held today? If so, by whom?'),
             at='f. Are any of the early heresies regarding the natures of Christ held today? If so, by whom?'),
        dict(_nat('g', 'Explain and defend the doctrine of the "communication of properties."'),
             at='g. Explain and defend the doctrine of the "communication of properties."'),
        dict(_nat('h', 'What is the "extra Calvinisticum?"',
                  summary=('Calvin: the deity of the Son was not confined to the incarnate flesh — the Son '
                           'descended without leaving heaven, continuing to fill and rule the world even as '
                           'the God-man walked on earth (Institutes II.xiii.4); the finite cannot contain '
                           'the infinite. It protects the Son\'s full deity; Lutherans charged Nestorianism.')),
             at='h. What is the "extra Calvinisticum?"'),
        dict(_nat('i', 'Define the names of Christ: Jesus, Son of Man, Christ, Son of God, Lord, Lamb of God.'),
             at='i. Define the following names:'),
        dict(_nat('j', 'How was Christ born?'), at='j. How was Christ born?'),
        dict(_nat('k', 'Explain and defend (including Scripture proofs) the Virgin Birth.'),
             at='k. Explain and defend (including Scripture proofs) the Virgin Birth.'),
        dict(_nat('l', 'Trace the revelation of the person and work of Christ from the beginning of the Old Testament.',
                  summary=('Gen 3:15 (seed of the woman) → Melchizedek (Gen 14, cf. Heb 7) → Gen 49:10 '
                           '(scepter of Judah) → Passover (Exod 12, cf. 1 Cor 5:7) → the sacrificial system '
                           'and priesthood (Lev 1-9) → the prophet to come (Deut 18:15) → the Davidic king '
                           '(2 Sam 7) → Messianic Psalms (2; 110) → the Suffering Servant (Isa 53) → the New '
                           'Covenant (Jer 31) → God\'s Shepherd (Ezek 34).')),
             at='l. Trace revelation of the person and work of Christ from the beginning of the Old Testament.'),
        dict(_nat('m', 'What is the humiliation of Christ?'), at='m. What is the humiliation of Christ?'),
        dict(_nat('n', 'Define and distinguish the active and passive obedience of Christ.'),
             at='n. Define and distinguish the active and passive obedience of Christ.'),
        dict(_nat('o', 'What happened in the resurrection of Christ?',
                  summary=('Not mere revival: in Christ human nature, body and soul, was restored and raised '
                           'to a higher level — "the firstfruits of them that slept" (1 Cor 15:20). It '
                           'declared the penalty paid, pictures the believer\'s justification, new birth, '
                           'and future resurrection, and is instrumentally connected to them (Rom 4:25).')),
             at='o. What happened in the resurrection of Christ?'),
        dict(_nat('p', 'What are the offices of Christ, and how does he execute them?'),
             at='p. What are the offices of Christ?'),
        dict(_nat('q', "Who is the only redeemer of God's elect?"),
             at="q. Who is the only redeemer of God's elect?"),
        dict(_nat('r', 'What is a redeemer?'), at='r. What is a redeemer?'),
        dict(_nat('s', 'What is the atonement?'), at='s. What is the atonement?'),
        dict(_nat('t', 'Was the atonement necessary? Explain and defend (include Scripture proofs).'),
             at='t. Was the atonement necessary? Explain and defend (include Scripture proofs).'),
        dict(_nat('u', "Why isn't a good life enough to gain salvation?"),
             at="u. Why isn't a good life enough to gain salvation?"),
        dict(_nat('v', 'Define: expiation, propitiation, reconciliation, redemption, imputation.'),
             at='v. Define:'),
        dict(_nat('w', 'What is the nature of the atonement? Discuss "penal substitutionary atonement."',
                  summary=('The atonement is objective (propitiating God), vicarious (Christ substituted '
                           'for the elect sinner), and includes Christ\'s active and passive obedience. '
                           'Penal substitution unites sacrifice, propitiation, substitution, and '
                           'reconciliation — Rom 3:25-26: God presented Christ as a propitiation, to be '
                           'just and the justifier of those who have faith.')),
             at='w. What is the nature of the atonement? Discuss "penal substitutionary atonement."'),
        dict(_nat('x', "What of Christ's work remains to be done?"),
             at="x. What of Christ's work remains to be done?"),
        dict(_nat('y', 'Were Old Testament believers saved by Christ? Explain and defend (include Scripture proofs).',
                  summary=('Yes — the virtue, efficacy, and benefits of redemption were communicated to '
                           'the elect in all ages through the promises, types, and sacrifices in which '
                           'Christ was revealed (WCF VIII.6); Abraham is the paradigm of justification by '
                           'faith (Rom 4).')),
             at='y. Were Old Testament believers saved by Christ? Explain and defend (include Scripture proofs).'),
        dict(_nat('z', 'Will any for whom Christ died be lost? Explain and defend (include Scripture proofs).',
                  summary=('No — to all for whom Christ purchased redemption he certainly and effectually '
                           'applies it (WCF VIII.8; John 6:37; 10:27-28; Rom 8:38-39). Texts that seem to '
                           'teach loss of salvation (Heb 6; 10; 2 Pet 2) describe those never genuinely '
                           'converted (1 John 2:19).')),
             at='z. Will any for whom Christ died be lost? Explain and defend (include Scripture proofs).'),
    ]},
    'th-004-what-is-the-canon-defend-it-script': {
        'summary': ('"Canon" = rule or standard: the list of books that belong in the Bible '
                    '(66 in the Protestant canon) — recognized, not created, by the church '
                    '(Athanasius\' Easter letter, 367; Hippo 393; Carthage 397). Tests: '
                    'apostolic authority, early recognition, theological consistency. Jesus '
                    'assumes the OT canon (Mat 23:35); the NT inscripturates the apostolic '
                    'witness (John 14:26; 2 Pet 3:16; 1 Tim 5:18).'),
    },
    'th-014-what-are-the-attributes-of-god-be': {
        'summary': ('The qualities that constitute God\'s very nature:\n'
                    '- Communicable — spirituality, knowledge, wisdom, truthfulness, '
                    'goodness, love, mercy, holiness, righteousness, jealousy, wrath, '
                    'will, freedom, omnipotence, perfection, blessedness, beauty, glory\n'
                    '- Incommunicable — self-existence, eternity, immutability, '
                    'omnipresence, unity\n'
                    'Each with its proof text in the full answer.'),
    },
    'th-017-what-is-an-amyraldian-view-of-god': {
        'summary': ('Amyraut (Saumur, 17th century): hypothetical universal predestination — '
                    'God decrees to save all on condition of belief, sends Christ to die for '
                    'all, then gives the Spirit effectually only to the elect. Hodge, Shedd, '
                    'and Warfield judged it an inconsistent synthesis of Arminianism and '
                    'Calvinism.'),
    },
    'th-025-is-god-responsible-for-sin': {
        'summary': ('No. God ordains whatsoever comes to pass — including the fall — yet '
                    '"neither is God the author of sin" (WCF III.1; V.4): his providence '
                    'bounds and governs sin to his own holy ends, while its sinfulness '
                    'proceeds only from the creature. God is the first cause of all things, '
                    'praiseworthy for good and never culpable for evil.'),
    },
    'th-027-discuss-the-biblical-teaching-rega': {
        'summary': ('Predestination embraces election and reprobation (WCF III.3-8). '
                    'Election: God\'s eternal, gracious choice of particular persons in '
                    'Christ unto glory, without foreseen faith or works (Eph 1:3-4). '
                    'Reprobation: his decree to pass others by and ordain them to wrath for '
                    'their sin (1 Pet 2:8; Jude 4). To be handled with special prudence and '
                    'care.'),
    },
    'th-035-in-what-way-is-man-created-in-the': {
        'summary': ('Functionally (ruling creation, loving God and neighbor) and structurally '
                    '(rationality, morality, spirituality). The fall corrupted but did not '
                    'annihilate the image (Gen 9:6) — every relationship is now disordered; '
                    'Christ, the image of the invisible God and second Adam (Col 1:15; '
                    '1 Cor 15:45), reveals and restores true humanity.'),
    },
    'th-051-discuss-the-covenant-of-grace': {
        'summary': ('After the fall God freely offers sinners life and salvation by Jesus '
                    'Christ, requiring faith and promising his Spirit to the elect (WCF '
                    'VII.3; WSC 20). One covenant in substance under both testaments, '
                    'differently administered (law: promises, types, and sacrifices; gospel: '
                    'Word and sacraments). Its heart: "I will be a God unto thee, and to thy '
                    'seed after thee." Gracious, Trinitarian, eternal, particular.'),
    },
    'th-053-discuss-the-relationship-between-t': {
        'summary': ('Distinct (Jer 31:31-34; Heb 8), yet one in substance — the same promise, '
                    '"I will be their God," redeeming in Christ. The New is superior (Heb '
                    '7-8): universal in scope, clearer in grace, richer in blessing; they '
                    'differ in administration (Gal 3:23-25), so the New displaces the Old '
                    '(Heb 8:13).'),
    },
    'th-056-what-is-the-ordo-salutis-support-y': {
        'strip_after': '|Overview of the ordo salutis',
        'summary': ('The order in which redemption is applied by the Spirit: election → gospel '
                    'call → effectual calling → regeneration → repentance unto life → faith → '
                    'justification → adoption → definitive sanctification → progressive '
                    'sanctification → perseverance → glorification (Rom 8:28-30).'),
    },
    'th-057-how-would-you-explain-the-plan-of': {
        'summary': ('Simple framework:\n'
                    '- God is holy (Mat 5:48)\n'
                    '- All have sinned (Rom 3:23)\n'
                    '- Sin earns death, but God gives life (Rom 6:23)\n'
                    '- Christ died for sinners (Rom 5:8)\n'
                    '- Receive him (John 1:12)\n'
                    '- By grace through faith, not works (Eph 2:8-9)\n'
                    'For someone without a Judeo-Christian background, start further '
                    'back: who God is, creation and fall, the gospel, the new life in the '
                    'Spirit.'),
    },
    'th-062-is-jesus-really-the-only-way-of-sa': {
        'summary': ('Yes — "No one comes to the Father except through me" (John 14:6); '
                    '"salvation is found in no one else" (Acts 4:12); none can be saved any '
                    'other way, however diligently they live by nature\'s light or another '
                    'religion (WCF X.4). Those who never hear are without excuse, having '
                    'general revelation (Rom 1:18-20); sincerity does not remove sin.'),
    },
    'th-064-what-is-the-basis-of-justification': {
        'summary': ('God\'s free grace, on the basis of Christ\'s imputed obedience and '
                    'satisfaction alone — not infused righteousness, not anything wrought in '
                    'us, not even faith itself as a work; faith is merely the instrument, '
                    'and it too is God\'s gift (WCF XI.1; Eph 2:8-9).'),
    },
    'th-079-what-is-the-relation-of-good-works': {
        'summary': ('Good works are the fruits and evidences of a true and lively faith '
                    '(WCF XVI.2): by them believers show thankfulness, strengthen assurance, '
                    'edify the brethren, adorn the gospel, and glorify God. Faith without '
                    'deeds cannot save (James 2:14); those who deny God by their actions '
                    'show they do not know him (Titus 1:16).'),
    },
    'th-082-can-unbelievers-do-good-works-defe': {
        'summary': ('In the matter of them, yes; properly, no. The unregenerate may do things '
                    'God commands, useful to themselves and others — but proceeding from no '
                    'heart purified by faith, done neither rightly nor for God\'s glory, '
                    'they are sinful and cannot please God (WCF XVI.7; Heb 11:6). Yet '
                    'neglecting them is more sinful still.'),
    },
    'th-085-on-what-does-a-believer-s-persever': {
        'summary': ('Not on the believer\'s free will (WCF XVII.2; Rom 8:28-30), but on:\n'
                    '- The immutability of the decree of election, flowing from the '
                    'Father\'s unchangeable love\n'
                    '- The efficacy of Christ\'s merit and intercession\n'
                    '- The abiding of the Spirit and of the seed of God within\n'
                    '- The nature of the covenant of grace'),
    },
    'th-086-can-a-person-be-sure-he-is-saved-d': {
        'summary': ('Yes — those who truly believe in the Lord Jesus, love him in sincerity, '
                    'and endeavor to walk in good conscience before him may in this life be '
                    'certainly assured they are in a state of grace (WCF XVIII.1; 1 John '
                    '5:11-12) — unlike the false hopes of hypocrites.'),
    },
    'th-088-how-could-a-person-know-he-is-save': {
        'summary': ('By an infallible assurance founded on three things (WCF XVIII.2):\n'
                    '- The divine truth of the promises (Heb 6:17-18)\n'
                    '- The inward evidence of the graces to which the promises are made '
                    '(1 John 3:18-20)\n'
                    '- The testimony of the Spirit of adoption witnessing with our spirits '
                    'that we are God\'s children (Eph 1:13-14)'),
    },
    'th-098-what-is-christian-liberty-explain': {
        'summary': ('The freedom Christ purchased (WCF XX.1):\n'
                    '- from the guilt of sin, God\'s condemning wrath, and the curse of '
                    'the law (Rom 8:1-2; Gal 3:13)\n'
                    '- free access to God (Eph 2:18)\n'
                    '- obedience from childlike love, not slavish fear\n'
                    '- under the gospel, freedom too from the ceremonial yoke — and from '
                    'the judgment of others (Rom 14:4)'),
    },
    'th-113-under-what-circumstances-is-divorc': {
        'summary': ('Nothing but adultery (Mat 19:9) or willful desertion that neither church '
                    'nor magistrate can remedy (1 Cor 7:15) is sufficient cause to dissolve '
                    'the bond of marriage — and then only by a public and orderly '
                    'proceeding, not by the parties\' own wills in their own case '
                    '(WCF XXIV.6).'),
    },
    'th-118-what-are-the-attributes-of-the-chu': {
        'summary': ('Ascribed primarily to the church as an invisible organism (Berkhof):\n'
                    '- Unity — through union with Christ (John 17:20-21)\n'
                    '- Holiness (Eph 1:4)\n'
                    '- Catholicity (1 Cor 1:2)\n'
                    'Further marks:\n'
                    '- Love (John 13:34-35)\n'
                    '- The presence of Christ by the Spirit (Mat 18:20; Eph 2:22)\n'
                    '- Apostolicity (Jude 3)'),
    },
    'th-122-what-are-the-principles-of-presbyt': {
        'summary': ('Berkhof:\n'
                    '- Christ is the Head of the church and the source of all its '
                    'authority\n'
                    '- He exercises it by his royal Word\n'
                    '- He endowed the church with power, exercised through representative '
                    'organs\n'
                    '- That power resides primarily in the governing body of the local '
                    'church\n'
                    'Add: the regulative principle, the organic unity of the church, '
                    'parity and plurality of elders, and graded courts (Session, '
                    'Presbytery, General Assembly).'),
    },
    'th-119-what-are-the-marks-of-the-church-p': {
        'summary': ('Churches are more or less pure as (WCF XXV.4): the doctrine of the '
                    'gospel is taught and embraced (1 Thes 1:4-8), the sacraments are '
                    'administered (1 Cor 11:23-26; Mat 28:18-20), and public worship is '
                    'performed purely (John 4:23-24) — with church discipline as a natural '
                    'corollary (Mat 18:15-20).'),
    },
    'th-121-define-three-basic-forms-of-church': {
        'summary': ('- Episcopalian — government entrusted to bishops as successors of '
                    'the apostles (archbishop → bishop → rector); the congregation has no '
                    'share\n'
                    '- Presbyterian — elected elders in graded courts: session, '
                    'presbytery, general assembly\n'
                    '- Congregational — each congregation complete and independent '
                    '(single-pastor-with-deacons or pure independency); wider bodies '
                    'advisory only'),
    },
    'th-129-what-is-the-purpose-of-church-cens': {
        'summary': ('Five ends (WCF XXX.3):\n'
                    '- Reclaiming the offending brother\n'
                    '- Deterring others from like offenses\n'
                    '- Purging the leaven from the lump\n'
                    '- Vindicating the honor of Christ and the gospel\n'
                    '- Preventing the wrath of God from falling on a church that lets his '
                    'covenant seals be profaned'),
    },
    'th-131-identify-some-scripture-passages-t': {
        'summary': ('- Procedure — Matthew 18:15-17\n'
                    '- Expelling the wicked — 1 Corinthians 5:3-13\n'
                    '- Maintaining sound faith — Titus 1:10-14 (rebuke them sharply)\n'
                    '- Restoration — 2 Corinthians 2:5-11 (forgive and comfort him)'),
    },
    'th-132-who-may-properly-call-church-assem': {
        'summary': ('The overseers and rulers of the particular churches, by virtue of their '
                    'office (WCF XXXI.1) — to settle controversies of faith and cases of '
                    'conscience ministerially, order public worship and government, and hear '
                    'complaints of maladministration; decrees bind when consonant with the '
                    'Word (WCF XXXI.2).'),
    },
    'th-140-what-practical-use-is-the-doctrine': {
        'summary': ('Two uses (WCF XXXIII.3): deterring all from sin — we will all stand '
                    'before God\'s judgment seat (Rom 14:10; 2 Cor 5:9-10; Acts 17:30-31) — '
                    'and consoling the godly in adversity (2 Thes 1:6-10). The day is '
                    'unknown so that we stay watchful: "Come, Lord Jesus."'),
    },
    'th-141-when-will-christ-return-defend-you': {
        'summary': ('At a day unknown to men — unexpectedly, like a thief (Mat 24:36-44; '
                    '1 Thes 5:1-3; 2 Pet 3:9-10), yet imminently ("the Lord is near," Phil '
                    '4:5; James 5:8; Rev 22:20); not before the rebellion and the revealing '
                    'of the man of lawlessness (2 Thes 2:1-12).'),
    },
    'th-142-what-will-heaven-be-like': {
        'summary': ('The dwelling of God with his people (Rev 21:3): joy, light, the family '
                    'of God, eternal life. Not a disembodied existence but a redeemed '
                    'physical creation — the new Jerusalem descends to earth, and Jesus\' '
                    'resurrection body (continuous yet transformed) is the paradigm; '
                    '2 Peter 3 describes purification, not annihilation.'),
    },
    'th-145-what-is-your-view-of-the-millenniu': {
        'strip_after': '2 Other Questions',
        'summary': ('Amillennial:\n'
                    '- the NT interprets the OT\'s pictures of the Messianic age (the '
                    'church is the new Israel)\n'
                    '- Revelation 20\'s millennium is the present heavenly reign of Christ '
                    'with the saints between his comings, Satan bound at the cross\n'
                    '- "all Israel will be saved" (Rom 11:26) means the totality of the '
                    'elect among Israel gathered throughout history'),
    },
}


def main():
    raw = open(SRC, encoding='utf-8', errors='ignore').read().split('\n')

    # slice the A..I region: from "A. The Bible" up to "J. Sacraments"
    start = end = None
    for i, ln in enumerate(raw):
        m = SECTION_RE.match(ln)
        if m and m.group(1) == 'A' and start is None and 'Bible' in ln:
            start = i
        if m and m.group(1) == 'J' and start is not None:
            end = i; break
    region = raw[start:end]

    sets = {}
    order = []
    section = None
    n = 0
    seen = set()
    cur = None  # dict(q=, items=[(kind,text)], deck=)

    def close():
        nonlocal cur, n
        if not cur: return
        a = normalize_answer(cur['items'])
        if cur['q'].strip() and a:
            n += 1
            cid = slugify(cur['q'], n)
            while cid in seen: cid += 'x'
            seen.add(cid)
            refs = extract_refs(cur['q'] + ' ' + ' '.join(t for _, t in cur['items']))
            sets[cur['deck']]['cards'].append(
                {"id": cid, "q": cur['q'], "a": a, "refs": refs})
        cur = None

    i = 0
    while i < len(region):
        line = region[i]
        if not line.strip():
            i += 1; continue
        ms = SECTION_RE.match(line)
        if ms and ms.group(1) in SECTION_LABELS:
            close()
            letter = ms.group(1)
            deck = f'th-{letter.lower()}'
            section = deck
            if deck not in sets:
                sets[deck] = {"label": SECTION_LABELS[letter], "subject": "theology",
                              "order": ord(letter) - 64, "cards": []}
                order.append(deck)
            i += 1; continue
        mq = QUESTION_RE.match(line)
        if mq and section:
            close()
            # gather wrapped question lines until the first answer marker
            q = mq.group(2)
            j = i + 1
            while j < len(region) and region[j].strip() \
                    and not LETTER_RE.match(region[j]) and not NUM_SUB_RE.match(region[j]) \
                    and not QUESTION_RE.match(region[j]) and not SECTION_RE.match(region[j]):
                q += ' ' + region[j].strip()
                j += 1
            cur = {"q": clean(q), "items": [], "deck": section}
            i = j; continue
        if cur is None:
            i += 1; continue
        # answer lines
        ml = LETTER_RE.match(line)
        mn = NUM_SUB_RE.match(line)
        if ml:
            i = emit_item(cur, 'letter', f'{ml.group(1)}. ', ml.group(2), region, i + 1)
            continue
        if mn:
            i = emit_item(cur, 'num', f'{int(mn.group(1))}. ', mn.group(2), region, i + 1)
            continue
        # plain prose continuation
        i = emit_item(cur, 'prose', '', line.strip(), region, i + 1)
    close()

    leftover = dict(CURATE)
    for k in order:
        keys = {c['id'] for c in sets[k]['cards']}
        ops = {cid: op for cid, op in leftover.items() if cid in keys}
        for cid in ops: del leftover[cid]
        sets[k]['cards'] = apply_curation(sets[k]['cards'], ops, refs_fn=lambda t: extract_refs(t))
    if leftover:
        raise SystemExit(f'curation keys no longer match any card: {sorted(leftover)}')

    order = [k for k in order if sets[k]['cards']]
    sets = {k: sets[k] for k in order}

    header = ("// PCA Ordination & Licensure Study — Theology (Westminster, A–I)\n"
              "// Generated by dev/build_theology.py from doc_2 (sections A–I;\n"
              "// J/Sacraments lives in the Sacraments subject). Do not hand-edit.\n")
    js = header + "\n(function (global) {\n"
    js += "  const SETS = " + json.dumps(sets, ensure_ascii=False, indent=2) + ";\n\n"
    SUBJECT = {"id": "theology", "label": "Theology",
               "blurb": "Westminster systematic theology — Bible, God, salvation, church, last things.",
               "order": 2, "setKeys": order}
    js += "  const SUBJECT = " + json.dumps(SUBJECT, ensure_ascii=False) + ";\n\n"
    js += ("  const data = (global.PCA_DATA = global.PCA_DATA || { subjects: [], sets: {} });\n"
           "  Object.assign(data.sets, SETS);\n"
           "  if (!data.subjects.some(s => s.id === SUBJECT.id)) data.subjects.push(SUBJECT);\n"
           "})(typeof window !== 'undefined' ? window : globalThis);\n")
    open(OUT, 'w', encoding='utf-8').write(js)
    total = sum(len(s['cards']) for s in sets.values())
    print(f"wrote {OUT}: {total} cards in {len(sets)} sub-decks")
    for k in order:
        print(f"  {k}: {len(sets[k]['cards'])} cards — {sets[k]['label']}")

if __name__ == '__main__':
    main()
