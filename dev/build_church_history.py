#!/usr/bin/env python3
"""Build js/data/subjects/church_history.js from the extracted source.

Two card patterns:
  1. Prose Q&A — an interrogative/"Briefly trace…" prompt followed by answer
     paragraphs.
  2. Glossary prompts — "…identify/define the following:" followed by
     blank-separated blocks; each block (first line = term, rest = definition)
     becomes its own card, for finer-grained SRS.

Run: python3 dev/build_church_history.py
"""
import re, json, os, sys, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from curation import apply_curation

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source_materials/extracted/church_history.txt')
OUT = os.path.join(ROOT, 'js/data/subjects/church_history.js')

INTERROG_RE = re.compile(r'^(What|Why|How|Who|Whom|Where|When|Which|Whose|Does|Do|Did|Is|Are|Was)\b')
PROMPT_RE = re.compile(r'^(Briefly|Trace|Name|List|Describe|Identify|Define|Distinguish|Give)\b')
GLOSSARY_KEYS = re.compile(r'(following|define|distinctives)', re.I)
HEADER_RE = re.compile(r'^(?:[A-E]\.\s*)?(General|Denominations|Events|Definitions|People)\s*:?\s*$', re.I)
REF_RE = re.compile(r'W(?:CF|LC|SC)\s*[\dIVXLC]+(?:[.:]\d+)?')

def is_question(line):
    l = line.strip()
    if INTERROG_RE.match(l) and l.endswith('?'):
        return True
    if PROMPT_RE.match(l) and (l.endswith('.') or l.endswith(':') or l.endswith('?')):
        return True
    return False

def is_glossary_prompt(line):
    l = line.strip()
    return PROMPT_RE.match(l) and l.endswith(':') and bool(GLOSSARY_KEYS.search(l)) \
        or (INTERROG_RE.match(l) and l.endswith(':') and 'following' in l.lower())

def blocks_of(text):
    blocks, cur = [], []
    for raw in text.split('\n'):
        if raw.strip():
            cur.append(raw.rstrip())
        elif cur:
            blocks.append(cur); cur = []
    if cur:
        blocks.append(cur)
    return blocks

def clean(t):
    # html.unescape decodes leftover HTML entities from the source extraction
    # (&quot; → ", &#39; → ', &amp; → &) that otherwise render literally.
    return re.sub(r'\s+', ' ', html.unescape(t)).strip()

def norm_para(lines):
    """Join wrapped lines into paragraphs; keep list markers separate."""
    out, buf = [], ''
    def flush():
        nonlocal buf
        if buf.strip(): out.append(clean(buf)); buf = ''
    for ln in lines:
        s = ln.strip()
        if re.match(r'^(\d+\.|[a-z]\.|[-•])\s', s):
            flush(); out.append(s)
        elif not buf:
            buf = s
        elif buf.rstrip().endswith(('.', ':', ';', '?', '!')):
            flush(); buf = s
        else:
            buf += ' ' + s
    flush()
    # normalize bullets
    out = [re.sub(r'^[•]\s*', '- ', x) for x in out]
    return '\n'.join(out).strip()

def extract_refs(text):
    refs = []
    for m in REF_RE.findall(text):
        r = re.sub(r'\s+', ' ', m).strip()
        if r not in refs: refs.append(r)
    return refs

# Section routing: which sub-deck a glossary prompt feeds.
def route(prompt):
    p = prompt.lower()
    if 'distinctives' in p: return 'ch-denominations'
    if 'give dates' in p or ('identify' in p and 'dates' in p): return 'ch-events'
    if p.startswith('briefly define'): return 'ch-terms'
    if 'people' in p: return 'ch-people'
    return 'ch-overview'

SETS_META = [
    ('ch-overview', 'Overview, Eras & Solas', 1),
    ('ch-denominations', 'Denominations', 2),
    ('ch-events', 'Key Events & Movements', 3),
    ('ch-terms', 'Key Terms', 4),
    ('ch-people', 'Key People', 5),
    ('ch-pca', 'Presbyterian & PCA History', 6),
]

def looks_like_term(block):
    """First line short & title-ish, rest is the definition."""
    first = block[0].strip()
    if first.startswith('http'):
        return False
    return len(first) <= 44 and len(block) >= 1 and not first.endswith(('.', '?'))

