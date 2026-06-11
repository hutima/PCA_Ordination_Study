#!/usr/bin/env python3
"""Build js/data/subjects/bible_content.js from the Bible Content section
(doc_2 §I, before the Theology sections).

Two question flavors:
  * Prose Q&A (e.g. "What is the Synoptic Problem?") → one card.
  * List-prompts ("Discuss/Locate … the following:") whose lettered items
    (a. Adam, b. Abraham, …) — often with nested 01. OT / 02. NT discussion —
    each become their own card, for finer SRS granularity.

Sub-section headers ("1 Old Testament: Key People", …) become sub-decks.
Run: python3 dev/build_bible_content.py
"""
import re, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'dev'))
from curation import apply_curation

SRC = os.path.join(ROOT, 'source_materials/extracted/bible_content_theology.txt')
OUT = os.path.join(ROOT, 'js/data/subjects/bible_content.js')

SUBSEC_RE = re.compile(r'^\s{4,16}(\d+)\s+((?:Old|New) Testament:.*|Whole Bible)\s*$')
QUESTION_RE = re.compile(r'^\s{3,7}([1-9]\d?)\.\s+(.*)$')   # not zero-padded
LETTER_RE = re.compile(r'^\s{6,9}([a-z])\.\s+(.*)$')
NUM_SUB_RE = re.compile(r'^\s{8,}(0\d|\d{2})\.\s+(.*)$')     # 0/2-padded (e.g. "01. OT")
ROMAN_RE = re.compile(r'^\s{10,}(xx|xix|xvi{0,3}|xv|xiv|xi{0,3}|ix|iv|vi{0,3}|v|i{1,3})\.\s+(.*)$', re.I)
# Word-export bullet debris: level-1 bullets came through as ".", level-2
# (Wingdings circles) as a bare "o". Convert to Markdown list items instead of
# letting the reflow run them into the surrounding prose.
BULLET_SRC_RE = re.compile(r'^\s{8,}([.o])\s+(\S.*)$')
REF_RE = re.compile(r'W(?:CF|LC|SC)\s*[\dIVXLC]+(?:[.:]\d+)?')
SCRIPT_RE = re.compile(r'\b(?:[123]\s)?[A-Z][a-z]+\.?\s\d+(?::\d+(?:[-–]\d+)?)?')
FOOTNOTE_RE = re.compile(r'\[\d+\]')

DECK_FOR = {
    'Whole Bible': ('bc-whole', 'Whole Bible', 1),
    'Old Testament: Key People': ('bc-ot-people', 'OT: Key People', 2),
    'Old Testament: Key Passages': ('bc-ot-passages', 'OT: Key Passages', 3),
    'Old Testament: Key Events': ('bc-ot-events', 'OT: Key Events', 4),
    'New Testament: General': ('bc-nt-general', 'NT: General', 5),
    'New Testament: Key People': ('bc-nt-people', 'NT: Key People', 6),
    'New Testament: Key Passages': ('bc-nt-passages', 'NT: Key Passages', 7),
    'New Testament: Key Topics': ('bc-nt-topics', 'NT: Key Topics', 8),
}

def deck_for(title):
    t = re.sub(r'\s+', ' ', title).strip().rstrip('.')
    for key, v in DECK_FOR.items():
        if t.startswith(key):
            return v
    return ('bc-whole', 'Whole Bible', 1)

def clean(t):
    t = re.sub(r'\s+', ' ', FOOTNOTE_RE.sub('', t.replace('&amp;', '&'))).strip()
    # source typo: a duplicated "around" at a line wrap ("around 1000 B.C. around")
    t = re.sub(r'\baround (\d{3,4})\s*B\.C\. around\b', r'around \1 B.C.', t)
    # dotted-leader runs from the flattened life-of-Christ outline table
    t = re.sub(r'\s*\.{5,}\s*', ' ', t).strip()
    return t

def is_list_prompt(q):
    ql = q.lower()
    return ('following' in ql) or bool(re.match(r'(discuss|locate|know|identify|name the)\b', ql))

# A licensure exam asks a question; a bare topic ("Abraham", "Passover") is
# not one. When a list-prompt expands into per-item cards, rebuild each card's
# front from the parent prompt so it reads like the exam question it answers.
# Items that are already full questions (e.g. "Which are the Prison
# Epistles?") pass through untouched.
def q_template(prompt):
    p = prompt.lower()
    if p.startswith('discuss briefly the life and significance'):
        return 'Discuss briefly the life and significance of {} (book(s) and chapter(s)).'
    if p.startswith('discuss briefly the significance'):
        return 'Discuss briefly the significance of {} (book(s) and chapter(s)).'
    if p.startswith('locate the following passages by book and chapter'):
        return 'Locate by book and chapter: {}.'
    if p.startswith('locate these events by book and chapter'):
        return 'Locate by book and chapter (and date where appropriate): {}.'
    if p.startswith('know books and chapters'):
        return 'Give book and chapter for: {}.'
    if p.startswith('identify passages someone could read about'):
        return 'Identify passages someone could read about: {}.'
    return None

