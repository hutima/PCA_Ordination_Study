#!/usr/bin/env python3
"""Build js/data/subjects/bco.js from the extracted BCO Q&A source.

Reproducible content pipeline for the Book of Church Order subject. Parses the
74 numbered questions, normalizes answer formatting for the Markdown renderer
(bullets, inline lettered sub-lists), cleans conversion artifacts, and extracts
standards references. Run: python3 dev/build_bco.py
"""
import re, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source_materials/extracted/bco_qa.txt')
OUT = os.path.join(ROOT, 'js/data/subjects/bco.js')

STARTERS = (r'(List|Name|Define|Explain|Distinguish|Describe|Summarize|Briefly|'
            r'How|What|Who|Where|When|Why|In |With |Can |Does |Do |Is |Of |Would|Identify|Trace)')
QNUM_RE = re.compile(r'^\s*(\d+|[IVXLC]+)\.\s+(.*)$')

def looks_like_q(text):
    return ('?' in text) or re.match(STARTERS, text.strip())

def clean_text(t):
    t = t.replace('&amp;', '&')
    t = re.sub(r'[ \t]+', ' ', t)
    # leading conversion debris like ".’..." before the real answer text
    t = re.sub(r"^[.'’`´… ]+(?=[A-Za-z(])", '', t.strip())
    return t.strip()

def split_inline_sublists(line):
    """Break an inline 'a. … b. … c. …' run onto separate lines so the
    Markdown renderer lists them. Only fires when ≥2 consecutive letters
    (a,b,…) appear as ' x. ' markers, to avoid splitting stray abbreviations."""
    markers = re.findall(r'(?:^|\s)([a-e])\.\s', line)
    # require a run starting at 'a' with at least a and b
    if len(markers) >= 2 and markers[0] == 'a' and markers[1] == 'b':
        # insert a newline before each ' x. ' marker (keep first if at line start)
        line = re.sub(r'\s([a-e])\.\s', lambda m: '\n' + m.group(1) + '. ', line)
    return line

def normalize_answer(a):
    out = []
    for ln in a.split('\n'):
        s = ln.strip()
        if not s:
            out.append('')
            continue
        # bullets: • ▪ ◦ * or "- " → markdown "- "
        m = re.match(r'^([•▪◦]|\*)\s*(.*)$', s)
        if m:
            s = '- ' + m.group(2)
        # strip a stray standalone leading quote that opens an artifact run
        s = re.sub(r'^[“"]\s+', '“', s)
        out.append(s)
    txt = '\n'.join(out)
    # split inline lettered sub-lists line by line
    txt = '\n'.join(split_inline_sublists(l) for l in txt.split('\n'))
    # clean conversion debris (both straight and smart quotes):
    #   "process. .'-BCO 27-1" → "process. BCO 27-1" (the stray middle period
    #   + quote + hyphen is an artifact; the real period stays on the word).
    txt = re.sub(r"\s+\.\s*['’]\s*-\s*", " ", txt)   # " .'-" / " .’-" debris run
    txt = txt.replace("''", "'").replace("’’", "’")
    # drop a lone trailing hyphen left on a line (e.g. "judicial model-")
    txt = '\n'.join(re.sub(r'\s*-\s*$', '', l) for l in txt.split('\n'))
    txt = re.sub(r'\n{3,}', '\n\n', txt).strip()
    return txt

REF_PATTERNS = [
    r'BCO\s*\d+[-–]\d+[a-z]?(?:,?\s*\d+[-–]\d+[a-z]?)*',
    r'W(?:CF|LC|SC)\s*[\dIVXLC]+[.\d, \-–]*',
]
def extract_refs(a):
    refs = []
    for pat in REF_PATTERNS:
        for m in re.findall(pat, a):
            r = re.sub(r'\s+', ' ', m).strip().rstrip(',').rstrip('.')
            if r and r not in refs:
                refs.append(r)
    return refs

def subdeck(qn):
    if qn <= 20:  return ('bco-officers', 'Church, Power & Officers (Q1–20)', 1)
    if qn <= 45:  return ('bco-courts',   'Courts, Calling & Ordination (Q21–45)', 2)
    if qn <= 66:  return ('bco-discipline','Discipline & Judicial Process (Q46–66)', 3)
    return ('bco-worship', 'Worship & Sacraments (Q67–74)', 4)

def parse():
    lines = open(SRC, encoding='utf-8').read().split('\n')
    cards = []
    expected = 1
    cur_q = None; cur_a = []; cur_qnum = None
    def flush():
        if cur_q is not None:
            cards.append([cur_qnum, cur_q, '\n'.join(cur_a).strip()])
    for raw in lines:
        m = QNUM_RE.match(raw)
        boundary = False
        if m:
            tok = m.group(1)
            val = 1 if tok == 'I' else (int(tok) if tok.isdigit() else None)
            if val == expected and looks_like_q(m.group(2)):
                boundary = True
        if boundary:
            flush()
            cur_qnum = expected; cur_q = m.group(2); cur_a = []; expected += 1
        elif cur_q is not None:
            cur_a.append(raw)
    flush()
    return cards

def split_inline_answer(q, a):
    """Peel answer text that ran onto the question line — after the '?', a
    bullet run, or (when the answer is otherwise empty) a ':'. Parenthetical
    asides like '(BCO 15-1)' or '(summarize)' stay on the question."""
    head, tail = q, ''
    if '?' in q:
        i = q.index('?')
        head, tail = q[:i+1], q[i+1:].strip()
        pm = re.match(r'(\([^)]*\))\s*(.*)$', tail)
        if pm:
            head, tail = head + ' ' + pm.group(1), pm.group(2).strip()
    elif '•' in q:
        i = q.index('•')
        head, tail = q[:i].strip(), q[i:].strip()
    elif not a.strip() and ':' in q:
        i = q.index(':')
        head, tail = q[:i+1], q[i+1:].strip()
    if tail:
        # inline "• x • y" runs become one bullet line each
        tail = re.sub(r'\s*•\s*', '\n• ', tail).lstrip('\n')
        a = tail + ('\n' + a if a.strip() else '')
    return head, a

