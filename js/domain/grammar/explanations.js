// Grammar explanation helpers — pure functions
import { PARSING_EXAMPLES } from '../../data/parsing_examples.js';
import { CONCEPT_EXAMPLES } from '../../data/concept_examples.js';
import { GRAMMAR_EXAMPLE_MAP } from '../../data/grammar_examples.js';

export function isMorphCard(card) {
  return !!(card && card.kind === 'morph');
}

export function normalizeParsingLabel(text) {
  if (!text) return '';
  return String(text)
    .replace(/\s+of\s+[^\s,]+(\s*\([^)]*\))?/gi, '')
    .replace(/[()]/g, ' ')
    .replace(/[''""\"']/g, '')
    .replace(/\b1st\b/gi, 'first')
    .replace(/\b2nd\b/gi, 'second')
    .replace(/\b3rd\b/gi, 'third')
    .replace(/\bsg\./gi, 'singular')
    .replace(/\bpl\./gi, 'plural')
    .replace(/\bmasc\./gi, 'masculine')
    .replace(/\bfem\./gi, 'feminine')
    .replace(/\bneut\./gi, 'neuter')
    .replace(/\bnom\./gi, 'nominative')
    .replace(/\bgen\./gi, 'genitive')
    .replace(/\bdat\./gi, 'dative')
    .replace(/\bacc\./gi, 'accusative')
    .replace(/\bvoc\./gi, 'vocative')
    .replace(/\bfirst aorist\b/gi, 'aorist')
    .replace(/\bsecond aorist\b/gi, 'aorist')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function lookupParsingExample(label) {
  if (!label) return null;
  return PARSING_EXAMPLES[normalizeParsingLabel(label)] || null;
}

export function lookupConceptExample(label) {
  if (!label) return null;
  return CONCEPT_EXAMPLES[String(label).trim()] || null;
}

export function normalizeGrammarAnswerText(answer) {
  return String(answer || '')
    .replace(/\b1st\b/g, 'first')
    .replace(/\b2nd\b/g, 'second')
    .replace(/\b3rd\b/g, 'third')
    .replace(/\bsg\./gi, 'singular')
    .replace(/\bpl\./gi, 'plural')
    .replace(/\bnom\./gi, 'nominative')
    .replace(/\bgen\./gi, 'genitive')
    .replace(/\bdat\./gi, 'dative')
    .replace(/\bacc\./gi, 'accusative')
    .replace(/\bvoc\./gi, 'vocative')
    .replace(/\bmasc\./gi, 'masculine')
    .replace(/\bfem\./gi, 'feminine')
    .replace(/\bneut\./gi, 'neuter')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getGrammarExplanation(card) {
  if (!isMorphCard(card)) return '';
  const prompt = String(card.prompt || '').toLowerCase();
  const answer = normalizeGrammarAnswerText(card.answer || '');
  if (!answer) return '';

  if (/parse|identify this form|parse this article|parse this relative pronoun|parse this form of/i.test(prompt)) {
    if (card.gloss) {
      return `Plain English: “${card.gloss}.”`;
    }
    return `Plain English: ${answer}.`;
  }

  if (/translate/i.test(prompt)) {
    return `Translation: ${answer}.`;
  }

  if (/which use is this|what position is|what construction is this|what declension and gender|what stem class is this|what tense is this|what voice meanings are possible/i.test(prompt)) {
    return `Explanation: ${answer}.`;
  }

  return '';
}

export function getGrammarExample(card) {
  if (!isMorphCard(card)) return null;
  const directKey = `${card.form || ''}|${card.answer || ''}`;
  return GRAMMAR_EXAMPLE_MAP[directKey] || null;
}

function renderWrongAnswerBlock(wrongLabel, data) {
  const greekHtml = data.greek
    ? `<div class="morph-wrong-greek">${data.greek}</div>`
    : '';
  const englishHtml = data.english
    ? `<div class="morph-wrong-english">\u201C${data.english}\u201D</div>`
    : '';
  const whyHtml = data.why
    ? `<div class="morph-wrong-why">${data.why}</div>`
    : '';
  return `
    <div class="morph-wrong-explanation">
      <div class="morph-wrong-label">If it were \u201C${wrongLabel}\u201D it would look like:</div>
      ${greekHtml}
      ${englishHtml}
      ${whyHtml}
    </div>`;
}

export function buildWrongAnswerExplanation(card, selectedChoice) {
  if (!card || !selectedChoice || selectedChoice === card.answer) return '';

  const authored = card.explanations && card.explanations[selectedChoice];
  if (authored && (authored.english || authored.greek || authored.why)) {
    return renderWrongAnswerBlock(selectedChoice, authored);
  }

  const concept = lookupConceptExample(selectedChoice);
  if (concept) return renderWrongAnswerBlock(selectedChoice, concept);

  const parsing = lookupParsingExample(selectedChoice);
  if (parsing) return renderWrongAnswerBlock(selectedChoice, parsing);

  return '';
}

function buildReverseWrongExplanation(card, selectedGreekForm) {
  if (!card || !selectedGreekForm || selectedGreekForm === card.form) return '';
  const lookupParse = card.formToAnswer && card.formToAnswer[selectedGreekForm];
  const parseLabel = lookupParse || '';
  const whyParts = [];
  if (parseLabel) whyParts.push(`${selectedGreekForm} is parsed as ${parseLabel}.`);
  whyParts.push(`The form you wanted is ${card.form} (${card.answer}).`);
  return `
    <div class="morph-wrong-explanation">
      <div class="morph-wrong-label">If you picked “${selectedGreekForm}”:</div>
      <div class="morph-wrong-greek">${selectedGreekForm}</div>
      <div class="morph-wrong-why">${whyParts.join(' ')}</div>
    </div>`;
}

export function buildGrammarSupportHtml(card, wrongChoice, options = {}) {
  const reversed = !!(options && options.reversed);
  const explanation = getGrammarExplanation(card);
  const example = getGrammarExample(card);
  const rationaleHtml = card.rationale
    ? `<div class="morph-rationale">${card.rationale}</div>`
    : '';
  const explanationHtml = explanation ? `<div class="morph-explanation">${explanation}</div>` : '';
  const exampleHtml = example
    ? `<div class="morph-example">
         <div class="morph-example-label">Example</div>
         <div class="morph-example-greek">${example.greek}</div>
         <div class="morph-example-english">${example.english || ''}</div>
       </div>`
    : '';
  let wrongHtml = '';
  if (wrongChoice) {
    wrongHtml = reversed
      ? buildReverseWrongExplanation(card, wrongChoice)
      : buildWrongAnswerExplanation(card, wrongChoice);
  }
  return explanationHtml + rationaleHtml + exampleHtml + wrongHtml;
}