def templated_q(tmpl, item):
    if not tmpl or item.rstrip().endswith('?'):
        return item
    it = item.strip().rstrip('.')
    # "Promise to Abraham*" footnote stars are extraction debris on the front.
    it = it.rstrip('*').strip()
    # Lowercase a leading article so the item reads inside the sentence.
    if it.split(' ', 1)[0] in ('The', 'A', 'An') and not tmpl.endswith(': {}.'):
        it = it[0].lower() + it[1:]
    return tmpl.format(it)

def extract_refs(text):
    refs = []
    for m in REF_RE.findall(text):
        r = re.sub(r'\s+', ' ', m).strip()
        if r not in refs: refs.append(r)
    return refs

def join_block(region, i, stop):
    """Join wrapped continuation lines starting at i until a stop-marker."""
    text = ''
    while i < len(region):
        ln = region[i]
        if not ln.strip():
            i += 1
            continue
        if stop(ln):
            break
        text += (' ' if text else '') + ln.strip()
        i += 1
    return clean(text), i

# ── Curation layer (see dev/curation.py) ─────────────────────────────────
# Repairs what the extraction can't: a question with its answer glued on and
# a second Q&A inside it (bc-002), memory-verse items orphaned from their
# parent question (bc-003/4/5, bc-069/70), OT divisions split across three
# fragments (bc-006/7/8), PDF tables flattened past recognition (bc-009/10,
# bc-064, bc-068), and three prompts glued into one card (bc-066).

OT_HISTORY_TABLE = """\
| Period | Start date | People | Books |
|---|---|---|---|
| Creation & Fall |  | Adam & Eve | Genesis |
| Flood |  | Noah | Genesis |
| Patriarchs (promise to Abraham) | 2100 | Abraham, Isaac, Jacob, Joseph | Genesis (Job?) |
| Exodus | 1446 | Moses | Exodus–Deuteronomy |
| Conquest | 1406 | Joshua | Joshua |
| Judges | ca. 1375 |  | Judges–1 Samuel |
| United Kingdom | 1050 (Saul) | Saul, David (anointed 1010), Solomon — 40 years each | 1 Samuel–1 Kings, 1 & 2 Chronicles; the Poetical Books |
| Divided Kingdom | c. 930/922 | Israel & Judah | 1 & 2 Kings, 2 Chronicles; the Prophetical Books & Psalms |
| Exile | 722 (Israel), 586 (Judah) | Ezekiel, Daniel | 2 Kings; Ezekiel, Daniel |
| Post-Exilic | 538 (return), 516 (Temple rebuilt) | Zerubbabel, Ezra, Nehemiah, Esther | Ezra, Nehemiah, Esther; Haggai, Zechariah, Malachi |
| Intertestamental | 400 B.C. |  | (Apocrypha) |
| Life of Christ | 4 B.C. | John the Baptist, Jesus, the Apostles | Matthew, Mark, Luke, John |
| Early Church | A.D. 33– | The Apostles — especially Peter, Paul, and John | Acts; the Letters (Paul & General); Revelation |

Key dates to anchor: Abram born c. 2150, enters Canaan 2090; Isaac c. 2065; Jacob & Esau c. 2000; Joseph in Egypt c. 1900; Moses born c. 1530; Exodus c. 1446; conquest begins c. 1400; Saul 1050–1010; David 1010–970; Solomon 970–930 (Temple dedicated c. 950); kingdom divides c. 922; Israel falls 722; Judah falls 586; return under Cyrus 538; second Temple 516; Ezra/Nehemiah return c. 458–445."""

COVENANT_TABLE = """\
| Covenant | Promise | Requirement | Sign | Reference |
|---|---|---|---|---|
| Works — Adamic | Life | Obedience (regarding the tree of knowledge of good/evil) | Tree of Life | Gen 3 |
| Grace — Noahic | Never flood again | None stated | Rainbow | Gen 9 |
| Grace — Abrahamic | Seed, land, blessing to the nations | Faith | Circumcision (Gen 17:11) | Gen 12, 15, 17 |
| Grace — Mosaic | God's special people | Law (esp. the Decalogue) | Passover / Sabbath | Exod 19–24, Deut 5 |
| Grace — Davidic | A Davidic dynasty securing blessing for the people | None | None | 2 Sam 7 |
| Grace — New | Renewal of the promises | None | None | Jer 31; Matt 26:28; Luke 22:20 |"""

