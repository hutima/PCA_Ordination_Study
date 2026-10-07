import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DEFAULT_SRS_CADENCE,
  SRS_AGAIN_MS,
  SRS_DAY_MS,
  SRS_FULL_DAY_MS,
  getCadencePreset,
} from '../js/domain/srs/constants.js';
import {
  daysFromMs,
  getNextEasyIntervalDays,
  msFromDays,
} from '../js/domain/srs/scheduler.js';

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key),
  clear: () => storage.clear(),
};

const store = await import('../js/app/store.js');
const { applyOutcome } = await import('../js/app/srs.js');

function resetState() {
  storage.clear();
  store.state.spacedOn = true;
  store.state.spacingCadence = 'intensive';
  store.state.progress = {};
  store.state.activity = {};
  store.state.xp = 0;
  store.state.spacedActiveIds = [];
  store.state.spacedMiddleIds = [];
}

function establishedProgress(overrides = {}) {
  return {
    confidenceHistory: [1, 1, 1, 1, 1],
    confidence: 5,
    intervalDays: 14,
    dueAt: 0,
    ease: 2.3,
    srsStage: 4,
    streak: 5,
    easyStreak: 5,
    lastEasyIntervalDays: 14,
    preLapseIntervalDays: 0,
    inRelearn: false,
    relearnLeft: 0,
    lapseCount: 0,
    leechDrill: false,
    leechStreak: 0,
    passCount: 5,
    failCount: 0,
    reps: 5,
    lastReviewedAt: 0,
    firstConfirmedAt: 1,
    ...overrides,
  };
}

test('PCA exposes Duff intensive and relaxed cadence presets', () => {
  assert.equal(DEFAULT_SRS_CADENCE, 'intensive');
  assert.equal(getCadencePreset('intensive').maxIntervalDays, 14);
  assert.equal(getCadencePreset('intensive').leechEnabled, false);
  assert.equal(getCadencePreset('relaxed').maxIntervalDays, 60);
  assert.equal(getCadencePreset('relaxed').leechEnabled, true);
  assert.equal(SRS_DAY_MS, 22 * 60 * 60 * 1000);
  assert.equal(SRS_FULL_DAY_MS, 24 * 60 * 60 * 1000);
  assert.equal(msFromDays(2), 46 * 60 * 60 * 1000);
  assert.equal(daysFromMs(msFromDays(2)), 2);
});

test('relaxed cadence continues growth past the intensive 14-day cap', () => {
  const progress = establishedProgress();
  assert.equal(getNextEasyIntervalDays({ ...progress }, getCadencePreset('intensive')), 14);
  assert.equal(getNextEasyIntervalDays({ ...progress }, getCadencePreset('relaxed')), 28);
});

test('cadence setting persists and defaults to intensive', () => {
  resetState();
  store.loadSpacingCadence();
  assert.equal(store.state.spacingCadence, 'intensive');
  store.state.spacingCadence = 'relaxed';
  store.saveSpacingCadence();
  store.state.spacingCadence = 'intensive';
  store.loadSpacingCadence();
  assert.equal(store.state.spacingCadence, 'relaxed');
});

test('fresh Again retries keep the 5-minute timestamp and session middle pile without counting lapses', () => {
  resetState();
  store.state.spacingCadence = 'relaxed';
  store.state.spacedActiveIds = ['fresh'];
  const realNow = Date.now;
  let now = 1_800_000_000_000;
  Date.now = () => now;
  try {
    for (let i = 0; i < 6; i++) {
      applyOutcome({ id: 'fresh' }, 'again');
      const p = store.getProgress('fresh');
      assert.equal(p.dueAt, now + SRS_AGAIN_MS);
      assert.equal(p.lapseCount || 0, 0);
      assert.equal(p.leechDrill, false);
      assert.ok(store.state.spacedMiddleIds.includes('fresh'));
      assert.ok(!store.state.spacedActiveIds.includes('fresh'));
      now += 1000;
    }
  } finally {
    Date.now = realNow;
  }
});

test('repeated Again inside one established-card relearn episode counts one lapse', () => {
  resetState();
  store.state.spacingCadence = 'relaxed';
  store.state.progress.card = establishedProgress();
  store.state.spacedActiveIds = ['card'];
  const realNow = Date.now;
  let now = 1_800_000_000_000;
  Date.now = () => now;
  try {
    applyOutcome({ id: 'card' }, 'again');
    const afterFirst = store.getProgress('card');
    assert.equal(afterFirst.lapseCount, 1);
    assert.equal(afterFirst.srsStage, 3);
    assert.ok(Math.abs(afterFirst.ease - 2.1) < 1e-9);
    for (let i = 0; i < 4; i++) {
      now += 1000;
      applyOutcome({ id: 'card' }, 'again');
    }
    const p = store.getProgress('card');
    assert.equal(p.lapseCount, 1);
    assert.equal(p.srsStage, 3);
    assert.ok(Math.abs(p.ease - 2.1) < 1e-9);
    assert.equal(p.leechDrill, false);
  } finally {
    Date.now = realNow;
  }
});

test('fourth genuine relaxed lapse becomes a leech but still retries in-session', () => {
  resetState();
  store.state.spacingCadence = 'relaxed';
  store.state.progress.card = establishedProgress({ lapseCount: 3, preLapseIntervalDays: 14 });
  store.state.spacedActiveIds = ['card'];
  const realNow = Date.now;
  let now = 1_800_000_000_000;
  Date.now = () => now;
  try {
    applyOutcome({ id: 'card' }, 'again');
    let p = store.getProgress('card');
    assert.equal(p.lapseCount, 4);
    assert.equal(p.leechDrill, true);
    assert.equal(p.dueAt, now + SRS_AGAIN_MS);
    assert.ok(store.state.spacedMiddleIds.includes('card'));

    now += 1000;
    applyOutcome({ id: 'card' }, 'again');
    p = store.getProgress('card');
    assert.equal(p.lapseCount, 4);
    assert.equal(p.dueAt, now + SRS_AGAIN_MS);

    now += 10 * 60 * 1000;
    applyOutcome({ id: 'card' }, 'easy');
    p = store.getProgress('card');
    assert.equal(p.leechDrill, true);
    assert.equal(p.leechStreak, 1);
    assert.equal(p.dueAt, now + msFromDays(1));
    assert.ok(!store.state.spacedMiddleIds.includes('card'));
  } finally {
    Date.now = realNow;
  }
});

test('intensive cadence never activates leech drill', () => {
  resetState();
  store.state.spacingCadence = 'intensive';
  store.state.progress.card = establishedProgress({ lapseCount: 3 });
  store.state.spacedActiveIds = ['card'];
  const realNow = Date.now;
  Date.now = () => 1_800_000_000_000;
  try {
    applyOutcome({ id: 'card' }, 'again');
    const p = store.getProgress('card');
    assert.equal(p.lapseCount, 4);
    assert.equal(p.leechDrill, false);
    assert.equal(p.inRelearn, true);
  } finally {
    Date.now = realNow;
  }
});

test('cadence controls are wired into the PCA settings UI', () => {
  const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const controller = readFileSync(new URL('../js/app/pca.js', import.meta.url), 'utf8');
  assert.match(index, /cadenceIntensiveBtn/);
  assert.match(index, /cadenceRelaxedBtn/);
  assert.match(controller, /loadSpacingCadence\(\)/);
  assert.match(controller, /saveSpacingCadence\(\)/);
  assert.match(controller, /setSpacingCadence/);
  assert.match(controller, /spacedMiddleIds/);
});
