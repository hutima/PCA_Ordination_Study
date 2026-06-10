// Catalog + chapter-gated lookups for the step-by-step morphology drill.
//
// Sources have one of two shapes: chapter-keyed sets ("2", "3", …) and
// W*_* paradigm/supplemental sets. We unify them into a single "effective
// chapter" scale via CHAPTER_TO_WEEK (its inverse picks the first chapter
// of each week). The dropdown list and the focused-paradigm card pool are
// then both cumulative: every paradigm whose effective chapter is ≤ the
// user's max selected effective chapter is in scope — so picking Ch N
// unlocks all paradigms introduced in Ch 1..N regardless of whether the
// underlying source is chapter-keyed or week-keyed.

import { CHAPTER_TO_WEEK } from '../../data/setMeta.js';
import { parseAnswerDimensions, dimValuePassesFilter } from './morph_steps.js';

const DIM_VALUE_FILTER_KEYS = ['aspect', 'tense', 'voice', 'mood', 'person', 'number', 'case', 'gender'];

// Single-gender lemmas whose gender is non-obvious from the form pattern:
// 1st-decl. masculine nouns ending in -ης / -ας wear feminine 1st-decl.
// endings throughout the paradigm, so a student parsing προφήταις sees
// what looks like a 1st-decl. feminine dative plural and has to recall
// that the lemma προφήτης is masculine. For these the gender step is
// asked even though the lemma is single-gender — buildMorphSteps reads
// this set and opts out of its single-gender auto-skip when the card's
// lemma is listed here. The gender filter in cardPassesDimValueFilters
// still treats them as single-gender (so disabling 'masculine' as a
// distractor doesn't wipe the whole paradigm); only the auto-skip is
// affected.
export const MIXED_FORM_NOUN_LEMMAS = new Set([
  'προφήτης', 'μαθητής', 'βαπτιστής', 'νεανίας'
]);

// True iff every dim the card's parse populates passes the per-value
// filter for that dim. Dims the card's parse leaves blank are ignored
// (they don't constrain the filter). A null/empty filter map means
// "everything enabled" and trivially passes.
//
// `multiGenderLemmas` is the set of lemmas whose paradigm has cards in
// more than one gender (articles, adjectives, pronouns). Lemmas not in
// the set are single-gender (most nouns) and skip the gender filter —
// excluding e.g. masculine wouldn't make sense for a lemma like λόγος
// whose entire paradigm is masculine; the user would lose all of λόγος.
// Gender-as-filter only meaningfully prunes within a multi-gender
// paradigm where the student is identifying gender from form.
function cardPassesDimValueFilters(card, dimValueFilters, multiGenderLemmas) {
  if (!dimValueFilters || typeof dimValueFilters !== 'object') return true;
  const dims = parseAnswerDimensions(card.parsedAnswer || card.answer || '');
  const lemmaIsMultiGender = !!(multiGenderLemmas && card.lemma && multiGenderLemmas.has(card.lemma));
  for (const dim of DIM_VALUE_FILTER_KEYS) {
    const value = dims[dim];
    if (!value) continue;
    if (dim === 'gender' && !lemmaIsMultiGender) continue;
    if (!dimValuePassesFilter(dim, value, dimValueFilters)) return false;
  }
  return true;
}

// Builds the set of lemmas that appear in more than one gender across
// `cards`. Composite genders (e.g. "masculine/feminine/neuter") split
// into their components so a tri-gender adjective registers as
// multi-gender even if every individual card carries the composite.
export function buildMultiGenderLemmas(cards) {
  const lemmaGenders = new Map();
  cards.forEach((card) => {
    if (!card || !card.lemma) return;
    const dims = parseAnswerDimensions(card.parsedAnswer || card.answer || '');
    if (!dims.gender) return;
    if (!lemmaGenders.has(card.lemma)) lemmaGenders.set(card.lemma, new Set());
    const genders = lemmaGenders.get(card.lemma);
    String(dims.gender).split('/').forEach((g) => { if (g) genders.add(g); });
  });
  const result = new Set();
  lemmaGenders.forEach((genders, lemma) => {
    if (genders.size > 1) result.add(lemma);
  });
  return result;
}