# The source's "Great Awakening(s)" entry is a two-column comparison table that
# plain-text extraction flattens into context-free fragments ("Nathaniel Taylor
# (Yale)", "Highlights", …). Rebuild it by hand as one comparison card instead
# of letting the glossary parser emit garbage cards.
AWAKENINGS_Q = 'Compare the First and Second Great Awakenings (dates, figures, theology, distinctives).'
AWAKENINGS_A = (
    '| | 1st Great Awakening (c. 1735–43) | 2nd Great Awakening (1795–1830) |\n'
    '|---|---|---|\n'
    '| Major figures | Theodore Frelinghuysen (Dutch Reformed), Gilbert Tennent (Presbyterian), '
    'Jonathan Edwards (Congregational), George Whitefield (Anglican) | Nathaniel Taylor (Yale), '
    'Lyman Beecher, Charles Finney; Methodists/Baptists in the west, Presbyterian New School in the east |\n'
    '| Theology | Calvinist | New Haven / Arminian (modified Edwards) |\n'
    '| Salvation | Traditional Calvinist (sovereign God; total depravity; no decisionalism) | '
    'Humans have the ability to choose to come to God |\n'
    '| Church | "Pure church" model (only the born-again take the Supper); end of the Half-Way Covenant | '
    'Private interpretation of the Bible; revivalism; volunteer societies |\n'
    '| Society | Church/state relationships grow apart | Optimism about the US; volunteer societies; '
    'sense of special blessing on America |\n'
    '| Highlights | Edwards (Freedom of the Will; Original Sin; Religious Affections); '
    "Whitefield's campaigns | Finney (Lectures on Revival); camp/tent meetings; "
    'the anxious bench ("New Measures") |'
)

# ── Curation layer (see dev/curation.py) ─────────────────────────────────
# Repairs and authored summaries: the spread-of-Christianity table arrives
# flattened (rebuilt by hand); the Presbyterianism-in-America card swallowed
# the modernism/fundamentalism question (split in two and rebuilt as a dated
# timeline); the PCA-distinctives card swallowed a ~20k-character COPYRIGHTED
# essay ("A Brief History of Covenant Theology" © R. S. Clark — must never
# ship; cf. the BCO rule in CLAUDE.md) and is rebuilt from the on-topic part.

SPREAD_TABLE = """\
| Period | Dates | Major events | Key people | Description |
|---|---|---|---|---|
| N.T. / Apostles | 6 B.C.–A.D. 70 | Ministry of Jesus; expansion recorded (partially) in Acts | Jesus, the disciples | Transition from Jewish to Gentile church — Jerusalem no longer central; issues re: Jews/Gentiles and early Gnosticism; the apostles teach and lead, some martyred |
| Church Fathers | 70–312 | 70 destruction of Jerusalem; 70–200 general persecution; 250–260 empire persecution (Decius); 303ff Great Persecution (Diocletian) | Apostolic Fathers & Apologists: Clement, Ignatius, Polycarp, Justin, Irenaeus, Tertullian, Eusebius | A small sect facing persecution and heresy (Gnosticism); no fixed creeds, theology, or worship; the apostles dying out |
| Roman Christian Empire | 312–550 | 312 Constantine converted; 313 Edict of Milan; councils — 325 Nicea, 381 Constantinople, 431 Ephesus, 451 Chalcedon | Constantine, Arius, Athanasius, Chrysostom, Jerome, Ambrose, Augustine | Christianity legalized and growing; the age of councils and creeds; eventually a "Christian" empire |
| Christian Middle Ages | 550–1517 | 663 Synod of Whitby; 716 Boniface's mission; 800 Charlemagne crowned; 1054 East/West schism; 1095 First Crusade; 1215 Fourth Lateran Council | Benedict, Patrick, Gregory the Great, Bede, Anselm, Abelard, Bernard of Clairvaux, Francis of Assisi, Aquinas | The church stabilizes the collapsing empire; missions to northern Europe; rise of Islam → crusades; papal power and abuses; monasticism; scholasticism and the universities |
| Age of Reformation | 1517–1649 | 1521 Luther excommunicated; 1534 Henry VIII's separation; 1536 first Institutes; 1542–64 Calvin in Geneva; 1545 Trent begins; 1618–19 Dordt; 1643–49 Westminster Assembly | Hus, Wycliffe, Tyndale, Luther, Zwingli, Calvin, Henry/Elizabeth, Cranmer, Knox, Loyola | Pre-reformers spark reform of papal abuse; Lutheran, Swiss, and English reformations plus the Catholic counter-reformation; radical changes to doctrine and church structure |
| Enlightenment & Expansion | 1649–1860 | 1735–43 First Great Awakening; 1793 Carey to India; 1795–1830 Second Great Awakening | Puritans, Edwards, Whitefield, the Wesleys, Carey, Locke, Hume, Darwin, Finney, Spurgeon | Confessionalism challenged by enlightenment reason and higher criticism; two Great Awakenings in North America; modern missions begin |
| Modern | 1860–present | 1830–60 Old/New School debate; 1880ff liberal theology flourishes; 1920ff Modernist/Fundamentalist controversy; 1924 Auburn Affirmation; 1964 Vatican II | Hodge, Warfield, Moody, Machen, Kuyper, Barth, Graham | The modernist–fundamentalist controversy cuts across denominations (the issue: authority); neo-orthodoxy; missions expand; rise of evangelicalism and the ecumenical movement |

Ages summarized from _Church History in Plain Language_; content summarized from _The Concise Book of Christian Faith_."""