GOSPELS_DISTINCTIVES = """\
**Matthew**

- Juxtaposition of particularism (go only to the lost sheep of Israel, Mat 10) with the universalism of the Great Commission
- Fulfillment formulae
- Discipleship and the church: a more positive portrait of the disciples (e.g. Peter calls Jesus the "Son of God," Mat 16) and emphasis on community instructions (e.g. Mat 18)
- Conflict with the Jewish authorities, seen in the repeated label "their synagogues"

**Mark**

- Jesus' identity as the suffering servant (cf. Mark 10:45)
- Disciples and discipleship: as the disciples recapitulate the failures of Israel, the reader is forced to conclude that no one is faithful and to ask whether or not he is
- The Holy Spirit is conspicuous by his absence
- The message about Jesus as the Good News

**Luke**

- Jesus' humanity: Christological titles are not as dominant as in the other gospels
- Jesus' ministry to the outcasts (e.g. the parables of the Good Samaritan and the Prodigal Son)
- Women: Elizabeth and Mary, the prophetess Anna, the women who supported Jesus' ministry
- The poor: "Blessed are the poor" rather than Matthew's "poor in spirit"
- Jesus' prayer life is emphasized
- The orderly account of Jesus' life; the Holy Spirit; stewardship of material possessions

**John**

- Realized eschatology: "Whereas the Synoptics stress a future hope and the return of Christ, John defines eternal life and death as beginning now in this age, based on men's and women's response to Jesus" (e.g. John 3:18)
- Miracles as signs: in the Synoptics Jesus only gives the sign of Jonah, but John stresses Jesus' signs
- Incipient Trinitarianism and the unity of Jesus' followers
- Election and the security of the believer
- Christ's death as exaltation/glorification
- Jesus' trips to Jerusalem and his fulfillment of all the major Jerusalem institutions and rituals
- Jesus' "I AM" statements"""

PAUL_TABLE = """\
| Date(s) | Reference(s) | Event(s) | Letter(s) |
|---|---|---|---|
| 33 | Acts 9 | Conversion |  |
| 46–48 | Acts 13–14 | First Missionary Journey | Galatians (if after the 1st journey) |
| 49–52 | Acts 15–18 | Second Missionary Journey | 1 & 2 Thessalonians |
| 53–57 | Acts 18–21 | Third Missionary Journey | 1 & 2 Corinthians; Romans |
| 57–62 | Acts 21–28 | First Imprisonment (Caesarea and Rome) | Prison Epistles: Ephesians, Philippians, Colossians, Philemon |
| 62–68 |  | Fourth Missionary Journey & Second Imprisonment (Rome) | Pastoral Epistles: 1 & 2 Timothy, Titus |"""

LIFE_OF_CHRIST_OUTLINE = """\
**Preparation** — Birth: Bethlehem, 6–4 B.C. (Mat 2:1); the trip to Egypt (Matthew 2); the boy Jesus at the Temple (Luke 2).

Public ministry began in A.D. 26, when Jesus was about 30, and lasted three years — three Passovers are celebrated in John (2:23; 6:4; 11:55), and John 5:1 may be a fourth.

**Year One — Obscurity/Inauguration (Judea/Galilee)**

- Baptism: Mat 3; Mark 1; Luke 3; John 1
- Temptation: Mat 4; Mark 1; Luke 4
- Nicodemus: John 3
- Ministry begins: Mat 4; Mark 1; Luke 4

**Year Two — Popularity/Acclamation (Galilee)**

- Calls the apostles: Mat 4; Mark 3; Luke 6
- Sermon on the Mount/Plain: Mat 5–7; Luke 6
- Parables of the Kingdom: Mat 13; Mark 4; Luke 8
- Apostles sent out to preach: Mat 10; Mark 6; Luke 9

**Year Three — Adversity/Opposition (Galilee/Judea)**

- Feeds the 5,000 / walks on water: Mat 14; Mark 6; Luke 9; John 6
- Peter's confession / passion predictions: Mat 16; Mark 8; Luke 9
- Transfiguration: Mat 17; Mark 9; Luke 9
- Raises Lazarus: John 11

**Passion (one week, A.D. 30, Jerusalem)**

- Triumphal Entry: Mat 21; Mark 11; Luke 19; John 12
- Upper Room / Last Supper: Mat 26; Mark 14; Luke 22; John 13–16
- High Priestly Prayer: John 17
- Resurrection: Mat 28; Mark 16; Luke 24; John 20–21"""

