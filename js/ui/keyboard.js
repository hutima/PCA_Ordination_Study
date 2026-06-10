// Keyboard shortcuts for the study UI.
//
// Reads modal/study state via the predicate functions passed in by main.js.
// Mutations (navigate, markCard, flipCard, answerMorphologyChoice) and the
// close* helpers come from the same host so this module stays a thin wire-up
// over the existing event semantics — no behavior change vs. the original
// inline listener.

export function installKeyboardShortcuts(deps) {
  const {
    isAnalyticsModalOpen,
    closeAnalyticsOverlay,
    isStudySelectorOpen,
    closeStudySelector,
    isShortcutsModalOpen,
    closeShortcutsModal,
    isWhatsNewV1_5ModalOpen,
    closeWhatsNewV1_5Modal,
    isDisclaimerModalOpen,
    isTransferModalOpen,
    closeTransferModal,
    isReviewDeckMode,
    getSelectedKeys,
    isMorphologyMode,
    isMorphSelfCheck,
    navigate,
    answerMorphologyChoice,
    revealMorphologyAnswer,
    rateMorphologySelfCheck,
    flipCard,
    markCard
  } = deps;

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isAnalyticsModalOpen()) { closeAnalyticsOverlay(); return; }
    if (e.key === 'Escape' && isStudySelectorOpen()) { closeStudySelector(); return; }
    if (e.key === 'Escape' && isShortcutsModalOpen()) { closeShortcutsModal(); return; }
    if (e.key === 'Escape' && isWhatsNewV1_5ModalOpen()) { closeWhatsNewV1_5Modal(); return; }
    if (e.key === 'Escape' && isTransferModalOpen()) { closeTransferModal(); return; }
    if (isDisclaimerModalOpen() || isTransferModalOpen() || isAnalyticsModalOpen() || isStudySelectorOpen() || isShortcutsModalOpen() || isWhatsNewV1_5ModalOpen()) return;
    if (!isReviewDeckMode() || !getSelectedKeys().length) return;

    if (isMorphologyMode()) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigate(-1);
      if (isMorphSelfCheck()) {
        // Self-check hides the multiple-choice options, so digits map to the
        // reveal/rate flow instead of answerMorphologyChoice (which would
        // grade the card against an invisible option).
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); revealMorphologyAnswer(); }
        if (e.key === '1') rateMorphologySelfCheck(true);
        if (e.key === '2') rateMorphologySelfCheck(false);
      } else if (/^[1-4]$/.test(e.key)) {
        answerMorphologyChoice(Number(e.key) - 1);
      }
      return;
    }

    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flipCard(); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigate(-1);
    if (e.key === '1') markCard('again');
    if (e.key === '2') markCard('pass');
    if (e.key === '3') markCard('easy');
    if (e.key === 'k' || e.key === 'K') markCard('easy');
    if (e.key === 'r' || e.key === 'R') markCard('again');
  });
}
