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
import re, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source_materials/extracted/bible_content_theology.txt')
OUT = os.path.join(ROOT, 'js/data/subjects/theology.js')

SECTION_RE = re.compile(r'^\s{2,4}([A-J])\.\s+(.+?)\s*\((WCF|WLC|WSC).*\)?\s*$')
QUESTION_RE = re.compile(r'^\s{3,7}([1-9]\d?)\.\s+(.*)$')   # not zero-padded
LETTER_RE = re.compile(r'^\s{6,9}([a-z])\.\s+(.*)$')
NUM_SUB_RE = re.compile(r'^\s{8,}(0\d|\d{2})\.\s+(.*)$')     # zero/2-padded
REF_RE = re.compile(r'W(?:CF|LC|SC)\s*[\dIVXLC]+(?:[.:]\d+)?(?:[-–]\d+)?')
FOOTNOTE_RE = re.compile(r'\[\d+\]')

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
            text = ml.group(2)
            i += 1
            while i < len(region) and region[i].strip() and not LETTER_RE.match(region[i]) \
                    and not NUM_SUB_RE.match(region[i]) and not QUESTION_RE.match(region[i]) \
                    and not SECTION_RE.match(region[i]):
                text += ' ' + region[i].strip(); i += 1
            cur['items'].append(('letter', f'{ml.group(1)}. {clean(text)}'))
            continue
        if mn:
            text = mn.group(2)
            i += 1
            while i < len(region) and region[i].strip() and not LETTER_RE.match(region[i]) \
                    and not NUM_SUB_RE.match(region[i]) and not QUESTION_RE.match(region[i]) \
                    and not SECTION_RE.match(region[i]):
                text += ' ' + region[i].strip(); i += 1
            num = int(mn.group(1))
            cur['items'].append(('num', f'{num}. {clean(text)}'))
            continue
        # plain prose continuation
        text = line.strip()
        i += 1
        while i < len(region) and region[i].strip() and not LETTER_RE.match(region[i]) \
                and not NUM_SUB_RE.match(region[i]) and not QUESTION_RE.match(region[i]) \
                and not SECTION_RE.match(region[i]):
            text += ' ' + region[i].strip(); i += 1
        cur['items'].append(('prose', clean(text)))
    close()

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
