// State migrations — applied in order during restoreState
import { isPlainObject } from '../utils/helpers.js';
import { SRS_DAY_MS, SRS_MAX_INTERVAL_DAYS } from '../domain/srs/constants.js';
import { MAX_DECK_STATE_ENTRIES, ANALYTICS_COLLAPSED_DEFAULTS } from './store.js';

// Old → new analyticsCollapsed keys (introduced when the analytics overlay
// was split into Total/Selected Vocabulary/Grammar sub-sections). A saved
// `vocab: true` should preserve its closed state under `totalVocab`, etc.
const ANALYTICS_COLLAPSED_RENAMES = {
  vocab: 'totalVocab',
  grammar: 'totalGrammar',
  vocabChapterMap: 'totalVocabChapterMap',
  grammarChapterMap: 'totalGrammarChapterMap'
};

// Legacy SRS cap, used to rescale intervals from older saves/exports.
const LEGACY_SRS_MAX_INTERVAL_DAYS = 30;

function stableKey(greek) {
  return typeof window.stableCardKey === 'function' ? window.stableCardKey(greek) : String(greek || '');
}

function getLegacyStableIdMap() {
  return typeof window.buildLegacyStableIdMap === 'function' ? window.buildLegacyStableIdMap() : new Map();
}

// Vocab card IDs have the shape `${lookupKey}-${idx}-${stableKey(card.g)}`.
// A very old format omitted the index: `${lookupKey}-${stableKey(card.g)}`.
// lookupKey contains no hyphens; stableKey is hyphen-free (it only allows
// Greek letters, digits, and underscores), so both shapes parse unambiguously.
const VOCAB_ID_INDEXED = /^([^-]+)-(\d+)-(.+)$/u;
const VOCAB_ID_UNINDEXED = /^([^-]+)-(.+)$/u;

function parseVocabId(id) {
  const s = String(id || '');
  if (s.startsWith('grammar-') || s.startsWith('morph-')) return null;
  let m = s.match(VOCAB_ID_INDEXED);
  if (m) return { rawKey: m[1], stableKey: m[3] };
  m = s.match(VOCAB_ID_UNINDEXED);
  if (m) return { rawKey: m[1], stableKey: m[2] };
  return null;
}

// Grammar/morph card IDs are content-keyed: the trailing segments encode
// the lemma/form/answer (and prompt, for grammar) via stableGrammarKey, so
// two cards with the same trailing fingerprint represent the same drill
// even if the owning set was reorganized.
const MORPH_ID_FORMAT = /^morph-([^-]+)-(\d+)-(\d+)-(.+)$/u;
const GRAMMAR_ID_FORMAT = /^grammar-([^-]+)-(\d+)-(\d+)-(.+)$/u;

function parseGrammarMorphId(id) {
  const s = String(id || '');
  let m = s.match(MORPH_ID_FORMAT);
  if (m) return { kind: 'morph', fingerprint: m[4] };
  m = s.match(GRAMMAR_ID_FORMAT);
  if (m) return { kind: 'grammar', fingerprint: m[4] };
  return null;
}

function getCurrentVocabCardIds() {
  const ids = new Set();
  const byStableKey = new Map();
  try {
    const sets = window.SETS && typeof window.SETS === 'object' ? window.SETS : {};
    Object.keys(sets).forEach(rawKey => {
      const set = sets[rawKey];
      if (!set || !Array.isArray(set.cards)) return;
      set.cards.forEach((card, idx) => {
        const sk = stableKey(card.g);
        const id = `${rawKey}-${idx}-${sk}`;
        ids.add(id);
        if (!byStableKey.has(sk)) byStableKey.set(sk, []);
        byStableKey.get(sk).push(id);
      });
    });
  } catch (err) {
    console.warn('Could not enumerate current vocab card ids for migration safety.', err);
  }
  return { ids, byStableKey };
}

const MARK_RANK = { known: 2, unsure: 1 };

