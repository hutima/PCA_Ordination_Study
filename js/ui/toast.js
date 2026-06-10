// Toast notifications for level-ups and achievement badges.
//
// Owns its own queue, "active" flag, and timeout handles. Toasts are rendered
// into a host div appended to <body> on first use. The module is self-contained
// — main.js only calls showLevelToast / showBadgeToast.

import { escapeHtml } from '../utils/helpers.js';

let levelToastHideTimer = null;
let levelToastRemoveTimer = null;
let toastQueue = [];
let toastActive = false;

function ensureLevelToastElement() {
  let host = document.getElementById('levelToastHost');
  if (host) return host;
  host = document.createElement('div');
  host.id = 'levelToastHost';
  host.className = 'level-toast-host';
  document.body.appendChild(host);
  return host;
}

function clearToastTimers() {
  if (levelToastHideTimer) {
    window.clearTimeout(levelToastHideTimer);
    levelToastHideTimer = null;
  }
  if (levelToastRemoveTimer) {
    window.clearTimeout(levelToastRemoveTimer);
    levelToastRemoveTimer = null;
  }
}

function dismissLevelToast() {
  const host = document.getElementById('levelToastHost');
  if (!host) return;
  host.classList.remove('show');
  clearToastTimers();
  levelToastRemoveTimer = window.setTimeout(() => {
    host.innerHTML = '';
    levelToastRemoveTimer = null;
    toastActive = false;
    showNextToast();
  }, 220);
}

function renderToast(toast) {
  if (!toast) return;
  const host = ensureLevelToastElement();
  const badgeHtml = toast.badgeHtml || escapeHtml(toast.badgeText || '★');
  host.innerHTML = `
    <button class="level-toast ${toast.variant === 'badge' ? 'level-toast-achievement' : ''}" type="button" aria-label="Dismiss notification">
      <span class="level-toast-badge">${badgeHtml}</span>
      <span class="level-toast-copy">
        <span class="level-toast-title">${escapeHtml(toast.title || 'Well done')}</span>
        <span class="level-toast-sub">${escapeHtml(toast.sub || 'Tap to dismiss')}</span>
      </span>
      <span class="level-toast-close" aria-hidden="true">×</span>
    </button>
  `;
  const button = host.querySelector('.level-toast');
  if (button) {
    button.addEventListener('click', dismissLevelToast);
    button.addEventListener('keydown', event => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        dismissLevelToast();
      }
    });
  }
  clearToastTimers();
  requestAnimationFrame(() => host.classList.add('show'));
  toastActive = true;
  levelToastHideTimer = window.setTimeout(() => {
    levelToastHideTimer = null;
    dismissLevelToast();
  }, 1800);
}

function enqueueToast(toast) {
  if (!toast) return;
  toastQueue.push(toast);
  if (!toastActive) showNextToast();
}

function showNextToast() {
  if (toastActive || !toastQueue.length) return;
  const nextToast = toastQueue.shift();
  renderToast(nextToast);
}

export function showLevelToast(levelData, totalXp) {
  if (!levelData || !levelData.level) return;
  enqueueToast({
    variant: 'level',
    badgeText: `Lv. ${levelData.level}`,
    title: `Congratulations — you have earned ${levelData.title}`,
    sub: `${levelData.flav || 'Well done.'} · ${Number(totalXp || 0).toLocaleString()} XP · Tap to dismiss`
  });
}

export function showBadgeToast(achievement) {
  if (!achievement || !achievement.id) return;
  enqueueToast({
    variant: 'badge',
    badgeHtml: `<span class="toast-achievement-icon">${achievement.icon || '★'}</span><span class="toast-achievement-label">Badge</span>`,
    title: `Congratulations — you have earned ${achievement.name}`,
    sub: `${achievement.desc || 'Badge earned'} · Tap to dismiss`
  });
}