PRESBYTERIAN_TIMELINE = """\
- **1706** — Francis Makemie (Irish missionary to America) establishes the first American presbytery, in Philadelphia, of Scots and Irish immigrants; arrested for preaching without a license.
- **1716** — First synod formed at Philadelphia (3 presbyteries).
- **1729** — The Adopting Act: a compromise between doctrinal essentials and non-essentials in the Westminster Standards; ministerial candidates must state all exceptions at subscription. (Scots stricter — orthodoxy; English looser — experiential religion.)
- **1720s–30s** — William Tennent sees that ministers need training; founds the Log College (1735).
- **First Great Awakening (1734–45)** — Old Side (William Tennent the elder: rational underpinnings of orthodoxy, continental Reformed theology, stricter subscription) vs New Side (Gilbert Tennent, "On the Danger of an Unconverted Ministry": evidence of true conversion and Christian experience).
- **1741** — New Side ("New Lights") expelled from the Synod of Philadelphia; the Log College becomes the College of New Jersey in 1746 (seed of Princeton; Jonathan Edwards president for a year).
- **1758** — Plan of Union reunites Old Side and New Side, slightly favoring the New Side.
- **1789** — First General Assembly of the Presbyterian Church in the U.S.A. convenes in Philadelphia.
- **1812** — Archibald Alexander founds Princeton Seminary (Old School).
- **Second Great Awakening (1795–1830)** — Charles Finney's revivalism draws Old School criticism as doctrinally shallow.
- **1837** — Old School / New School division: Old School (Alexander, Hodge — strict adherence to the Standards, historic Calvinism) vs New School (revivalist theology and practice, New Haven theology); the New School a separate denomination 1837–1869.
- **1861** — The Gardiner Spring Resolutions split the Old School over church and state; first General Assembly of the Southern Presbyterian Church (James Henley Thornwell its dominant influence — committees, not boards; B. M. Palmer first moderator; also Girardeau and Dabney).
- **1864 / 1869–70** — Old School and New School reunite (South 1864, forming what becomes the PCUS; North 1869–70).
- **1890s** — Liberalism creeps in (Briggs heresy trial; Union Seminary leaves the denomination) — seeds of the Fundamentalist–Modernist controversy.
- **1910/1916** — The "Five Fundamentals" outlined at General Assembly: inerrancy of the Bible, the Virgin Birth, Christ's substitutionary atonement, Christ's bodily resurrection, the authenticity of miracles / literal second coming.
- **1922** — Fosdick, "Shall the Fundamentalists Win?" (liberal). **1923** — Machen, _Christianity and Liberalism_ (conservative). **1924** — The Auburn Affirmation.
- **1929** — Princeton reorganized; Machen, Oswald Allis, Cornelius Van Til, and Robert Dick Wilson found Westminster Theological Seminary (John Murray joins the next year).
- **1933** — Independent Board for Presbyterian Foreign Missions (Machen). **1936** — the Orthodox Presbyterian Church formed. **1937** — Bible Presbyterian Church splits off (McIntire, Buswell, Schaeffer); a branch becomes the EPC, then the RPCES — received by the PCA in 1982.
- **1973** — Conservatives leave the PCUS and form the National Presbyterian Church — renamed the **Presbyterian Church in America** in 1974."""

