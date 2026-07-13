// Progress overlay: hero stats (streak / today / coverage / seen), a
// GitHub-style activity heatmap, per-subject mastery bars, a due forecast, and
// a weak-spots list. Reads from the shared store; writes nothing.

import { DATA, state, dayKey } from './store.js';
import { getConfidencePct } from '../domain/srs/confidence.js';
import { escapeHtml } from '../utils/text.js';
import { computeXpAndLevel, computeStreaks, computeBadges } from './gamification.js';
import { loadRecords } from './scoreRecords.js';
import { gradeBadgeHtml } from './scoreUi.js';

const CATECHISMS = (typeof window !== 'undefined' && window.PCA_CATECHISMS) || null;

// Catechism-mode mastery (the Catechisms reader's own progress namespace,
// `cat:<cat>:<n>`), kept separate from the subject-deck mastery bars / week plan.
function catechismMasteryHtml() {
  if (!CATECHISMS) return '';
  const rows = Object.values(CATECHISMS).map(c => {
    const items = c.items || [];
    if (!items.length) return '';
    const confirmed = items.filter(it => {
      const p = state.progress[`cat:${c.id}:${it.n}`];
      return p && p.firstConfirmedAt;
    }).length;
    const pct = Math.round((confirmed / items.length) * 100);
    return `<div class="mastery-row">
        <div class="mastery-head"><span>${escapeHtml(c.short || c.label)}</span>
          <span class="mastery-meta">${confirmed}/${items.length} confirmed · ${pct}%</span></div>
        <div class="mastery-bar"><div class="mastery-fill" style="width:${pct}%"></div></div>
      </div>`;
  }).filter(Boolean).join('');
  return rows ? `<div class="prog-section-title">Catechism mastery</div>${rows}` : '';
}

// Best scores: Quiz per-subject + Mock exam per-section/variant high-score
// records (js/app/scoreRecords.js) — a compact right-aligned row per record,
// shown only once at least one exists (a fresh install has no ranked history).
const EXAM_SECTION_LABELS = { bible: 'Bible Knowledge', theology: 'Theology', bco: 'BCO', mixed: 'All sections' };

function quizRecordLabel(subjectId) {
  const subj = DATA.subjects.find(s => s.id === subjectId);
  return subj ? subj.label : subjectId;
}

// variantKey is 'format:length' (e.g. 'mixed:full', 'mcq:quick').
function examRecordLabel(sectionId, variantKey) {
  const [format, length] = String(variantKey).split(':');
  const lengthLabel = length ? length.charAt(0).toUpperCase() + length.slice(1) : length;
  const formatLabel = format === 'mcq' ? 'MCQ only' : 'Mixed';
  const sectionLabel = EXAM_SECTION_LABELS[sectionId] || sectionId;
  return `Mock exam · ${sectionLabel} · ${lengthLabel}, ${formatLabel}`;
}

function bestScoreRow(label, rec) {
  return `<div class="best-score-row">
      <span class="best-score-label">${escapeHtml(label)}</span>
      <span class="best-score-right">${rec.pct}% · ${rec.correct}/${rec.total} ${gradeBadgeHtml(rec)}</span>
    </div>`;
}

function bestScoresHtml() {
  const records = loadRecords();
  const quizRows = Object.entries(records.quiz || {})
    .map(([subjectId, rec]) => bestScoreRow(quizRecordLabel(subjectId), rec));
  const examRows = [];
  for (const [sectionId, variants] of Object.entries(records.exam || {})) {
    for (const [variantKey, rec] of Object.entries(variants || {})) {
      examRows.push(bestScoreRow(examRecordLabel(sectionId, variantKey), rec));
    }
  }
  if (!quizRows.length && !examRows.length) return '';
  return `<div class="prog-section-title">Best scores</div>${quizRows.join('')}${examRows.join('')}`;
}

// A ~17-week heatmap, columns = weeks, rows = days (Sun→Sat), shaded by volume.
function heatmapHtml() {
  const DAYS = 119;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (DAYS - 1));
  start.setDate(start.getDate() - start.getDay()); // align to Sunday
  const cells = [];
  let max = 1;
  for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const c = state.activity[dayKey(d.getTime())] || 0;
    if (c > max) max = c;
    cells.push({ k: dayKey(d.getTime()), c });
  }
  const level = (c) => c === 0 ? 0 : c >= max * 0.75 ? 4 : c >= max * 0.5 ? 3 : c >= max * 0.25 ? 2 : 1;
  let cols = '';
  for (let i = 0; i < cells.length; i += 7) {
    cols += '<div class="hm-col">' + cells.slice(i, i + 7).map(cell =>
      `<div class="hm-cell hm-l${level(cell.c)}" title="${cell.k}: ${cell.c} review${cell.c === 1 ? '' : 's'}"></div>`).join('') + '</div>';
  }
  return `<div class="heatmap">${cols}</div>`;
}

