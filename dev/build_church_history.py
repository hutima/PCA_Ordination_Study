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
import re, json, os, html

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

# Authored short summaries (the teaser shown before the "Full answer"
# expander) for cards whose answer is a table — a teaser derived line-by-line
# from table markup is unreadable. Keyed by generated card id.
SUMMARIES = {
    'ch-025-compare-the-first-and-second-great-a':
        ("1st (c. 1735–43): Calvinist — Frelinghuysen, Tennent, Edwards, "
         "Whitefield; \"pure church\" model, end of the Half-Way Covenant. "
         "2nd (1795–1830): New Haven/Arminian — Taylor, Beecher, Finney; "
         "revivalism, camp meetings, the anxious bench, volunteer societies."),
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
        card = {"id": cid, "q": q, "a": a, "refs": extract_refs(q + ' ' + a)}
        if cid in SUMMARIES:
            card["summary"] = SUMMARIES[cid]
        sets[deck]['cards'].append(card)

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

    missing = set(SUMMARIES) - seen
    if missing:
        raise SystemExit(f'summary keys no longer match any card: {sorted(missing)}')

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
