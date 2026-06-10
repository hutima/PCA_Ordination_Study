// Modal/overlay control: open/close + open-state predicates for the disclaimer,
// "what's new", study selector, shortcuts and analytics overlays. Plus the
// consent gate that runs on first load.
//
// All of these manipulate DOM only — no shared module state in main.js. The
// few hooks they need (renderAnalyticsOverlay, build*Selector for the study
// chooser, and the disclaimer-acceptance flag) are passed via configureModals
// so the module stays a thin wrapper over the existing semantics.

import { getStorage } from '../utils/storage.js';
import { shieldClicksBriefly } from '../utils/clickShield.js';
import { CONSENT_STORAGE_KEY, WHATS_NEW_V1_5_STORAGE_KEY } from '../state/store.js';

let host = {
  // Defaults are intentional no-ops so the predicate functions can run before
  // configureModals if init order ever changes; the open* ones will fail
  // silently in that case, which is the safest behavior.
  renderAnalyticsOverlay: () => {},
  buildSessions: () => {},
  buildChapterSelector: () => {},
  buildSupplementalSelector: () => {},
  buildAdvancedSelector: () => {},
  getHasAcceptedDisclaimer: () => false,
  setHasAcceptedDisclaimer: () => {},
  setDisclaimerModalRequiresAgreement: () => {},
  getDisclaimerModalRequiresAgreement: () => false,
  hasSelectedKeys: () => false
};

export function configureModals(deps) {
  host = { ...host, ...deps };
}

// ── Consent / disclaimer ─────────────────────────────────────────────────

export function updateConsentButtonState() {
  const checkbox = document.getElementById('consentCheckbox');
  const btn = document.getElementById('consentContinueBtn');
  if (!btn) return;
  if (!host.getDisclaimerModalRequiresAgreement()) {
    btn.disabled = false;
    btn.textContent = 'Close';
    return;
  }
  btn.textContent = 'Agree and continue';
  btn.disabled = !(checkbox && checkbox.checked);
}

export function openDisclaimerModal(requireAgreement = !host.getHasAcceptedDisclaimer()) {
  const overlay = document.getElementById('consentOverlay');
  const checkRow = document.getElementById('consentCheckRow');
  const checkbox = document.getElementById('consentCheckbox');
  if (!overlay) return;

  host.setDisclaimerModalRequiresAgreement(!!requireAgreement);
  if (checkRow) checkRow.style.display = host.getDisclaimerModalRequiresAgreement() ? 'flex' : 'none';
  if (checkbox) checkbox.checked = false;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  updateConsentButtonState();
}