CURATE = {
    # The source glues the OT and NT law questions (and their reference
    # answers) into one prompt; pull them apart into two real Q&A cards.
    'bc-002-where-in-the-old-testament-would-y': {'split': [
        {'at': None,
         'q': 'Where in the Old Testament would you find the Ten Commandments (two references)?',
         'summary': 'Exodus 20:1-17 and Deuteronomy 5:1-21. (The Exodus version is quoted in full, with the note on how Reformed, Roman, and Jewish traditions number the ten.)'},
        {'at': 'b. Law Summarized in the NT:',
         'id': 'bc-002b-law-summarized-in-the-nt',
         'q': 'Where in the New Testament would you find the law summarized (two references, quote one)?',
         'summary': 'Matthew 22:37-40 and Luke 10:27 (cf. Mark 12:28-31): love the Lord your God with all your heart, soul, and mind — and your neighbor as yourself.'},
    ]},
    # Memory-verse items orphaned from their parent question → one card again.
    'bc-003-psalm-19-1-4a': {'replace': [{
        'id': 'bc-003-revelation-of-god-in-nature',
        'q': 'Locate two passages about the revelation of God in nature.',
        'a': ('Psalm 19:1-4a: "For the director of music. A psalm of David. The heavens declare '
              'the glory of God; the skies proclaim the work of his hands. 2 Day after day they '
              'pour forth speech; night after night they display knowledge. 3 There is no speech '
              'or language where their voice is not heard. 4 Their voice goes out into all the '
              'earth, their words to the ends of the world...."\n\n'
              'Romans 1:20: "For since the creation of the world God\'s invisible qualities-his '
              'eternal power and divine nature-- have been clearly seen, being understood from '
              'what has been made, so that men are without excuse."\n\n'
              'Cf. also Acts 14:15-17 (Paul speaking to pagans in Lystra).'),
        'summary': ('Psalm 19:1-4a ("the heavens declare the glory of God") and Romans 1:20 '
                    '("God\'s invisible qualities… clearly seen"); cf. also Acts 14:15-17.'),
        'refs': ['Psalm 19:1-4', 'Romans 1:20', 'Acts 14:15-17'],
    }]},
    'bc-004-romans-1-20': 'drop',
    'bc-005-cf-also-acts-14-15-17-paul-speakin': 'drop',
    # The OT-divisions answer arrived as three fragments → one card again.
    'bc-006-history': {'replace': [{
        'id': 'bc-006-ot-divisions',
        'q': 'Name the general divisions of the Old Testament and the books in each.',
        'a': ('**History (17).** Pentateuch (5): Genesis, Exodus, Leviticus, Numbers, '
              'Deuteronomy. Historical Books (12): Joshua, Judges, Ruth, 1 & 2 Samuel, '
              '1 & 2 Kings, 1 & 2 Chronicles, Ezra, Nehemiah, Esther.\n\n'
              '**Poetry (5).** Job, Psalms, Proverbs, Ecclesiastes, Song of Songs.\n\n'
              '**Prophecy (17).** Major (5): Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel. '
              'Minor (12): Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, '
              'Zephaniah, Haggai, Zechariah, Malachi.'),
        'summary': ('History (Pentateuch 5 + Historical Books 12), Poetry (5: Job–Song of '
                    'Songs), and Prophecy (Major 5 + Minor 12).'),
        'refs': [],
    }]},
    'bc-007-poetry-5': 'drop',
    'bc-008-prophesy': 'drop',
    'bc-009-give-a-general-outline-of-old-test': {
        'a': OT_HISTORY_TABLE,
        'summary': ('Patriarchs (c. 2100) → Exodus (1446) → Conquest (1406) → Judges (c. 1375) '
                    '→ United Kingdom (1050) → Divided Kingdom (c. 930) → Exile (722 Israel / '
                    '586 Judah) → Return (538) → Intertestamental (400 B.C.) → Christ and the '
                    'early church.'),
    },
    'bc-010-give-a-general-outline-of-old-test': {
        'a': COVENANT_TABLE,
        'summary': ('The covenant of works (Adamic: life for obedience, Gen 3), then the '
                    'covenant of grace administered through the Noahic (rainbow, Gen 9), '
                    'Abrahamic (seed, land, blessing — circumcision, Gen 12/15/17), Mosaic '
                    '(law, Passover/Sabbath, Exod 19-24), Davidic (dynasty, 2 Sam 7), and New '
                    '(Jer 31; Luke 22) covenants.'),
    },
    'bc-064-what-are-the-distinctive-features': {
        'a': GOSPELS_DISTINCTIVES,
        'summary': ('Matthew: fulfillment formulae, discipleship and the church, conflict with '
                    '"their synagogues." Mark: the suffering servant, failing disciples, the '
                    'gospel about Jesus. Luke: Jesus\' humanity, outcasts, women, the poor, '
                    'prayer. John: realized eschatology, miracles as signs, "I AM" statements, '
                    'the believer\'s security.'),
    },
    # Three prompts glued into one card → outline, parables, miracles.
    'bc-066-outline-the-life-of-christ': {'split': [
        {'at': None, 'a': LIFE_OF_CHRIST_OUTLINE,
         'summary': ('Preparation (born Bethlehem 6-4 B.C.) → three-year ministry from '
                     'A.D. 26 (year one obscurity, year two popularity, year three '
                     'opposition) → Passion week in Jerusalem, A.D. 30: triumphal entry, '
                     'Last Supper, cross, resurrection.')},
        {'at': "a. Name, locate and briefly discuss three of Jesus' parables.",
         'id': 'bc-066b-three-parables',
         'q': "Name, locate, and briefly discuss three of Jesus' parables.",
         'summary': ('The Sower (Mat 13:3-23): four soils, four responses to the kingdom '
                     'message. The Weeds (Mat 13:24-30): kingdom and evil grow together '
                     'until the judgment. The Lost Sheep (Luke 15:1-7): God\'s gracious '
                     'love for lost sinners, which we are to emulate.')},
        {'at': "b. Name, locate and briefly discuss three of Jesus' miracles.",
         'id': 'bc-066c-three-miracles',
         'q': "Name, locate, and briefly discuss three of Jesus' miracles.",
         'summary': ('Healing the paralytic (Mat 9:1-8): authority to forgive sins. The '
                     'blind man at Bethsaida (Mark 8:22-26): a two-stage healing '
                     'foreshadowing the disciples\' two-stage sight. The man born blind '
                     '(John 9): physical sight given, the Pharisees\' spiritual blindness '
                     'exposed.')},
    ]},
    'bc-068-relate-the-writing-of-the-pauline': {
        'a': PAUL_TABLE,
        'summary': ('Conversion (33) → 1st journey 46-48 (Galatians) → 2nd journey 49-52 '
                    '(1 & 2 Thessalonians) → 3rd journey 53-57 (1 & 2 Corinthians, Romans) → '
                    'first imprisonment 57-62 (the Prison Epistles) → 4th journey & second '
                    'imprisonment 62-68 (the Pastorals).'),
    },
    # Two memory verses orphaned from their parent law-and-grace question.
    'bc-069-romans-6-14': {'replace': [{
        'id': 'bc-069-law-and-grace',
        'q': 'Locate and discuss at least two passages which deal with law and grace.',
        'a': ('Romans 6:14: "For sin shall not be your master, because you are not under law, '
              'but under grace."\n\n'
              '- The condemnation of the law is no longer applicable for those in Christ.\n\n'
              'Galatians 5:4: "You who are trying to be justified by law have been alienated '
              'from Christ; you have fallen away from grace."\n\n'
              '- Since we received Christ by faith and not by the works of the Law, and thus '
              'are justified by grace through faith, we should not then try to turn back to '
              'the Law but should pursue the righteousness which comes from faith.'),
        'summary': ('Romans 6:14 (not under law but under grace — the law\'s condemnation no '
                    'longer applies to those in Christ) and Galatians 5:4 (seeking '
                    'justification by law means falling away from grace).'),
        'refs': ['Romans 6:14', 'Galatians 5:4'],
    }]},
    'bc-070-galatians-5-4': 'drop',
    # Two items whose parenthetical wrapped onto the next source line: the
    # tail leaked into the answer and the front was cut mid-phrase.
    'bc-050-jacob-s-dream-of-the-ladder-to-hea': {
        'q': ("Locate by book and chapter (and date where appropriate): Jacob's dream of "
              "the ladder to heaven (God affirming his Abrahamic promise)."),
        'a': 'Genesis 28',
    },
    'bc-123-bereans-noble-received-the-word-wi': {
        'q': ('Give book and chapter for: Bereans (noble — received the Word with '
              'eagerness, examining Scripture).'),
        'a': 'Acts 17:11',
    },
    'bc-158-biblical-discipline': {
        'summary': ('Procedure: Matthew 18:15-17 (one-on-one, then witnesses, then the '
                    'church). Excommunication: 1 Corinthians 5:1-13 ("expel the wicked '
                    'man"). Restoration: 2 Corinthians 2:5-11 (forgive and comfort him).'),
    },
    # The extraction ran the next document section — including the source
    # author's PERSONAL stated exceptions to the Standards — into this card.
    'bc-175-significance-of-the-death-of-chris': {
        'strip_after': 'Study Questions on Theology',
        'summary': ('Mark 10:45 (a ransom for many); Romans 3:21-26 (justifies us and '
                    'demonstrates God\'s justice); Galatians 3:13 (redeemed from the law\'s '
                    'curse); Colossians 1:19-20 (reconciles all things); Colossians 2:13-15 '
                    '(cancels the written code, disarms the powers); Hebrews 9:11-14 '
                    '(eternal redemption, cleansed consciences).'),
    },
}