// Categorical grouping for the focused-paradigm dropdown. Each lemma string
// (matched verbatim against the extractLemma output) maps to a category
// label; lemmas without a mapping fall into "Other constructions". Display
// overrides clean up a few labels (e.g. dropping the cosmetic "-paradigm"
// suffix on the πολύς/μέγας set).
const PARADIGM_CATEGORIES = {
  // ─── Article ───
  'ὁ, ἡ, τό':                            'Article',

  // ─── Nouns by declension/pattern ───
  'λόγος':                               'Nouns · 2nd-decl. masculine',
  'ἔργον':                               'Nouns · 2nd-decl. neuter',
  'ἀρχή':                                'Nouns · 1st-decl. feminine (η-pattern)',
  'φωνή':                                'Nouns · 1st-decl. feminine (η-pattern)',
  'ἡμέρα':                               'Nouns · 1st-decl. feminine (α-pattern)',
  'ἁμαρτία':                             'Nouns · 1st-decl. feminine (α-pattern)',
  'δόξα':                                'Nouns · 1st-decl. feminine (α-impure pattern)',
  'προφήτης':                            'Nouns · 1st-decl. masculine (-ης pattern)',
  'μαθητής':                             'Nouns · 1st-decl. masculine (-ης pattern)',
  'σάρξ':                                'Nouns · 3rd declension',
  'ὄνομα':                               'Nouns · 3rd declension',
  'πόλις':                               'Nouns · 3rd declension',
  'βασιλεύς':                            'Nouns · 3rd declension',
  'ἀστήρ':                               'Nouns · 3rd declension',

  // ─── Adjectives ───
  'πᾶς, πᾶσα, πᾶν':                      'Adjectives',
  'πολύς / μέγας-paradigm':              'Adjectives',
  'πλείων':                              'Adjectives',

  // ─── Pronouns ───
  'αὐτός, αὐτή, αὐτό':                   'Pronouns · personal / intensive',
  'First and second personal pronouns':  'Pronouns · personal / intensive',
  'οὗτος, αὕτη, τοῦτο':                  'Pronouns · demonstrative',
  'ἐκεῖνος, ἐκείνη, ἐκεῖνο':             'Pronouns · demonstrative',
  'ὅς, ἥ, ὅ':                            'Pronouns · relative',
  'τίς, τί':                             'Pronouns · interrogative / indefinite',

  // ─── Verbs (finite) ───
  'λύω':                                 'Verbs · standard ω-pattern',
  'φιλέω':                               'Verbs · contract (-έω)',
  'εἰμί':                                'Verbs · irregular (εἰμί)',
  'ῥύομαι':                              'Verbs · middle / deponent',
  'βάλλω':                               'Verbs · second aorist',
  'γίνομαι':                             'Verbs · second aorist',
  'λαμβάνω':                             'Verbs · second aorist',
  'λείπω':                               'Verbs · second aorist',
  'ἄγω':                                 'Verbs · second aorist',
  'ἔχω':                                 'Verbs · second aorist',
  'γινώσκω':                             'Verbs · second aorist',
  'ἔρχομαι':                             'Verbs · second aorist',
  'λέγω':                                'Verbs · second aorist',
  'ὁράω':                                'Verbs · second aorist',
  'Second-aorist stems':                 'Verbs · second aorist',
  'μένω':                                'Verbs · liquid future',
  'κρίνω':                               'Verbs · liquid future',
  'Liquid-stem futures':                 'Verbs · liquid future',
  'δίδωμι':                              'Verbs · μι-verbs',
  'δίδομαι':                             'Verbs · μι-verbs',
  'ἵστημι':                              'Verbs · μι-verbs',
  'τίθημι':                              'Verbs · μι-verbs',
  '-μι verbs':                           'Verbs · μι-verbs',

  // ─── Participles (case-marked verbals; their own group) ───
  'λύων, λύουσα, λῦον':                  'Participles',
  'λύσας, λύσασα, λῦσαν':                'Participles',
  'λυθείς, λυθεῖσα, λυθέν':              'Participles',
  'ῥυόμενος, -η, -ον':                   'Participles',
  'ῥυσάμενος, -η, -ον':                  'Participles'
};

