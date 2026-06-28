// PCA Ordination & Licensure Study — PWA "install to Home Screen" nudge.
//
// Self-contained module (ported from the Mounce study tool, PR #107, adapted
// to this app). pca.js calls initPwaInstall() once at startup and
// maybeScheduleInstallPrompt() after init. A persistent top banner invites
// phone users — who aren't already running the installed app and haven't
// dismissed the nudge — to install the app to their Home Screen for a
// full-screen, distraction-free view. Tapping Install fires the native
// install prompt where the browser supports it (Android/Chromium) or opens
// platform-detected how-to steps (iOS Safari, generic fallback).
//
// Unlike the Mounce port this is NOT tied to a consent/new-user gate (this app
// has none): the prompt is offered to ALL phone users who haven't dismissed it,
// not just first-time visitors.
//
// IMPORTANT: the "don't show again" flag is a module-LOCAL localStorage key,
// deliberately NOT a store.js export. A brand-new cross-module export risks the
// "frozen on update" service-worker failure mode (an old cached module being
// unable to resolve a new export from a freshly-installed sibling). Keeping the
// key here keeps the module self-contained and update-safe. The key is
// app-specific (`pca_…`) so it never collides with the Duff/Mounce apps that
// share a *.github.io origin.

const DISMISS_KEY = 'pca_install_prompt_dismissed_v1';
const SCHEDULE_DELAY_MS = 2000;

let deferredPrompt = null; // captured beforeinstallprompt event (Android/Chromium)
let scheduleTimer = null;
let bannerShown = false;

// ── Environment detection ──────────────────────────────────────────────
function isStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
    || window.navigator.standalone === true;
}

// Phone, not tablet/desktop: iPhone/iPod UA, or Android+Mobile UA, or a
// coarse pointer with a short min screen edge (≤ 480px).
function isLikelyPhone() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPod/.test(ua)) return true;
  if (/Android/.test(ua) && /Mobile/.test(ua)) return true;
  const coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const minSide = Math.min(screen.width || 0, screen.height || 0);
  return coarse && minSide > 0 && minSide <= 480;
}

function platform() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPod|iPad/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'generic';
}

function isDismissed() {
  try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch (e) { return false; }
}
function markDismissed() {
  try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) { /* private mode */ }
}

// ── Banner markup ───────────────────────────────────────────────────────
const DOWNLOAD_ICON =
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"'
  + ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></svg>';

function bannerHtml() {
  return ''
    + '<div class="pwa-install" role="region" aria-label="Install this app">'
    + '<span class="pwa-install-icon">' + DOWNLOAD_ICON + '</span>'
    + '<span class="pwa-install-copy">'
    + '<span class="pwa-install-title">Get the best experience</span>'
    + '<span class="pwa-install-text">Install this app to your Home Screen for a '
    + 'full-screen, distraction-free view.</span>'
    + '</span>'
    + '<button class="pwa-install-btn" type="button">Install</button>'
    + '<button class="pwa-install-close" type="button" aria-label="Dismiss">&times;</button>'
    + '</div>';
}

// ── How-to steps (platform-detected) ────────────────────────────────────
function stepsHtml(plat) {
  let steps;
  if (plat === 'ios') {
    steps = [
      'Tap the <strong>Share</strong> button (the square with an up arrow) in the Safari toolbar.',
      'Scroll down and tap <strong>Add to Home Screen</strong>.',
      'Keep <strong>Open as Web App</strong> turned on so it launches full-screen.',
      'Tap <strong>Add</strong> in the top-right corner.',
    ];
  } else if (plat === 'android') {
    steps = [
      'Tap the <strong>⋮</strong> menu in the top-right of Chrome.',
      'Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>).',
      'Confirm by tapping <strong>Install</strong>.',
    ];
  } else {
    steps = [
      'Open your browser&rsquo;s menu.',
      'Choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>.',
      'Confirm to add it to your device.',
    ];
  }
  return '<ol class="install-steps">' + steps.map((s, i) =>
    '<li class="install-step"><span class="install-step-num">' + (i + 1) + '</span>'
    + '<span class="install-step-text">' + s + '</span></li>').join('') + '</ol>';
}