function mergeMark(existing, incoming) {
  if (!incoming) return existing;
  if (!existing) return incoming;
  return (MARK_RANK[existing] || 0) >= (MARK_RANK[incoming] || 0) ? existing : incoming;
}

function minNonZero(a, b) {
  const aNum = Number.isFinite(a) ? a : 0;
  const bNum = Number.isFinite(b) ? b : 0;
  if (!aNum) return bNum;
  if (!bNum) return aNum;
  return Math.min(aNum, bNum);
}

function mergeProgressEntry(existing, incoming) {
  if (!isPlainObject(incoming)) return existing;
  if (!isPlainObject(existing)) return { ...incoming };
  const histA = Array.isArray(existing.confidenceHistory) ? existing.confidenceHistory : [];
  const histB = Array.isArray(incoming.confidenceHistory) ? incoming.confidenceHistory : [];
  return {
    ...existing,
    seenCount: (existing.seenCount || 0) + (incoming.seenCount || 0),
    passCount: (existing.passCount || 0) + (incoming.passCount || 0),
    failCount: (existing.failCount || 0) + (incoming.failCount || 0),
    streak: Math.max(existing.streak || 0, incoming.streak || 0),
    easyStreak: Math.max(existing.easyStreak || 0, incoming.easyStreak || 0),
    srsStage: Math.max(existing.srsStage || 0, incoming.srsStage || 0),
    ease: Math.max(existing.ease || 0, incoming.ease || 0),
    intervalDays: Math.max(existing.intervalDays || 0, incoming.intervalDays || 0),
    lastEasyIntervalDays: Math.max(existing.lastEasyIntervalDays || 0, incoming.lastEasyIntervalDays || 0),
    dueAt: Math.max(existing.dueAt || 0, incoming.dueAt || 0),
    lastReviewedAt: Math.max(existing.lastReviewedAt || 0, incoming.lastReviewedAt || 0),
    firstSeenAt: minNonZero(existing.firstSeenAt, incoming.firstSeenAt),
    firstConfirmedAt: minNonZero(existing.firstConfirmedAt, incoming.firstConfirmedAt),
    confidence: Math.max(existing.confidence || 0, incoming.confidence || 0),
    confidenceHistory: [...histA, ...histB].slice(-10)
  };
}

export function getCurrentGrammarAndMorphCardIdSet() {
  const ids = new Set();
  try {
    if (window.buildGrammarCardsForKeys && window.GRAMMAR_SETS && typeof window.GRAMMAR_SETS === 'object') {
      const grammarKeys = Object.keys(window.GRAMMAR_SETS);
      window.buildGrammarCardsForKeys(grammarKeys).forEach(card => {
        if (card?.id) ids.add(card.id);
      });
    }
  } catch (err) {
    console.warn('Could not enumerate current grammar card ids for migration safety.', err);
  }
  try {
    if (window.buildMorphologyCardsForKeys && window.MORPHOLOGY_SETS && typeof window.MORPHOLOGY_SETS === 'object') {
      const morphKeys = Object.keys(window.MORPHOLOGY_SETS);
      window.buildMorphologyCardsForKeys(morphKeys).forEach(card => {
        if (card?.id) ids.add(card.id);
      });
    }
  } catch (err) {
    console.warn('Could not enumerate current morphology card ids for migration safety.', err);
  }
  return ids;
}

export function isLegacyOrphanedMorphId(id, validIds = null) {
  if (!(String(id || '').startsWith('grammar-') || String(id || '').startsWith('morph-'))) return false;
  const liveIds = validIds || getCurrentGrammarAndMorphCardIdSet();
  if (!liveIds.size) return false;
  return !liveIds.has(String(id));
}

function getCurrentGrammarMorphMaps() {
  const ids = getCurrentGrammarAndMorphCardIdSet();
  const byFingerprint = new Map();
  ids.forEach(id => {
    const parsed = parseGrammarMorphId(id);
    if (!parsed) return;
    const key = `${parsed.kind}|${parsed.fingerprint}`;
    if (!byFingerprint.has(key)) byFingerprint.set(key, []);
    byFingerprint.get(key).push(id);
  });
  return { ids, byFingerprint };
}