const PARADIGM_DISPLAY_OVERRIDES = {
  'πολύς / μέγας-paradigm':             'πολύς, μέγας',
  'First and second personal pronouns': 'ἐγώ / σύ — personal pronouns',
  '-μι verbs':                          '-μι verbs (other active forms)',
  'Second-aorist stems':                'Second-aorist stem recall (what is the aorist of … ?)',
  'Liquid-stem futures':                'Liquid-future stem recall (what is the future / aorist of … ?)'
};

// Display order for the optgroup headings in the dropdown. Order reflects
// course progression (article → nouns → adjectives → pronouns → verbs →
// participles → other). Categories not in this list are appended at the end.
const CATEGORY_ORDER = [
  'Article',
  'Nouns · 2nd-decl. masculine',
  'Nouns · 2nd-decl. neuter',
  'Nouns · 1st-decl. feminine (η-pattern)',
  'Nouns · 1st-decl. feminine (α-pattern)',
  'Nouns · 1st-decl. feminine (α-impure pattern)',
  'Nouns · 1st-decl. masculine (-ης pattern)',
  'Nouns · 3rd declension',
  'Adjectives',
  'Pronouns · personal / intensive',
  'Pronouns · demonstrative',
  'Pronouns · relative',
  'Pronouns · interrogative / indefinite',
  'Verbs · standard ω-pattern',
  'Verbs · contract (-έω)',
  'Verbs · irregular (εἰμί)',
  'Verbs · middle / deponent',
  'Verbs · second aorist',
  'Verbs · liquid future',
  'Verbs · μι-verbs',
  'Participles',
  'Other constructions'
];

function categoryForLemma(lemma) {
  return PARADIGM_CATEGORIES[lemma] || 'Other constructions';
}

function displayLabelForLemma(lemma, item) {
  const override = PARADIGM_DISPLAY_OVERRIDES[lemma];
  if (override) return override;
  return lemma + (item && item.gloss ? ` — ${item.gloss}` : '');
}

// Inverse of CHAPTER_TO_WEEK keyed by week → first chapter where that
// week's material starts in the textbook. Used to give W*_* sources an
// effective chapter so they sort/gate alongside chapter-keyed sets.
const WEEK_FIRST_CHAPTER = (() => {
  const map = {};
  Object.keys(CHAPTER_TO_WEEK).forEach((chapStr) => {
    const ch = Number(chapStr);
    const wk = CHAPTER_TO_WEEK[chapStr];
    if (!map[wk] || ch < map[wk]) map[wk] = ch;
  });
  return map;
})();

function safeMorphSets() {
  const sets = (typeof window !== 'undefined' && window.MORPHOLOGY_SETS) || {};
  return sets;
}

function sourceLevel(sourceKey) {
  const str = String(sourceKey || '');
  if (/^\d+$/.test(str)) {
    const ch = Number(str);
    return { kind: 'chapter', week: CHAPTER_TO_WEEK[ch] || null, effectiveChapter: ch };
  }
  const weekMatch = str.match(/^W(\d+)_/);
  if (weekMatch) {
    const wk = Number(weekMatch[1]);
    const firstCh = WEEK_FIRST_CHAPTER[wk];
    return { kind: 'week', week: wk, effectiveChapter: firstCh || (wk * 2 - 1) };
  }
  // OPT_<chapter>[_<suffix>] — synthetic source key for optional paradigm
  // forms injected from LEMMA_INVENTORY.optionalFormGroups when the user
  // toggles "Optional paradigm extensions" on. The chapter component is
  // the group's own `chapter` field, so the standard sourcePassesLevel
  // gate naturally caps optional cards at the student's current scope.
  const optMatch = str.match(/^OPT_(\d+)/);
  if (optMatch) {
    const ch = Number(optMatch[1]);
    return { kind: 'optional', week: CHAPTER_TO_WEEK[ch] || null, effectiveChapter: ch };
  }
  return { kind: 'other', week: null, effectiveChapter: 0 };
}