export function closeDisclaimerModal() {
  const overlay = document.getElementById('consentOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  if (!isTransferModalOpen() && !isAnalyticsModalOpen()) document.body.classList.remove('modal-open');
  shieldClicksBriefly();
}

export function handleConsentAction() {
  if (!host.getDisclaimerModalRequiresAgreement()) {
    closeDisclaimerModal();
    return;
  }

  const checkbox = document.getElementById('consentCheckbox');
  if (!checkbox || !checkbox.checked) return;

  host.setHasAcceptedDisclaimer(true);
  const storage = getStorage();
  if (storage) {
    storage.setItem(CONSENT_STORAGE_KEY, 'accepted');
    // First-time accepters already see the new features as part of the base
    // experience, so suppress the v1.4 announcement for them.
    storage.setItem(WHATS_NEW_V1_5_STORAGE_KEY, 'seen');
  }
  closeDisclaimerModal();
  openStudySelector();
}

export function initializeConsentGate() {
  const storage = getStorage();
  host.setHasAcceptedDisclaimer(storage ? storage.getItem(CONSENT_STORAGE_KEY) === 'accepted' : false);

  const checkbox = document.getElementById('consentCheckbox');
  if (checkbox) checkbox.addEventListener('change', updateConsentButtonState);

  if (!host.getHasAcceptedDisclaimer()) {
    openDisclaimerModal(true);
  } else {
    updateConsentButtonState();
    maybeShowWhatsNewV1_5Modal();
  }
}

export function showDisclaimerModal() {
  openDisclaimerModal(false);
}

export function isDisclaimerModalOpen() {
  return !!document.getElementById('consentOverlay')?.classList.contains('show');
}

// ── What's New v1.4 ──────────────────────────────────────────────────────

export function maybeShowWhatsNewV1_5Modal() {
  if (!host.getHasAcceptedDisclaimer()) return;
  const storage = getStorage();
  if (!storage) return;
  if (storage.getItem(WHATS_NEW_V1_5_STORAGE_KEY) === 'seen') return;
  openWhatsNewV1_5Modal();
}

export function openWhatsNewV1_5Modal() {
  const overlay = document.getElementById('whatsNewV1_5Overlay');
  if (!overlay) return;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

export function closeWhatsNewV1_5Modal() {
  const overlay = document.getElementById('whatsNewV1_5Overlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  const storage = getStorage();
  if (storage) storage.setItem(WHATS_NEW_V1_5_STORAGE_KEY, 'seen');
  if (!isDisclaimerModalOpen() && !isTransferModalOpen() && !isAnalyticsModalOpen() && !isStudySelectorOpen() && !isShortcutsModalOpen()) {
    document.body.classList.remove('modal-open');
  }
  shieldClicksBriefly();
}

export function isWhatsNewV1_5ModalOpen() {
  return !!document.getElementById('whatsNewV1_5Overlay')?.classList.contains('show');
}

// ── Transfer modal (open-state only — open/close lives with the import/
//     export plumbing in main.js since it needs deck/state refs) ───────

export function isTransferModalOpen() {
  return !!document.getElementById('transferOverlay')?.classList.contains('show');
}

// ── Study selector ───────────────────────────────────────────────────────

export function isStudySelectorOpen() {
  return !!document.getElementById('studySelectorOverlay')?.classList.contains('show');
}

export function openStudySelector() {
  host.buildSessions();
  host.buildChapterSelector();
  host.buildSupplementalSelector();
  host.buildAdvancedSelector();

  const overlay = document.getElementById('studySelectorOverlay');
  if (!overlay) return;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

export function closeStudySelector() {
  const overlay = document.getElementById('studySelectorOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  if (!isDisclaimerModalOpen() && !isTransferModalOpen() && !isAnalyticsModalOpen() && !isShortcutsModalOpen()) document.body.classList.remove('modal-open');
  shieldClicksBriefly();
}

// ── Shortcuts ────────────────────────────────────────────────────────────

export function isShortcutsModalOpen() {
  return !!document.getElementById('shortcutsOverlay')?.classList.contains('show');
}

export function openShortcutsModal() {
  const overlay = document.getElementById('shortcutsOverlay');
  if (!overlay) return;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

export function closeShortcutsModal() {
  const overlay = document.getElementById('shortcutsOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  if (!isDisclaimerModalOpen() && !isTransferModalOpen() && !isAnalyticsModalOpen() && !isStudySelectorOpen()) document.body.classList.remove('modal-open');
  shieldClicksBriefly();
}

// ── Analytics overlay open/close (the render itself stays in main.js) ────

export function isAnalyticsModalOpen() {
  const overlay = document.getElementById('analyticsOverlay');
  return !!overlay && overlay.classList.contains('show');
}

export function openAnalyticsOverlay() {
  const overlay = document.getElementById('analyticsOverlay');
  if (!overlay) return;
  host.renderAnalyticsOverlay();
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

export function closeAnalyticsOverlay() {
  const overlay = document.getElementById('analyticsOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  if (!isDisclaimerModalOpen() && !isTransferModalOpen() && !isStudySelectorOpen() && !isShortcutsModalOpen()) document.body.classList.remove('modal-open');
  shieldClicksBriefly();
}

// ── Start-studying button (scrolls the card area into view) ──────────────

export function startStudying() {
  if (!host.hasSelectedKeys()) {
    openStudySelector();
    return;
  }
  const cardArea = document.getElementById('cardArea');
  if (cardArea) cardArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