# Authored short summaries (the teaser shown before the "Full answer"
# expander) for cards whose derived teaser cannot end on a whole thought.
SUMMARIES = {
    'bco-049': ("Primarily their parents: God commits the spiritual nurture, instruction, "
                "and training of the church's children to parents, who answer to the church "
                "for it; it is a principal duty of the Church to promote true religion in "
                "the home (BCO 28-1)."),
    'bco-068': ("The glory of God (BCO 47-3): public worship aims at the building of "
                "Christ's Church by perfecting the saints and adding those being saved — "
                "training Christians to do all to God's glory every day of the week "
                "(1 Cor 10:31)."),
    # Enumeration questions: the teaser must name every part, not expound
    # the first one.
    'bco-002': ("God alone is Lord of the conscience; every body sets the qualifications "
                "for its members; Christ appointed the officers; godliness is founded on "
                "truth; teachers must be sound in the faith; each body elects its own "
                "officers; church power is ministerial and declarative, not legislative; "
                "discipline is moral and spiritual, not civil."),
    'bco-012': ("Communing members — all rights and privileges (voting, office, the "
                "Lord's table; BCO 6-2, 6-4); non-communing members — baptism, pastoral "
                "oversight, instruction, and government (6-1); associate members — all "
                "privileges except voting and holding office in that church (6-4)."),
    'bco-015': ("Watch over the flock in doctrine and morality; exercise government and "
                "discipline; take oversight of the local and the general church; visit "
                "(especially the sick), instruct, comfort, nourish, and guard the "
                "children; set a worthy example; love and pray with and for the people "
                "(BCO 8-3)."),
    'bco-019': ("An office of service, not rule: minister to those in need, the sick, "
                "the friendless, and any in distress; devise methods to collect the "
                "congregation's gifts; keep the church in proper physical repair "
                "(BCO 9-2)."),
    'bco-029': ("Christian experience and inward call; written or oral exams in Theology "
                "(the Westminster Standards), English Bible, and the Book of Church "
                "Order; oral examination before Presbytery on the same; a written sermon "
                "delivered before Presbytery (BCO 19-2)."),
    'bco-038': ("Christian experience (especially personal character); knowledge of "
                "doctrine, church government, and discipline in the PCA Constitution; "
                "the duties of the office to which he is nominated; willingness to "
                "assent to the ordination questions (BCO 24-1)."),
    'bco-050': ("Admonition (formal reproof); suspension from the sacraments (temporary, "
                "indefinite); suspension from office (definite or indefinite); "
                "deposition (degradation of an officer from office); excommunication "
                "(excision from the communion of the church)."),
}

def main():
    raw_cards = parse()
    assert [c[0] for c in raw_cards] == list(range(1, 75)), 'expected 74 sequential questions'
    sets = {}; order = []
    for qn, q, a in raw_cards:
        q, a = split_inline_answer(clean_text(q), clean_text(a))
        # Compound prompts: the source sometimes runs a second question onto
        # the answer's first line ("Who is the head of the church?" / "How
        # does he exercise his authority?"). Fold it into the front so the
        # card asks everything its answer answers.
        first, _, rest = a.partition('\n')
        if first.strip().endswith('?') and len(first.strip()) <= 90 and rest.strip():
            q = f'{q} {first.strip()}'
            a = rest.strip()
        sk, label, idx = subdeck(qn)
        if sk not in sets:
            sets[sk] = {"label": label, "subject": "bco", "order": idx, "cards": []}
            order.append(sk)
        card = {
            "id": f"bco-{qn:03d}",
            "q": q,
            "a": normalize_answer(a),
            "refs": extract_refs(a),
        }
        if card["id"] in SUMMARIES:
            card["summary"] = SUMMARIES.pop(card["id"])
        sets[sk]["cards"].append(card)

    if SUMMARIES:
        raise SystemExit(f'summary keys no longer match any card: {sorted(SUMMARIES)}')

    header = ("// PCA Ordination & Licensure Study — Book of Church Order (BCO)\n"
              "// Generated by dev/build_bco.py from source_materials/extracted/bco_qa.txt.\n"
              "// Card shape: { id, q (plain), a (Markdown), refs[] }. Do not hand-edit;\n"
              "// re-run the generator instead.\n")
    js = header + "\n(function (global) {\n"
    js += "  const SETS = " + json.dumps(sets, ensure_ascii=False, indent=2) + ";\n\n"
    js += ("  const SUBJECT = {\n"
           "    id: 'bco',\n"
           "    label: 'Book of Church Order',\n"
           "    blurb: 'Government, officers, courts, discipline, and worship (BCO).',\n"
           "    order: 5,\n"
           "    setKeys: " + json.dumps(order) + "\n"
           "  };\n\n"
           "  const data = (global.PCA_DATA = global.PCA_DATA || { subjects: [], sets: {} });\n"
           "  Object.assign(data.sets, SETS);\n"
           "  if (!data.subjects.some(s => s.id === SUBJECT.id)) data.subjects.push(SUBJECT);\n"
           "})(typeof window !== 'undefined' ? window : globalThis);\n")
    open(OUT, 'w', encoding='utf-8').write(js)
    total = sum(len(s['cards']) for s in sets.values())
    print(f"wrote {OUT}: {total} cards in {len(sets)} sub-decks")

if __name__ == '__main__':
    main()