export function summarizePersistedState(state) {
  const safeState = isPlainObject(state) ? state : {};
  const marks = isPlainObject(safeState.globalWordMarks) ? safeState.globalWordMarks : {};
  const progress = isPlainObject(safeState.globalWordProgress) ? safeState.globalWordProgress : {};
  const countObjectKeys = bucket => (isPlainObject(bucket) ? Object.keys(bucket).length : 0);

  return {
    selectedSets: Array.isArray(safeState.selectedKeys) ? safeState.selectedKeys.length : 0,
    deckStates: countObjectKeys(safeState.deckStates),
    marks: {
      g2e: countObjectKeys(marks.g2e),
      e2g: countObjectKeys(marks.e2g),
      morph: countObjectKeys(marks.morph)
    },
    progress: {
      g2e: countObjectKeys(progress.g2e),
      e2g: countObjectKeys(progress.e2g),
      morph: countObjectKeys(progress.morph)
    }
  };
}

export function formatPersistedStateSummary(summary) {
  const safe = isPlainObject(summary) ? summary : {};
  const marks = isPlainObject(safe.marks) ? safe.marks : {};
  const progress = isPlainObject(safe.progress) ? safe.progress : {};
  return `Sets ${safe.selectedSets || 0} \u00B7 Marks G\u2192E ${marks.g2e || 0}, E\u2192G ${marks.e2g || 0}, Grammar ${marks.morph || 0} \u00B7 Progress G\u2192E ${progress.g2e || 0}, E\u2192G ${progress.e2g || 0}, Grammar ${progress.morph || 0}`;
}

// ── Save compaction ──────────────────────────────────────────────────────
// localStorage on iOS is small (~5MB) and a bloated save throws
// QuotaExceededError mid-render — saveState() runs at the top of renderCard(),
// so a throw there aborts the re-render and freezes the current card.
// compactPersistedState keeps every persisted payload (localStorage saves and
// JSON exports alike) as small as possible without losing real progress:
//
//  - globalWordProgress accumulates a fresh all-zero entry for every card the
//    app merely *looks at* — getWordProgress lazily seeds defaults during
//    rendering and deck building. Those entries carry no information (an
//    identical default is regenerated on demand), so they are dropped.
//  - Only the three reachable direction buckets (g2e / e2g / morph) are ever
//    read; a stray empty bucket from an older build (e.g. "morph_e2g") is
//    dropped.
//  - The deck-state bank grows one entry per distinct selection combo and is
//    only a resume convenience, so it is capped to the most recently saved
//    selections; reader-mode entries (reader never resumes a card deck) go.

const KNOWN_DIRECTION_BUCKETS = ['g2e', 'e2g', 'morph'];
const PROGRESS_DEFAULT_EASE = 2.3;
const PROGRESS_MEANINGFUL_NUMERIC_FIELDS = [
  'seenCount', 'passCount', 'failCount', 'streak', 'easyStreak', 'srsStage',
  'intervalDays', 'lastEasyIntervalDays', 'dueAt', 'lastReviewedAt',
  'firstSeenAt', 'firstConfirmedAt', 'confidence'
];

// Default values for each progress field — getWordProgress re-seeds these on
// read, and every progress consumer (analytics, scheduler, charts) tolerates
// missing fields via `Number(p.x) || 0` / `p?.x`. Fields equal to their
// default carry no information, so they're stripped on serialize: with ~14
// fields per active card and most defaulting to 0, this halves the per-card
// cost of `globalWordProgress` in the persisted save.
const PROGRESS_FIELD_DEFAULTS = {
  seenCount: 0,
  passCount: 0,
  failCount: 0,
  streak: 0,
  easyStreak: 0,
  srsStage: 0,
  ease: PROGRESS_DEFAULT_EASE,
  intervalDays: 0,
  lastEasyIntervalDays: 0,
  dueAt: 0,
  lastReviewedAt: 0,
  firstSeenAt: 0,
  firstConfirmedAt: 0,
  confidence: 0
};
const PROGRESS_NUMERIC_FIELDS = Object.keys(PROGRESS_FIELD_DEFAULTS);