def main():
    raw = open(SRC, encoding='utf-8', errors='ignore').read().split('\n')
    # region: from "1 Whole Bible" / first content to the Theology intro.
    start = 0
    for i, ln in enumerate(raw):
        if re.match(r'^\s+1\s+Whole Bible', ln):
            start = i; break
    end = len(raw)
    for i in range(start, len(raw)):
        if re.match(r'^\s{2,4}A\.\s+The Bible', raw[i]) or re.match(r'^\s+1\s+Introduction', raw[i]):
            end = i; break
    region = raw[start:end]

    sets = {}
    order = []
    n = 0
    seen = set()
    deck = 'bc-whole'

    def ensure(d):
        if d[0] not in sets:
            sets[d[0]] = {"label": d[1], "subject": "bible_content", "order": d[2], "cards": []}
            order.append(d[0])
        return d[0]

    def add(d, q, a, slug_src=None):
        nonlocal n
        q, a = clean(q), a.strip()
        if not q or not a:
            return
        n += 1
        # ids slug from the item name (not the templated front) so they stay
        # short and stable across front-of-card wording changes.
        slug = re.sub(r'[^a-z0-9]+', '-', clean(slug_src or q).lower()).strip('-')[:34].rstrip('-')
        cid = f'bc-{n:03d}-{slug}' if slug else f'bc-{n:03d}'
        while cid in seen: cid += 'x'
        seen.add(cid)
        sets[d]['cards'].append({"id": cid, "q": q, "a": a, "refs": extract_refs(q + ' ' + a)})

    def is_marker(ln):
        return bool(QUESTION_RE.match(ln) or SUBSEC_RE.match(ln) or LETTER_RE.match(ln))

    i = 0
    while i < len(region):
        line = region[i]
        if not line.strip():
            i += 1; continue
        msub = SUBSEC_RE.match(line)
        if msub:
            deck = ensure(deck_for(msub.group(2)))
            i += 1; continue
        mq = QUESTION_RE.match(line)
        if mq:
            ensure(('bc-whole', 'Whole Bible', 1)) if deck not in sets else None
            # gather wrapped question text
            q = mq.group(2); i += 1
            while i < len(region) and region[i].strip() and not is_marker(region[i]) \
                    and not NUM_SUB_RE.match(region[i]) and not BULLET_SRC_RE.match(region[i]):
                q += ' ' + region[i].strip(); i += 1
            q = clean(q)
            if is_list_prompt(q):
                # Items may be lettered (a. Adam) or numbered (01. Birth of
                # Jesus); detect which by the first marker, then make each item
                # its own card. The other marker type stays as item body.
                item_kind = None
                j = i
                while j < len(region):
                    if SUBSEC_RE.match(region[j]) or QUESTION_RE.match(region[j]):
                        break
                    if LETTER_RE.match(region[j]): item_kind = 'letter'; break
                    if NUM_SUB_RE.match(region[j]): item_kind = 'num'; break
                    j += 1
                if not item_kind:
                    continue
                item_re = LETTER_RE if item_kind == 'letter' else NUM_SUB_RE
                tmpl = q_template(q)
                while i < len(region):
                    if SUBSEC_RE.match(region[i]) or QUESTION_RE.match(region[i]):
                        break
                    m = item_re.match(region[i])
                    if not m:
                        i += 1; continue
                    item_head = m.group(2); i += 1
                    # Passage items often run the verse text into the head
                    # ("Psalm 19:1-4a: For the director of music. … The") —
                    # split at the colon so the question is the reference and
                    # the verse text opens the answer.
                    mref = re.match(r'^((?:[123]\s)?[A-Z][A-Za-z]+\.?\s[\d:.,;\-–ab\s]+?)\s*:\s+(\S.*)$', item_head)
                    head_tail = None
                    if mref and re.search(r'\d', mref.group(1)):
                        item_head = mref.group(1)
                        head_tail = mref.group(2)
                    body_lines = []
                    while i < len(region):
                        if item_re.match(region[i]) or QUESTION_RE.match(region[i]) or SUBSEC_RE.match(region[i]):
                            break
                        body_lines.append(region[i]); i += 1
                    if head_tail:
                        body_lines.insert(0, ' ' * 12 + head_tail)
                    a = render_item_body(body_lines)
                    if not a and re.search(r'\s[-—:]\s', item_head):
                        parts = re.split(r'\s[-—:]\s', item_head, 1)
                        add(deck, templated_q(tmpl, parts[0]), parts[1], slug_src=parts[0]); continue
                    add(deck, templated_q(tmpl, item_head), a or '(see Scripture references)', slug_src=item_head)
                continue
            else:
                # prose Q&A: answer = following lettered/num/prose until next Q/subsec
                ans, i = collect_answer(region, i)
                add(deck, q, ans)
                continue
        i += 1

    leftover = dict(CURATE)
    for k in order:
        keys = {c['id'] for c in sets[k]['cards']}
        ops = {cid: op for cid, op in leftover.items() if cid in keys}
        for cid in ops: del leftover[cid]
        sets[k]['cards'] = apply_curation(sets[k]['cards'], ops, refs_fn=lambda t: extract_refs(t))
    if leftover:
        raise SystemExit(f'curation keys no longer match any card: {sorted(leftover)}')

    order2 = [k for k in order if sets[k]['cards']]
    sets = {k: sets[k] for k in order2}

    header = ("// PCA Ordination & Licensure Study — Bible Content\n"
              "// Generated by dev/build_bible_content.py from doc_2 §I. Do not hand-edit.\n")
    js = header + "\n(function (global) {\n"
    js += "  const SETS = " + json.dumps(sets, ensure_ascii=False, indent=2) + ";\n\n"
    SUBJECT = {"id": "bible_content", "label": "Bible Content",
               "blurb": "Whole-Bible facts and OT/NT key people, passages, events, and topics.",
               "order": 1, "setKeys": order2}
    js += "  const SUBJECT = " + json.dumps(SUBJECT, ensure_ascii=False) + ";\n\n"
    js += ("  const data = (global.PCA_DATA = global.PCA_DATA || { subjects: [], sets: {} });\n"
           "  Object.assign(data.sets, SETS);\n"
           "  if (!data.subjects.some(s => s.id === SUBJECT.id)) data.subjects.push(SUBJECT);\n"
           "})(typeof window !== 'undefined' ? window : globalThis);\n")
    open(OUT, 'w', encoding='utf-8').write(js)
    total = sum(len(s['cards']) for s in sets.values())
    print(f"wrote {OUT}: {total} cards in {len(sets)} sub-decks")
    for k in order2:
        print(f"  {k}: {len(sets[k]['cards'])} cards — {sets[k]['label']}")

