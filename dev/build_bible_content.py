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
import re, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source_materials/extracted/bible_content_theology.txt')
OUT = os.path.join(ROOT, 'js/data/subjects/bible_content.js')

SUBSEC_RE = re.compile(r'^\s{4,16}(\d+)\s+((?:Old|New) Testament:.*|Whole Bible)\s*$')
QUESTION_RE = re.compile(r'^\s{3,7}([1-9]\d?)\.\s+(.*)$')   # not zero-padded
LETTER_RE = re.compile(r'^\s{6,9}([a-z])\.\s+(.*)$')
NUM_SUB_RE = re.compile(r'^\s{8,}(0\d|\d{2})\.\s+(.*)$')     # 0/2-padded (e.g. "01. OT")
ROMAN_RE = re.compile(r'^\s{10,}(i{1,3}|iv|v|vi{0,3}|ix|x)\.\s+(.*)$', re.I)
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
    return t

def is_list_prompt(q):
    ql = q.lower()
    return ('following' in ql) or bool(re.match(r'(discuss|locate|know|identify|name the)\b', ql))

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

    def add(d, q, a):
        nonlocal n
        q, a = clean(q), a.strip()
        if not q or not a:
            return
        n += 1
        slug = re.sub(r'[^a-z0-9]+', '-', q.lower()).strip('-')[:34].rstrip('-')
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
                    and not NUM_SUB_RE.match(region[i]):
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
                        add(deck, parts[0], parts[1]); continue
                    add(deck, item_head, a or '(see Scripture references)')
                continue
            else:
                # prose Q&A: answer = following lettered/num/prose until next Q/subsec
                ans, i = collect_answer(region, i)
                add(deck, q, ans)
                continue
        i += 1

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

def render_item_body(lines):
    """Render a list-item's nested body (01. OT / 02. NT / i. discussion / prose)
    into Markdown: OT/NT labels become bold leads, discussion becomes paragraphs."""
    out = []
    i = 0
    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            i += 1; continue
        mn = NUM_SUB_RE.match(ln)
        mr = ROMAN_RE.match(ln)
        if mn:
            label = clean(mn.group(2))
            # gather following roman/prose as the label's text
            i += 1
            text = ''
            while i < len(lines) and lines[i].strip() and not NUM_SUB_RE.match(lines[i]):
                mr2 = ROMAN_RE.match(lines[i])
                seg = mr2.group(2) if mr2 else lines[i].strip()
                text += (' ' if text else '') + seg.strip()
                i += 1
            if len(label) <= 6:
                # short label ("OT", "NT") → bold lead before the body text
                out.append((f'**{label}.** ' + clean(text)).strip())
            else:
                # full-prose first line — keep it (it is the start of the
                # answer, e.g. "A prophetess who was the only female judge…")
                out.append(clean(label + (' ' + text if text else '')))
        elif mr:
            out.append(clean(mr.group(2))); i += 1
        else:
            text, i = '', i
            buf = ''
            while i < len(lines) and lines[i].strip() and not NUM_SUB_RE.match(lines[i]) and not ROMAN_RE.match(lines[i]):
                buf += (' ' if buf else '') + lines[i].strip(); i += 1
            out.append(clean(buf))
    return re.sub(r'\n{3,}', '\n\n', '\n\n'.join(x for x in out if x)).strip()

def collect_answer(region, i):
    """Collect a prose question's answer (lettered/num/prose) until next
    question or sub-section header."""
    out = []
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
            while i < len(region) and region[i].strip() and not LETTER_RE.match(region[i]) \
                    and not NUM_SUB_RE.match(region[i]) and not QUESTION_RE.match(region[i]) and not SUBSEC_RE.match(region[i]):
                text += ' ' + region[i].strip(); i += 1
            out.append(f'{ml.group(1)}. {clean(text)}')
        elif mn:
            text = mn.group(2); i += 1
            while i < len(region) and region[i].strip() and not LETTER_RE.match(region[i]) \
                    and not NUM_SUB_RE.match(region[i]) and not QUESTION_RE.match(region[i]) and not SUBSEC_RE.match(region[i]):
                text += ' ' + region[i].strip(); i += 1
            out.append(f'{int(mn.group(1))}. {clean(text)}')
        else:
            text = ln.strip(); i += 1
            while i < len(region) and region[i].strip() and not LETTER_RE.match(region[i]) \
                    and not NUM_SUB_RE.match(region[i]) and not QUESTION_RE.match(region[i]) and not SUBSEC_RE.match(region[i]):
                text += ' ' + region[i].strip(); i += 1
            out.append(clean(text))
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(out)).strip(), i

if __name__ == '__main__':
    main()