// True when a progress entry is indistinguishable from a freshly-seeded
// default — it records no actual study history and getWordProgress will
// regenerate an identical entry on demand, so it can be safely dropped.
function isEmptyProgressEntry(entry) {
  if (!isPlainObject(entry)) return true;
  if (PROGRESS_MEANINGFUL_NUMERIC_FIELDS.some(field => Number(entry[field]) > 0)) return false;
  if (Array.isArray(entry.confidenceHistory) && entry.confidenceHistory.length) return false;
  if (entry.lastSpacedOutcome) return false;
  if (Number.isFinite(entry.ease) && entry.ease !== PROGRESS_DEFAULT_EASE) return false;
  return true;
}

// Strip default-valued fields from a non-empty progress entry. Readers
// (getWordProgress + analytics/scheduler) tolerate missing fields, so the
// dropped fields are reconstructed lazily on first read without any data loss.
function compactProgressEntry(entry) {
  if (!isPlainObject(entry)) return entry;
  const out = {};
  PROGRESS_NUMERIC_FIELDS.forEach(field => {
    const value = entry[field];
    if (value === undefined || value === null) return;
    if (!Number.isFinite(value)) return;
    if (value === PROGRESS_FIELD_DEFAULTS[field]) return;
    out[field] = value;
  });
  if (Array.isArray(entry.confidenceHistory) && entry.confidenceHistory.length) {
    out.confidenceHistory = entry.confidenceHistory;
  }
  if (entry.lastSpacedOutcome) out.lastSpacedOutcome = entry.lastSpacedOutcome;
  return out;
}

function compactDirectionalStore(store, transform) {
  if (!isPlainObject(store)) return store;
  // A store with none of the real direction keys is the pre-split legacy flat
  // shape ({ cardId: value, ... }); leave it untouched so ensureDirectionalStores
  // can migrate it to the nested shape first.
  const hasDirectionBuckets = KNOWN_DIRECTION_BUCKETS.some(dir => dir in store);
  if (!hasDirectionBuckets) return store;

  const next = {};
  Object.keys(store).forEach(bucketKey => {
    const bucket = store[bucketKey];
    const isKnown = KNOWN_DIRECTION_BUCKETS.includes(bucketKey);
    if (!isPlainObject(bucket)) {
      if (isKnown) next[bucketKey] = {};
      return;
    }
    // Non-standard buckets are unreachable by the app; drop them once empty,
    // but never silently discard a bucket that still holds entries.
    if (!isKnown && !Object.keys(bucket).length) return;
    const trimmed = {};
    Object.keys(bucket).forEach(id => {
      const result = transform(bucket[id]);
      if (result !== undefined) trimmed[id] = result;
    });
    next[bucketKey] = trimmed;
  });
  return next;
}

function compactDeckStates(deckStates, cap = MAX_DECK_STATE_ENTRIES) {
  if (!isPlainObject(deckStates)) return {};
  const entries = Object.keys(deckStates)
    .map(key => ({ key, value: deckStates[key] }))
    .filter(entry => isPlainObject(entry.value) && Array.isArray(entry.value.deckIds))
    .filter(entry => !/"mode"\s*:\s*"reader"/.test(entry.key));
  // Newest selections first; legacy entries with no savedAt stamp sort last.
  entries.sort((a, b) => (Number(b.value.savedAt) || 0) - (Number(a.value.savedAt) || 0));
  const kept = {};
  entries.slice(0, cap).forEach(entry => { kept[entry.key] = entry.value; });
  return kept;
}

function compactAnalyticsCollapsed(collapsed) {
  if (!isPlainObject(collapsed)) return undefined;
  const next = {};
  Object.keys(ANALYTICS_COLLAPSED_DEFAULTS).forEach(key => {
    if (typeof collapsed[key] === 'boolean') next[key] = collapsed[key];
  });
  // Returning undefined when no recognised keys survive lets the caller drop
  // the field entirely — the runtime defaults will rehydrate it.
  return Object.keys(next).length ? next : undefined;
}