def consume_bullets(lines, i, stops):
    """Consume a run of bullet lines (+ wrapped continuations) starting at i;
    return (markdown_block, next_i). Bullets indented deeper than the run's
    shallowest marker become nested items."""
    items = []  # (indent, text)
    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            break
        m = BULLET_SRC_RE.match(ln)
        if not m:
            break
        indent = len(ln) - len(ln.lstrip())
        text = m.group(2)
        i += 1
        while i < len(lines) and lines[i].strip() and not BULLET_SRC_RE.match(lines[i]) \
                and not any(s(lines[i]) for s in stops):
            cont = lines[i].strip()
            # Reference range wrapped after its hyphen ("(9:24-\n27)") closes
            # up; anything else joins with a space — this doc's "Place- note"
            # dashes must not swallow the following word.
            if text.endswith('-') and cont[:1].isdigit():
                text += cont
            else:
                text += ' ' + cont
            i += 1
        items.append((indent, clean(text)))
    if not items:
        return '', i
    base = min(ind for ind, _ in items)
    md = [('  - ' if ind > base else '- ') + t for ind, t in items if t]
    return '\n'.join(md), i


def render_item_body(lines):
    """Render a list-item's nested body (01. OT / 02. NT / i. discussion / prose)
    into Markdown: OT/NT labels become bold leads, discussion becomes paragraphs."""
    out = []
    stops = [NUM_SUB_RE.match, ROMAN_RE.match]
    i = 0
    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            i += 1; continue
        mn = NUM_SUB_RE.match(ln)
        mr = ROMAN_RE.match(ln)
        if mn:
            label = clean(mn.group(2))
            # Gather the label's following lines. `text` is the old inline form
            # (roman markers dropped); `romans`/`lead` split the same lines into
            # roman sub-items vs. the non-roman remainder for the list form.
            i += 1
            text = ''
            lead = ''
            romans = []
            while i < len(lines) and lines[i].strip() and not NUM_SUB_RE.match(lines[i]) \
                    and not BULLET_SRC_RE.match(lines[i]):
                mr2 = ROMAN_RE.match(lines[i])
                seg = mr2.group(2) if mr2 else lines[i].strip()
                text += (' ' if text else '') + seg.strip()
                if mr2:
                    romans.append(clean(mr2.group(2)))
                elif romans:
                    romans[-1] = clean(romans[-1] + ' ' + lines[i].strip())
                else:
                    lead += (' ' if lead else '') + lines[i].strip()
                i += 1
            # Two or more roman sub-items are a real enumeration ("name them") and
            # render as a Markdown bullet list instead of being run together
            # ("Simon Peter Andrew James …"); a lone roman item is just the
            # label's discussion prose, so keep it inline as before.
            listed = len(romans) >= 2
            body = clean(lead) if listed else clean(text)
            if len(label) <= 6:
                # short label ("OT", "NT") → bold lead before the body text
                out.append((f'**{label}.** ' + body).strip())
            else:
                # full-prose first line — keep it (it is the start of the
                # answer, e.g. "A prophetess who was the only female judge…")
                out.append(clean(label + (' ' + body if body else '')))
            if listed:
                out.append('\n'.join(f'- {r}' for r in romans))
        elif mr:
            out.append(clean(mr.group(2))); i += 1
        elif BULLET_SRC_RE.match(ln):
            block, i = consume_bullets(lines, i, stops)
            if block:
                out.append(block)
        else:
            text, i = '', i
            buf = ''
            while i < len(lines) and lines[i].strip() and not NUM_SUB_RE.match(lines[i]) \
                    and not ROMAN_RE.match(lines[i]) and not BULLET_SRC_RE.match(lines[i]):
                buf += (' ' if buf else '') + lines[i].strip(); i += 1
            out.append(clean(buf))
    return re.sub(r'\n{3,}', '\n\n', '\n\n'.join(x for x in out if x)).strip()

