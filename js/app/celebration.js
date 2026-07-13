// Local, dependency-free "you did well" feedback: a few synthesized sound
// effects (Web Audio API, no audio files) and a lightweight confetti burst
// (Canvas 2D, no libraries). Everything here is best-effort — a failure to
// play a sound or draw a frame must never surface to the caller, since this
// runs from result screens on real devices (iOS Safari, installed PWAs)
// where audio/animation APIs can be flaky or absent. Respects `state.soundOn`
// / `state.celebrationsOn` and `prefers-reduced-motion`.

import { state } from './store.js';

// ── Audio ───────────────────────────────────────────────────────────────
let audioCtx = null;

function getAudioContext() {
  if (audioCtx) return audioCtx;
  try {
    if (typeof window === 'undefined') return null;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
    return audioCtx;
  } catch (e) {
    return null;
  }
}

// Ensures the context is running (iOS/Safari suspend it until a user
// gesture); returns the context if it's usable, else null. Every caller runs
// from inside a user-gesture handler already, so resume() should succeed.
function ensureRunning(ctx) {
  try {
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      const p = ctx.resume();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    return ctx.state === 'running' ? ctx : null;
  } catch (e) {
    return null;
  }
}

// Plays a single short tone with an exponential-decay envelope. All timing is
// relative to the context's current time. Never throws.
function tone(ctx, { freq, start, dur, peak = 0.1, type = 'sine' }) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), ctx.currentTime + start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.02);
    // Nodes are not retained; they're garbage-collected once stopped and
    // disconnected by the audio graph's own teardown.
    osc.onended = () => {
      try { osc.disconnect(); gain.disconnect(); } catch (e2) {}
    };
  } catch (e) {}
}

function withAudio(fn) {
  try {
    if (!state.soundOn) return;
    const ctx = ensureRunning(getAudioContext());
    if (!ctx) return;
    fn(ctx);
  } catch (e) {}
}

export function playCorrect() {
  withAudio(ctx => {
    tone(ctx, { freq: 660, start: 0, dur: 0.09, peak: 0.1 });
    tone(ctx, { freq: 880, start: 0.07, dur: 0.09, peak: 0.1 });
  });
}

export function playWrong() {
  withAudio(ctx => {
    tone(ctx, { freq: 180, start: 0, dur: 0.2, peak: 0.09, type: 'triangle' });
  });
}

export function playResultSound(grade) {
  if (grade !== 'A' && grade !== 'S') return;
  withAudio(ctx => {
    if (grade === 'A') {
      // Brief 3-note ascending success chime.
      tone(ctx, { freq: 523.25, start: 0.00, dur: 0.16, peak: 0.11 });
      tone(ctx, { freq: 659.25, start: 0.14, dur: 0.16, peak: 0.11 });
      tone(ctx, { freq: 783.99, start: 0.28, dur: 0.22, peak: 0.12 });
    } else {
      // 'S': fuller 4-5 note fanfare with a light fifth harmony under the
      // final note, all under ~1s.
      tone(ctx, { freq: 523.25, start: 0.00, dur: 0.14, peak: 0.1 });
      tone(ctx, { freq: 659.25, start: 0.12, dur: 0.14, peak: 0.1 });
      tone(ctx, { freq: 783.99, start: 0.24, dur: 0.14, peak: 0.1 });
      tone(ctx, { freq: 1046.5, start: 0.38, dur: 0.32, peak: 0.12 });
      tone(ctx, { freq: 1567.98, start: 0.38, dur: 0.32, peak: 0.06 }); // fifth harmony
    }
  });
}

// ── Visuals ─────────────────────────────────────────────────────────────
export function prefersReducedMotion() {
  try {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return !!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    return false;
  }
}

// Confetti palette: the app's gold/cream tokens plus a couple of accent
// colours, as plain hex literals (this module can't read CSS custom
// properties reliably off-screen, and doesn't need to).
const PALETTE = ['#c9a84c', '#e8c97a', '#f0e6c8', '#7a6030', '#9fd6ad', '#8ec7e8'];
const GOLD_SPARKLE = ['#e8c97a', '#ffe9a8', '#c9a84c'];

let active = null; // { canvas, raf, timer } for the in-flight celebration

export function stopCelebration() {
  if (!active) return;
  try { if (active.raf != null) cancelAnimationFrame(active.raf); } catch (e) {}
  try { if (active.timer != null) clearTimeout(active.timer); } catch (e) {}
  try { if (active.onVisibility) document.removeEventListener('visibilitychange', active.onVisibility); } catch (e) {}
  try { if (active.canvas && active.canvas.parentNode) active.canvas.parentNode.removeChild(active.canvas); } catch (e) {}
  active = null;
}

