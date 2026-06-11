"""Shared post-extraction curation engine for the subject builders.

The PDF extraction stays verbatim in each builder; this layer applies what
only an editor can decide, keyed by generated card id. The build fails loudly
if a key stops matching, so curation can never silently rot.

Ops per card id:
  'drop'                       — remove the card (its content lives elsewhere).
  {'q':, 'a':, 'summary':}     — replace those fields.
  {'strip_after': marker}      — truncate the answer at the first line
                                 containing the marker.
  {'replace': [card, ...]}     — swap the card for the given literal cards.
  {'split': [part, ...]}       — split the answer into several cards at
                                 marker lines. Each part: {'at': line-text
                                 (None = from the top), 'id', 'q', 'summary',
                                 'a' (optional body override), 'refs'
                                 (optional)}. The 'at' line itself is dropped,
                                 but any text after ' — ' on it is kept as the
                                 part's first body line (the source often runs
                                 an answer into its sub-question line).
"""


def _find_line(lines, marker):
    # Prefix match: the source often runs an answer into its sub-question
    # line ("o. What happened…? — \"The resurrection…\""), so the marker is
    # the question part only.
    for i, l in enumerate(lines):
        if l.strip() == marker or l.strip().startswith(marker):
            return i
    raise SystemExit(f'curation: split marker not found: {marker!r}')


def _split(card, parts, refs_fn=None):
    lines = card['a'].split('\n')
    bounds = []
    for p in parts:
        bounds.append(0 if p.get('at') is None else _find_line(lines, p['at']))
    bounds.append(len(lines))
    out = []
    for pi, p in enumerate(parts):
        seg = lines[bounds[pi]:bounds[pi + 1]]
        if p.get('at') is not None and seg:
            head = seg[0].strip()
            seg = seg[1:]
            tail = head[len(p['at']):].lstrip(' —').strip()
            if tail:  # answer text glued onto the sub-question line
                seg.insert(0, tail)
        nc = dict(card)
        nc.pop('summary', None)
        nc['a'] = p['a'] if 'a' in p else '\n'.join(seg).strip()
        nc['id'] = p.get('id', card['id'])
        nc['q'] = p.get('q', card['q'])
        if 'refs' in p:
            nc['refs'] = p['refs']
        elif refs_fn:
            # Don't let every part inherit the whole parent's chips —
            # recompute from this part's own text.
            nc['refs'] = refs_fn(nc['q'] + ' ' + nc['a'])
        if 'summary' in p:
            nc['summary'] = p['summary']
        out.append(nc)
    return out


def apply_curation(cards, curate, refs_fn=None):
    """Return a new card list with the curation ops applied; consume-check keys."""
    out = []
    used = set()
    for c in cards:
        op = curate.get(c['id'])
        if op is None:
            out.append(c)
            continue
        used.add(c['id'])
        if op == 'drop':
            continue
        if 'replace' in op:
            out.extend(op['replace'])
            continue
        if 'split' in op:
            out.extend(_split(c, op['split'], refs_fn))
            continue
        if 'strip_after' in op:
            pos = c['a'].find(op['strip_after'])
            if pos < 0:
                raise SystemExit(f"curation: strip_after marker not found in {c['id']}")
            c['a'] = c['a'][:pos].rstrip()
        for k in ('q', 'a', 'summary'):
            if k in op:
                c[k] = op[k]
        out.append(c)
    missing = set(curate) - used
    if missing:
        raise SystemExit(f'curation keys no longer match any card: {sorted(missing)}')
    return out
