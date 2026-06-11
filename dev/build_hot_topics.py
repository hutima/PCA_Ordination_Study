#!/usr/bin/env python3
"""Build js/data/subjects/hot_topics.js from doc_2 §III (Hot Topics).

Captures the 12 numbered hot topics (Creation … Fencing the Lord's Table) plus
the B/C/D reference blocks (created each day, Ten Plagues, Kings of
Israel/Judah). Stops before the Westminster-Assembly appendix that follows.

Run: python3 dev/build_hot_topics.py
"""
import re, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source_materials/extracted/bible_content_theology.txt')
OUT = os.path.join(ROOT, 'js/data/subjects/hot_topics.js')

TOPIC_RE = re.compile(r'^\s{3,7}(\d+)\.\s+(.*)$')      # "1. Creation"
REFBLK_RE = re.compile(r'^\s{2,4}([B-Z])\.\s+(.*)$')   # "B. What were created…"
SUBNUM_RE = re.compile(r'^\s{4,}(\d+)\.\s+(.*)$')        # nested numbered
TABLE_RE = re.compile(r'^\s*\|')
FOOTNOTE_RE = re.compile(r'\[\d+\]')

def clean(t):
    return re.sub(r'\s+', ' ', FOOTNOTE_RE.sub('', t.replace('&amp;', '&'))).strip()

def render_body(lines):
    out, i = [], 0
    while i < len(lines):
        s = lines[i]
        if not s.strip():
            i += 1; continue
        if TABLE_RE.match(s):
            rows = []
            while i < len(lines) and TABLE_RE.match(lines[i]):
                rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')]); i += 1
            if rows:
                w = max(len(r) for r in rows)
                rows = [r + [''] * (w - len(r)) for r in rows]
                merged = []
                for r in rows:
                    if merged and not r[0].strip() and any(c.strip() for c in r[1:]):
                        for ci in range(1, w):
                            if r[ci].strip():
                                merged[-1][ci] = (merged[-1][ci] + ' ' + r[ci]).strip()
                    else:
                        merged.append(list(r))
                rows = merged
                out.append('| ' + ' | '.join(clean(c) for c in rows[0]) + ' |')
                out.append('|' + '|'.join(['---'] * w) + '|')
                for r in rows[1:]:
                    out.append('| ' + ' | '.join(clean(c) for c in r) + ' |')
                out.append('')
            continue
        mn = SUBNUM_RE.match(s)
        if mn:
            text = mn.group(2); i += 1
            while i < len(lines) and lines[i].strip() and not SUBNUM_RE.match(lines[i]) and not TABLE_RE.match(lines[i]):
                text += ' ' + lines[i].strip(); i += 1
            out.append(f'{int(mn.group(1))}. {clean(text)}')
            continue
        text = s.strip(); i += 1
        while i < len(lines) and lines[i].strip() and not SUBNUM_RE.match(lines[i]) and not TABLE_RE.match(lines[i]):
            text += ' ' + lines[i].strip(); i += 1
        out.append(clean(text))
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(out)).strip()

# ── Curation layer ────────────────────────────────────────────────────────
# The extraction above stays verbatim; this layer fixes what only an editor
# can: an authored `summary` for every long answer (the teaser shown before
# the "Full answer & quotations" expander — the derived one truncated with
# "…"), phone-friendly rewrites of tables the PDF flattened badly, and
# sub-card splits so table rows become their own recall targets.
# Keyed by generated card id; the build fails if a key stops matching.
#
# Per-card fields: q / a / summary replace the extracted values; `append`
# inserts extra cards right after; `replace` swaps the card for several.

CREATION_TABLE = """\
| Theory | Description | Understanding of Time | Treatment of "Day" | Major Problems |
|---|---|---|---|---|
| 24-hour day | Views Gen 1 as sequential and literal | Most support "young earth" | 24 hours | Reconciling with scientific data; integrating chapters 1 & 2 |
| Day-age | Views creation as taking place over six eras | Unlimited time available for each era | Day = age | Sequence does not suit scientific data; difficult to substantiate author's intention as day = age; often an excuse for evolution |
| Literary approach | Views seven-day sequence as a literary structure | Narrative has nothing to say about time | Oriented toward Sabbath theology | Exodus 20:11; difficult to preclude temporality on basis of literary structure |
| Prior Creation | Suggests existence of a previous created world prior to Gen 1 | Most scientific ages related to prior creation | 24 hours | No textual support; questions of continuity in scientific record; sun/moon |
| Two-phase | Two distinct phases of creation in chapters 1 & 2 with long period of time in between | Gap between 2:3 and 2:4 can accommodate any time requirements | Any view possible | People in chapter 1 are not Adam and Eve and must be viewed as not yet morally responsible |"""