// Build the overlay body. `onStudyWeak` is invoked when the user taps "Study
// weak spots". Returns the HTML; the caller wires the button after injecting it.
export function progressBodyHtml() {
  const now = Date.now();
  let totalCards = 0, seen = 0, dueNow = 0, due24 = 0, due7 = 0;
  const weak = [];
  const subjStats = [];
  for (const subj of DATA.subjects.slice().sort((a, b) => (a.order || 0) - (b.order || 0))) {
    let st = 0, ss = 0, sumPct = 0, pctN = 0;
    for (const k of subj.setKeys) {
      const set = DATA.sets[k];
      if (!set) continue;
      for (const c of set.cards) {
        totalCards++; st++;
        const p = state.progress[c.id];
        if (p && p.reps) {
          seen++; ss++;
          const pct = getConfidencePct(p);
          if (pct != null) { sumPct += pct; pctN++; if (pct < 60) weak.push({ q: c.q, pct }); }
          if (p.dueAt && p.dueAt <= now) dueNow++;
          else if (p.dueAt && p.dueAt <= now + 86400000) due24++;
          else if (p.dueAt && p.dueAt <= now + 7 * 86400000) due7++;
        }
      }
    }
    subjStats.push({ label: subj.label, ss, st, avg: pctN ? Math.round(sumPct / pctN) : 0 });
  }
  if (!totalCards) return { html: '<p>No content loaded.</p>', hasWeak: false };

  const newCount = totalCards - seen;
  const coverage = totalCards ? Math.round((seen / totalCards) * 100) : 0;
  const today = state.activity[dayKey(now)] || 0;
  const streaks = computeStreaks(state.activity);

  // ── Level / XP banner ─────────────────────────────────────────────────
  const { totalXp, currentLevel, nextLevel, levelProgress } = computeXpAndLevel(state.xp);
  const xpToNext = nextLevel ? nextLevel.threshold - totalXp : 0;
  const levelBanner = `<div class="prog-level">
      <div class="prog-level-head">
        <span class="prog-level-badge">Lv ${currentLevel.level}</span>
        <span class="prog-level-title">${escapeHtml(currentLevel.title)}</span>
        <span class="prog-level-xp">${totalXp.toLocaleString()} XP</span>
      </div>
      <div class="prog-level-flav">${escapeHtml(currentLevel.flav)}</div>
      <div class="prog-level-bar"><div class="prog-level-fill" style="width:${Math.round(levelProgress * 100)}%"></div></div>
      <div class="prog-level-next">${nextLevel
        ? `${xpToNext.toLocaleString()} XP to <strong>${escapeHtml(nextLevel.title)}</strong>`
        : 'Top level reached — well done.'}</div>
    </div>`;

  const hero = `<div class="prog-hero">
      <div class="prog-stat"><div class="prog-stat-num">${streaks.current}</div><div class="prog-stat-label">day streak</div></div>
      <div class="prog-stat"><div class="prog-stat-num">${streaks.longest}</div><div class="prog-stat-label">longest</div></div>
      <div class="prog-stat"><div class="prog-stat-num">${today}</div><div class="prog-stat-label">today</div></div>
      <div class="prog-stat"><div class="prog-stat-num">${coverage}%</div><div class="prog-stat-label">coverage</div></div>
      <div class="prog-stat"><div class="prog-stat-num">${seen}</div><div class="prog-stat-label">of ${totalCards} seen</div></div>
    </div>`;
  const forecast = `<div class="prog-section-title">Coming due</div>
    <div class="prog-forecast">
      <span><strong>${dueNow}</strong> now</span>
      <span><strong>${due24}</strong> next 24h</span>
      <span><strong>${due7}</strong> next 7d</span>
      <span><strong>${newCount}</strong> new</span>
    </div>`;
  const bars = `<div class="prog-section-title">Mastery by subject</div>` +
    subjStats.map(s => `<div class="mastery-row">
        <div class="mastery-head"><span>${escapeHtml(s.label)}</span>
          <span class="mastery-meta">${s.ss}/${s.st} seen · ${s.avg}%</span></div>
        <div class="mastery-bar"><div class="mastery-fill" style="width:${s.avg}%"></div></div>
      </div>`).join('');
  const heat = `<div class="prog-section-title">Activity (last 17 weeks)</div>${heatmapHtml()}`;

  weak.sort((a, b) => a.pct - b.pct);
  const weakHtml = weak.length
    ? `<div class="prog-section-title">Weak spots (${weak.length})</div>` +
      weak.slice(0, 8).map(w => `<div class="review-item">${escapeHtml(w.q.slice(0, 64))}${w.q.length > 64 ? '…' : ''}
        <span style="float:right;color:var(--muted)">${w.pct}%</span></div>`).join('') +
      `<button class="quick-btn" id="studyWeakBtn" type="button" style="margin-top:10px">Study weak spots</button>`
    : '';

  // ── Badges ────────────────────────────────────────────────────────────
  const badges = computeBadges({ streaks, todayCount: today });
  const earnedCount = badges.filter(b => b.earned).length;
  const badgesHtml = `<div class="prog-section-title">Badges (${earnedCount}/${badges.length})</div>
    <div class="badge-grid">` +
    badges.map(b => `<div class="badge ${b.earned ? 'earned' : 'locked'}" title="${escapeHtml(b.name)} — ${escapeHtml(b.desc)}">
        <span class="badge-icon">${b.earned ? b.icon : '·'}</span>
        <span class="badge-name">${escapeHtml(b.name)}</span>
      </div>`).join('') + `</div>`;

  return { html: levelBanner + hero + forecast + bars + catechismMasteryHtml() + heat + weakHtml + badgesHtml + bestScoresHtml(), hasWeak: !!weak.length };
}