def collect_answer(region, i):
    """Collect a prose question's answer (lettered/num/prose) until next
    question or sub-section header."""
    out = []
    stops = [LETTER_RE.match, NUM_SUB_RE.match, QUESTION_RE.match, SUBSEC_RE.match]

    def boundary(ln):
        return any(s(ln) for s in stops) or BULLET_SRC_RE.match(ln)

    while i < len(region):
        ln = region[i]
        if QUESTION_RE.match(ln) or SUBSEC_RE.match(ln):
            break
        if not ln.strip():
            i += 1; continue
        ml = LETTER_RE.match(ln)
        mn = NUM_SUB_RE.match(ln)
        if ml:
            text = ml.group(2); i += 1
            while i < len(region) and region[i].strip() and not boundary(region[i]):
                text += ' ' + region[i].strip(); i += 1
            out.append(f'{ml.group(1)}. {clean(text)}')
        elif mn:
            first = mn.group(2); i += 1
            lead = ''; romans = []
            while i < len(region) and region[i].strip() and not boundary(region[i]):
                mr = ROMAN_RE.match(region[i])
                if mr:
                    romans.append(clean(mr.group(2)))
                elif romans:
                    romans[-1] = clean(romans[-1] + ' ' + region[i].strip())
                else:
                    lead += (' ' if lead else '') + region[i].strip()
                i += 1
            head = f'{first} {lead}'.strip() if lead else first
            # Two or more roman sub-items become a bullet list rather than being
            # run into the prose ("who i. Did good works ii. Was crucified …").
            if len(romans) >= 2:
                out.append(f'{int(mn.group(1))}. {clean(head)}')
                out.append('\n'.join(f'- {r}' for r in romans))
            elif romans:
                out.append(f'{int(mn.group(1))}. {clean(head + " — " + romans[0])}')
            else:
                out.append(f'{int(mn.group(1))}. {clean(head)}')
        elif BULLET_SRC_RE.match(ln):
            block, i = consume_bullets(region, i, stops)
            if block:
                out.append(block)
        else:
            text = ln.strip(); i += 1
            while i < len(region) and region[i].strip() and not boundary(region[i]):
                text += ' ' + region[i].strip(); i += 1
            out.append(clean(text))
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(out)).strip(), i

if __name__ == '__main__':
    main()