MODERNISM_CARD_A = """\
The Fundamentalist–Modernist controversy: with urbanization and liberal trends in the church came pressure within the General Assembly to revise the Westminster Confession and accommodate liberal theology. J. Gresham Machen (professor of New Testament at Princeton) stood at the center of the conservative response.

- **1910/1916 — the "Five Essentials/Fundamentals,"** outlined at General Assembly: the inerrancy of the Bible; the Virgin Birth; Christ's substitutionary atonement; Christ's bodily resurrection; the authenticity of miracles.
- **1922 — Harry Emerson Fosdick,** "Shall the Fundamentalists Win?" — the liberal side of the argument (Union Theological Seminary; helped draft the Auburn Affirmation; pastor of Riverside Church, NY).
- **1923 — J. Gresham Machen,** _Christianity and Liberalism_ — liberalism is not a variety of Christianity but a different religion.
- **1924 — The Auburn Affirmation** — liberal presbyters nominally affirm but relativize the five fundamentals, to "create room" for non-orthodox views: liberalism and fundamentalism could co-exist in one church.
- **1926** — Machen denied the Chair of Apologetics at Princeton.
- **1929 — Westminster Theological Seminary** founded by Machen with Oswald Allis, Cornelius Van Til, and Robert Dick Wilson (John Murray joins the next year) after Princeton's boards were restructured — leading to the Independent Board for Presbyterian Foreign Missions (1933), Machen's suspension (1935), and the OPC (1936)."""

PCA_DISTINCTIVES = """\
Cf. Morton Smith, _How the Gold Became Dim_.

- **A high view of Scripture:** verbal plenary inspiration; Scripture the basis for authority within the church.
- **The spiritual mission of the church** — evangelism.
- **A distinctly Presbyterian and Reformed ministry,** confessionally subscribing to the Westminster Standards.
- **Limited polity** in church matters; power with the laity.
- **Against the PCUS trends:** women teaching, exhorting, or leading in public assemblies; the social gospel; the "one church movement" (National and World Councils of Churches)."""

