// Card rendering for both vocab and grammar modes, plus flipCard().
//
// Reads runtime state for deck position / direction / answer state. Calls
// back into main.js for the deck/lifecycle hooks (startNextCycle, saveState,
// isMorphologyMode, etc.) and into progress.js for the progress/review
// re-renders that follow a flip or mark.

import { runtime } from '../state/runtime.js';
import { buildGrammarSupportHtml } from '../domain/grammar/explanations.js';
import { renderProgress, renderReview } from './progress.js';
import { buildMorphSteps, summarizeLemmaStats, getParadigmStepAttemptWindow, computeAccessibleDimensionPools, parseAnswerDimensions, aspectMistakeNote, isSecondPluralPresentMoodAmbiguity, computeParadigmPresentValues, accentLookalikesFor, confusableFormHints } from '../domain/grammar/morph_steps.js';
import { getAccessibleMorphCards, deriveSelectionLevels, buildMultiGenderLemmas, MIXED_FORM_NOUN_LEMMAS } from '../domain/grammar/paradigm_focus.js';

let host = {
  saveState: () => {},
  syncLayoutVisibility: () => {},
  noteStudyInteraction: () => {},
  getNearDueCount: () => 0,
  isMorphologyMode: () => false,
  isParsingMode: () => false,
  isReverseGrammarActive: () => false,
  isMorphCard: () => false,
  reverseDisplayActive: () => false,
  startNextCycle: () => {},
  resetMorphAnswerState: () => {},
  maybeReturnKnownCardToActivePile: () => false,
  // window-global text formatters are wrapped so the module doesn't depend on
  // load order between this ES module and the legacy <script defer> data files.
  formatGreekHeadword: (g) => g || '—',
  transliterateGreek: (s) => s,
  detectPartOfSpeech: () => '',
  isMultiCasePreposition: () => false,
  getEnabledParsingDims: () => null,
  // Full focused-paradigm card pool (chapter-gated, but NOT pruned by the
  // exclude-known filter or per-value dim filters) — the structural truth of
  // what forms the paradigm owns. Used to detect value gaps like ἐγώ/σύ
  // having no third-person forms. Returns [] outside parsing mode.
  getFocusedParadigmAllCards: () => []
};

export function configureRender(deps) {
  host = { ...host, ...deps };
}

// Grammar MC options often carry a trailing parenthetical that names the very
// grammatical category the prompt asks for, or glosses the form — e.g.
// "-ειν / -σαι / -ναι (infinitive endings)" against "-ος (nominative)", or a
// parse string ending in "('he sees')" when only the correct option is
// glossed. Shown up front, that tail hands the answer over (it labels the
// right category, or singles out the one annotated option). This returns a
// display-only copy of the choices with each trailing "(…)" removed so the
// buttons read as a real recall test before the student commits; the full
// text — brackets and all — returns on the disabled buttons and in the reveal
// once they answer. Returns null (leave choices untouched) when there is
// nothing to hide, or when stripping would make any option empty or collide
// with another — that guards load-bearing parens like "genitive plural
// ('of us')" vs "('of you all')", where the tail is the only thing telling
// the options apart.
function hideGrammarChoiceAnnotations(choices) {
  if (!Array.isArray(choices) || choices.length < 2) return null;
  const stripped = choices.map(c => String(c).replace(/\s*\([^()]*\)\s*$/, '').trim());
  const changed = stripped.some((s, i) => s !== String(choices[i]).trim());
  if (!changed) return null;
  if (stripped.some(s => s.length === 0)) return null;
  if (new Set(stripped).size !== stripped.length) return null;
  return stripped;
}

// Focused-paradigm lemmas that are stem-recall prompts ("what is the aorist
// of λαμβάνω?") rather than canonical paradigm forms. Parsing mode can't
// dimension-walk them — they have no tense/voice/mood/case/etc. parse —
// so we surface a redirect card that, when clicked, hops the student into
// the matching stem-FLIP Vocab supplemental (diff-highlighted changing
// letters). Second-aorist → W4_SECOND_AORIST_FLIP; liquid-future →
// W4_LIQUID_FUTURE_FLIP. The parseable liquid-future paradigms (μένω, κρίνω)
// still appear in the dropdown on their own — this entry is just the
// stem-recall link, parallel to the second-aorist one.
const PARSING_INCOMPATIBLE_LEMMAS = {
  'Second-aorist stems': 'W4_SECOND_AORIST_FLIP',
  'Liquid-stem futures': 'W4_LIQUID_FUTURE_FLIP'
};

// The "nothing selected" placeholder — the same markup index.html ships in
// #cardArea. Shown on a fresh start, after deselecting everything, and when
// switching into a mode that has no chapters selected (e.g. split
// vocab/grammar selection with only one side populated). Only paints the card
// area; callers that also need the deck cleared do that themselves.
export function renderChooseSessionEmptyState() {
  const area = document.getElementById('cardArea');
  if (area) {
    area.innerHTML = '<div class="empty-state"><div class="big">αβγ</div>Tap to choose a session and start studying.</div>';
  }
}

