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
            while i < len(region) and not TOPIC_RE.match(region[i]) and not REFBLK_RE.match(region[i]):
                body.append(region[i]); i += 1
            add(topics, q, body)
        elif mb:
            q = mb.group(2); i += 1
            body = []
            while i < len(region) and not REFBLK_RE.match(region[i]):
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