CURATE = {
    'ch-002-briefly-trace-the-spread-of-christia': {
        'a': SPREAD_TABLE,
        'summary': ('Apostles (to 70) → persecuted Fathers (70-312) → imperial church and '
                    'the great councils (312-550) → Middle Ages (550-1517) → Reformation '
                    '(1517-1649) → Enlightenment and the Awakenings (1649-1860) → the modern '
                    'era (1860-): modernist-fundamentalist struggle and global expansion.'),
    },
    'ch-004-methodist-churches': {
        'summary': ('Rooted in John and Charles Wesley (with Whitefield, the "Holy Club"): '
                    'inward religion of the heart, a strong ethical view of sanctification, '
                    'evangelistic, disciplined, active in social concern, resistant to strict '
                    'confessionalism — Anglican forms with an evangelical emphasis and a '
                    'doctrine of perfection. Francis Asbury led in America.'),
    },
    'ch-011-mennonite-churches': {
        'summary': ('Menno Simons (c. 1496-1561), from Dutch/Swiss Anabaptism: adult baptism '
                    'only, rejection of oaths and military service, humility, nonresistance, '
                    'and separation from the world; pietistic, Bible-centered renewal of '
                    'life; held a Melchiorite view of the incarnation.'),
    },
    'ch-025-compare-the-first-and-second-great-a': {
        'summary': ("1st (c. 1735–43): Calvinist — Frelinghuysen, Tennent, Edwards, "
                    "Whitefield; \"pure church\" model, end of the Half-Way Covenant. "
                    "2nd (1795–1830): New Haven/Arminian — Taylor, Beecher, Finney; "
                    "revivalism, camp meetings, the anxious bench, volunteer societies."),
    },
    'ch-041-justin-martyr': {
        'summary': ('Greek apologist, martyred c. 160 in Rome. Converted while seeking true '
                    'philosophy; saw Christ as the fulfillment of the best of Greek thought '
                    '("all truth is God\'s truth"), setting the pattern for Greek theology '
                    '(Clement, Origen). Works: I & II Apology, Dialogue with Trypho.'),
    },
    'ch-064-philip-melanchthon': {
        'summary': ('"Teacher of Germany" (1497-1560), humanist, Luther\'s No. 2 at '
                    'Wittenberg. Wrote the Loci Communes (1521) and authored the Augsburg '
                    'Confession (1530); favored the Reformed rather than Lutheran view of '
                    'communion — reversed by the Formula of Concord (1577).'),
    },
    # The extraction glued the modernism/fundamentalism question into this
    # card; split it back out and recast both as dated timelines.
    'ch-087-briefly-trace-the-history-of-presbyt': {'replace': [
        {'id': 'ch-087-briefly-trace-the-history-of-presbyt',
         'q': 'Briefly trace the history of Presbyterianism in the United States.',
         'a': PRESBYTERIAN_TIMELINE,
         'summary': ('Makemie\'s first presbytery (1706) → first synod (1716) → Adopting Act '
                     '(1729) → Old/New Side (1741-58) → first GA (1789) → Old/New School '
                     '(1837) → North/South (1861) → fundamentalist-modernist controversy '
                     '(Machen, Westminster 1929, OPC 1936) → PCA leaves the PCUS (1973).'),
         'refs': []},
        {'id': 'ch-087b-modernism-fundamentalism',
         'q': ('Discuss the controversy between modernism and fundamentalism. Identify the '
               'significance of the Five Fundamentals, the Auburn Affirmation, Fosdick, '
               'Machen, and Westminster Seminary.'),
         'a': MODERNISM_CARD_A,
         'summary': ('Liberal pressure to revise the Standards vs the Five Fundamentals '
                     '(1910/16); Fosdick\'s "Shall the Fundamentalists Win?" (1922) vs '
                     'Machen\'s Christianity and Liberalism (1923); the Auburn Affirmation '
                     '(1924); Princeton reorganized → Westminster Seminary (1929) → '
                     'OPC (1936).'),
         'refs': []},
    ]},
    'ch-088-trace-the-historical-roots-of-the-rp': {
        'summary': ('Machen\'s Westminster (1929) and the OPC (1936) → Bible Presbyterian '
                    'Church split (1937: eschatology, liberty, separatism — McIntire, '
                    'Buswell, Schaeffer) → EPC (1955; Covenant College and Covenant Seminary, '
                    'Rayburn) → merger with the RPCGS forms the RPCES (1965) → joined and '
                    'received by the PCA in 1982, bringing both Covenant institutions.'),
    },
    'ch-089-when-where-and-why-did-the-pca-begin': {
        'summary': ('In response to liberalism and lost mission in the PCUS, conservatives '
                    'organized (Presbyterian Journal 1942, PEF 1958, Concerned Presbyterians '
                    '1964, Presbyterian Churchmen United 1968), formed a steering committee '
                    '(1971), and on December 4, 1973, 260 churches (41,000 members) formed '
                    'the National Presbyterian Church at Briarwood, Birmingham — renamed the '
                    'Presbyterian Church in America in 1974.'),
    },
    'ch-090-what-are-some-distinctives-of-the-pc': {
        'a': PCA_DISTINCTIVES,
        'summary': ('A high view of Scripture (verbal plenary inspiration), the spiritual '
                    'mission of the church (evangelism), a distinctly Reformed and '
                    'confessional ministry, and limited polity with power to the laity — '
                    'against the PCUS drift: women leading assemblies, the social gospel, '
                    'and NCC/WCC ecumenism.'),
    },
}