def theory_card(suffix, name, summary, desc, time, day, problems):
    return {
        "id": f"ht-001{suffix}-{re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')}",
        "q": f"Creation theories — the {name} view",
        "a": (f"- **Description:** {desc}\n"
              f"- **Understanding of time:** {time}\n"
              f"- **Treatment of \"day\":** {day}\n"
              f"- **Major problems:** {problems}"),
        "summary": summary,
        "refs": [],
    }


CURATE = {
    'ht-001-creation': {
        'a': CREATION_TABLE,
        'summary': ("Five main theories: 24-hour day (sequential and literal), "
                    "Day-age (each day an era), Literary approach (a framework "
                    "oriented to Sabbath theology), Prior creation (a created "
                    "world before Gen 1), and Two-phase (chapters 1 & 2 as two "
                    "phases). Each view is drilled on its own card."),
        'append': [
            theory_card('a', '24-hour day',
                        ('Gen 1 read as sequential and literal: each "day" is 24 hours, '
                         'and most supporters hold a "young earth." Problems: reconciling '
                         'with scientific data, and integrating chapters 1 & 2.'),
                        'Views Gen 1 as sequential and literal',
                        'Most supporters hold a "young earth"', '24 hours',
                        'Reconciling with scientific data; integrating chapters 1 & 2'),
            theory_card('b', 'Day-age',
                        ('Creation takes place over six eras — "day" = age, so unlimited '
                         'time is available for each era. Problems: the sequence does not '
                         "suit scientific data, day = age is hard to substantiate as the "
                         'author\'s intention, and it is often an excuse for evolution.'),
                        'Views creation as taking place over six eras',
                        'Unlimited time available for each era', 'Day = age',
                        ("Sequence does not suit scientific data; difficult to substantiate "
                         "author's intention as day = age; often an excuse for evolution")),
            theory_card('c', 'Literary approach',
                        ('The seven-day sequence is a literary structure oriented toward '
                         'Sabbath theology; the narrative has nothing to say about time. '
                         'Problems: Exodus 20:11, and it is difficult to preclude '
                         'temporality on the basis of literary structure.'),
                        'Views the seven-day sequence as a literary structure',
                        'Narrative has nothing to say about time',
                        'Oriented toward Sabbath theology',
                        'Exodus 20:11; difficult to preclude temporality on basis of literary structure'),
            theory_card('d', 'Prior Creation',
                        ('A created world existed before Gen 1; most scientific ages relate '
                         'to that prior creation, leaving the Gen 1 days as 24 hours. '
                         'Problems: no textual support, questions of continuity in the '
                         'scientific record, and the sun/moon.'),
                        'Suggests existence of a previous created world prior to Gen 1',
                        'Most scientific ages related to prior creation', '24 hours',
                        'No textual support; questions of continuity in scientific record; sun/moon'),
            theory_card('e', 'Two-phase',
                        ('Two distinct phases of creation in chapters 1 & 2, with a long '
                         'period between — the gap between 2:3 and 2:4 can accommodate any '
                         'time requirement. Problem: the people of chapter 1 are not Adam '
                         'and Eve and must be viewed as not yet morally responsible.'),
                        ('Two distinct phases of creation in chapters 1 & 2 with a long '
                         'period of time in between'),
                        'Gap between 2:3 and 2:4 can accommodate any time requirements',
                        'Any view possible',
                        ('People in chapter 1 are not Adam and Eve and must be viewed as '
                         'not yet morally responsible')),
            {
                "id": "ht-001f-literary-framework-support",
                "q": "What supports the Literary Framework view of creation?",
                "a": ("1. Forming of the Earth, days 1-3 vs. Filling of the Earth, days 4-6 "
                      "(cf. the seven-days reference card)\n"
                      "2. The combined length of the narratives for days 1 and 2 equals that "
                      "of day 3, and that of days 4 and 5 equals that of day 6. Also, the "
                      "combined length of days 1-3 equals that of day 6. This is significant "
                      "for discerning the emphases of the narrative. The point is that day 3 "
                      "provides the climax for days 1-3 and day 6 provides the climax for "
                      "days 4-6 as well as the whole chapter."),
                "summary": ("Days 1–3 (forming) parallel days 4–6 (filling), and the "
                            "narrative lengths pair off — days 1+2 match day 3, days 4+5 "
                            "match day 6 — so day 3 and day 6 carry the climaxes. The "
                            "structure is literary, not a comment on time."),
                "refs": [],
            },
        ],
    },
    'ht-002-charismatic-gifts': {
        'summary': ("Every believer receives spiritual gifts for ministry and edification "
                    "(Rom 12; 1 Cor 12; Eph 4). The PCA holds that the office of apostle "
                    "has ceased, urges caution about tongues, miracles, and healing in "
                    "public worship, and the General Assembly urges forbearance among "
                    "differing views."),
    },
    'ht-003-regulative-principle': {
        'summary': ("True worship is only what God commands; anything not commanded is "
                    "false worship. WCF 21.1: God \"may not be worshiped according to the "
                    "imaginations and devices of men, or the suggestions of Satan… or any "
                    "other way not prescribed in the Holy Scripture.\""),
    },
    'ht-004-sabbath': {
        'summary': ("The Sabbath is a creation ordinance (Gen 2:1-3), moved to the Lord's "
                    "Day in the NT. Strict sabbatarianism keeps the seventh day; "
                    "semisabbatarianism transfers its demands to Sunday. The Westminster "
                    "view (WCF 21.8) requires rest even from recreations; the Continental "
                    "view (Heidelberg, Calvin) stresses worship, spiritual rest, and "
                    "relief of servants."),
    },
    'ht-005-role-of-women-in-the-church': {
        'summary': ("Men and women are equal in worth and dignity (Gen 1:27), and women "
                    "have vital ministries of prophecy, teaching, service, missions, and "
                    "labor in the Lord — but Scripture restricts the office of elder to "
                    "men (1 Tim 2:8-15; 1 Cor 14:33-36), grounded in the creation order."),
    },
    'ht-006-re-baptism': {
        'summary': ("There is one baptism (Eph 4:5): one baptized as an infant of "
                    "professing parents, or on a profession later judged false, ought not "
                    "be re-baptized. A previous baptism judged invalid (the PCA paper, "
                    "against Hodge, counts Roman Catholic baptism invalid) may be followed "
                    "by Christian baptism — which is then not a re-baptism."),
    },
    'ht-007-theonomy': {
        'summary': ("The \"Christian Reconstruction\" school (Rushdoony, Bahnsen, North) "
                    "holds that the OT judicial law and its penal sanctions still bind all "
                    "nations. Critique: it overstresses continuity between the covenants — "
                    "Israel was uniquely God's nation, and Paul turns a death-penalty text "
                    "into excommunication (1 Cor 5:13 quoting Deut 17:7)."),
    },
    'ht-008-civil-disobedience': {
        'summary': ("We must obey the state's lawful commands, but when it commands sin we "
                    "must obey God by disobeying — as the Hebrew midwives did, and God "
                    "blessed them (Exod 1:15-20). Rom 13 presupposes authorities who "
                    "uphold the moral law."),
    },
    'ht-009-paedo-communion': {
        'summary': ("Advocates argue from the Passover parallel, but there is no evidence "
                    "infants took the Passover (Murray). Baptism signs initiation and "
                    "happens once; the Supper signs continuation, is repeated, and "
                    "requires conscious participation in its fellowship (1 Cor 10-11) — "
                    "so infants are not admitted."),
    },
    'ht-010-divorce-and-remarriage': {
        'summary': ("Divorce stems from hardness of heart and is contrary to God's "
                    "creational intent (Mat 19:8). Remarriage is allowed only after a "
                    "spouse's death or a biblically justified divorce (adultery, Mat 19:9; "
                    "desertion, 1 Cor 7:15), and not for the offending party."),
    },
    'ht-011-confessional-subscription': {
        'summary': ("How a candidate \"receives and adopts\" the Westminster standards "
                    "(BCO 21-5). Four views: substance of doctrine (not acceptable), "
                    "vital to the system (\"loose\"), very doctrines of the Word "
                    "(\"strict\"), very word of doctrine (ruled out). The live debate is "
                    "between the loose and strict views."),
    },
    'ht-012-fencing-the-lord-s-table': {
        'summary': ("Settled at GA in 1993: per BCO 58-4b the warning before the Supper "
                    "must require communicants to be enrolled members of an evangelical "
                    "church — a mere profession is not enough. The underlying question: "
                    "does profession of faith or church membership make one eligible? "
                    "(WCF XXV.3, XXIX.8; 1 Cor 11:27ff.)"),
    },
    'ht-013-what-were-created-on-the-seven-day': {
        'a': ("**Forming of the Earth (days 1–3)**\n\n"
              "1. Light, Darkness\n"
              "2. Waters Above & Below\n"
              "3. Land, Vegetation\n\n"
              "**Filling of the Earth (days 4–6)**\n\n"
              "4. Light Bearers: Sun, Moon, Stars\n"
              "5. Birds of the Air, Water Creatures\n"
              "6. Land Creatures, Humankind\n\n"
              "**Day 7:** God Rested"),
        'summary': ("Days 1–3 form (light & darkness; waters above & below; land & "
                    "vegetation); days 4–6 fill (sun, moon, stars; birds & water "
                    "creatures; land creatures & humankind); day 7 God rested."),
    },
    'ht-014-ten-plagues-exodus-7-12': {
        'summary': ("The ten plagues on Egypt: blood, frogs, gnats, flies, livestock, "
                    "boils, hail, locusts, darkness, firstborn — several sparing the "
                    "Israelites (Exodus 9:6, 9:25-26, 10:22-23)."),
    },
    # The PDF's two-kingdom synchronic table flattens into unreadable rows on
    # extraction (names and dates drift across columns). Recast as one list
    # per kingdom — also how you'd actually memorize it. Dates follow the
    # table's own (Thiele) chronology; Pekahiah 742-740 / Pekah 752-732 fixes
    # an obvious column slip in the extraction (dynasty 8 cannot end before
    # dynasty 7 does).
    'ht-015-kings-of-israel-judah': {
        'replace': [
            {
                "id": "ht-015a-kings-of-israel",
                "q": "Kings of Israel (931–722 B.C.)",
                "a": ("Nine dynasties, from the division of the kingdom to the fall of "
                      "Samaria:\n\n"
                      "1. **Jeroboam:** Jeroboam I (931–910), Nadab (910–909)\n"
                      "2. **Baasha:** Baasha (909–886), Elah (886–885)\n"
                      "3. **Zimri:** Zimri (885)\n"
                      "4. **Omri:** Omri (885–874), Ahab (874–853), Ahaziah (853–852), "
                      "Joram/Jehoram (852–841)\n"
                      "5. **Jehu:** Jehu (841–814), Jehoahaz (814–798), Jehoash/Joash "
                      "(798–782), Jeroboam II (793–753), Zechariah (753)\n"
                      "6. **Shallum:** Shallum (752)\n"
                      "7. **Menahem:** Menahem (752–742), Pekahiah (742–740)\n"
                      "8. **Pekah:** Pekah (752–732)\n"
                      "9. **Hoshea:** Hoshea (732–722) — Israel falls to Assyria (722)"),
                "summary": ("Nine dynasties in two centuries — Jeroboam I (931) through "
                            "the houses of Baasha, Zimri, Omri (Ahab), Jehu, Shallum, "
                            "Menahem, Pekah, and Hoshea, until Samaria falls to Assyria "
                            "in 722 B.C."),
                "refs": [],
            },
            {
                "id": "ht-015b-kings-of-judah",
                "q": "Kings of Judah (931–586 B.C.)",
                "a": ("The Davidic line, from the division of the kingdom to the fall of "
                      "Jerusalem (G = godly king; B = evil king):\n\n"
                      "1. Rehoboam, B (931–913)\n"
                      "2. Abijah (Abijam), B (913–911)\n"
                      "3. Asa (911–870)\n"
                      "4. Jehoshaphat (872–848)\n"
                      "5. Jehoram (Joram), B (853–841)\n"
                      "6. Ahaziah, B (841)\n"
                      "7. Queen Athaliah, B (841–835)\n"
                      "8. Joash (Jehoash) (835–796)\n"
                      "9. Amaziah (796–767)\n"
                      "10. Azariah (Uzziah) (790–740)\n"
                      "11. Jotham (750–732)\n"
                      "12. Ahaz, B (735–715)\n"
                      "13. Hezekiah, G (728–686)\n"
                      "14. Manasseh, B (697–642; cf. 2 Chr 33)\n"
                      "15. Amon, B (642–640)\n"
                      "16. Josiah, G (640–609)\n"
                      "17. Jehoahaz, B (609)\n"
                      "18. Jehoiakim, B (609–597)\n"
                      "19. Jehoiachin, B (597)\n"
                      "20. Zedekiah, B (597–586) — Jerusalem falls to Babylon (586)"),
                "summary": ("One Davidic dynasty, twenty rulers — Rehoboam (931) to "
                            "Zedekiah, with godly kings like Hezekiah and Josiah and evil "
                            "ones like Manasseh, until Jerusalem falls to Babylon in "
                            "586 B.C."),
                "refs": [],
            },
        ],
    },
}


