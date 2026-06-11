// Content access over the window.PCA_DATA contract. Pure selection/lookup
// helpers shared by deck-building, quiz generation, and the selector.

import { DATA, state } from './store.js';
import { getConfidencePct } from '../domain/srs/confidence.js';

export function allSetKeys() {
  const keys = [];
  for (const subj of DATA.subjects) for (const k of subj.setKeys) if (DATA.sets[k]) keys.push(k);
  return keys;
}
// The current selection. Nothing selected means nothing to study — the deck
// stays empty until the user chooses subjects (no silent "everything" default).
export function effectiveSetKeys() {
  return [...state.selected];
}
export function cardsForKeys(keys) {
  const out = [];
  for (const k of keys) {
    const set = DATA.sets[k];
    if (!set) continue;
    for (const c of set.cards) out.push({ ...c, _setKey: k, _setLabel: set.label });
  }
  return out;
}
export function subjectLabel(id) {
  const s = DATA.subjects.find(x => x.id === id);
  return s ? s.label : id;
}
// Subjects implied by the current sub-deck selection (null = all subjects).
export function selectedSubjectIds() {
  if (!state.selected.size) return null;
  const s = new Set();
  for (const k of state.selected) { const set = DATA.sets[k]; if (set) s.add(set.subject); }
  return s;
}
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// A card is a "weak spot" once it has been studied at least once and its
// rolling confidence is under 60%.
export function isWeak(card) {
  const p = state.progress[card.id];
  if (!p || !p.reps) return false;
  const pct = getConfidencePct(p);
  return pct != null && pct < 60;
}