export function compactPersistedState(state, { maxDeckStates = MAX_DECK_STATE_ENTRIES } = {}) {
  if (!isPlainObject(state)) return state;
  const next = { ...state };
  if ('globalWordProgress' in next) {
    next.globalWordProgress = compactDirectionalStore(next.globalWordProgress,
      entry => (isEmptyProgressEntry(entry) ? undefined : compactProgressEntry(entry)));
  }
  if ('globalWordMarks' in next) {
    next.globalWordMarks = compactDirectionalStore(next.globalWordMarks,
      mark => ((mark === 'known' || mark === 'unsure') ? mark : undefined));
  }
  if ('deckStates' in next) {
    next.deckStates = compactDeckStates(next.deckStates, maxDeckStates);
  }
  if ('analyticsCollapsed' in next) {
    const compacted = compactAnalyticsCollapsed(next.analyticsCollapsed);
    if (compacted) next.analyticsCollapsed = compacted;
    else delete next.analyticsCollapsed;
  }
  return next;
}

// In-place variant for the live runtime stores. compactPersistedState only
// trims the save payload, but getWordProgress re-seeds a default entry into
// the runtime store for every card the app renders, so without this the
// in-memory state regrows across a session even though each save stays small.
// Mutates the bucket objects rather than reassigning them so existing
// references (e.g. runtime.marks, which aliases a marks bucket) stay valid.
// These runtime stores are always in the nested g2e/e2g/morph shape by the
// time this runs (ensureDirectionalStores has migrated any legacy flat data).
function trimRuntimeDirectionalStore(store, keepValue) {
  if (!isPlainObject(store)) return;
  Object.keys(store).forEach(bucketKey => {
    const bucket = store[bucketKey];
    if (!isPlainObject(bucket)) return;
    if (!KNOWN_DIRECTION_BUCKETS.includes(bucketKey)) {
      // Stray unreachable bucket (e.g. legacy "morph_e2g") — drop once empty.
      if (!Object.keys(bucket).length) delete store[bucketKey];
      return;
    }
    Object.keys(bucket).forEach(id => {
      if (!keepValue(bucket[id])) delete bucket[id];
    });
  });
}

export function compactRuntimeStores({ globalWordProgress, globalWordMarks, deckStates } = {}) {
  trimRuntimeDirectionalStore(globalWordProgress, entry => !isEmptyProgressEntry(entry));
  trimRuntimeDirectionalStore(globalWordMarks, mark => mark === 'known' || mark === 'unsure');
  if (isPlainObject(deckStates)) {
    const survivors = compactDeckStates(deckStates);
    Object.keys(deckStates).forEach(key => {
      if (!(key in survivors)) delete deckStates[key];
    });
  }
}