// Single number that drives gating: the max "effective chapter" across all
// selected keys. If the user picks Ch 8 and W5_PAS, max is 12 (W5's first
// chapter), which is then the cap for everything else.
export function deriveSelectionLevels(selectedKeys) {
  let maxEffectiveChapter = -Infinity;
  (selectedKeys || []).forEach((k) => {
    const lvl = sourceLevel(k);
    if (lvl.effectiveChapter > maxEffectiveChapter) maxEffectiveChapter = lvl.effectiveChapter;
  });
  return {
    maxEffectiveChapter: maxEffectiveChapter === -Infinity ? null : maxEffectiveChapter
  };
}

function sourcePassesLevel(sourceKey, levels) {
  if (levels.maxEffectiveChapter == null) return false;
  const lvl = sourceLevel(sourceKey);
  if (lvl.kind === 'other') return false;
  return lvl.effectiveChapter <= levels.maxEffectiveChapter;
}

// Synthesizes morph-shaped cards from LEMMA_INVENTORY[lemma].optionalFormGroups
// for every group whose chapter gate is in scope at the student's current
// max effective chapter. Returns [] when the lemma has no optional groups,
// when no group is in scope, or when LEMMA_INVENTORY isn't loaded.
//
// Each synthesized card mirrors the shape buildMorphologyCardsForKeys
// produces (kind: 'morph', sourceKey, parsedAnswer, formToAnswer, …) so
// downstream consumers — the step builder, the form-lookup fallback, the
// per-form dedup in getCardsForFocusedParadigm, the stats tracker — treat
// them uniformly with Duff-curriculum cards. supplemental: true tags them
// as off-textbook (matters for any filter that splits curriculum vs
// extension content). choices/reverseChoices are left as the single-item
// arrays the form-lookup feedback uses; the parsing walk doesn't read
// these.
function buildOptionalMorphCardsForLemma(lemma, levels, filters) {
  if (!lemma || !levels || levels.maxEffectiveChapter == null) return [];
  const inv = (typeof window !== 'undefined' && window.LEMMA_INVENTORY)
    ? window.LEMMA_INVENTORY[lemma]
    : null;
  if (!inv || !Array.isArray(inv.optionalFormGroups)) return [];

  // Per-category filter: a card is dropped if any of its canonical-parse
  // tokens corresponds to a filter that's been turned off. Filters
  // default to "include" — only explicit `false` excludes. Empty/missing
  // filters object means no filtering.
  const filterCard = (parsedAnswer) => {
    if (!filters || typeof filters !== 'object') return true;
    const parse = String(parsedAnswer || '').toLowerCase();
    if (filters.imperative === false   && /\bimperative\b/.test(parse))    return false;
    if (filters.subjunctive === false  && /\bsubjunctive\b/.test(parse))   return false;
    if (filters.infinitive === false   && /\binfinitive\b/.test(parse))    return false;
    if (filters.participle === false   && /\bparticiple\b/.test(parse))    return false;
    if (filters.thirdPerson === false  && /\bthird person\b/.test(parse))  return false;
    if (filters.futureTense === false  && /\bfuture\b/.test(parse))        return false;
    if (filters.perfectTense === false && /\bperfect\b/.test(parse))       return false;
    return true;
  };

  const out = [];
  inv.optionalFormGroups.forEach((group, groupIdx) => {
    if (!group || !group.forms || typeof group.chapter !== 'number') return;
    if (group.chapter > levels.maxEffectiveChapter) return;
    const sourceKey = `OPT_${group.chapter}`;
    const sourceLabel = group.family || `${lemma} — optional (ch ${group.chapter})`;
    const entries = Object.entries(group.forms);
    entries.forEach(([form, parsedAnswer], formIdx) => {
      if (!form || !parsedAnswer) return;
      if (!filterCard(parsedAnswer)) return;
      out.push({
        id: `morph-OPT-${stableMorphKey(lemma)}-${group.chapter}-${groupIdx}-${formIdx}-${stableMorphKey(form)}`,
        kind: 'morph',
        required: true,
        sourceKey,
        sourceLabel,
        supplemental: true,
        chapter: group.chapter,
        family: group.family || `${lemma} — optional`,
        lemma,
        gloss: '',
        lemmaGloss: '',
        form,
        prompt: 'Parse this form.',
        dimensional: true,
        context: '',
        note: '',
        answer: parsedAnswer,
        parsedAnswer,
        choices: [parsedAnswer],
        reversible: false,
        reversePrompt: 'Choose the correct Greek form.',
        reverseChoices: [form],
        formToAnswer: { [form]: parsedAnswer }
      });
    });
  });
  return out;
}