export function renderCard() {
  const area = document.getElementById('cardArea');
  host.saveState();
  host.syncLayoutVisibility();

  // No chapters selected for the current mode → show the canonical "choose a
  // session" placeholder. Sits ahead of every deck-dependent branch so a stale
  // deck carried over from the mode we just left can't render here. This is
  // the split vocab/grammar case: switching to the side with no selection used
  // to surface the other side's cards (e.g. grammar cards in an empty vocab
  // deck) because the deck was never cleared.
  if (!runtime.selectedKeys.length) {
    renderChooseSessionEmptyState();
    return;
  }

  if (host.isParsingMode() && runtime.morphFocusedParadigm && Object.prototype.hasOwnProperty.call(PARSING_INCOMPATIBLE_LEMMAS, runtime.morphFocusedParadigm)) {
    const lemma = runtime.morphFocusedParadigm;
    const drillKey = PARSING_INCOMPATIBLE_LEMMAS[lemma];
    area.innerHTML = `
      <button type="button" class="empty-state parsing-redirect-btn" onclick="goToStemDrillFromParsing('${drillKey}')">
        <div class="big">↗</div>
        <strong>${lemma}</strong> is a stem-recall drill, not a parseable
        paradigm — there are no tense / voice / mood / case dimensions to
        walk. <u>Tap to open the matching Vocabulary mode supplemental</u>.
      </button>`;
    // The redirect card is the only action surface here — Prev/Reset/Next
    // would just no-op against the empty deck, so hide the whole nav row
    // until the user taps through (or switches paradigms).
    const navRow = document.getElementById('navRow');
    if (navRow) navRow.style.display = 'none';
    return;
  }

  if (!runtime.deck.length) {
    let emptyMessage;
    if (host.isParsingMode()) {
      // A paradigm IS focused but the deck came back empty: with "Exclude
      // known morphs" on that means every in-scope form is 2/2 known, so
      // the filter (correctly) drained the deck. Tell the student the
      // paradigm is mastered rather than nudging them to pick one they've
      // already picked. Focused paradigms always have forms in scope (they
      // come from listAvailableParadigms), so an empty deck here is the
      // exclude-known case, not a genuinely empty paradigm.
      emptyMessage = (runtime.morphFocusedParadigm && runtime.excludeKnownMorphs)
        ? 'Every form in this paradigm is mastered (both of the last two attempts correct under your current parsing toggles). Pick another paradigm above, clear a form’s tally with the ✕ in the progress panel below, or turn off “Exclude known morphs” to drill them again.'
        : 'Pick a focused paradigm from the dropdown above to start parsing.';
    } else if (host.isMorphologyMode()) {
      emptyMessage = host.isReverseGrammarActive()
        ? 'No reversible grammar items in this selection. Toggle “English → Greek” off to see all questions.'
        : 'No grammar quiz material is available yet for this selection.';
    } else {
      emptyMessage = runtime.requiredOnly ? 'No required-vocabulary cards match this selection.' : 'No cards in this deck.';
    }
    area.innerHTML = `<div class="empty-state"><div class="big">—</div>${emptyMessage}</div>`;
    return;
  }

  if (!runtime.spacedRepetition && !host.isMorphologyMode() && runtime.currentIdx >= runtime.deck.length && runtime.unspacedPendingRecycle) {
    // Legacy auto-recycle pathway — only retained for morph; vocab unspaced
    // never sets unspacedPendingRecycle in the new flip-deck flow.
    runtime.unspacedPendingRecycle = false;
  }

  if (!runtime.spacedRepetition && (host.isMorphologyMode() || host.isParsingMode()) && runtime.currentIdx >= runtime.deck.length && runtime.unspacedPendingRecycle) {
    host.startNextCycle('remaining');
    host.resetMorphAnswerState();
    renderCard();
    renderReview();
    renderProgress();
    return;
  }

  if ((!runtime.spacedRepetition && runtime.currentIdx >= runtime.deck.length) || (runtime.spacedRepetition && runtime.currentIdx >= runtime.activeDeckCount)) {
    const unspacedVocab = !runtime.spacedRepetition && !host.isMorphologyMode();
    // Round complete = active is empty AND middle still has cards waiting to
    // reshuffle. If middle is empty too, everything is archived and the
    // "Session Confirmed" state takes over instead.
    const unspacedRoundComplete = unspacedVocab && runtime.unspacedMiddleCount > 0;

    const nearDueCount = runtime.spacedRepetition ? host.getNearDueCount() : 0;
    const spacedAdvanceTitle = nearDueCount > 0
      ? `No cards currently due ✦ <span style="color:var(--muted);font-weight:normal;font-size:0.82em;letter-spacing:1px">(${nearDueCount} near-due)</span>`
      : 'No cards currently due ✦';

    const doneTitle = runtime.spacedRepetition
      ? spacedAdvanceTitle
      : host.isMorphologyMode()
        ? 'Grammar pass complete ✦'
        : unspacedRoundComplete
          ? 'End of round ✦'
          : 'All cards confirmed ✨';

    const spacedAdvanceSub = nearDueCount > 0
      ? `Everything in this selection is scheduled ahead. Press <strong>Next →</strong> to advance the review clock by 1 hour and pull <strong>${nearDueCount}</strong> near-due card${nearDueCount === 1 ? '' : 's'} back in.`
      : 'Everything in this selection is scheduled ahead. Press <strong>Next →</strong> to advance the review clock by 1 hour and pull the next near-due cards back in.';

    const doneSub = runtime.spacedRepetition
      ? spacedAdvanceSub
      : host.isMorphologyMode()
        ? 'Everything in this grammar selection is currently marked correct. Press next to reshuffle the full selected set and run it again.'
        : unspacedRoundComplete
          ? 'Press <strong>Next →</strong> to reshuffle unconfirmed cards into another pass, or <strong>↻ Reset</strong> to start the whole deck over.'
          : 'Press <strong>↻ Reset</strong> to reshuffle the selected cards.<br><span style="color:var(--muted);font-size:13px">Archived cards stay archived until you reset or pick a new session.</span>';

    area.innerHTML = `
      <div class="done-card show">
        <div class="done-title">${doneTitle}</div>
        <div class="done-sub">${doneSub}</div>
      </div>`;
    document.getElementById('markRow').style.display = 'none';
    return;
  }

  document.getElementById('markRow').style.display = (host.isMorphologyMode() || host.isParsingMode()) ? 'none' : 'flex';
  const card = runtime.deck[runtime.currentIdx];

  // Parsing mode always uses the step-by-step renderer for dimensional cards.
  // Stem-change recall cards ("what is the aorist of βάλλω?") have
  // card.dimensional === false; those fall through to the standard MC
  // renderer below regardless of mode.
  if (host.isMorphCard(card) && host.isParsingMode() && card.dimensional !== false) {
    if (runtime.parsingReverse) {
      renderParsingReverseCard(area, card);
      return;
    }
    renderMorphStepCard(area, card);
    return;
  }

  if (host.isMorphCard(card)) {
    const reversed = host.reverseDisplayActive(card);
    const displayPrompt = reversed
      ? (card.reversePrompt || 'Choose the correct Greek form.')
      : (card.prompt || 'Parse this form.');
    const displayForm = reversed ? card.answer : card.form;
    const displayChoices = reversed ? (card.reverseChoices || []) : (card.choices || []);
    const correctAnswer = reversed ? card.form : card.answer;
    const formClass = reversed ? 'morph-form morph-form-english' : 'morph-form';

    const noteHtml = card.note ? `<div class="morph-note">${card.note}</div>` : '';
    const contextHtml = card.context
      ? `<div class="morph-context"><span class="morph-context-label">Context:</span> ${card.context}</div>`
      : '';

    const resultBody = reversed
      ? `${card.answer} = ${card.form}`
      : `${card.form} = ${card.answer}`;

    let interactionHtml = '';
    let resultHtml = '';

    if (runtime.morphSelfCheck) {
      if (!runtime.morphAnswerState.revealed) {
        const placeholder = reversed
          ? 'Recall the Greek form yourself first, then reveal the answer.'
          : 'Parse it yourself first, then reveal the answer.';
        interactionHtml = `<div class="morph-selfcheck-actions">
          <button class="ctrl-btn morph-reveal-btn" type="button" onclick="revealMorphologyAnswer()">Reveal answer</button>
          <button class="ctrl-btn morph-dontknow-btn" type="button" onclick="markMorphologyDontKnow()">I don't know</button>
        </div>`;
        resultHtml = `<div class="morph-result pending">${placeholder}</div>`;
      } else {
        const resultClass = runtime.morphAnswerState.answered
          ? (runtime.morphAnswerState.isCorrect ? 'correct' : 'incorrect')
          : 'pending';
        const resultTitle = runtime.morphAnswerState.answered
          ? (runtime.morphAnswerState.isCorrect ? 'You had it' : 'Needs more review')
          : 'Answer';
        const ratingHtml = runtime.morphAnswerState.answered
          ? ''
          : `<div class="morph-selfcheck-actions">
               <button class="choice-btn selfcheck-good" type="button" onclick="rateMorphologySelfCheck(true)">I had it</button>
               <button class="choice-btn selfcheck-bad" type="button" onclick="rateMorphologySelfCheck(false)">Needs review</button>
             </div>`;

        resultHtml = `<div class="morph-result ${resultClass}">
            <div class="morph-result-title">${resultTitle}</div>
            <div class="morph-result-body">${resultBody}</div>
            <div class="morph-result-meta">${card.lemma}${card.family ? ` · ${card.family}` : ''}</div>
            ${buildGrammarSupportHtml(card, null, { reversed })}
            ${noteHtml}
          </div>${ratingHtml}`;
      }
    } else {
      // Before the student commits, hide answer-giving trailing parentheticals
      // on grammar choices (see hideGrammarChoiceAnnotations). Grading is by
      // index against the untouched card data, so this is display-only; the
      // full text returns on the disabled buttons once answered.
      const isGrammarCard = String(card.id || '').startsWith('grammar-');
      const choiceLabels = (!reversed && isGrammarCard && !runtime.morphAnswerState.answered)
        ? hideGrammarChoiceAnnotations(displayChoices)
        : null;
      const choiceButtons = displayChoices.map((choice, idx) => {
        const classes = ['choice-btn'];
        if (reversed) classes.push('choice-btn-greek');
        if (runtime.morphAnswerState.answered) {
          if (choice === correctAnswer) classes.push('correct');
          if (idx === runtime.morphAnswerState.selectedIndex && choice !== correctAnswer) classes.push('incorrect');
        }
        const label = choiceLabels ? choiceLabels[idx] : choice;
        return `<button class="${classes.join(' ')}" type="button" ${runtime.morphAnswerState.answered ? 'disabled' : ''} onclick="answerMorphologyChoice(${idx})">${label}</button>`;
      }).join('');

      const dontKnowHtml = runtime.morphAnswerState.answered
        ? ''
        : `<div class="morph-dontknow-row">
             <button class="ctrl-btn morph-dontknow-btn" type="button" onclick="markMorphologyDontKnow()">I don't know</button>
           </div>`;
      interactionHtml = `<div class="morph-choices">${choiceButtons}</div>${dontKnowHtml}`;
      const wrongChoice = runtime.morphAnswerState.answered
        && !runtime.morphAnswerState.isCorrect
        && runtime.morphAnswerState.selectedIndex >= 0
        ? displayChoices[runtime.morphAnswerState.selectedIndex]
        : null;
      const pendingLabel = reversed
        ? 'Choose the correct Greek form.'
        : 'Choose the best parsing option.';
      resultHtml = runtime.morphAnswerState.answered
        ? `<div class="morph-result ${runtime.morphAnswerState.isCorrect ? 'correct' : 'incorrect'}">
            <div class="morph-result-title">${runtime.morphAnswerState.isCorrect ? 'Correct' : 'Not quite'}</div>
            <div class="morph-result-body">${resultBody}</div>
            <div class="morph-result-meta">${card.lemma}${card.family ? ` · ${card.family}` : ''}</div>
            ${buildGrammarSupportHtml(card, wrongChoice, { reversed })}
            ${noteHtml}
          </div>`
        : `<div class="morph-result pending">${pendingLabel}</div>`;
    }

    const morphSourceLabel = card.supplemental
      ? cardFaceLabelFromSourceLabel(card.sourceLabel)
      : card.sourceLabel;
    // Grammar.js families are keyed to a single family-level lemma/gloss
    // even when a few questions in the family use related-but-different
    // vocabulary (e.g. the πιστός questions sitting under an ἀγαθός family).
    // When the family lemma's headword can't be found in the form, the
    // inherited subtitle ("ἀγαθός in attributive position") and gloss
    // ("the good X") are misleading — suppress them. Per-question q.lemma
    // / q.gloss overrides bypass the check (the override IS the right
    // label for that question).
    const lemmaMatchesForm = familyLemmaAppearsInForm(card.lemma, card.form);
    // Translate prompts ("Translate.", "How should this be translated?")
    // turn the gloss into a giveaway — for εἰμί cards the gloss "I am"
    // hands the student the verb's meaning in a sentence-translation task.
    // Hide it until they've answered (or revealed in self-check), then
    // surface it as reinforcement. The reverse direction (English →
    // Greek) doesn't have this problem — the English IS the prompt — so
    // leave it visible there.
    const isTranslatePrompt = /translate/i.test(card.prompt || '') && !reversed;
    // Choice-pointing giveaway: when the gloss text appears in exactly one
    // of the (forward) MC options, it singles that choice out — sometimes
    // the correct one (Identify εἰμί: gloss "I am" → "1st singular ('I am')")
    // and sometimes a wrong distractor (Identify ἐστίν: gloss "I am" → also
    // points at the 1st-sg option). Either way the gloss does the student's
    // work for them or actively misleads — hide until they commit, then
    // reveal as reinforcement. When the gloss appears in zero or in
    // multiple choices (e.g. "the" in every sentence translation, "present
    // active participle" across every parse variant) it doesn't single one
    // out, so leave it visible.
    const glossText = String(card.gloss || card.lemmaGloss || '');
    const glossSinglesOutChoice = !reversed
      && glossPointsAtSingleChoice(glossText, displayChoices);
    const glossUnlocked = runtime.morphSelfCheck
      ? runtime.morphAnswerState.revealed
      : runtime.morphAnswerState.answered;
    const showGloss = glossText
      && lemmaMatchesForm
      && (!isTranslatePrompt || glossUnlocked)
      && (!glossSinglesOutChoice || glossUnlocked);
    const glossHtml = showGloss
      ? `<div class="morph-gloss">Gloss: “${glossText}”</div>`
      : '';
    const lemmaHintHtml = lemmaMatchesForm
      ? `<div class="morph-hint">${card.lemma}</div>`
      : '';
    area.innerHTML = `
      <div class="morph-card">
        <div class="morph-label">Grammar${reversed ? ' · English → Greek' : ''}</div>
        <div class="morph-prompt">${displayPrompt}</div>
        ${glossHtml}
        <div class="${formClass}">${displayForm}</div>
        ${contextHtml}
        ${lemmaHintHtml}
        <div class="morph-source">${morphSourceLabel}${runtime.morphSelfCheck ? ' · Self-check' : ''}</div>
        ${interactionHtml}
        ${resultHtml}
      </div>`;
    runtime.isFlipped = false;
    renderProgress();
    return;
  }

  const advancedCountSuffix = (card.advanced && Number.isFinite(Number(card.count)))
    ? ` [${Number(card.count)}× in NT]`
    : '';
  // Supplemental paradigm set labels read "<lemma> — <sub-paradigm>" (e.g.
  // "εἰμί — infinitive and participle"). Showing the sub-paradigm on the
  // card front gives away the parse class of the form — knowing εἶναι is
  // an infinitive collapses the recall to a single form. Strip the tail
  // for the on-card hint and show just the lemma side; the full label
  // still appears in the session selector for browsing.
  const onCardSourceLabel = card.supplemental
    ? cardFaceLabelFromSourceLabel(card.sourceLabel)
    : card.sourceLabel;
  const sourceLabelDisplay = `${onCardSourceLabel}${advancedCountSuffix}`;

  // Prepositions that govern more than one case get a star on both faces as a
  // reminder that the meaning depends on the case of the object.
  const prepStar = host.isMultiCasePreposition(card) ? '★ ' : '';
  // Vocab mode has no explicit chapter dropdown, so the selection itself is
  // the gate: its max effective chapter (same deriveSelectionLevels scale
  // parsing uses) caps the later stem annotations below. The second-aorist /
  // liquid-future material is deliberately NOT gated — the aorist is the most
  // common form a verb wears in the NT, so early exposure is wanted — but the
  // aorist-passive (Ch. 15) and perfect (Ch. 16) parts, and the
  // third-declension annotations (Ch. 12), wait for their chapters.
  const levels = deriveSelectionLevels(runtime.selectedKeys || []);
  const maxCh = levels.maxEffectiveChapter;
  // The "Stem & declension notes" toggle (advanced settings, default on)
  // switches every annotation below off at once for students who want bare
  // cards.
  const notesOn = runtime.stemNotes !== false;
  // A card carries at most one inline stem: the verbal stem for second-aorist /
  // liquid-future verbs, or the third-declension noun stem (never both).
  const stemInline = notesOn ? (verbStemInlineHtml(card) || nounStemInlineHtml(card, maxCh)) : '';
  const greekDisplay = `${prepStar}${host.formatGreekHeadword(card.g)}${stemInline}`;
  const englishDisplay = `${prepStar}${card.e || '—'}`;
  const requiredLabelHTML = `<span class="card-required-label card-required-label-${card.required ? 'req' : 'opt'}">(${card.required ? 'req.' : 'opt.'})</span>`;
  // Verbs with irregular principal parts get them in one small bracketed line
  // under the Greek headword (2 aor. / fut. / aor. pass. / pf.).
  const verbStemAltHTML = notesOn ? verbStemAltHtml(card, maxCh) : '';
  // Third-declension nouns carry a "declines like σάρξ" pointer in the hint
  // line of the Greek-bearing face, anchoring each noun to its model paradigm.
  const declModelTag = notesOn ? nounDeclensionModelSuffix(card, maxCh) : '';

  // Stem-flip cards (second-aorist supplement set): both faces show Greek +
  // English gloss subtitle, with the differing characters highlighted so the
  // stem change between present and aorist is visually obvious.
  let frontHTML, backHTML;
  if (card.stemFlip) {
    const diff = diffHighlightPair(card.g, card.aorist);
    // The "other form" face is the aorist for second-aorist flips and the
    // future for liquid-future flips; key off the back-face label override.
    const revealWord = /future/i.test(card.stemFlipAorist || '') ? 'future' : 'aorist';
    const flipHint = `<div class="flip-hint">click to reveal ${revealWord} →</div>`;
    const keyBadge = card.keyVerb
      ? '<div class="card-key-verb">★ key verb</div>'
      : '';
    const noteHtml = card.stemNote
      ? `<div class="card-stem-note">${escapeHtml(card.stemNote)}</div>`
      : '';
    // The verbal stem is printed after a comma on BOTH faces (same stem each
    // side), anchoring the present↔aorist/future pair to the stem that links
    // them. Appended outside the diff HTML so it doesn't perturb the
    // char-by-char form highlighting.
    const stemSuffix = card.stem
      ? `<span class="card-stem-inline">, ${escapeHtml(card.stem)}</span>`
      : '';
    frontHTML = `
        <div class="card-face card-front card-stem-flip">
          ${requiredLabelHTML}
          ${keyBadge}
          <span class="card-label">Present</span>
          <div class="card-greek card-stem-flip-form">${diff.aHtml}${stemSuffix}</div>
          <div class="card-stem-flip-gloss">${escapeHtml(card.e || '')}</div>
          <div class="card-hint">${sourceLabelDisplay}</div>
          ${flipHint}
        </div>`;
    backHTML = `
        <div class="card-face card-back card-stem-flip">
          ${requiredLabelHTML}
          ${keyBadge}
          <span class="card-label">${escapeHtml(card.stemFlipAorist || 'Aorist (1st sg.)')}</span>
          <div class="card-greek card-stem-flip-form">${diff.bHtml}${stemSuffix}</div>
          <div class="card-stem-flip-gloss">${escapeHtml(card.aoristGloss || '')}</div>
          ${noteHtml}
          <div class="card-hint">${escapeHtml(card.g)} → ${escapeHtml(card.aorist)}</div>
        </div>`;
    area.innerHTML = `
      <div class="card-wrapper" id="cardWrapper" onclick="flipCard()">
        <div class="card-inner" id="cardInner">
          ${frontHTML}
          ${backHTML}
        </div>
      </div>`;
    runtime.isFlipped = false;
    renderProgress();
    return;
  }

  if (!runtime.directionToGreek) {
    frontHTML = `
        <div class="card-face card-front">
          ${requiredLabelHTML}
          <span class="card-label">Greek</span>
          <div class="card-greek">${greekDisplay}</div>
          ${verbStemAltHTML}
          <div class="card-hint">${sourceLabelDisplay}${declModelTag}</div>
          <div class="flip-hint">click to reveal →</div>
        </div>`;
    backHTML = `
        <div class="card-face card-back">
          ${requiredLabelHTML}
          <span class="card-label">English</span>
          <div class="card-english">${englishDisplay}</div>
          <div class="card-greek-small">${host.formatGreekHeadword(card.g)}</div>
          ${verbStemAltHTML}
          <div class="card-hint">${host.transliterateGreek(host.formatGreekHeadword(card.g))}${advancedCountSuffix}</div>
          <div class="card-pos">${host.detectPartOfSpeech(card)}</div>
        </div>`;
  } else {
    frontHTML = `
        <div class="card-face card-front">
          ${requiredLabelHTML}
          <span class="card-label">English</span>
          <div class="card-english">${englishDisplay}</div>
          <div class="card-hint">${sourceLabelDisplay}</div>
          <div class="flip-hint">click to reveal →</div>
        </div>`;
    backHTML = `
        <div class="card-face card-back">
          ${requiredLabelHTML}
          <span class="card-label">Greek</span>
          <div class="card-greek">${greekDisplay}</div>
          ${verbStemAltHTML}
          <div class="card-hint">${host.transliterateGreek(host.formatGreekHeadword(card.g))}${advancedCountSuffix}${declModelTag}</div>
          <div class="card-pos">${host.detectPartOfSpeech(card)}</div>
        </div>`;
  }

  area.innerHTML = `
    <div class="card-wrapper" id="cardWrapper" onclick="flipCard()">
      <div class="card-inner" id="cardInner">
        ${frontHTML}
        ${backHTML}
      </div>
    </div>`;

  runtime.isFlipped = false;
  renderProgress();
}