function rand(min, max) { return min + Math.random() * (max - min); }

function makeParticles(count, palette, spreadMs) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: rand(0, 1), // normalized; scaled to canvas width at draw time
      y: rand(-0.15, 0), // start just above the top edge
      vx: rand(-0.06, 0.06),
      vy: rand(0.15, 0.45),
      size: rand(4, 9),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.15, 0.15),
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
      color: palette[(Math.random() * palette.length) | 0],
      born: Math.random() * spreadMs * 0.25, // stagger the burst slightly
      life: rand(0.8, 1) * spreadMs,
    });
  }
  return particles;
}

export function celebrateResult({ grade, newRecord = false, hostEl = null } = {}) {
  // Always start clean — at most one celebration runs at a time.
  stopCelebration();

  if (grade !== 'A' && grade !== 'S') return;
  try {
    if (!state.celebrationsOn) return;
    if (typeof document !== 'undefined' && document.hidden) return;
  } catch (e) { return; }

  if (prefersReducedMotion()) {
    try {
      if (hostEl && hostEl.classList) hostEl.classList.add('celebrate-accent');
    } catch (e) {}
    return;
  }

  let canvas, ctx2d;
  try {
    if (typeof document === 'undefined') return;
    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const w = (typeof window !== 'undefined' && window.innerWidth) || 360;
    const h = (typeof window !== 'undefined' && window.innerHeight) || 640;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    document.body.appendChild(canvas);
    ctx2d = canvas.getContext('2d');
    if (!ctx2d) { stopCelebration(); return; }
    ctx2d.scale(dpr, dpr);
  } catch (e) {
    stopCelebration();
    return;
  }

  const big = grade === 'S';
  const durationMs = big ? 1600 : 1100;
  const count = big ? 120 : 50;
  let particles = makeParticles(count, PALETTE, durationMs);
  if (newRecord) particles = particles.concat(makeParticles(big ? 18 : 12, GOLD_SPARKLE, durationMs));

  const startTs = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const state_ = { canvas, raf: null, timer: null, onVisibility: null };
  active = state_;

  const onVisibility = () => {
    try { if (document.hidden) stopCelebration(); } catch (e) {}
  };
  try {
    document.addEventListener('visibilitychange', onVisibility);
    state_.onVisibility = onVisibility;
  } catch (e) {}

  function frame(now) {
    if (!active || active.canvas !== canvas) return; // superseded/cleaned up
    let anyAlive = false;
    try {
      const w = canvas.width / ((typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      const h = canvas.height / ((typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      ctx2d.clearRect(0, 0, w, h);
      const elapsed = now - startTs;
      for (const p of particles) {
        const t = elapsed - p.born;
        if (t < 0) { anyAlive = true; continue; }
        if (t > p.life) continue;
        anyAlive = true;
        const tt = t / 1000; // seconds
        const gravity = 0.35; // gentle
        const px = (p.x + p.vx * tt) * w;
        const py = (p.y * h) + p.vy * h * tt + 0.5 * gravity * h * tt * tt;
        const rot = p.rot + p.vr * tt * 6;
        const lifeFrac = t / p.life;
        const alpha = lifeFrac < 0.75 ? 1 : Math.max(0, 1 - (lifeFrac - 0.75) / 0.25);
        if (py > h + 20 || alpha <= 0) continue;
        ctx2d.save();
        ctx2d.globalAlpha = alpha;
        ctx2d.translate(px, py);
        ctx2d.rotate(rot);
        ctx2d.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx2d.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        } else {
          ctx2d.beginPath();
          ctx2d.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx2d.fill();
        }
        ctx2d.restore();
      }
    } catch (e) {
      stopCelebration();
      return;
    }
    if (!anyAlive) { stopCelebration(); return; }
    try {
      state_.raf = requestAnimationFrame(frame);
    } catch (e) {
      stopCelebration();
    }
  }

  try {
    state_.raf = requestAnimationFrame(frame);
  } catch (e) {
    stopCelebration();
    return;
  }
  // Hard stop as a backstop in case a stray particle keeps `anyAlive` true
  // longer than expected (e.g. a frozen rAF on a backgrounded tab).
  try {
    state_.timer = setTimeout(stopCelebration, durationMs + 500);
  } catch (e) {}
}