export const STATE_MIGRATIONS = [
  {
    name: 'card-ids-legacy-raw-to-indexed-stable',
    match(saved) {
      const buckets = [
        saved.globalWordMarks?.g2e, saved.globalWordMarks?.e2g,
        saved.globalWordProgress?.g2e, saved.globalWordProgress?.e2g,
      ];
      const oldFormat = /^([^-]+)-(\d+)-(.+)$/u;
      return buckets.some(bucket => bucket && Object.keys(bucket).some(id => {
        const m = id.match(oldFormat);
        return !!(m && m[3] !== stableKey(m[3]));
      }));
    },
    migrate(saved) {
      const oldFormat = /^([^-]+)-(\d+)-(.+)$/u;
      const rewriteBucket = (bucket) => {
        if (!bucket) return bucket;
        const next = {};
        Object.keys(bucket).forEach(id => {
          const m = id.match(oldFormat);
          if (m && m[3] !== stableKey(m[3])) {
            const newId = `${m[1]}-${m[2]}-${stableKey(m[3])}`;
            next[newId] = bucket[id];
          } else {
            next[id] = bucket[id];
          }
        });
        return next;
      };
      ['g2e', 'e2g'].forEach(dir => {
        if (saved.globalWordMarks?.[dir]) saved.globalWordMarks[dir] = rewriteBucket(saved.globalWordMarks[dir]);
        if (saved.globalWordProgress?.[dir]) saved.globalWordProgress[dir] = rewriteBucket(saved.globalWordProgress[dir]);
      });
      saved.deckStates = {};
      return saved;
    }
  },

  {
    name: 'card-ids-stable-to-indexed-stable',
    match(saved) {
      const buckets = [
        saved.globalWordMarks?.g2e, saved.globalWordMarks?.e2g,
        saved.globalWordProgress?.g2e, saved.globalWordProgress?.e2g,
      ];
      const legacyIdMap = getLegacyStableIdMap();
      return buckets.some(bucket => bucket && Object.keys(bucket).some(id => legacyIdMap.has(id)));
    },
    migrate(saved) {
      const legacyIdMap = getLegacyStableIdMap();
      const rewriteBucket = (bucket) => {
        if (!bucket) return bucket;
        const next = {};
        Object.keys(bucket).forEach(id => {
          const targets = legacyIdMap.get(id);
          if (targets && targets.length) {
            targets.forEach(targetId => { next[targetId] = bucket[id]; });
          } else {
            next[id] = bucket[id];
          }
        });
        return next;
      };
      ['g2e', 'e2g'].forEach(dir => {
        if (saved.globalWordMarks?.[dir]) saved.globalWordMarks[dir] = rewriteBucket(saved.globalWordMarks[dir]);
        if (saved.globalWordProgress?.[dir]) saved.globalWordProgress[dir] = rewriteBucket(saved.globalWordProgress[dir]);
      });
      saved.deckStates = {};
      return saved;
    }
  },

  {
    // Drop grammar/morph card entries whose set was deprecated. If a live
    // card carries the same lemma/form/answer fingerprint (the trailing
    // content portion of the id), the orphan's counters are merged into
    // it so grammar study history survives module reorganization.
    name: 'grammar-orphans-cleanup-and-merge',
    match(saved) {
      const { ids } = getCurrentGrammarMorphMaps();
      if (!ids.size) return false;
      const buckets = [
        saved.globalWordMarks?.morph,
        saved.globalWordProgress?.morph,
      ];
      return buckets.some(bucket => bucket && Object.keys(bucket).some(id => {
        const parsed = parseGrammarMorphId(id);
        return !!parsed && !ids.has(id);
      }));
    },
    migrate(saved) {
      const { ids: liveIds, byFingerprint } = getCurrentGrammarMorphMaps();
      if (!liveIds.size) return saved;

      const reconcileBucket = (bucket, merge) => {
        if (!bucket) return bucket;
        const next = { ...bucket };
        Object.keys(bucket).forEach(id => {
          const parsed = parseGrammarMorphId(id);
          if (!parsed) return;
          if (liveIds.has(id)) return;
          const targets = byFingerprint.get(`${parsed.kind}|${parsed.fingerprint}`) || [];
          targets.forEach(targetId => {
            next[targetId] = merge(next[targetId], bucket[id]);
          });
          delete next[id];
        });
        return next;
      };

      if (saved.globalWordMarks?.morph) {
        saved.globalWordMarks.morph = reconcileBucket(saved.globalWordMarks.morph, mergeMark);
      }
      if (saved.globalWordProgress?.morph) {
        saved.globalWordProgress.morph = reconcileBucket(saved.globalWordProgress.morph, mergeProgressEntry);
      }
      saved.deckStates = {};
      return saved;
    }
  },

  {
    // Drop vocab card entries whose owning set was deprecated. When a live
    // card shares the same Greek stableKey (the word survives in another
    // module), the orphan's per-card counters are merged in so study history
    // for that word isn't lost. Runs in g2e and e2g buckets independently.
    name: 'vocab-orphans-cleanup-and-merge',
    match(saved) {
      const { ids } = getCurrentVocabCardIds();
      if (!ids.size) return false;
      const buckets = [
        saved.globalWordMarks?.g2e, saved.globalWordMarks?.e2g,
        saved.globalWordProgress?.g2e, saved.globalWordProgress?.e2g,
      ];
      return buckets.some(bucket => bucket && Object.keys(bucket).some(id => {
        const parsed = parseVocabId(id);
        return !!parsed && !ids.has(id);
      }));
    },
    migrate(saved) {
      const { ids: liveIds, byStableKey } = getCurrentVocabCardIds();
      if (!liveIds.size) return saved;

      const reconcileBucket = (bucket, merge) => {
        if (!bucket) return bucket;
        const next = { ...bucket };
        Object.keys(bucket).forEach(id => {
          const parsed = parseVocabId(id);
          if (!parsed) return;
          if (liveIds.has(id)) return;
          const targets = byStableKey.get(parsed.stableKey) || [];
          targets.forEach(targetId => {
            next[targetId] = merge(next[targetId], bucket[id]);
          });
          delete next[id];
        });
        return next;
      };

      ['g2e', 'e2g'].forEach(dir => {
        if (saved.globalWordMarks?.[dir]) {
          saved.globalWordMarks[dir] = reconcileBucket(saved.globalWordMarks[dir], mergeMark);
        }
        if (saved.globalWordProgress?.[dir]) {
          saved.globalWordProgress[dir] = reconcileBucket(saved.globalWordProgress[dir], mergeProgressEntry);
        }
      });
      saved.deckStates = {};
      return saved;
    }
  },

  {
    // Pre-V18 saves (and JSON exports made before May 2026) sized intervals
    // against a 30-day cap. The active cap is now 14 days, so any unaligned
    // save needs its per-card intervals — and the remaining wait until
    // `dueAt` — scaled by 14/30 and clamped to the new cap. The marker
    // `srsIntervalCapAlignedV1` is stamped on new saves so this only runs
    // on legacy data.
    name: 'srs-interval-cap-30-to-14-alignment',
    match(saved) {
      return !saved.srsIntervalCapAlignedV1;
    },
    migrate(saved) {
      const factor = SRS_MAX_INTERVAL_DAYS / LEGACY_SRS_MAX_INTERVAL_DAYS;
      const capDays = SRS_MAX_INTERVAL_DAYS;
      const capMs = capDays * SRS_DAY_MS;

      // Only rescale entries whose value still exceeds the new cap: anything
      // already at or below 14 days was written under the new schedule and
      // should be left alone (mixed-era exports are common).
      const scaleDaysIfOverCap = value => {
        const days = Number(value);
        if (!Number.isFinite(days) || days <= capDays) return value;
        return Math.min(capDays, days * factor);
      };

      const scaleEntry = entry => {
        if (!isPlainObject(entry)) return entry;
        const next = { ...entry };
        if ('intervalDays' in next) next.intervalDays = scaleDaysIfOverCap(next.intervalDays);
        if ('lastEasyIntervalDays' in next) next.lastEasyIntervalDays = scaleDaysIfOverCap(next.lastEasyIntervalDays);

        const lastReviewedAt = Number(next.lastReviewedAt) || 0;
        const dueAt = Number(next.dueAt) || 0;
        if (dueAt > 0) {
          if (lastReviewedAt > 0 && dueAt > lastReviewedAt) {
            const gap = dueAt - lastReviewedAt;
            if (gap > capMs) {
              next.dueAt = lastReviewedAt + Math.min(capMs, gap * factor);
            }
          } else {
            // No anchor to scale against — clamp the absolute remaining wait
            // so cards can't sit beyond the new cap.
            const now = Date.now();
            if (dueAt > now + capMs) next.dueAt = now + capMs;
          }
        }
        return next;
      };

      const scaleBucket = bucket => {
        if (!isPlainObject(bucket)) return bucket;
        const next = {};
        Object.keys(bucket).forEach(id => { next[id] = scaleEntry(bucket[id]); });
        return next;
      };

      if (isPlainObject(saved.globalWordProgress)) {
        ['g2e', 'e2g', 'morph'].forEach(dir => {
          if (isPlainObject(saved.globalWordProgress[dir])) {
            saved.globalWordProgress[dir] = scaleBucket(saved.globalWordProgress[dir]);
          }
        });
      }

      saved.srsIntervalCapAlignedV1 = true;
      return saved;
    }
  },

  {
    name: 'required-only-default-on',
    match(saved) {
      return !saved.requiredOnlyDefaultedV1;
    },
    migrate(saved) {
      saved.requiredOnly = true;
      saved.requiredOnlyDefaultedV1 = true;
      return saved;
    }
  },

  {
    name: 'analytics-collapsed-rename-total-selected',
    match(saved) {
      if (!isPlainObject(saved.analyticsCollapsed)) return false;
      return Object.keys(ANALYTICS_COLLAPSED_RENAMES).some(k => k in saved.analyticsCollapsed)
        || 'vocabProgress' in saved.analyticsCollapsed;
    },
    migrate(saved) {
      const next = { ...saved.analyticsCollapsed };
      Object.entries(ANALYTICS_COLLAPSED_RENAMES).forEach(([oldKey, newKey]) => {
        if (oldKey in next) {
          // Don't clobber a value the user already set explicitly under the new key.
          if (!(newKey in next) && typeof next[oldKey] === 'boolean') {
            next[newKey] = next[oldKey];
          }
          delete next[oldKey];
        }
      });
      // `vocabProgress` was a single key for the selection-scoped vocab
      // progress collapse. The new layout has totalVocabProgress and
      // selectedVocabProgress, both closed by default, which is exactly what
      // a user setting `vocabProgress: true` already wanted — so drop it
      // rather than try to fan it out.
      if ('vocabProgress' in next) delete next.vocabProgress;
      saved.analyticsCollapsed = next;
      return saved;
    }
  },

  {
    // Early "Reset progress" runs cleared the scheduling fields but left
    // `lastSpacedOutcome` set, which made the per-word analytics show a
    // last outcome alongside stage 0 / ease 2.30 / no due date — looking
    // half-cooked. Drop the dangling outcome on entries whose SRS state
    // is fully at defaults so the display reflects "no scheduled state".
    name: 'drop-stale-last-spaced-outcome',
    match(saved) {
      const buckets = ['g2e', 'e2g'];
      return buckets.some(dir => {
        const bucket = saved.globalWordProgress?.[dir];
        if (!isPlainObject(bucket)) return false;
        return Object.values(bucket).some(entry => isStaleLastSpacedOutcome(entry));
      });
    },
    migrate(saved) {
      ['g2e', 'e2g'].forEach(dir => {
        const bucket = saved.globalWordProgress?.[dir];
        if (!isPlainObject(bucket)) return;
        Object.values(bucket).forEach(entry => {
          if (isStaleLastSpacedOutcome(entry)) delete entry.lastSpacedOutcome;
        });
      });
      return saved;
    }
  }
];

// A `lastSpacedOutcome` is stale when the entry has no scheduling state
// to back it up — every SRS field is missing or at its default and the
// confidence history is empty. That shape is what a "Reset progress" run
// leaves behind, and the outcome label without supporting state misreads.
function isStaleLastSpacedOutcome(entry) {
  if (!isPlainObject(entry)) return false;
  if (!entry.lastSpacedOutcome) return false;
  const num = (v) => Number.isFinite(v) ? v : 0;
  if (num(entry.dueAt) > 0) return false;
  if (num(entry.intervalDays) > 0) return false;
  if (num(entry.streak) > 0) return false;
  if (num(entry.easyStreak) > 0) return false;
  if (num(entry.srsStage) > 0) return false;
  if (num(entry.lastEasyIntervalDays) > 0) return false;
  if (Number.isFinite(entry.ease) && entry.ease !== PROGRESS_DEFAULT_EASE) return false;
  if (Array.isArray(entry.confidenceHistory) && entry.confidenceHistory.length) return false;
  return true;
}