// Loose slugifier reused by the synthetic card id. Mirrors the
// stableMorphKey defined inside morphology.js's IIFE so Greek and ASCII
// keys both produce stable, collision-free strings. Kept in sync by
// convention — if morphology.js's version evolves, update here too.
function stableMorphKey(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

// Cumulative list of paradigm lemmas available to the user given their
// selection. Walks every morph set in MORPHOLOGY_SETS and includes any whose
// effective chapter is ≤ the user's max selected effective chapter — so a
// user on Ch 8 sees every paradigm introduced from Ch 1 through Ch 8, not
// just the ones in their currently-checked sources.
export function listAvailableParadigms(selectedKeys) {
  const sets = safeMorphSets();
  const levels = deriveSelectionLevels(selectedKeys);
  if (levels.maxEffectiveChapter == null) return [];
  const seen = new Map();
  Object.keys(sets).forEach((key) => {
    if (!sourcePassesLevel(key, levels)) return;
    const set = sets[key];
    if (!set || !Array.isArray(set.items)) return;
    set.items.forEach((item) => {
      if (!item || !item.lemma) return;
      const lemma = item.lemma;
      if (!seen.has(lemma)) {
        const lvl = sourceLevel(key);
        seen.set(lemma, {
          lemma,
          displayLabel: displayLabelForLemma(lemma, item),
          category: categoryForLemma(lemma),
          sources: new Set(),
          firstChapter: lvl.effectiveChapter
        });
      } else {
        const lvl = sourceLevel(key);
        const entry = seen.get(lemma);
        if (lvl.effectiveChapter < entry.firstChapter) entry.firstChapter = lvl.effectiveChapter;
      }
      seen.get(lemma).sources.add(String(key));
    });
  });
  // Sort by first-introduced chapter (ascending), then alphabetically, so the
  // dropdown reads as a natural progression through the course.
  return [...seen.values()]
    .map((p) => ({ ...p, sources: [...p.sources] }))
    .sort((a, b) => (a.firstChapter - b.firstChapter) || a.lemma.localeCompare(b.lemma));
}

// Groups listAvailableParadigms output by category for optgroup rendering.
// Returns [{ category, lemmas: [...] }, ...] in CATEGORY_ORDER (with any
// unknown categories appended at the end alphabetically). Categories that
// have no available paradigms at the current selection are omitted.
export function listAvailableParadigmsByCategory(selectedKeys) {
  const flat = listAvailableParadigms(selectedKeys);
  const grouped = new Map();
  flat.forEach((p) => {
    if (!grouped.has(p.category)) grouped.set(p.category, []);
    grouped.get(p.category).push(p);
  });
  const orderedCats = [
    ...CATEGORY_ORDER.filter((c) => grouped.has(c)),
    ...[...grouped.keys()].filter((c) => !CATEGORY_ORDER.includes(c)).sort()
  ];
  return orderedCats.map((category) => ({
    category,
    lemmas: grouped.get(category)
  }));
}

// Normalizes a Greek form for dedup comparison: strips parenthesized
// optional letters ("ἐστι(ν)" → "ἐστιν"), keeps only the first variant
// before " / " or " or " ("εἰσίν / εἰσί" → "εἰσίν"), trims whitespace.
// Used so the same form appearing under multiple chapter-overlapping
// sources collapses to one card.
function normalizeFormForDedup(form) {
  if (!form) return '';
  let s = String(form);
  // Strip "(letter)" → "letter" so optional-letter variants compare equal.
  s = s.replace(/\(([^)]*)\)/g, '$1');
  // Keep just the first listed variant.
  s = s.split(/\s+(?:\/|or)\s+/u)[0];
  return s.trim();
}