// ── Banner show / hide ──────────────────────────────────────────────────
export function showInstallPrompt() {
  if (isStandalone() || isDismissed() || bannerShown) return;
  let host = document.getElementById('pwaInstallHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'pwaInstallHost';
    host.className = 'pwa-install-host';
    host.innerHTML = bannerHtml();
    document.body.appendChild(host);
    host.querySelector('.pwa-install-btn').addEventListener('click', triggerInstall);
    // The ✕ is a permanent dismissal — same as "Don't show again".
    host.querySelector('.pwa-install-close').addEventListener('click', dontShowInstallAgain);
  }
  // Next frame so the entrance transition runs from the off-screen start state.
  requestAnimationFrame(() => host.classList.add('show'));
  bannerShown = true;
}

// Hide the banner without dismissing it forever (used when the how-to modal
// takes over the screen, or after firing the native prompt).
function hideBanner() {
  const host = document.getElementById('pwaInstallHost');
  if (host) host.classList.remove('show');
  bannerShown = false;
}

// Remove the banner entirely and stop any pending schedule.
function teardown() {
  if (scheduleTimer) { clearTimeout(scheduleTimer); scheduleTimer = null; }
  const host = document.getElementById('pwaInstallHost');
  if (host) host.remove();
  bannerShown = false;
}

// ── Scheduling ──────────────────────────────────────────────────────────
export function maybeScheduleInstallPrompt() {
  if (isStandalone() || isDismissed() || !isLikelyPhone()) return;
  if (bannerShown || scheduleTimer) return;
  scheduleTimer = setTimeout(tryShowScheduled, SCHEDULE_DELAY_MS);
}

function tryShowScheduled() {
  scheduleTimer = null;
  // Re-arm while any modal (selector / progress / update) is open so the banner
  // lands right after it closes rather than fighting it for the screen.
  if (document.querySelector('.consent-overlay.show')) {
    scheduleTimer = setTimeout(tryShowScheduled, SCHEDULE_DELAY_MS);
    return;
  }
  showInstallPrompt();
}

// ── Install / how-to ────────────────────────────────────────────────────
export function triggerInstall() {
  if (deferredPrompt) {
    // Android/Chromium captured a real install prompt — fire it. Only an
    // accepted outcome marks the nudge dismissed; "dismissed" leaves it to
    // return next session.
    const dp = deferredPrompt;
    deferredPrompt = null;
    hideBanner();
    dp.prompt();
    dp.userChoice.then((choice) => {
      if (choice && choice.outcome === 'accepted') { markDismissed(); teardown(); }
    }).catch(() => {});
    return;
  }
  // No native prompt available (iOS Safari, etc.) — show how-to steps.
  openInstallInstructions();
}

export function openInstallInstructions() {
  const body = document.getElementById('installInstructionsBody');
  if (body) body.innerHTML = stepsHtml(platform());
  const ov = document.getElementById('installInstructionsOverlay');
  if (ov) { ov.classList.add('show'); ov.setAttribute('aria-hidden', 'false'); }
  hideBanner(); // opening the how-to auto-hides the banner
}

export function closeInstallInstructions() {
  const ov = document.getElementById('installInstructionsOverlay');
  if (ov) { ov.classList.remove('show'); ov.setAttribute('aria-hidden', 'true'); }
}

export function isInstallInstructionsOpen() {
  const ov = document.getElementById('installInstructionsOverlay');
  return !!(ov && ov.classList.contains('show'));
}

// Forever-dismiss: the banner ✕ and the modal's "Don't show again" both land
// here. Persist the flag, close the how-to, and remove the banner.
export function dontShowInstallAgain() {
  markDismissed();
  closeInstallInstructions();
  teardown();
}

// ── Init ────────────────────────────────────────────────────────────────
export function initPwaInstall() {
  // Capture the install prompt so we can fire it from our own Install button.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
  // Once installed, never nudge again and tear the banner down.
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    markDismissed();
    teardown();
  });

  // Wire the how-to modal's footer + close-x.
  const gotIt = document.getElementById('installGotItBtn');
  if (gotIt) gotIt.addEventListener('click', closeInstallInstructions);
  const never = document.getElementById('installDontShowBtn');
  if (never) never.addEventListener('click', dontShowInstallAgain);
  const closeX = document.getElementById('installCloseX');
  if (closeX) closeX.addEventListener('click', closeInstallInstructions);

  // Settings "Install app" button — the standing way to install for users who
  // dismissed the banner (analog of Mounce's user-guide button). Only relevant
  // on a phone that isn't already running the installed app.
  const appBtn = document.getElementById('installAppBtn');
  if (appBtn) {
    if (isStandalone() || !isLikelyPhone()) appBtn.style.display = 'none';
    else appBtn.addEventListener('click', triggerInstall);
  }
}