def apply_curation(sets):
    used = set()
    for s in sets.values():
        out = []
        for c in s['cards']:
            cur = CURATE.get(c['id'])
            if cur:
                used.add(c['id'])
                if 'replace' in cur:
                    out.extend(cur['replace'])
                    continue
                for k in ('q', 'a', 'summary'):
                    if k in cur:
                        c[k] = cur[k]
            out.append(c)
            if cur and 'append' in cur:
                out.extend(cur['append'])
        s['cards'] = out
    missing = set(CURATE) - used
    if missing:
        raise SystemExit(f'curation keys no longer match any card: {sorted(missing)}')


def main():
    raw = open(SRC, encoding='utf-8', errors='ignore').read().split('\n')
    start = next(i for i, l in enumerate(raw) if l.startswith('III. Hot Topics'))
    # stop before the Westminster-Assembly appendix / synoptic-problem recap
    end = len(raw)
    for i in range(start + 5, len(raw)):
        if 'Historical Details concerning the Westminster' in raw[i] \
           or re.match(r'^\s{3,7}1\.\s+The synoptic problem', raw[i]):
            end = i; break
    region = raw[start:end]

    topics = {"id": "ht-topics", "label": "Hot Topics", "subject": "hot_topics", "order": 1, "cards": []}
    refs = {"id": "ht-reference", "label": "Reference Lists", "subject": "hot_topics", "order": 2, "cards": []}
    n = 0
    seen = set()

    def add(deck, q, body_lines):
        nonlocal n
        q = clean(q)
        a = render_body(body_lines)
        if not q or not a:
            return
        n += 1
        slug = re.sub(r'[^a-z0-9]+', '-', q.lower()).strip('-')[:34].rstrip('-')
        cid = f'ht-{n:03d}-{slug}' if slug else f'ht-{n:03d}'
        while cid in seen: cid += 'x'
        seen.add(cid)
        deck["cards"].append({"id": cid, "q": q, "a": a, "refs": []})

    i = 0
    # skip the A. intro
    while i < len(region) and not TOPIC_RE.match(region[i]):
        i += 1
    while i < len(region):
        mt = TOPIC_RE.match(region[i])
        mb = REFBLK_RE.match(region[i])
        if mt:
            q = mt.group(2); i += 1
            body = []
            # "Miscellaneous" is a stray section header between the last topic and
            # the reference blocks — stop here so it doesn't trail into the card.
            while i < len(region) and not TOPIC_RE.match(region[i]) \
                    and not REFBLK_RE.match(region[i]) and region[i].strip() != 'Miscellaneous':
                body.append(region[i]); i += 1
            add(topics, q, body)
        elif mb:
            q = mb.group(2); i += 1
            body = []
            # "Synoptic Problem" is a stray trailing header after the last
            # reference block — stop so it doesn't trail into the Kings card.
            while i < len(region) and not REFBLK_RE.match(region[i]) \
                    and region[i].strip() != 'Synoptic Problem':
                # ref blocks may contain their own "1." plague list — keep as body
                body.append(region[i]); i += 1
            add(refs, q, body)
        else:
            i += 1

    out_sets = {}
    order = []
    for d in (topics, refs):
        if d["cards"]:
            out_sets[d["id"]] = d
            order.append(d["id"])
    apply_curation(out_sets)

    header = ("// PCA Ordination & Licensure Study — Hot Topics\n"
              "// Generated by dev/build_hot_topics.py from doc_2 §III. Do not hand-edit.\n")
    js = header + "\n(function (global) {\n"
    js += "  const SETS = " + json.dumps(out_sets, ensure_ascii=False, indent=2) + ";\n\n"
    SUBJECT = {"id": "hot_topics", "label": "Hot Topics",
               "blurb": "Contemporary controversies: creation, gifts, the Sabbath, women, theonomy, and more.",
               "order": 6, "setKeys": order}
    js += "  const SUBJECT = " + json.dumps(SUBJECT, ensure_ascii=False) + ";\n\n"
    js += ("  const data = (global.PCA_DATA = global.PCA_DATA || { subjects: [], sets: {} });\n"
           "  Object.assign(data.sets, SETS);\n"
           "  if (!data.subjects.some(s => s.id === SUBJECT.id)) data.subjects.push(SUBJECT);\n"
           "})(typeof window !== 'undefined' ? window : globalThis);\n")
    open(OUT, 'w', encoding='utf-8').write(js)
    total = sum(len(s['cards']) for s in out_sets.values())
    print(f"wrote {OUT}: {total} cards in {len(out_sets)} sub-decks")
    for k in order:
        print(f"  {k}: {len(out_sets[k]['cards'])} cards — " + ', '.join(c['q'][:18] for c in out_sets[k]['cards']))

if __name__ == '__main__':
    main()