// Given a focused lemma and the selection, return every morph card across
// all sources whose effective chapter is ≤ the user's max — filtered to the
// focused lemma so cross-chapter expansions of the same paradigm collapse
// into one deck.
//
// Deduplication: when overlapping sources cover the same form (e.g. εἰμί's
// present indicatives appear in both W1_EIMI_PRESENT and W3_EIMI_COMPLETE),
// we keep only the version from the LATER source. The reasoning: a later
// set that covers the same forms is the more authoritative / pedagogically
// complete one — the earlier set was an introductory preview that gets
// superseded once the fuller paradigm chapter rolls around.
export function getCardsForFocusedParadigm(selectedKeys, focusedLemma, options = {}) {
  if (!focusedLemma) return [];
  if (typeof window === 'undefined' || typeof window.buildMorphologyCardsForKeys !== 'function') return [];

  const sets = safeMorphSets();
  const levels = deriveSelectionLevels(selectedKeys);
  if (levels.maxEffectiveChapter == null) return [];
  const eligibleSourceKeys = Object.keys(sets).filter((key) => {
    if (!sourcePassesLevel(key, levels)) return false;
    const set = sets[key];
    if (!set || !Array.isArray(set.items)) return false;
    return set.items.some((item) => item && item.lemma === focusedLemma);
  });

  // Optional paradigm extensions: when the user has toggled them on in
  // settings, append synthetic cards for any LEMMA_INVENTORY group whose
  // chapter gate is in scope. Doing this BEFORE the per-form dedup means
  // an extension form that happens to collide with a Duff-curriculum form
  // (rare — extensions exist precisely because the curriculum doesn't
  // drill them) collapses to the richer-parse winner like any other
  // duplicate. When the toggle is off, no extension cards are added —
  // but the fallback form-lookup in render.js still consults
  // LEMMA_INVENTORY.extraForms, so wrong-pick feedback stays canonical.
  const optionalCards = options.includeOptional
    ? buildOptionalMorphCardsForLemma(focusedLemma, levels, options.optionalFilters)
    : [];

  if (!eligibleSourceKeys.length && !optionalCards.length) return [];
  const drilledCards = eligibleSourceKeys.length
    ? window.buildMorphologyCardsForKeys(eligibleSourceKeys)
        .filter((card) => card && card.lemma === focusedLemma)
    : [];
  const cards = drilledCards.concat(optionalCards);

  // Source-level dedup: drop any earlier source whose normalized form set is
  // entirely contained in a LATER source's form set. The W1_EIMI_PRESENT
  // forms are all covered by W3_EIMI_COMPLETE, so W3 supersedes W1 once Ch
  // 8+ is selected. λύω's W1_PRESENT_ACTIVE is similarly a subset of W2's
  // 4-tense indicative, so W2 supersedes W1 once Ch 6+ is selected.
  //
  // Doing this at the source level (rather than per-form) preserves
  // legitimate within-source duplicates — e.g. λύω's imperfect ἔλυον is the
  // same Greek string for both 1sg and 3pl, and both cards must survive.
  const cardsBySource = new Map();
  cards.forEach((card) => {
    if (!cardsBySource.has(card.sourceKey)) cardsBySource.set(card.sourceKey, []);
    cardsBySource.get(card.sourceKey).push(card);
  });
  const formsBySource = new Map();
  cardsBySource.forEach((srcCards, srcKey) => {
    const formSet = new Set();
    srcCards.forEach((c) => {
      const key = normalizeFormForDedup(c.form);
      if (key) formSet.add(key);
    });
    formsBySource.set(srcKey, formSet);
  });
  const superseded = new Set();
  formsBySource.forEach((formsA, srcA) => {
    if (superseded.has(srcA)) return;
    const chapA = sourceLevel(srcA).effectiveChapter;
    formsBySource.forEach((formsB, srcB) => {
      if (srcA === srcB || superseded.has(srcA)) return;
      const chapB = sourceLevel(srcB).effectiveChapter;
      if (chapA >= chapB) return;
      // srcA is earlier than srcB. Drop srcA if every one of its forms is
      // present in srcB.
      let allInB = formsA.size > 0;
      formsA.forEach((f) => { if (!formsB.has(f)) allInB = false; });
      if (allInB) superseded.add(srcA);
    });
  });

  // Drop cards whose canonical parse has no extractable dimensions — those
  // are concept questions (e.g. "what kind of verb is εἰμί syntactically?")
  // that happen to live in a paradigm item; in parsing mode they collapse
  // to a 0-step empty walk. Also drop sentence-shaped "forms" (translation
  // exercises like "ὁ Ἰησοῦς ἐστιν ὁ Χριστός.") which leak through with
  // multi-word "forms".
  function hasParseableDims(card) {
    const text = card.parsedAnswer || card.answer || '';
    const dims = parseAnswerDimensions(text);
    return !!(dims.tense || dims.voice || dims.mood || dims.person
              || dims.case || dims.number || dims.gender);
  }
  function isSingleFormShape(form) {
    if (!form) return false;
    if (/\s/.test(String(form).trim())) return false; // multi-word ⇒ sentence/phrase
    if (/[=→]/.test(form)) return false;              // marker / stem-pair shorthand
    return true;
  }
  const dimValueFilters = options.dimValueFilters || null;
  // Compute the multi-gender lemma set from the pre-gender-filter pool —
  // including a lemma's full gender repertoire even if some of its cards
  // would later be excluded by other dim filters. The gender filter is
  // then a no-op for any single-gender (noun) lemma.
  const preGenderFiltered = cards
    .filter((c) => !superseded.has(c.sourceKey))
    .filter((c) => isSingleFormShape(c.form) && hasParseableDims(c));
  const multiGenderLemmas = buildMultiGenderLemmas(preGenderFiltered);
  const filtered = preGenderFiltered
    .filter((c) => cardPassesDimValueFilters(c, dimValueFilters, multiGenderLemmas));

  // Per-form dedup. Multiple sources can carry the same form (e.g.
  // grammar.js ch 5's εἰμί 1-sg question + W3_EIMI_COMPLETE's εἰμί entry).
  // In parsing mode they all render the same step-by-step walk — keeping
  // them all just makes the same Greek word repeat in the deck. Pick the
  // single card with the richest canonical parse per form so the walk
  // asks every dim the form carries.
  function dimCount(card) {
    const dims = parseAnswerDimensions(card.parsedAnswer || card.answer || '');
    return ['tense', 'voice', 'mood', 'person', 'case', 'number', 'gender']
      .filter(k => dims[k]).length;
  }
  const deduped = new Map();
  filtered.forEach((card) => {
    const key = normalizeFormForDedup(card.form);
    if (!key) return;
    const existing = deduped.get(key);
    if (!existing || dimCount(card) > dimCount(existing)) deduped.set(key, card);
  });
  return [...deduped.values()];
}

export function chooseDefaultFocusedParadigm(selectedKeys) {
  const available = listAvailableParadigms(selectedKeys);
  if (!available.length) return null;
  return available[0].lemma;
}

// Every morph card whose source is in scope at the student's current max
// chapter — used to derive the chapter-gated distractor pool so the drill
// never asks about tenses/moods the textbook hasn't introduced yet.
export function getAccessibleMorphCards(selectedKeys) {
  if (typeof window === 'undefined' || typeof window.buildMorphologyCardsForKeys !== 'function') return [];
  const sets = safeMorphSets();
  const levels = deriveSelectionLevels(selectedKeys);
  if (levels.maxEffectiveChapter == null) return [];
  const eligibleSourceKeys = Object.keys(sets).filter((key) => sourcePassesLevel(key, levels));
  if (!eligibleSourceKeys.length) return [];
  return window.buildMorphologyCardsForKeys(eligibleSourceKeys);
}