// ─── Step-by-step paradigm rendering ──────────────────────────────────────
// Walks one dimension MC per click. State is held in runtime.morphStepState
// and lazily initialized whenever the active card changes.
function ensureStepStateForCard(card) {
  const state = runtime.morphStepState;
  if (state && state.cardId === card.id) return state;
  // Build a chapter-gated distractor pool so MC choices never include
  // tenses/moods/cases the textbook hasn't introduced by the user's max
  // selected chapter (e.g. no "pluperfect" while Ch ≤ 11).
  const accessibleCards = getAccessibleMorphCards(runtime.selectedKeys);
  const accessiblePools = computeAccessibleDimensionPools(accessibleCards);
  const levels = deriveSelectionLevels(runtime.selectedKeys || []);
  const multiGenderLemmas = buildMultiGenderLemmas(accessibleCards);
  const steps = buildMorphSteps(card, accessiblePools, {
    includeAspect: runtime.aspectStep !== false,
    maxChapter: levels.maxEffectiveChapter,
    dimToggles: runtime.dimToggles,
    dimValueFilters: runtime.dimValueFilters,
    multiGenderLemmas,
    mixedFormNouns: MIXED_FORM_NOUN_LEMMAS
  });
  // Values the focused paradigm actually carries per dimension, from its full
  // (unfiltered) pool. Lets answerMorphologyStep cut the walk off when a pick
  // names a value the paradigm structurally lacks — e.g. "third person" for
  // ἐγώ/σύ, which has only 1st/2nd-person forms. Falls back to the current
  // card's own dims so a present-only-truth still includes the right answer
  // when the full pool is unavailable.
  const paradigmCards = host.getFocusedParadigmAllCards();
  const paradigmPresentValues = computeParadigmPresentValues(
    Array.isArray(paradigmCards) && paradigmCards.length ? paradigmCards : [card]
  );
  runtime.morphStepState = {
    cardId: card.id,
    steps,
    stepIdx: 0,
    answers: new Array(steps.length).fill(null),
    completed: steps.length === 0,
    // Per-dimension value sets for the focused paradigm (gap detection).
    paradigmPresentValues,
    // Kept on state so answerMorphologyStep can build ungraded follow-up
    // steps with the same chapter-gated MC choices the original steps
    // were drawn from (avoids re-computing on every answer).
    accessiblePools,
    // Dims that were skipped (chapter-gated or user-toggled off) along
    // with their canonical correct values, so the form lookup can fill
    // them in silently. Survives across renders via the cached state.
    autoFilledDims: steps.autoFilledDims || {},
    // Subset of autoFilledDims that should still appear in the rendered
    // parse summary (currently just single-gender gender) — the step
    // wasn't asked, but the dim belongs to the canonical label.
    impliedDims: steps.impliedDims || {}
  };
  return runtime.morphStepState;
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Lazily-built lookup of present-stem lemma → its second-aorist (1st sg.)
// form, derived from the W4_SECOND_AORIST_FLIP supplemental set so the data
// keeps a single source. The present and 2nd-aorist stems of these verbs
// often look nothing alike (e.g. λέγω → εἶπον, ἔρχομαι → ἦλθον), so the
// standard chapter-vocab card surfaces the aorist as a small second row to
// help associate the pair.
let secondAoristByLemma = null;
function getSecondAoristByLemma() {
  if (secondAoristByLemma) return secondAoristByLemma;
  const map = {};
  const flip = window.SUPPLEMENTAL_VOCAB_SETS && window.SUPPLEMENTAL_VOCAB_SETS.W4_SECOND_AORIST_FLIP;
  if (flip && Array.isArray(flip.cards)) {
    for (const c of flip.cards) {
      if (c && c.stemFlip && c.g && c.aorist) map[c.g] = c.aorist;
    }
  }
  // Only cache once populated, in case this runs before the data file loads.
  if (Object.keys(map).length) secondAoristByLemma = map;
  return map;
}

// Same idea for liquid futures (derived from W4_LIQUID_FUTURE_FLIP): present
// lemma → liquid-future (1st sg.) form. A verb can be both a second aorist and
// a liquid future (e.g. βάλλω → ἔβαλον / βαλῶ, ἀποθνῄσκω → ἀπέθανον /
// ἀποθανοῦμαι), so its chapter card can carry three rows.
let liquidFutureByLemma = null;
function getLiquidFutureByLemma() {
  if (liquidFutureByLemma) return liquidFutureByLemma;
  const map = {};
  const flip = window.SUPPLEMENTAL_VOCAB_SETS && window.SUPPLEMENTAL_VOCAB_SETS.W4_LIQUID_FUTURE_FLIP;
  if (flip && Array.isArray(flip.cards)) {
    for (const c of flip.cards) {
      if (c && c.stemFlip && c.g && c.aorist) map[c.g] = c.aorist;
    }
  }
  if (Object.keys(map).length) liquidFutureByLemma = map;
  return map;
}

// Lazily-built lookup of present-stem lemma → its bare verbal stem (e.g.
// ἀποθνῄσκω → ἀποθαν-), merged from both flip sets. A verb that is both a
// second aorist and a liquid future carries the same stem in each set
// (ἀποθαν- in both), so the merge is order-independent. Used to print the
// stem inline after the headword on standard chapter-vocab cards.
let verbStemByLemma = null;
function getVerbStemByLemma() {
  if (verbStemByLemma) return verbStemByLemma;
  const map = {};
  const sets = window.SUPPLEMENTAL_VOCAB_SETS;
  for (const key of ['W4_SECOND_AORIST_FLIP', 'W4_LIQUID_FUTURE_FLIP']) {
    const flip = sets && sets[key];
    if (flip && Array.isArray(flip.cards)) {
      for (const c of flip.cards) {
        if (c && c.stemFlip && c.g && c.stem) map[c.g] = c.stem;
      }
    }
  }
  if (Object.keys(map).length) verbStemByLemma = map;
  return map;
}

// Same idea for the W6 sets: present lemma → aorist passive / perfect active
// (1st sg.). The aorist-passive set carries one reference-only entry whose
// "aorist" is really a 2nd-aorist ACTIVE (ἔρχομαι → ἦλθον, flagged in its
// note) — a real aorist passive always ends in -ην (1st sg.), so forms that
// don't are skipped rather than mislabelled "aor. pass." on the vocab card.
let aoristPassiveByLemma = null;
function getAoristPassiveByLemma() {
  if (aoristPassiveByLemma) return aoristPassiveByLemma;
  const map = {};
  const flip = window.SUPPLEMENTAL_VOCAB_SETS && window.SUPPLEMENTAL_VOCAB_SETS.W6_AORIST_PASSIVE_FLIP;
  if (flip && Array.isArray(flip.cards)) {
    for (const c of flip.cards) {
      if (!c || !c.stemFlip || !c.g || !c.aorist) continue;
      const bare = String(c.aorist).normalize('NFD').replace(/\p{M}/gu, '');
      if (bare.endsWith('ην')) map[c.g] = c.aorist;
    }
  }
  if (Object.keys(map).length) aoristPassiveByLemma = map;
  return map;
}

// Perfect actives skip the self-identical entry (οἶδα is listed as its own
// perfect) — a "pf. [οἶδα]" row under the οἶδα headword says nothing.
let perfectActiveByLemma = null;
function getPerfectActiveByLemma() {
  if (perfectActiveByLemma) return perfectActiveByLemma;
  const map = {};
  const flip = window.SUPPLEMENTAL_VOCAB_SETS && window.SUPPLEMENTAL_VOCAB_SETS.W6_PERFECT_ACTIVE_FLIP;
  if (flip && Array.isArray(flip.cards)) {
    for (const c of flip.cards) {
      if (c && c.stemFlip && c.g && c.aorist && c.aorist !== c.g) map[c.g] = c.aorist;
    }
  }
  if (Object.keys(map).length) perfectActiveByLemma = map;
  return map;
}

// One small bracketed line of irregular principal parts under a standard
// chapter-vocab verb's headword, so the present is learned together with the
// forms that look nothing like it: "2 aor. [ἔλαβον] · pf. [εἴληφα] ·
// aor. pass. [ἐλήμφθην]". The second-aorist / liquid-future parts always show
// (early exposure to the NT's most common verb forms is wanted); the
// aorist-passive and perfect parts wait for the chapter that teaches them
// (Duff Ch. 15 / Ch. 16), so they never leak into an earlier deck. A null
// maxChapter (no chapter-graded selection) shows everything, matching the
// ungated legacy behavior. Returns '' for supplemental/advanced/flip cards
// and for lemmas with no recorded parts.
function verbStemAltHtml(card, maxChapter) {
  if (!card || card.advanced || card.supplemental || card.stemFlip) return '';
  // A standalone second-aorist card (the "Second aorists as cards" toggle)
  // points back at its present-stem parent instead of listing parts.
  if (card.secondAoristOf) {
    return `<div class="card-stem-alts"><span class="card-stem-alts-label">2 aor. of</span> [${escapeHtml(card.secondAoristOf)}]</div>`;
  }
  const unlocked = (ch) => maxChapter == null || maxChapter >= ch;
  const parts = [];
  const push = (label, form) =>
    parts.push(`<span class="card-stem-alts-label">${label}</span> [${escapeHtml(form)}]`);
  const aorist = getSecondAoristByLemma()[card.g];
  if (aorist) push('2 aor.', aorist);
  const future = getLiquidFutureByLemma()[card.g];
  if (future) push('fut.', future);
  const aoristPassive = getAoristPassiveByLemma()[card.g];
  if (aoristPassive && unlocked(15)) push('aor. pass.', aoristPassive);
  const perfect = getPerfectActiveByLemma()[card.g];
  if (perfect && unlocked(16)) push('pf.', perfect);
  return parts.length ? `<div class="card-stem-alts">${parts.join(' · ')}</div>` : '';
}

// Inline verbal-stem suffix (", ἀποθαν-") for a standard chapter-vocab verb,
// printed in smaller muted letters right after the headword — the same lexical
// treatment the stem-flip cards use, so the present is read together with the
// stem its 2nd-aorist / liquid-future forms are built on. Returns '' for
// supplemental/advanced/flip cards and lemmas without a recorded stem.
function verbStemInlineHtml(card) {
  if (!card || card.advanced || card.supplemental || card.stemFlip) return '';
  // Standalone second-aorist cards carry their stem directly (the lookup is
  // keyed by present-stem lemma, which their headword isn't).
  const stem = card.secondAoristOf ? card.secondAoristStem : getVerbStemByLemma()[card.g];
  return stem ? `<span class="card-stem-inline">, ${escapeHtml(stem)}</span>` : '';
}

// Bare third-declension noun stem (e.g. σαρκ-) derived from a headword that
// prints its full genitive singular ("σάρξ, σαρκός, ἡ") — Duff's rule: the
// stem is the genitive singular minus -ος. Only full consonant-stem genitives
// qualify; the abbreviated ch. 13 contract tails ("-εως", "-ους") yield ''
// since their bare stem never surfaces uncontracted in a real form. Pitch
// accents (acute/grave/circumflex) are stripped so the stem prints unaccented
// like the verbal stems; breathing marks are kept (σωτῆρος → σωτηρ-,
// ὕδατος → ὑδατ-).
function thirdDeclensionStemFromHeadword(greek) {
  // Mirrors pos_logic's primary "<nom>, <gen>, <article>" nominal pattern —
  // the only shape full third-declension genitives are written in.
  const m = String(greek || '').match(/^.*?,\s*([^,]+),\s*(?:ὁ|ἡ|τό)$/u);
  const gen = m ? m[1].trim() : '';
  if (!gen || gen.startsWith('-')) return '';
  const bare = gen.normalize('NFD').replace(/[\u0300\u0301\u0342]/g, '').normalize('NFC');
  return bare.endsWith('ος') ? `${bare.slice(0, -2)}-` : '';
}

// The third declension enters at Duff Ch. 12; its annotations (inline stem,
// "declines like" pointer) stay hidden below that. In practice the nouns
// themselves are Ch. 12+ cards so the gate is belt-and-braces, but it keeps
// the rule explicit. Null (no chapter-graded selection) shows them.
const THIRD_DECLENSION_CHAPTER = 12;

// Inline noun-stem suffix (", νυκτ-") for a standard chapter-vocab
// third-declension noun — the same smaller muted treatment the verb cards
// give their verbal stem, so νύξ is read together with the νυκτ- its other
// cases are built on. Returns '' for supplemental/advanced/flip cards and
// for headwords without a full genitive in -ος.
function nounStemInlineHtml(card, maxChapter) {
  if (!card || card.advanced || card.supplemental || card.stemFlip) return '';
  if (maxChapter != null && maxChapter < THIRD_DECLENSION_CHAPTER) return '';
  const stem = thirdDeclensionStemFromHeadword(card.g);
  return stem ? `<span class="card-stem-inline">, ${escapeHtml(stem)}</span>` : '';
}

// Third-declension model-noun anchors, keyed by the headword's first token.
// Duff teaches the declension through model paradigms (the app drills them
// as the W5 sets: σάρξ, ὄνομα, ἀστήρ, πόλις, βασιλεύς, πλείων); tagging each
// vocab noun "declines like σάρξ" turns ~35 scary nouns into six patterns.
// Curated, and deliberately conservative: nouns whose endings genuinely track
// the model are tagged; the syncopated kinship nouns (πατήρ, μήτηρ, θυγάτηρ,
// ἀνήρ), irregular-accusative χάρις (χάριν), neuter ρ-stem πῦρ, and the
// proper name Μωϋσῆς are left untagged rather than overclaim. The model
// nouns themselves carry no tag. ἔθνος anchors the Ch. 13 -ους neuters (no
// W5 paradigm set, but it heads that chapter's vocab).
const DECLENSION_MODEL_BY_HEAD = {
  // masc/fem consonant stems (Ch. 12 pattern)
  'γυνή': 'σάρξ', 'ἐλπίς': 'σάρξ', 'νύξ': 'σάρξ', 'πούς': 'σάρξ',
  'αἰών': 'σάρξ', 'ἄρχων': 'σάρξ', 'Σίμων': 'σάρξ',
  'ἀμπελών': 'σάρξ', 'εἰκών': 'σάρξ', 'Ἕλλην': 'σάρξ', 'παῖς': 'σάρξ',
  'ποιμήν': 'σάρξ',
  // ρ-stems
  'σωτήρ': 'ἀστήρ', 'χείρ': 'ἀστήρ', 'Καῖσαρ': 'ἀστήρ', 'μάρτυς': 'ἀστήρ',
  // neuter τ-stems
  'αἷμα': 'ὄνομα', 'θέλημα': 'ὄνομα', 'πνεῦμα': 'ὄνομα', 'ῥῆμα': 'ὄνομα',
  'στόμα': 'ὄνομα', 'σῶμα': 'ὄνομα', 'ὕδωρ': 'ὄνομα', 'φῶς': 'ὄνομα',
  'κρίμα': 'ὄνομα', 'σπέρμα': 'ὄνομα', 'οὖς': 'ὄνομα',
  // ι-stems (Ch. 13, gen. -εως)
  'ἀνάστασις': 'πόλις', 'γνῶσις': 'πόλις', 'δύναμις': 'πόλις',
  'θλῖψις': 'πόλις', 'κρίσις': 'πόλις', 'παράκλησις': 'πόλις',
  'πίστις': 'πόλις', 'συνείδησις': 'πόλις',
  // ευ-stems (Ch. 13, gen. -έως)
  'ἀρχιερεύς': 'βασιλεύς', 'γραμματεύς': 'βασιλεύς', 'ἱερεύς': 'βασιλεύς',
  // -ους neuters (Ch. 13)
  'ἔλεος': 'ἔθνος', 'ἔτος': 'ἔθνος', 'μέλος': 'ἔθνος', 'μέρος': 'ἔθνος',
  'ὄρος': 'ἔθνος', 'πλῆθος': 'ἔθνος', 'σκεῦος': 'ἔθνος', 'σκότος': 'ἔθνος',
  'τέλος': 'ἔθνος',
  // 3rd-decl. comparative adjectives (ν-stems)
  'μείζων': 'πλείων'
};

// " · declines like σάρξ" suffix for the hint line of the Greek-bearing card
// face. Plain text in the hint's own muted style — no extra row, so the card
// stays clean. Same guards and Ch. 12 gate as the noun stem.
function nounDeclensionModelSuffix(card, maxChapter) {
  if (!card || card.advanced || card.supplemental || card.stemFlip) return '';
  if (maxChapter != null && maxChapter < THIRD_DECLENSION_CHAPTER) return '';
  const head = String(card.g || '').split(',')[0].trim();
  const model = DECLENSION_MODEL_BY_HEAD[head];
  return model ? ` · declines like ${escapeHtml(model)}` : '';
}

// Heuristic: does any Greek head-token in the family lemma string appear
// (accent-insensitive stem-prefix) somewhere in the form? Used to suppress
// the inherited subtitle/gloss on cards where the family-level lemma
// doesn't actually match the question's vocabulary (e.g. the πιστός
// questions sitting under an ἀγαθός family in grammar.js 5.2).
//
// Returns true when nothing Greek is in either string — no signal to act
// on, so don't suppress. Returns true when the lemma's stem (first
// max(3, len-2) chars, accents stripped) shows up in any form word, OR
// vice versa (handles short lemmas like εἰμί). Suppletive pairs (εἰμί ↔
// ἐστιν) won't match — add an explicit q.lemma override there.
// True when the gloss text appears (case- and quote-insensitive) in
// exactly one of the answer choices — i.e. the gloss singles out a
// single option and steers the student toward it. When it shows up in
// zero choices the gloss is just context; when it shows up in multiple
// choices it doesn't disambiguate. Glosses under two characters are
// ignored to avoid false positives on tiny common words.
function glossPointsAtSingleChoice(gloss, choices) {
  if (!gloss || !Array.isArray(choices) || choices.length < 2) return false;
  const strip = (s) => String(s).toLowerCase().replace(/[''""‘’“”]/g, '').replace(/\s+/g, ' ').trim();
  const g = strip(gloss);
  if (g.length < 2) return false;
  let hits = 0;
  for (const c of choices) {
    if (strip(c).includes(g)) hits++;
    if (hits > 1) return false;
  }
  return hits === 1;
}

function familyLemmaAppearsInForm(lemma, form) {
  if (!lemma || !form) return true;
  const greek = /[Ͱ-Ͽἀ-῿]+/g;
  const lemmaTokens = String(lemma).match(greek) || [];
  const formTokens = String(form).match(greek) || [];
  if (!lemmaTokens.length || !formTokens.length) return true;
  const strip = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const formStems = formTokens.map(strip);
  return lemmaTokens.some((lt) => {
    const ls = strip(lt);
    if (ls.length < 2) return false;
    const stemLen = Math.max(3, ls.length - 2);
    const stem = ls.slice(0, Math.min(ls.length, stemLen));
    return formStems.some((fs) => fs.includes(stem) || stem.includes(fs));
  });
}

// Supplemental set labels follow "<lemma(s)> — <sub-paradigm>" (e.g.
// "εἰμί — infinitive and participle"). On a card face the sub-paradigm
// half leaks the parse class — drop it. Labels without an em-dash
// separator ("First and second personal pronouns") are returned as-is.
// Selectors/analytics keep the full label by going through card.sourceLabel
// directly instead of this helper.
function cardFaceLabelFromSourceLabel(label) {
  if (!label) return label;
  const idx = label.indexOf(' — ');
  return idx >= 0 ? label.slice(0, idx) : label;
}

function renderMorphStepBreadcrumb(state) {
  if (!state.steps.length) return '';
  // Reveal dots one step at a time. Showing the full breadcrumb upfront
  // leaks the parse class — e.g. an A T M C N G tail on a verb form tells
  // you it's a participle before you've answered the Mood step, because
  // only participles carry case/number/gender. Render only the answered
  // steps plus the current step until the walk completes.
  const visibleCount = state.completed
    ? state.steps.length
    : Math.min(state.steps.length, state.stepIdx + 1);
  const dots = state.steps.slice(0, visibleCount).map((step, idx) => {
    const answer = state.answers[idx];
    let cls = 'morph-step-dot';
    if (idx === state.stepIdx && !state.completed) cls += ' current';
    // Inferred steps (ungraded follow-ups) and steps whose correctness
    // is deferred pending a follow-up answer render as neutral — the
    // student shouldn't see "wrong" on mood before they've committed
    // to the dynamic person that completes their parse.
    else if (answer && (step.inferred || answer.deferred)) cls += ' neutral';
    else if (answer && answer.isCorrect === true) cls += ' correct';
    else if (answer && answer.isCorrect === false) cls += ' incorrect';
    return `<span class="${cls}" title="${escapeHtml(step.label)}">${escapeHtml(step.label[0])}</span>`;
  }).join('');
  return `<div class="morph-step-breadcrumb">${dots}</div>`;
}

function renderMorphStepCurrent(state) {
  const step = state.steps[state.stepIdx];
  if (!step) return '';
  const choiceButtons = step.displayChoices.map((label, idx) => {
    return `<button class="choice-btn" type="button" onclick="answerMorphologyStep(${idx})">${escapeHtml(label)}</button>`;
  }).join('');
  return `
    <div class="morph-step-current">
      <div class="morph-step-progress">Step ${state.stepIdx + 1}</div>
      <div class="morph-step-label">${escapeHtml(step.label)}?</div>
      <div class="morph-choices">${choiceButtons}</div>
      <div class="morph-dontknow-row">
        <button class="ctrl-btn morph-dontknow-btn" type="button" onclick="skipMorphologyStep()">I don't know</button>
        <button class="ctrl-btn morph-giveup-btn" type="button" onclick="giveUpMorphologyStep()">I give up</button>
      </div>
    </div>`;
}

// Mirrors the display-suffix logic in morph_steps.js so a person value
// like "first" reads as "first person" in correction lines too.
function applyDisplaySuffixIfPerson(dimKey, value) {
  return dimKey === 'person' ? `${value} person` : value;
}

// Builds a human-readable parse from a list of dimension values, e.g.
// ['continuous/undefined', 'present', 'indicative', 'second', 'plural'] →
// "continuous/undefined · present · indicative · second person · plural".
// Skips empty values so a partial walk still reads cleanly.
//
// Imperative cards have no Person step (it's structurally 2nd person), but
// the canonical parse still reads "...imperative · second person ·
// singular" — slot the implied 2nd-person token in after mood when no
// Person step is present.
// `impliedDims` carries dimensions that weren't asked as a step but still
// belong to the canonical parse — currently single-gender gender (λόγος
// is always masculine, the step is skipped, but the label still reads
// "...singular masculine"). Injected after the 'number' position so the
// nominal order case → number → gender is preserved.
function assembleParseLine(steps, values, impliedDims) {
  const parts = [];
  let moodImperativePos = -1;
  let hasPersonStep = false;
  let postNumberPos = -1;
  steps.forEach((step, idx) => {
    if (step.key === 'person') hasPersonStep = true;
    const v = values[idx];
    if (!v) return;
    parts.push(step.key === 'person' ? `${v} person` : v);
    if (step.key === 'mood' && String(v).toLowerCase() === 'imperative') {
      moodImperativePos = parts.length;
    }
    if (step.key === 'number') postNumberPos = parts.length;
  });
  if (moodImperativePos >= 0 && !hasPersonStep) {
    parts.splice(moodImperativePos, 0, 'second person');
    if (postNumberPos >= moodImperativePos) postNumberPos += 1;
  }
  if (impliedDims && impliedDims.gender) {
    const insertAt = postNumberPos >= 0 ? postNumberPos : parts.length;
    parts.splice(insertAt, 0, impliedDims.gender);
  }
  return parts.join(' · ');
}

// Two dimension values are compatible if they share any '/'-separated
// component. Picking 'nominative' matches an answer of 'nominative' or
// 'nominative/accusative'; picking 'nominative/accusative' matches an
// answer of 'nominative' or 'accusative' or 'nominative/accusative'.
function dimsCompatible(picked, answer) {
  if (!picked || !answer) return false;
  const pp = String(picked).split('/').filter(Boolean);
  const ap = String(answer).split('/').filter(Boolean);
  return pp.some((p) => ap.includes(p));
}

// Many paradigm-derived card answers omit voice and/or mood — the data
// extracts the parsing from the card's English-side note, so a card like
// `{ g: 'λύω', e: 'I untie / I am untying (1st person sg.)' }` produces
// the canonical "present first person singular" with no 'indicative' or
// 'active' tag, even though the set label says "λύω — present active
// indicative." For the form-lookup feedback we need those tags, otherwise
// the orphan-skip rule lets a student picking mood=imperative falsely
// match λύω. Reads what the label implies and prepends it to the answer
// string when not already present. Augmentation is local to the lookup —
// it doesn't change card.answer used by step generation or grading, so
// the student isn't suddenly asked about voice in chapters where the
// textbook hasn't introduced it.
function augmentAnswerWithLabel(answer, label) {
  if (!answer) return '';
  if (!label) return answer;
  const t = String(label).toLowerCase();
  const voiceMatch = t.match(/\b(middle\/passive|middle or passive|active|middle|passive)\b/);
  const moodMatch  = t.match(/\b(indicative|subjunctive|imperative|infinitive|participle)\b/);
  const lcAns = String(answer).toLowerCase();
  // Only augment when the answer doesn't already carry its OWN mood/voice
  // marker. Comparing against the label's first match (the previous logic)
  // misfires on labels that mention multiple moods — e.g. "εἰμί —
  // infinitive and participle" picks 'infinitive' and prepends it to every
  // participle card, so ans.mood parses as 'infinitive' and the form
  // lookup can no longer match the card on a participle pick.
  const ansHasVoice = /\b(active|middle|passive|middle\/passive)\b/.test(lcAns);
  const ansHasMood  = /\b(indicative|subjunctive|imperative|infinitive|participle)\b/.test(lcAns);
  let out = String(answer);
  if (voiceMatch && !ansHasVoice) {
    const v = voiceMatch[0].replace(/middle or passive/, 'middle/passive');
    out = `${v} ${out}`;
  }
  if (moodMatch && !ansHasMood) {
    out = `${moodMatch[0]} ${out}`;
  }
  return out;
}

// Builds a form→answer map for every morph card in `cards` whose lemma
// matches. Used as a fallback pool when the card's own paradigm subset
// doesn't cover the student's picks (e.g. λῦε lives in the active-
// imperative paradigm; 'aorist infinitive' picks point at λῦσαι in
// λύω's separate active-infinitive paradigm).
//
// Critically, `cards` should be the chapter-gated accessible deck (from
// getAccessibleMorphCards) — NOT every morph card ever defined. Voice
// isn't introduced until chapter 15 in Duff's curriculum, so a chapter-3
// student parsing λῦε must not have λύομαι (middle/passive indicative
// 1sg, chapter 15+) surfaced as a candidate match. Restricting the
// pool to accessible cards keeps the feedback aligned with what the
// student has actually been taught.
function buildLemmaFormToAnswerFromCards(lemma, cards) {
  if (!lemma) return {};
  const out = {};
  for (const c of (cards || [])) {
    if (!c || c.lemma !== lemma || !c.form) continue;
    // Prefer the canonical parsed form when the card supplies one
    // (grammar.js can ship a `parsed:` next to a sparse human answer).
    const ans = c.parsedAnswer || c.answer;
    if (!ans) continue;
    // Stem-pair study notes like 'βάλλω → ἔβαλον' aren't single forms.
    if (/→/.test(c.form)) continue;
    // Syncretic forms (e.g. λύω's ἔλυον = imperfect active 1sg AND 3pl)
    // appear in the supplemental paradigms as TWO cards with different
    // parses but the same Greek. Both readings must reach the lookup so a
    // student picking the second reading isn't told "no morph exists" —
    // collect every distinct answer per form into an array, deduping on
    // the canonical text so a card and its richer-label twin don't both
    // surface.
    const augmented = augmentAnswerWithLabel(ans, c.sourceLabel || '');
    if (!out[c.form]) out[c.form] = [];
    if (!out[c.form].includes(augmented)) out[c.form].push(augmented);
  }
  return out;
}

// Card's own paradigm pool augmented with voice/mood implied by the
// card's sourceLabel — same reason as buildLemmaFormToAnswerFromCards
// above. Without this the orphan-skip rule lets every untagged answer
// in the card's pool spuriously match whichever mood/voice the student
// picked. Same array-valued shape as buildLemmaFormToAnswerFromCards;
// most paradigm subsets don't have syncretic forms, but the matchPool
// consumer treats single answers and arrays uniformly.
function buildAugmentedCardPool(card) {
  if (!card || !card.formToAnswer || typeof card.formToAnswer !== 'object') return {};
  const out = {};
  for (const [form, answer] of Object.entries(card.formToAnswer)) {
    if (!form || !answer) continue;
    out[form] = [augmentAnswerWithLabel(answer, card.sourceLabel || '')];
  }
  return out;
}

// Aspect is derivative of tense (present → continuous/undefined, aorist →
// undefined, etc.) so it adds no form-identification information beyond
// tense. Excluded from picked-dim matching to keep the lookup focused on
// the dimensions that actually disambiguate a Greek form.
const FORM_LOOKUP_SKIP_DIMS = new Set(['aspect']);

// Citation-form priority used to pick a single canonical match when the
// student's picks underdetermine the form (e.g. picking 'present
// indicative singular' on a verb without specifying voice or person —
// six forms qualify, we want one). Lower scores win.
const VOICE_ORDER  = { active: 0, 'middle/passive': 1, middle: 2, passive: 3 };
const PERSON_ORDER = { first: 0, third: 1, second: 2 };
const NUMBER_ORDER = { singular: 0, plural: 1 };
const CASE_ORDER   = { nominative: 0, accusative: 1, genitive: 2, dative: 3, vocative: 4 };
const GENDER_ORDER = { masculine: 0, feminine: 1, neuter: 2 };
function canonicalScore(ansDims) {
  const v = VOICE_ORDER[ansDims.voice]  ?? 9;
  const p = PERSON_ORDER[ansDims.person] ?? 9;
  const n = NUMBER_ORDER[ansDims.number] ?? 9;
  const c = CASE_ORDER[ansDims.case]     ?? 9;
  const g = GENDER_ORDER[ansDims.gender] ?? 9;
  return v * 1e6 + p * 1e4 + n * 1e2 + c * 1e1 + g;
}

// Checks the student's picked parse against the lemma's negative
// morphological inventory (from js/data/lemma_inventory.js). Returns
// false only when the picks include a tense/voice/mood that genuinely
// doesn't exist for this lemma in Greek (e.g. aorist εἰμί). Lemmas with
// no inventory entry default to "all combos possible," so this function
// never spuriously reports impossibility — that's how we distinguish
// "[no morph exists]" (confident) from "—" (data gap).
function isParseImpossibleForLemma(lemma, pickedDims) {
  const inv = (typeof window !== 'undefined' && window.LEMMA_INVENTORY) ? window.LEMMA_INVENTORY[lemma] : null;
  if (!inv) return false;
  const violates = (list, picked) => {
    if (!Array.isArray(list) || !picked) return false;
    // Picked may itself be syncretic ('middle/passive'); any component
    // landing in the impossible list disqualifies the combination.
    const parts = String(picked).split('/').filter(Boolean);
    return parts.some((p) => list.includes(p));
  };
  if (violates(inv.impossibleTenses, pickedDims.tense)) return true;
  if (violates(inv.impossibleVoices, pickedDims.voice)) return true;
  if (violates(inv.impossibleMoods,  pickedDims.mood))  return true;
  return false;
}

// Mood is a structural class, not just another label: finite forms carry
// a person; participles carry case + gender; infinitives carry none of
// these. A candidate whose answer string omits an explicit mood marker
// (Duff's εἰμί cards say "Future: I will be (1sg.)" with no "indicative"
// tag) can still be disqualified by its structural shape — without this,
// picking mood=participle on εἰμί + future happily matches the finite
// ἔσομαι because per-dim matching only checks tense + number.
function structurallyCompatibleMood(pickedMood, ansDims) {
  if (!pickedMood) return true;
  const nonFinitePick = pickedMood === 'participle' || pickedMood === 'infinitive';
  if (nonFinitePick && ansDims.person) return false;
  if (!nonFinitePick && (ansDims.case || ansDims.gender) && !ansDims.person) return false;
  return true;
}

// Resolves the student's picked dimensions to one of three outcomes:
//   { kind: 'form', form }       — canonical Greek form matching the picks
//   { kind: 'impossible' }       — inventory says this combo doesn't exist
//                                  in Greek for this lemma (e.g. aorist εἰμί)
//   { kind: 'none' }             — combo is theoretically possible but no
//                                  form for it appears in our data
//
// Strategy: skip aspect (derivative of tense). Inventory check first,
// since a confident "impossible" verdict should win over a data-gap
// "—" even if the picks happen not to match anything in the pool.
// Then try the card's own paradigm subset (tightest context), broaden
// to the lemma-wide pool, then fall back to lemma_inventory.extraForms
// (paradigms Duff doesn't drill but which exist in Greek — e.g. εἰμί's
// future middle participle ἐσόμενος, so ἐσομένου can be surfaced for
// "future participle gen. sg." picks). Picks a single canonical form.
function resolveFormForPickedDims(card, steps, pickedValues, autoFilledDims) {
  if (!card) return { kind: 'none' };
  const pickedDims = {};
  steps.forEach((step, idx) => {
    const v = pickedValues[idx];
    if (v && !FORM_LOOKUP_SKIP_DIMS.has(step.key)) pickedDims[step.key] = v;
  });
  // Dims whose step was silently skipped (chapter-gated voice on active
  // cards, or user-toggled-off dims) get auto-filled with the canonical
  // correct value so the form lookup behaves as if the student had
  // picked correctly. Without this, an off-toggle would orphan-skip
  // every wrong-form candidate through the matchPool's missing-dim
  // pass and the lookup would surface noise.
  //
  // Voice exception: suppletive εἰμί is active in present/imperfect but
  // middle in future, and other paradigms split voice by tense too. The
  // auto-filled voice reflects the CARD's tense — when the student picks
  // a different tense, that voice no longer applies (a "present 2sg" pick
  // on the future ἔσεσθε should resolve to εἶ/active, not be blocked by
  // the card's middle). Drop the voice fill in that case.
  if (autoFilledDims && typeof autoFilledDims === 'object') {
    const cardDims = parseAnswerDimensions(card.parsedAnswer || card.answer || '');
    const normalizeTense = (t) => String(t || '').replace(/^(first|second)\s+/, '');
    Object.keys(autoFilledDims).forEach((k) => {
      if (FORM_LOOKUP_SKIP_DIMS.has(k)) return;
      if (pickedDims[k] || !autoFilledDims[k]) return;
      if (k === 'voice' && pickedDims.tense && cardDims.tense
          && normalizeTense(pickedDims.tense) !== normalizeTense(cardDims.tense)) {
        return;
      }
      pickedDims[k] = autoFilledDims[k];
    });
  }
  const keys = Object.keys(pickedDims);
  if (keys.length === 0) return { kind: 'none' };

  if (isParseImpossibleForLemma(card.lemma, pickedDims)) return { kind: 'impossible' };

  // A dimension the candidate answer doesn't carry (infinitives have no
  // number; finite verbs have no case) shouldn't disqualify the
  // candidate — the orphan dimension is a category error against this
  // candidate, not a disagreement. But require at least one positive dim
  // match too, otherwise a card whose answer carries no parseable dims
  // ("an equative (linking) verb...") passes every check vacuously and
  // wins the lookup for any picks. Structural mood compatibility is
  // checked separately so an unlabeled finite candidate can't satisfy a
  // participle/infinitive pick.
  const matchPool = (pool) => {
    const out = [];
    for (const [form, answers] of Object.entries(pool || {})) {
      if (!form || !answers) continue;
      // Pool values are arrays of answer strings (one per distinct parse
      // of a syncretic form, e.g. ἔλυον = imperfect active 1sg AND 3pl).
      // The lemma_inventory.extraForms fallback still hands us plain
      // strings, so handle both shapes.
      const answerList = Array.isArray(answers) ? answers : [answers];
      for (const answer of answerList) {
        if (!answer) continue;
        const ansDims = parseAnswerDimensions(answer);
        const ok = keys.every((k) => !ansDims[k] || dimsCompatible(pickedDims[k], ansDims[k]));
        if (!ok) continue;
        const hasAnyMatch = keys.some((k) => ansDims[k] && dimsCompatible(pickedDims[k], ansDims[k]));
        if (!hasAnyMatch) continue;
        if (!structurallyCompatibleMood(pickedDims.mood, ansDims)) continue;
        out.push({ form, ansDims });
      }
    }
    return out;
  };

  let candidates = matchPool(buildAugmentedCardPool(card));
  if (!candidates.length) {
    // Chapter-gated broadening: pool only forms from cards the student
    // currently has access to. Stops voice-distinguished forms (m/p,
    // passive — chapter 15+) from leaking into a chapter-3 student's
    // feedback for λύω.
    const accessibleCards = getAccessibleMorphCards(runtime.selectedKeys);
    candidates = matchPool(buildLemmaFormToAnswerFromCards(card.lemma, accessibleCards));
  }
  if (!candidates.length) {
    // Final fallback: lemma_inventory's extraForms — morphologically real
    // paradigms (εἰμί's future middle participle, etc.) that no card
    // carries. Pure lookup augmentation; not part of any study deck.
    const inv = (typeof window !== 'undefined' && window.LEMMA_INVENTORY)
      ? window.LEMMA_INVENTORY[card.lemma]
      : null;
    if (inv && inv.extraForms) candidates = matchPool(inv.extraForms);
  }
  if (!candidates.length) return { kind: 'none' };

  candidates.sort((a, b) => canonicalScore(a.ansDims) - canonicalScore(b.ansDims));
  return { kind: 'form', form: candidates[0].form };
}

function renderMorphStepSummary(card, state) {
  const rows = state.steps.map((step, idx) => {
    const answer = state.answers[idx];
    const pickedLabel = answer && answer.selectedIdx >= 0
      ? step.displayChoices[answer.selectedIdx]
      : '—';
    // A null answer means the walk ended before this step (structural
    // impossibility or a paradigm value gap short-circuited it). Render
    // neutral, no ✓/✗ — these were never asked, so they're not graded.
    if (!answer && (state.structuralImpossibility || state.paradigmGap)) {
      return `
        <div class="morph-step-summary-row morph-step-inferred">
          <span class="morph-step-summary-dim">${escapeHtml(step.label)}</span>
          <span class="morph-step-summary-pick">${escapeHtml(pickedLabel)}</span>
        </div>`;
    }
    // Inferred follow-up steps are ungraded: render the student's pick
    // without a ✓/✗ mark and without a correction arrow.
    if (step.inferred) {
      return `
        <div class="morph-step-summary-row morph-step-inferred">
          <span class="morph-step-summary-dim">${escapeHtml(step.label)}</span>
          <span class="morph-step-summary-pick">${escapeHtml(pickedLabel)}</span>
        </div>`;
    }
    const correct = answer && answer.isCorrect;
    const markClass = correct ? 'morph-step-correct' : 'morph-step-incorrect';
    const mark = correct ? '✓' : '✗';
    const acceptable = Array.isArray(step.acceptable) ? step.acceptable : [step.correct];
    const correctionInner = acceptable.map((a) => escapeHtml(applyDisplaySuffixIfPerson(step.key, a))).join(' / ');
    // For aspect mistakes, the picked value can visually overlap with the
    // correct value (picking "continuous" when the right answer is the
    // composite "continuous/undefined"). Append a one-line note that names
    // the mistake — strikethrough + arrow alone reads like a near-miss.
    let aspectNoteHtml = '';
    if (!correct && answer && answer.selectedIdx >= 0 && step.key === 'aspect' && step.context) {
      const pickedRaw = step.choices[answer.selectedIdx];
      const note = aspectMistakeNote(step.context.tense, pickedRaw, step.correct);
      if (note) aspectNoteHtml = `<span class="morph-step-aspect-note">${escapeHtml(note)}</span>`;
    }
    const showCorrection = !correct && answer
      ? `<span class="morph-step-correction">→ ${correctionInner}</span>${aspectNoteHtml}`
      : '';
    return `
      <div class="morph-step-summary-row ${markClass}">
        <span class="morph-step-summary-dim">${escapeHtml(step.label)}</span>
        <span class="morph-step-summary-pick">${escapeHtml(pickedLabel)} ${mark}</span>
        ${showCorrection}
      </div>`;
  }).join('');

  // X/N excludes inferred (ungraded) follow-up steps and steps that were
  // never asked because a structural impossibility ended the walk early.
  // X/N excludes inferred (ungraded) follow-up steps and steps that were
  // never asked because a structural impossibility ended the walk early.
  const gradedCount = state.steps.filter((s, i) => !s.inferred && state.answers[i]).length;
  const totalCorrect = state.answers.filter((a, i) => a && a.isCorrect && !state.steps[i].inferred).length;
  const totalStr = `${totalCorrect}/${gradedCount} correct`;

  // Side-by-side "Your parse" vs "Correct parse" with the corresponding
  // Greek form under each. Shown on every walk (right or wrong) so the
  // parse → form mapping is reinforced consistently. Under "Your parse"
  // we resolve a single canonical paradigm form for the picks; if the
  // picks violate the lemma's morphological inventory (aorist εἰμί,
  // middle/passive εἰμί, …) we say so explicitly. Under "Correct parse"
  // we always show the card's own form.
  const pickedValues = state.steps.map((step, idx) => {
    const ans = state.answers[idx];
    return ans && ans.selectedIdx >= 0 ? step.choices[ans.selectedIdx] : '';
  });
  const correctValues = state.steps.map((step) => step.correct);
  // A structural impossibility (e.g. future imperative) or a paradigm value
  // gap (e.g. third person for ἐγώ/σύ) trumps any lemma lookup — show the
  // specific reason instead of the generic "[no morph exists]" we'd fall back
  // to from the inventory check.
  const structReason = (state.structuralImpossibility && state.structuralImpossibility.reason)
    || (state.paradigmGap && state.paradigmGap.short);
  let yourFormHtml;
  if (structReason) {
    yourFormHtml = `<div class="morph-step-parse-match morph-step-parse-match-impossible">[${escapeHtml(structReason)}]</div>`;
  } else {
    const lookup = resolveFormForPickedDims(card, state.steps, pickedValues, state.autoFilledDims);
    if (lookup.kind === 'form') {
      yourFormHtml = `<div class="morph-step-parse-match">${escapeHtml(lookup.form)}</div>`;
    } else if (lookup.kind === 'impossible') {
      yourFormHtml = `<div class="morph-step-parse-match morph-step-parse-match-impossible">[no morph exists]</div>`;
    } else {
      yourFormHtml = `<div class="morph-step-parse-match morph-step-parse-match-empty">—</div>`;
    }
  }
  const correctFormHtml = card.form
    ? `<div class="morph-step-parse-match">${escapeHtml(card.form)}</div>`
    : '';
  const youParseLine = `<div class="morph-step-parse-compare">
       <div class="morph-step-parse-line morph-step-parse-line-yours">
         <span class="morph-step-parse-label">Your parse</span>
         ${escapeHtml(assembleParseLine(state.steps, pickedValues, state.impliedDims) || '—')}
         ${yourFormHtml}
       </div>
       <div class="morph-step-parse-line morph-step-parse-line-correct">
         <span class="morph-step-parse-label">Correct parse</span>
         ${escapeHtml(assembleParseLine(state.steps, correctValues, state.impliedDims))}
         ${correctFormHtml}
       </div>
     </div>`;

  const lemmaSummary = summarizeLemmaStats(runtime.paradigmStepStats || {}, card.lemma, host.getEnabledParsingDims());
  const recentLine = lemmaSummary.attempts > 0
    ? `<div class="morph-step-rollup-recent">Last ${lemmaSummary.attempts}/${getParadigmStepAttemptWindow()} attempts for ${escapeHtml(card.lemma)}: ${lemmaSummary.correct}/${lemmaSummary.total} dimensions correct (${Math.round(100 * lemmaSummary.correct / Math.max(1, lemmaSummary.total))}%)</div>`
    : '';

  // Stem-change footer: if the parsed form is in a tense whose stem differs
  // from the present lemma (aorist family, perfect, pluperfect), surface the
  // present → form pair so the student sees the stem association alongside
  // the completed parse.
  const STEM_CHANGE_TENSES = new Set(['aorist', 'first aorist', 'second aorist', 'perfect', 'pluperfect']);
  const parsedDims = parseAnswerDimensions(card.answer);
  const stemChangeNote = (STEM_CHANGE_TENSES.has(parsedDims.tense) && card.lemma && card.form && card.lemma !== card.form)
    ? `<div class="morph-step-stem-note"><span class="morph-step-stem-label">Stem change</span> ${escapeHtml(card.lemma)} → ${escapeHtml(card.form)}</div>`
    : '';

  // Ambiguity footer: 2nd-plural present is spelt identically in the
  // indicative and imperative (λύετε, λύεσθε), so the form alone doesn't
  // pick a mood — flag it so the student sees why both readings score
  // correct on the Mood step.
  const ambigNote = isSecondPluralPresentMoodAmbiguity(card.answer, parsedDims)
    ? `<div class="morph-step-ambig-note"><span class="morph-step-ambig-label">Ambiguous form</span> 2nd-plural present is spelt the same in the indicative and the imperative — only context picks the mood. Either reading is accepted.</div>`
    : '';

  // "How to tell it apart" hints for forms that are easy to confuse with a
  // neighbouring parse (e.g. present vs future — the σ). Tucked behind a
  // collapsed "Hint" disclosure so the summary stays short; the ambiguity note
  // above is deliberately NOT collapsed (it explains why a mark was accepted).
  const tellApartItems = confusableFormHints(card.parsedAnswer || card.answer, parseAnswerDimensions(card.parsedAnswer || card.answer), card.form);
  const tellApartHints = tellApartItems.length
    ? `<details class="morph-step-hint">
         <summary class="morph-step-hint-summary">Hint</summary>
         <div class="morph-step-hint-body">${tellApartItems.map((hint) => `<div class="morph-step-hint-note">${escapeHtml(hint)}</div>`).join('')}</div>
       </details>`
    : '';

  // Inferred-person note: an imperative form has no person contrast in Koine
  // (it's 2nd person by default), so its walk omits the Person step entirely.
  // When the student instead picks a finite mood (indicative/subjunctive), we
  // inject an ungraded Person step so their picks still resolve to a single
  // form — but the resulting row carries no ✓/✗, which reads like a bug
  // without explanation. Name why the row is ungraded.
  const gradedMoodStep = state.steps.find((s) => s.key === 'mood' && !s.inferred);
  const hasInferredPerson = state.steps.some((s) => s.key === 'person' && s.inferred);
  const personInferredNote = (hasInferredPerson && gradedMoodStep && gradedMoodStep.correct === 'imperative')
    ? `<div class="morph-step-person-note"><span class="morph-step-person-label">Person not graded</span> the imperative is 2nd person by default, so ${escapeHtml(card.form || card.lemma)} is parsed without a person — picking a finite mood is what added the Person step, so it isn't scored.</div>`
    : '';

  // Paradigm-gap note: the student picked a value the focused paradigm has no
  // forms for (e.g. third person for ἐγώ/σύ), so the walk cut off early. Name
  // the gap so the dropped downstream steps don't read as a bug.
  const paradigmGapNote = state.paradigmGap
    ? `<div class="morph-step-gap-note"><span class="morph-step-gap-label">No such form</span> ${escapeHtml(state.paradigmGap.note)}</div>`
    : '';

  return `
    <div class="morph-step-summary">
      <div class="morph-step-summary-title">Parse complete — ${escapeHtml(totalStr)}</div>
      <div class="morph-step-summary-body">${rows}</div>
      ${youParseLine}
      ${paradigmGapNote}
      ${ambigNote}
      ${tellApartHints}
      ${personInferredNote}
      ${stemChangeNote}
      ${recentLine}
      <div class="morph-step-summary-meta">${escapeHtml(card.lemma)}${card.family ? ' · ' + escapeHtml(card.family) : ''}</div>
    </div>`;
}

// ── English → Greek parsing (reverse direction) ──────────────────────────
// Forward parsing walks a Greek form's parse one dimension at a time. The
// reverse drill flips it: show the requested parse (restricted to the dims
// the student has enabled) and offer a multiple-choice of Greek forms drawn
// from the same focused paradigm — they pick the form that matches.

const PARSE_DISPLAY_ORDER = ['tense', 'voice', 'mood', 'person', 'number', 'case', 'gender'];

// In-place Fisher–Yates; returns the same array for chaining.
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Readable parse from a card's canonical answer, limited to the enabled dims.
// "third" reads as "third person"; empty dims are skipped so a narrowed dim
// scope still reads cleanly.
function reverseParseLine(card, enabledDims) {
  const dims = parseAnswerDimensions(card.parsedAnswer || card.answer || '');
  const parts = [];
  PARSE_DISPLAY_ORDER.forEach((k) => {
    if (enabledDims && enabledDims[k] === false) return;
    const v = dims[k];
    if (!v) return;
    parts.push(k === 'person' ? `${v} person` : v);
  });
  return parts.join(' · ');
}

// Stable identity for a card's parse under the enabled dims — two cards with
// the same key are indistinguishable answers to the same requested parse, so
// one must never appear as a distractor for the other.
function reverseParseKey(card, enabledDims) {
  const dims = parseAnswerDimensions(card.parsedAnswer || card.answer || '');
  return PARSE_DISPLAY_ORDER
    .filter((k) => !(enabledDims && enabledDims[k] === false))
    .map((k) => dims[k] || '')
    .join('|');
}

// Build (and cache, per card) the MC option list for the reverse drill: the
// correct form plus up to three distractor forms from the focused-paradigm
// pool. Distractors must be a different Greek string AND a different parse
// (under the enabled dims) so exactly one option is right. Falls back to
// however many distinct forms exist for small paradigms.
function ensureReverseChoices(card) {
  const cached = runtime.parsingReverseState;
  if (cached && cached.cardId === card.id && Array.isArray(cached.options) && cached.options.length) {
    return cached;
  }
  const enabledDims = host.getEnabledParsingDims();
  const pool = Array.isArray(runtime.originalDeck) ? runtime.originalDeck : [];
  const correctForm = card.form;
  const targetKey = reverseParseKey(card, enabledDims);
  const seenForms = new Set([String(correctForm).trim()]);
  const distractors = [];
  let lookalikeNote = '';
  // Accent / breathing look-alike distractor (toggle-optional, off by default):
  // a curated twin that differs from the tested form only by accent/breathing
  // and is a different word. Added before the pool distractors so it survives
  // the 3-distractor cap, and never via the pool's same-parse filter (its whole
  // point is that it shares the dimensions but not the spelling).
  if (runtime.accentLookalikes) {
    for (const twin of accentLookalikesFor(correctForm)) {
      if (distractors.length >= 3) break;
      const tform = String(twin.form).trim();
      if (!tform || seenForms.has(tform)) continue;
      seenForms.add(tform);
      distractors.push(twin.form);
      if (!lookalikeNote) lookalikeNote = twin.note;
    }
  }
  shuffleInPlace([...pool]).forEach((c) => {
    if (distractors.length >= 3) return;
    if (!c || !c.form) return;
    const formKey = String(c.form).trim();
    if (seenForms.has(formKey)) return;
    if (reverseParseKey(c, enabledDims) === targetKey) return;
    seenForms.add(formKey);
    distractors.push(c.form);
  });
  const options = shuffleInPlace([correctForm, ...distractors]);
  const state = { cardId: card.id, options, correctForm, lookalikeNote };
  runtime.parsingReverseState = state;
  return state;
}

function renderParsingReverseCard(area, card) {
  const enabledDims = host.getEnabledParsingDims();
  const parseLine = reverseParseLine(card, enabledDims);
  const { options, correctForm, lookalikeNote } = ensureReverseChoices(card);
  const answered = runtime.morphAnswerState.answered;
  const selectedIdx = runtime.morphAnswerState.selectedIndex;

  const stepSourceLabel = card.supplemental
    ? cardFaceLabelFromSourceLabel(card.sourceLabel || '')
    : (card.sourceLabel || '');

  const choiceButtons = options.map((form, idx) => {
    const classes = ['choice-btn', 'choice-btn-greek'];
    if (answered) {
      if (form === correctForm) classes.push('correct');
      if (idx === selectedIdx && form !== correctForm) classes.push('incorrect');
    }
    return `<button class="${classes.join(' ')}" type="button" ${answered ? 'disabled' : ''} onclick="answerParsingReverseChoice(${idx})">${escapeHtml(form)}</button>`;
  }).join('');

  const dontKnowHtml = answered
    ? ''
    : `<div class="morph-dontknow-row">
         <button class="ctrl-btn morph-dontknow-btn" type="button" onclick="answerParsingReverseChoice(-1)">I don't know</button>
       </div>`;

  let resultHtml = '';
  if (answered) {
    const isCorrect = runtime.morphAnswerState.isCorrect;
    const glossLine = (card.gloss || card.lemmaGloss)
      ? `<div class="morph-gloss">Gloss: “${escapeHtml(card.gloss || card.lemmaGloss)}”</div>`
      : '';
    // When an accent/breathing look-alike was offered, name the distinction
    // after the answer (whether they hit or missed) so the spelling contrast
    // is reinforced.
    const lookalikeHtml = lookalikeNote
      ? `<div class="morph-step-ambig-note"><span class="morph-step-ambig-label">Accent / breathing</span> ${escapeHtml(lookalikeNote)}</div>`
      : '';
    resultHtml = `<div class="morph-result ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="morph-result-title">${isCorrect ? 'Correct' : 'Not quite'}</div>
        <div class="morph-result-body">${escapeHtml(parseLine)} = ${escapeHtml(correctForm)}</div>
        <div class="morph-result-meta">${escapeHtml(card.lemma || '')}${card.family ? ` · ${escapeHtml(card.family)}` : ''}</div>
        ${glossLine}
        ${lookalikeHtml}
      </div>`;
  }

  area.innerHTML = `
    <div class="morph-card morph-step-card">
      <div class="morph-label">Grammar · English → Greek</div>
      <div class="morph-prompt">Pick the form that matches this parse.</div>
      <div class="morph-form">${escapeHtml(card.lemma || card.form)}</div>
      <div class="morph-step-label">${escapeHtml(parseLine)}</div>
      <div class="morph-source">${escapeHtml(stepSourceLabel)}</div>
      <div class="morph-choices">${choiceButtons}</div>
      ${dontKnowHtml}
      ${resultHtml}
    </div>`;
  runtime.isFlipped = false;
  renderProgress();
}

function renderMorphStepCard(area, card) {
  const state = ensureStepStateForCard(card);
  // Hide the gloss until the parse is complete — a per-form gloss like
  // "you will be" on ἔσεσθε would otherwise hand the student tense/person/
  // number on a plate. Revealed in the summary, where it's reinforcement
  // rather than a giveaway.
  const lemmaGloss = state.completed && (card.gloss || card.lemmaGloss)
    ? `<div class="morph-gloss">Gloss: “${escapeHtml(card.gloss || card.lemmaGloss)}”</div>`
    : '';

  const body = state.completed
    ? renderMorphStepSummary(card, state)
    : renderMorphStepCurrent(state);

  const stepSourceLabel = card.supplemental
    ? cardFaceLabelFromSourceLabel(card.sourceLabel || '')
    : (card.sourceLabel || '');
  // The italic line under the form is a reading aid — a transliteration of
  // the form the student is parsing, so they can sound it out. Printing the
  // lemma here (the old behavior) doubled up with the source-label prefix
  // and, on cards where the form IS the lemma (εἰμί = 1sg present), just
  // duplicated the form in italics. The lemma still appears in the
  // source-label prefix and in the post-parse summary meta.
  const formTransliteration = typeof window !== 'undefined' && typeof window.transliterateGreek === 'function'
    ? window.transliterateGreek(card.form || '')
    : '';
  const hintHtml = formTransliteration
    ? `<div class="morph-hint">${escapeHtml(formTransliteration)}</div>`
    : '';
  area.innerHTML = `
    <div class="morph-card morph-step-card">
      <div class="morph-label">Grammar · Step-by-step</div>
      <div class="morph-prompt">Parse this form one dimension at a time.</div>
      ${lemmaGloss}
      <div class="morph-form">${escapeHtml(card.form)}</div>
      ${hintHtml}
      <div class="morph-source">${escapeHtml(stepSourceLabel)} · Use “continuous/undefined” when the form licenses either reading</div>
      ${renderMorphStepBreadcrumb(state)}
      ${body}
    </div>`;
  runtime.isFlipped = false;
  renderProgress();
}

// Split a string into "letter units" — a base character plus any combining
// diacritics that follow it. `full` keeps every mark for display (re-composed
// to NFC so it renders normally); `key` is what the diff compares against —
// the base letter plus its *meaningful* marks (breathing, diaeresis, iota
// subscript), with only the pitch accents (acute/grave/circumflex) stripped.
// Breathing is taught in this class, so it stays significant; the unwritten
// accent rules are the only thing we don't want lighting up the highlight.
const ACCENT_MARKS = /[̀́̀́͂]/; // grave, acute, perispomeni (+ tonos variants); breathing/diaeresis/iota kept
function toLetterUnits(s) {
  const units = [];
  for (const ch of String(s || '').normalize('NFD')) {
    if (/[̀-ͯ]/.test(ch) && units.length) {
      // Combining mark — attach to the preceding base letter for display,
      // and to its comparison key unless it's a pitch accent.
      const u = units[units.length - 1];
      u.full += ch;
      if (!ACCENT_MARKS.test(ch)) u.key += ch;
    } else {
      units.push({ key: ch, full: ch });
    }
  }
  // Display form keeps all marks but renders as a normal precomposed glyph.
  units.forEach((u) => { u.full = u.full.normalize('NFC'); });
  return units;
}

// LCS-based diff between two strings (typically a present and an aorist
// Greek form). Returns {aHtml, bHtml} where matching letters render plain and
// differing letters get wrapped in <span class="stem-diff">.
// Used by the second-aorist flip-card supplement to visualize stem changes.
//
// By default the diff compares letters with the pitch accents stripped (see
// toLetterUnits), so an accent-only difference never lights up — our class
// doesn't cover the full accent rules, and highlighting accent shifts would
// distract from the actual stem change. Breathing marks still count, and
// accents are still shown on the letters; they just don't drive the highlight.
//
// The one exception: when the two forms are identical once pitch accents are
// stripped, the accent is the *only* thing telling them apart (e.g. the liquid
// present κρίνω vs. future κρινῶ — same letters, the circumflex is the whole
// signal). There's no stem change to highlight, so we fall back to comparing
// the fully accented glyphs, letting the differentiating accent light up rather
// than the card showing no highlight at all.
function diffHighlightPair(a, b) {
  const A = toLetterUnits(a);
  const B = toLetterUnits(b);
  if (!A.length || !B.length) return { aHtml: escapeHtml(a || ''), bHtml: escapeHtml(b || '') };
  // If the bare (accent-stripped) letters match end to end, the accent is the
  // sole differentiator, so compare the full accented glyph; otherwise compare
  // the accent-stripped key so only real letter changes drive the highlight.
  const sameBareLetters = A.length === B.length && A.every((u, idx) => u.key === B[idx].key);
  const keyOf = sameBareLetters ? (u) => u.full : (u) => u.key;
  // Standard LCS DP table over the chosen comparison key.
  const m = A.length, n = B.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      dp[i + 1][j + 1] = keyOf(A[i]) === keyOf(B[j]) ? dp[i][j] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  // Walk back to mark which positions in A and B are part of the common
  // subsequence; anything else gets the diff highlight.
  const inLCS_A = new Array(m).fill(false);
  const inLCS_B = new Array(n).fill(false);
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (keyOf(A[i - 1]) === keyOf(B[j - 1])) {
      inLCS_A[i - 1] = true;
      inLCS_B[j - 1] = true;
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  const wrap = (units, mask) => units.map((u, idx) =>
    mask[idx] ? escapeHtml(u.full) : `<span class="stem-diff">${escapeHtml(u.full)}</span>`
  ).join('');
  return { aHtml: wrap(A, inLCS_A), bHtml: wrap(B, inLCS_B) };
}

export function flipCard() {
  const wrapper = document.getElementById('cardWrapper');
  if (!wrapper) return;
  host.noteStudyInteraction();
  runtime.isFlipped = !runtime.isFlipped;
  wrapper.classList.toggle('flipped', runtime.isFlipped);

  if (runtime.isFlipped && host.maybeReturnKnownCardToActivePile()) {
    renderProgress();
    renderReview();
    host.saveState();
  }
}