def main():
    text = open(SRC, encoding='utf-8').read()
    blks = blocks_of(text)

    sets = {k: {"label": l, "subject": "church_history", "order": o, "cards": []}
            for k, l, o in SETS_META}
    n = 0
    seen = set()
    section = 'ch-overview'      # default prose bucket
    gloss = None                 # active glossary sub-deck key, or None
    cur_q = None                 # (question, [answer blocks], deck)
    in_awakenings = False        # inside the flattened Awakenings table

    def add(deck, q, a):
        nonlocal n
        a = a.strip()
        if not q.strip() or not a:
            return
        n += 1
        slug = re.sub(r'[^a-z0-9]+', '-', q.lower()).strip('-')[:36].rstrip('-')
        cid = f'ch-{n:03d}-{slug}' if slug else f'ch-{n:03d}'
        while cid in seen: cid += 'x'
        seen.add(cid)
        sets[deck]['cards'].append({"id": cid, "q": q, "a": a, "refs": extract_refs(q + ' ' + a)})

    def close_prose():
        nonlocal cur_q
        if cur_q:
            add(cur_q[2], cur_q[0], norm_para(cur_q[1]))
        cur_q = None

    for blk in blks:
        # a section header (General/Denominations) often shares a block with the
        # first question/prompt below it — strip it and process the remainder.
        if HEADER_RE.match(blk[0].strip()):
            close_prose(); gloss = None
            blk = blk[1:]
            if not blk:
                continue
        first = blk[0].strip()
        if first.startswith('Study Questions'):
            continue
        # PCA-history section starts at the US-Presbyterianism trace
        if re.match(r'(Trace the history of the formation of the PCA|'
                    r'Briefly trace the history of Presbyterianism in the United States|'
                    r'Trace the historical roots of the RPCES)', first):
            close_prose(); gloss = None; section = 'ch-pca'
        if is_glossary_prompt(first):
            close_prose()
            gloss = route(first)
            # any trailing lines in the prompt block before items are ignored
            continue
        if is_question(first):
            close_prose()
            gloss = None
            deck = 'ch-pca' if section == 'ch-pca' else 'ch-overview'
            # question may have answer text after it in the same block
            q = first
            rest = blk[1:]
            cur_q = (q, rest, deck)
            continue
        # content block
        if gloss:
            # Great Awakening(s) comparison table → one hand-built card; skip
            # the flattened fragments until the next real entry.
            if first.startswith('Great Awakening'):
                add(gloss, AWAKENINGS_Q, AWAKENINGS_A)
                in_awakenings = True
                continue
            if in_awakenings:
                if first.startswith('Old School / New School'):
                    in_awakenings = False  # fall through to normal handling
                else:
                    continue
            if looks_like_term(blk):
                term = clean(blk[0])
                defn = norm_para(blk[1:]) if len(blk) > 1 else ''
                if defn:
                    add(gloss, term, defn)
            # else: stray (e.g. URL) — skip
            continue
        if cur_q:
            cur_q[1].extend([''] + blk)  # paragraph break then block
    close_prose()

    leftover = dict(CURATE)
    for k, _, _ in SETS_META:
        keys = {c['id'] for c in sets[k]['cards']}
        ops = {cid: op for cid, op in leftover.items() if cid in keys}
        for cid in ops: del leftover[cid]
        sets[k]['cards'] = apply_curation(sets[k]['cards'], ops)
    if leftover:
        raise SystemExit(f'curation keys no longer match any card: {sorted(leftover)}')

    order = [k for k, _, _ in SETS_META if sets[k]['cards']]
    sets = {k: sets[k] for k in order}

    header = ("// PCA Ordination & Licensure Study — Church History & PCA History\n"
              "// Generated by dev/build_church_history.py. Do not hand-edit.\n")
    js = header + "\n(function (global) {\n"
    js += "  const SETS = " + json.dumps(sets, ensure_ascii=False, indent=2) + ";\n\n"
    SUBJECT = {"id": "church_history", "label": "Church History & PCA History",
               "blurb": "Eras, the Reformation, denominations, key people, and PCA origins.",
               "order": 4, "setKeys": order}
    js += "  const SUBJECT = " + json.dumps(SUBJECT, ensure_ascii=False) + ";\n\n"
    js += ("  const data = (global.PCA_DATA = global.PCA_DATA || { subjects: [], sets: {} });\n"
           "  Object.assign(data.sets, SETS);\n"
           "  if (!data.subjects.some(s => s.id === SUBJECT.id)) data.subjects.push(SUBJECT);\n"
           "})(typeof window !== 'undefined' ? window : globalThis);\n")
    open(OUT, 'w', encoding='utf-8').write(js)
    total = sum(len(s['cards']) for s in sets.values())
    print(f"wrote {OUT}: {total} cards in {len(sets)} sub-decks")
    for k in order:
        print(f"  {k}: {len(sets[k]['cards'])} cards")

if __name__ == '__main__':
    main()
