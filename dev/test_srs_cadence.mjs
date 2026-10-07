import assert from 'node:assert/strict';
import { state, getProgress } from '../js/app/store.js';
import { applyOutcome } from '../js/app/srs.js';
import { getCadencePreset } from '../js/domain/srs/constants.js';
import { getNextEasyIntervalDays, msFromDays } from '../js/domain/srs/scheduler.js';

const realNow = Date.now;
function reset(now = 1_800_000_000_000) {
  state.spacedOn = true;
  state.spacingCadence = 'relaxed';
  state.progress = {};
  state.spacedActiveIds = [];
  state.activity = {};
  state.xp = 0;
  Date.now = () => now;
}
try {
  reset();
  assert.equal(state.spacingCadence, 'relaxed');
  const fresh = { id: 'fresh' };
  for (let n = 0; n < 6; n++) {
    const now = 1_800_000_000_000 + n * 1000;
    Date.now = () => now;
    state.spacedActiveIds = ['fresh'];
    applyOutcome(fresh, 'again');
    const p = getProgress('fresh');
    assert.equal(p.dueAt, now, 'Hard should stay due-now for the middle-deck loop');
    assert.equal(p.lapseCount || 0, 0, 'fresh retries are not lapses');
    assert.equal(p.leechDrill, false);
    assert.deepEqual(state.spacedActiveIds, []);
  }

  reset();
  const id = 'known';
  state.progress[id] = {
    confidenceHistory: [1,1,1,1,1], intervalDays: 14, lastEasyIntervalDays: 14,
    ease: 2.3, srsStage: 4, streak: 5, easyStreak: 5,
    lapseCount: 3, inRelearn: false, relearnLeft: 0,
    preLapseIntervalDays: 14, leechDrill: false, leechStreak: 2,
    passCount: 5, failCount: 3, reps: 8, dueAt: 0,
  };
  state.spacedActiveIds = [id];
  applyOutcome({ id }, 'again');
  let p = getProgress(id);
  assert.equal(p.lapseCount, 4);
  assert.equal(p.leechDrill, true);
  assert.equal(p.dueAt, Date.now());
  assert.deepEqual(state.spacedActiveIds, []);
  const nextNow = Date.now() + 1000;
  Date.now = () => nextNow;
  applyOutcome({ id }, 'again');
  p = getProgress(id);
  assert.equal(p.lapseCount, 4, 'same leech/relearn episode must not add another lapse');
  assert.equal(p.dueAt, nextNow);

  reset();
  state.spacingCadence = 'intensive';
  state.progress[id] = {
    confidenceHistory: [1,1,1,1,1], intervalDays: 14, lastEasyIntervalDays: 14,
    ease: 2.3, srsStage: 4, lapseCount: 3, inRelearn: false, leechDrill: false,
  };
  applyOutcome({ id }, 'again');
  p = getProgress(id);
  assert.equal(p.lapseCount, 4);
  assert.notEqual(p.leechDrill, true, '2-month cadence must not enable the leech drill');

  const relaxed = getCadencePreset('relaxed');
  const growth = { confidenceHistory: Array(10).fill(1), intervalDays: 14, lastEasyIntervalDays: 14, ease: 2.3 };
  assert.equal(getNextEasyIntervalDays(growth, relaxed), 28);
  growth.intervalDays = 28; growth.lastEasyIntervalDays = 28;
  assert.equal(getNextEasyIntervalDays(growth, relaxed), 42);
  assert.equal(msFromDays(1), 22 * 60 * 60 * 1000);
  assert.equal(msFromDays(2), 46 * 60 * 60 * 1000);

  console.log('OK — PCA SRS cadence/relearn regression tests passed');
} finally {
  Date.now = realNow;
}
