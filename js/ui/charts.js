// Pure chart/SVG/HTML builders and data-series helpers used by the analytics
// overlay. None of these touch DOM or read module-level state — everything
// is computed from the arguments passed in.

import { escapeHtml } from '../utils/helpers.js';
import { formatAnalyticsDate, formatAnalyticsDateTime, getUsageDayKey } from '../utils/time.js';
import { formatRemainingForTable } from '../domain/srs/scheduler.js';
import { getConfidencePct } from '../domain/srs/confidence.js';
import { XP_LEVELS } from '../domain/gamification/levels.js';

// Backfill `firstSeenAt` / `firstConfirmedAt` on existing per-card progress
// records that pre-date those fields. Mutates the progress objects in place.
export function backfillConfirmedMilestones(cards, marksStore, progressStore) {
  (cards || []).forEach(card => {
    const progress = progressStore?.[card.id];
    if (!progress) return;
    if (!progress.firstSeenAt && progress.lastReviewedAt) progress.firstSeenAt = progress.lastReviewedAt;
    if (!progress.firstConfirmedAt && marksStore?.[card.id] === 'known' && progress.lastReviewedAt) progress.firstConfirmedAt = progress.lastReviewedAt;
  });
}

export function buildDailyCumulativeSeriesFromMap(dailyMap, startTs = 0) {
  const entries = Object.entries(dailyMap || {}).filter(([, value]) => Number.isFinite(value) && value > 0);
  if (!entries.length) return [];
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  const firstKey = startTs ? getUsageDayKey(startTs) : entries[0][0];
  const lastKey = getUsageDayKey();
  let cursor = new Date(`${firstKey}T00:00:00`);
  const last = new Date(`${lastKey}T00:00:00`);
  let cumulative = 0;
  const series = [];
  while (cursor <= last) {
    const key = getUsageDayKey(cursor.getTime());
    cumulative += dailyMap[key] || 0;
    series.push({ key, ts: cursor.getTime(), value: cumulative / (60 * 60 * 1000) });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
}

export function buildCumulativeConfirmationSeries(cards, marksStore, progressStore) {
  const total = (cards || []).length;
  if (!total) return { total: 0, currentConfirmed: 0, weeklyPct: 0, series: [] };
  backfillConfirmedMilestones(cards, marksStore, progressStore);
  const confirmedTimes = cards.map(card => progressStore?.[card.id]?.firstConfirmedAt || 0).filter(Boolean).sort((a, b) => a - b);
  const currentConfirmed = (cards || []).filter(card => {
    if (marksStore?.[card.id] === 'known') return true;
    const p = progressStore?.[card.id];
    const pct = getConfidencePct(p);
    return pct !== null && pct >= 70;
  }).length;
  if (!confirmedTimes.length) return { total, currentConfirmed, weeklyPct: 0, series: [] };
  const dailyAdds = {};
  confirmedTimes.forEach(ts => { const key = getUsageDayKey(ts); dailyAdds[key] = (dailyAdds[key] || 0) + 1; });
  const firstKey = Object.keys(dailyAdds).sort()[0];
  const lastKey = getUsageDayKey();
  let cursor = new Date(`${firstKey}T00:00:00`);
  const last = new Date(`${lastKey}T00:00:00`);
  let cumulative = 0;
  const series = [];
  while (cursor <= last) {
    const key = getUsageDayKey(cursor.getTime());
    cumulative += dailyAdds[key] || 0;
    series.push({ key, ts: cursor.getTime(), value: cumulative / total, count: cumulative });
    cursor.setDate(cursor.getDate() + 1);
  }
  const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentCount = confirmedTimes.filter(ts => ts >= cutoff).length;
  const weeklyPct = total ? (recentCount / total) * 100 : 0;
  return { total, currentConfirmed, weeklyPct, series };
}

export function getCertaintyBucketForCard(card, marksStore, progressStore) {
  const progress = progressStore?.[card.id];
  const confidence = getConfidencePct(progress);
  if ((!progress?.seenCount && confidence === null) && marksStore?.[card.id] !== 'known') return 'unseen';
  if (marksStore?.[card.id] === 'known') return '100';
  if (confidence === null) return progress?.seenCount ? '0' : 'unseen';
  if (confidence >= 80) return '100';
  if (confidence >= 25) return '50';
  return '0';
}

export function buildCertaintyBuckets(cards, marksStore, progressStore) {
  const buckets = { unseen: 0, '0': 0, '50': 0, '100': 0 };
  (cards || []).forEach(card => { buckets[getCertaintyBucketForCard(card, marksStore, progressStore)] += 1; });
  return buckets;
}

// Returns array of 11 counts: [unseen, 0-9%, 10-19%, ..., 90-100%]. Accepts an
// explicit progressStore so analytics can be computed for a card kind that
// doesn't match the current study mode (e.g. inspecting vocab stats while in
// grammar mode).
export function buildConfirmationHistogram(cards, progressStore) {
  const counts = new Array(11).fill(0);
  (cards || []).forEach(card => {
    const progress = progressStore?.[card.id];
    const pct = getConfidencePct(progress);
    if (pct === null && !progress?.seenCount) {
      counts[0]++;
    } else {
      const p = pct === null ? 0 : pct;
      counts[Math.min(10, Math.floor(p / 10) + 1)]++;
    }
  });
  return counts;
}

// Roll the 11-bucket confidence histogram (unseen, 0-9%, ..., 90-100%) into
// six bands — five 20%-wide confidence bands plus Unseen — so the gradient
// shows more granularity than the older three-band (Building/Confirmed/
// Mastered) collapse while still reading at a glance.
export function buildHistogramSvg(counts, options = {}) {
  const safe = Array.isArray(counts) ? counts : [];
  const unseen = safe[0] || 0;
  // Bucket index i ∈ [1..10] maps to confidence range [(i-1)*10, i*10)%.
  // Pair them up into 20% bands.
  const band = (loIdx, hiIdx) => {
    let total = 0;
    for (let i = loIdx; i <= hiIdx; i++) total += safe[i] || 0;
    return total;
  };
  const b0_20  = band(1, 2);
  const b20_40 = band(3, 4);
  const b40_60 = band(5, 6);
  const b60_80 = band(7, 8);
  const b80_100 = band(9, 10);

  const segments = [
    { label: '80–100%', range: '80–100%', count: b80_100, className: 'stacked-seg-b80' },
    { label: '60–80%',  range: '60–80%',  count: b60_80,  className: 'stacked-seg-b60' },
    { label: '40–60%',  range: '40–60%',  count: b40_60,  className: 'stacked-seg-b40' },
    { label: '20–40%',  range: '20–40%',  count: b20_40,  className: 'stacked-seg-b20' },
    { label: '0–20%',   range: '0–20%',   count: b0_20,   className: 'stacked-seg-b0'  },
    { label: 'Unseen',  range: 'no data', count: unseen,  className: 'stacked-seg-unseen' }
  ];
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  if (!total) {
    return `<div class="analytics-empty">${escapeHtml(options.emptyText || 'No cards in this selection yet.')}</div>`;
  }

  const visible = segments.filter(s => s.count > 0).map(s => {
    const pct = (s.count / total) * 100;
    return { ...s, pct };
  });

  const barHtml = visible.map(s =>
    `<div class="stacked-seg ${s.className}" style="width:${s.pct.toFixed(2)}%" title="${s.label} (${s.range}): ${s.count} (${Math.round(s.pct)}%)"></div>`
  ).join('');

  const legendHtml = visible.map(s =>
    `<span class="stacked-legend-item"><span class="stacked-legend-dot ${s.className}"></span>${s.label} ${s.count} <span class="stacked-legend-pct">${Math.round(s.pct)}%</span></span>`
  ).join('');

  return `
    <div class="stacked-bar-wrap" role="img" aria-label="${escapeHtml(options.title || 'Confirmation breakdown')}">
      <div class="stacked-bar">${barHtml}</div>
      <div class="stacked-legend">${legendHtml}</div>
    </div>
  `;
}

// Centered summary box meant to sit beneath a stacked confirmation bar.
// Matches the percent shown in the bar's "X / Y confirmed" header so the
// reader sees the same number called out at a glance. `weeklyPct` is the
// percentage points added to the confirmed share in the last 7 days
// (already computed by `buildCumulativeConfirmationSeries`).
export function buildConfidenceSummaryBox({ currentConfirmed, total, weeklyPct } = {}) {
  const totalNum = Number(total) || 0;
  const confirmedNum = Math.max(0, Number(currentConfirmed) || 0);
  if (!totalNum) return '';
  const pct = Math.round((confirmedNum / totalNum) * 100);
  const delta = Number(weeklyPct) || 0;
  const deltaRounded = delta >= 10 ? Math.round(delta) : Math.round(delta * 10) / 10;
  const trendHtml = delta > 0
    ? `<div class="analytics-confidence-summary-trend analytics-confidence-summary-trend-up" title="Percentage points added to confirmed share in the last 7 days">▲ +${deltaRounded}% this week</div>`
    : `<div class="analytics-confidence-summary-trend analytics-confidence-summary-trend-flat" title="No newly confirmed cards in the last 7 days">No change this week</div>`;
  return `
    <div class="analytics-confidence-summary" role="status" aria-label="Confirmed: ${pct}% (${confirmedNum} of ${totalNum})">
      <div class="analytics-confidence-summary-pct">${pct}%</div>
      <div class="analytics-confidence-summary-meta">${confirmedNum.toLocaleString()} / ${totalNum.toLocaleString()} confirmed</div>
      ${trendHtml}
    </div>
  `;
}

export function buildLineChartSvg(series, options = {}) {
  const width = options.width || 860;
  const height = options.height || 220;
  // padLeft must leave room for the widest y-axis label (e.g. "100%") at the
  // 22px SVG font size used for mobile readability — otherwise text-anchor="end"
  // labels extend past x=0 and get clipped by the viewBox.
  const padLeft = 64; const padRight = 14; const padTop = 12; const padBottom = 24;
  const values = (series || []).map(point => Number(point.value) || 0);
  if (!values.length) return `<div class="analytics-empty">Not enough data yet.</div>`;
  const maxValue = Math.max(...values, options.maxValue || 0);
  const safeMax = maxValue > 0 ? maxValue : 1;
  const minTs = series[0].ts; const maxTs = series[series.length - 1].ts || (minTs + 1); const span = Math.max(1, maxTs - minTs);
  const toX = ts => padLeft + (((ts - minTs) / span) * (width - padLeft - padRight));
  const toY = value => (height - padBottom) - ((value / safeMax) * (height - padTop - padBottom));
  const path = series.map((point, idx) => `${idx ? 'L' : 'M'} ${toX(point.ts).toFixed(1)} ${toY(point.value).toFixed(1)}`).join(' ');
  const lastPoint = series[series.length - 1]; const midPoint = series[Math.max(0, Math.floor(series.length / 2) - 1)];
  const axisLabels = [
    { x: toX(series[0].ts), label: formatAnalyticsDate(series[0].ts), anchor: 'start' },
    { x: toX(midPoint.ts), label: formatAnalyticsDate(midPoint.ts), anchor: 'middle' },
    { x: toX(lastPoint.ts), label: formatAnalyticsDate(lastPoint.ts), anchor: 'end' }
  ];
  const yLabels = [0, safeMax / 2, safeMax];
  return `
    <svg class="analytics-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHtml(options.title || 'Chart')}">
      <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${height - padBottom}" class="analytics-axis-line"></line>
      <line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padRight}" y2="${height - padBottom}" class="analytics-axis-line"></line>
      ${yLabels.map(value => { const y = toY(value); return `
          <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" class="analytics-grid-line"></line>
          <text x="${padLeft - 8}" y="${y + 4}" text-anchor="end" class="analytics-axis-text">${options.percent ? `${Math.round(value * 100)}%` : value.toFixed(value >= 10 ? 0 : 1)}</text>
        `; }).join('')}
      <path d="${path}" class="analytics-line-path"></path>
      <circle cx="${toX(lastPoint.ts)}" cy="${toY(lastPoint.value)}" r="4" class="analytics-line-point"></circle>
      ${axisLabels.map(item => `<text x="${item.x}" y="${height - 6}" text-anchor="${item.anchor}" class="analytics-axis-text">${escapeHtml(item.label)}</text>`).join('')}
    </svg>
  `;
}

export function buildBarChartSvg(buckets, options = {}) {
  const segments = [
    { key: '100',    label: 'Easy',      className: 'stacked-seg-100' },
    { key: '50',     label: 'Uncertain', className: 'stacked-seg-50' },
    { key: '0',      label: 'Hard',      className: 'stacked-seg-0' },
    { key: 'unseen', label: 'Unseen',    className: 'stacked-seg-unseen' }
  ];
  const total = segments.reduce((sum, s) => sum + (Number(buckets?.[s.key]) || 0), 0);
  if (!total) return `<div class="analytics-empty">No cards in this selection yet.</div>`;
  const segs = segments.map(s => {
    const count = Number(buckets?.[s.key]) || 0;
    const pct = (count / total) * 100;
    return { ...s, count, pct };
  }).filter(s => s.count > 0);

  const barHtml = segs.map(s =>
    `<div class="stacked-seg ${s.className}" style="width:${s.pct.toFixed(2)}%" title="${s.label}: ${s.count} (${Math.round(s.pct)}%)"></div>`
  ).join('');

  const legendHtml = segs.map(s =>
    `<span class="stacked-legend-item"><span class="stacked-legend-dot ${s.className}"></span>${s.label} ${s.count} <span class="stacked-legend-pct">${Math.round(s.pct)}%</span></span>`
  ).join('');

  return `
    <div class="stacked-bar-wrap">
      <div class="stacked-bar">${barHtml}</div>
      <div class="stacked-legend">${legendHtml}</div>
    </div>
  `;
}

export function buildHeatmapSvg(activeDailyMs) {
  const weeks = 15;
  const cellSize = 13;
  const cellGap = 3;
  const totalDays = weeks * 7;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Sun
  // Anchor startDate on the Sunday that begins the column `weeks - 1` columns
  // before the current week. Today then lands in the last column, on the row
  // that matches its day of week (`i % 7`).
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - ((weeks - 1) * 7) - dayOfWeek);

  // collect values
  const cells = [];
  let maxVal = 0;
  const cursor = new Date(startDate);
  for (let i = 0; i < totalDays; i++) {
    const key = getUsageDayKey(cursor.getTime());
    const val = (activeDailyMs || {})[key] || 0;
    const msVal = val / (60 * 1000); // minutes
    if (msVal > maxVal) maxVal = msVal;
    cells.push({ key, val: msVal, date: new Date(cursor), dow: cursor.getDay() });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Build grid: columns = weeks, rows = days of week (Sun-Sat)
  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];
  const labelWidth = 20;
  // Top pad needs to clear the month label cap height. .analytics-axis-text is
  // 22 user units, so a baseline of `topPad - 6` keeps the ascender inside the
  // viewBox.
  const topPad = 28;
  const gridWidth = weeks * (cellSize + cellGap);
  const gridHeight = 7 * (cellSize + cellGap);
  const svgW = labelWidth + gridWidth + 10;
  const svgH = gridHeight + topPad + 10;

  // month labels
  const monthLabels = [];
  let lastMonth = -1;
  cells.forEach((cell, i) => {
    const m = cell.date.getMonth();
    if (m !== lastMonth && cell.dow === 0) {
      const week = Math.floor(i / 7);
      monthLabels.push({ label: cell.date.toLocaleDateString(undefined, { month: 'short' }), x: labelWidth + week * (cellSize + cellGap) });
      lastMonth = m;
    }
  });

  const safeMax = maxVal > 0 ? maxVal : 1;
  const rects = cells.map((cell, i) => {
    const week = Math.floor(i / 7);
    const dow = i % 7;
    const x = labelWidth + week * (cellSize + cellGap);
    const y = topPad + dow * (cellSize + cellGap);
    const isFuture = cell.date > today;
    let fill;
    if (isFuture) {
      fill = 'rgba(255,255,255,0.02)';
    } else if (cell.val === 0) {
      fill = 'rgba(255,255,255,0.05)';
    } else {
      const intensity = Math.min(1, cell.val / safeMax);
      const alpha = 0.2 + intensity * 0.7;
      fill = `rgba(201,168,76,${alpha.toFixed(2)})`;
    }
    const title = `${cell.key}: ${Math.round(cell.val)}m`;
    return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="3" fill="${fill}"><title>${escapeHtml(title)}</title></rect>`;
  }).join('');

  const dayLabelsSvg = dayLabels.map((label, i) => {
    if (!label) return '';
    const y = topPad + i * (cellSize + cellGap) + cellSize - 2;
    return `<text x="0" y="${y}" class="analytics-axis-text heatmap-day-label">${label}</text>`;
  }).join('');

  const monthLabelsSvg = monthLabels.map(m => `<text x="${m.x}" y="${topPad - 6}" class="analytics-axis-text">${escapeHtml(m.label)}</text>`).join('');

  return `<svg class="heatmap-svg" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Study activity heatmap">${monthLabelsSvg}${dayLabelsSvg}${rects}</svg>`;
}

export function buildCircularProgressSvg(fraction, label, sublabel) {
  const size = 100;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, Math.max(0, fraction)));
  const pct = Math.round(fraction * 100);
  return `
    <svg class="ring-svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="${escapeHtml(label)}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="${stroke}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--gold)" stroke-width="${stroke}"
        stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
        transform="rotate(-90 ${size/2} ${size/2})" class="ring-progress"/>
      <text x="${size/2}" y="${size/2 - 4}" text-anchor="middle" class="ring-value">${pct}%</text>
      <text x="${size/2}" y="${size/2 + 12}" text-anchor="middle" class="ring-label">${escapeHtml(sublabel)}</text>
    </svg>
  `;
}

export function buildLevelBarHtml(xpData) {
  const pct = Math.round(xpData.levelProgress * 100);
  const nextLabel = xpData.nextLevel ? `${xpData.nextLevel.threshold - xpData.totalXp} XP to ${xpData.nextLevel.title}` : 'Max level reached';
  return `
    <div class="level-bar-wrap">
      <div class="level-bar-track">
        <div class="level-bar-fill" style="width:${pct}%"></div>
      </div>
      <div class="level-bar-caption">${escapeHtml(nextLabel)}</div>
    </div>
  `;
}

export function buildTitleLadderHtml(xpData) {
  const totalXp = Number(xpData?.totalXp || 0);
  const currentLevel = Number(xpData?.currentLevel?.level || 1);
  const items = XP_LEVELS.map(level => {
    const earned = totalXp >= level.threshold;
    const isCurrent = currentLevel === level.level;
    const star = earned ? '<span class="title-ladder-star" aria-hidden="true">★</span>' : '<span class="title-ladder-star muted" aria-hidden="true">☆</span>';
    return `
      <div class="title-ladder-row ${earned ? 'earned' : 'locked'} ${isCurrent ? 'current' : ''}">
        <div class="title-ladder-main">
          <div class="title-ladder-name-wrap">${star}<span class="title-ladder-name">${escapeHtml(level.title)}</span>${isCurrent ? '<span class="title-ladder-current">Current</span>' : ''}</div>
          <div class="title-ladder-note">Level ${level.level}${level.flav ? ` · ${escapeHtml(level.flav)}` : ''}</div>
        </div>
        <div class="title-ladder-xp">${level.threshold.toLocaleString()} XP</div>
      </div>
    `;
  }).join('');

  return `
    <div class="analytics-chart-card title-ladder-card">
      <div class="analytics-chart-title">Titles and XP required</div>
      <div class="title-ladder-list">${items}</div>
    </div>
  `;
}

// ── Per-value (mood / tense / voice …) proficiency breakdown ──────────────
// Renders the grouped breakdown produced by finalizeValueBreakdown(): one
// labelled group per dimension (Tense, Mood, …), each value a horizontal bar
// coloured on the shared 5-band gradient (stacked-seg-b0..b80, red → green).
// A value with no recent attempts shows a muted track + "—" so coverage gaps
// (e.g. an aorist you've never drilled) read as honestly as weak ones.
function masteryBandClass(pct) {
  if (pct == null) return null;
  if (pct < 20) return 'stacked-seg-b0';
  if (pct < 40) return 'stacked-seg-b20';
  if (pct < 60) return 'stacked-seg-b40';
  if (pct < 80) return 'stacked-seg-b60';
  return 'stacked-seg-b80';
}

export function buildDimValueBarsHtml(groups, options = {}) {
  if (!Array.isArray(groups) || !groups.length) {
    const msg = options.emptyText
      || 'Drill a few more forms to unlock the per-mood / per-tense breakdown.';
    return `<div class="dim-value-empty">${escapeHtml(msg)}</div>`;
  }
  const groupsHtml = groups.map((g) => {
    const rowsHtml = g.rows.map((r) => {
      const band = masteryBandClass(r.pct);
      const fill = band
        ? `<span class="dim-value-fill ${band}" style="width:${Math.max(4, r.pct)}%"></span>`
        : '';
      const pctText = r.pct == null ? '—' : `${r.pct}%`;
      const cov = `${r.seenForms}/${r.forms}`;
      const rowCls = r.pct == null ? 'dim-value-row dim-value-row-unseen' : 'dim-value-row';
      const title = r.pct == null
        ? `${g.label} ${r.label}: not attempted yet — ${r.forms} form${r.forms === 1 ? '' : 's'} in scope`
        : `${g.label} ${r.label}: ${r.pct}% over recent attempts · ${r.seenForms}/${r.forms} forms seen`;
      return `
        <div class="${rowCls}" title="${escapeHtml(title)}">
          <span class="dim-value-name">${escapeHtml(r.label)}</span>
          <span class="dim-value-track">${fill}</span>
          <span class="dim-value-pct">${pctText}</span>
          <span class="dim-value-cov" aria-label="${r.seenForms} of ${r.forms} forms seen">${escapeHtml(cov)}</span>
        </div>`;
    }).join('');
    return `
      <div class="dim-value-group">
        <div class="dim-value-group-label">${escapeHtml(g.label)}</div>
        ${rowsHtml}
      </div>`;
  }).join('');
  const caption = options.caption
    || 'Recent accuracy per value · the number = forms you’ve seen / forms in scope';
  return `
    <div class="dim-value-breakdown">${groupsHtml}</div>
    <div class="dim-value-caption">${escapeHtml(caption)}</div>
  `;
}

// ── Per-word stat card (revealed by tapping a word row inside a chapter) ──
// Pulls everything off the same g2e progress record the SRS uses, so the
// numbers here are authoritative — same source as Study screen.
export function buildWordStatCardHtml(card, progressRaw, isKnownMark) {
  const progress = progressRaw || {};
  const seenCount = progress.seenCount || 0;
  const passCount = progress.passCount || 0;
  const failCount = progress.failCount || 0;
  const responses = passCount + failCount;
  const rawPct = getConfidencePct(progress);
  const hasActivity = seenCount > 0 || responses > 0 || !!progress.lastReviewedAt;

  let statusLabel;
  let statusClass;
  if (isKnownMark) {
    statusLabel = 'Marked known';
    statusClass = 'word-stat-status-known';
  } else if (rawPct !== null && rawPct >= 70) {
    statusLabel = 'Confirmed (≥70%)';
    statusClass = 'word-stat-status-confirmed';
  } else if (hasActivity) {
    statusLabel = 'Learning';
    statusClass = 'word-stat-status-learning';
  } else {
    statusLabel = 'Unseen';
    statusClass = 'word-stat-status-unseen';
  }

  // Display the rolling last-10-flips confidence regardless of any "marked
  // known" override — the user wants the real signal, not the manual toggle.
  const pctDisplay = rawPct === null ? '—' : `${rawPct}%`;
  const accuracyDisplay = responses ? `${Math.round((passCount / responses) * 100)}%` : '—';
  const dueDisplay = progress.dueAt
    ? (progress.dueAt > Date.now() ? `in ${formatRemainingForTable(progress.dueAt)}` : 'due now')
    : '—';
  const lastReviewedDisplay = progress.lastReviewedAt ? formatAnalyticsDateTime(progress.lastReviewedAt) : '—';
  const firstSeenDisplay = progress.firstSeenAt ? formatAnalyticsDate(progress.firstSeenAt) : '—';
  const firstConfirmedDisplay = progress.firstConfirmedAt ? formatAnalyticsDate(progress.firstConfirmedAt) : '—';
  const intervalDisplay = progress.intervalDays
    ? (progress.intervalDays >= 1 ? `${progress.intervalDays.toFixed(progress.intervalDays >= 10 ? 0 : 1)}d` : `${Math.max(1, Math.round(progress.intervalDays * 24))}h`)
    : '—';

  // Tiny inline bar chart of the last (up to 10) confidence samples.
  // 0 = red miss, 0.5 = amber pass, 1 = green easy. Most recent on the right.
  const history = Array.isArray(progress.confidenceHistory) ? progress.confidenceHistory.filter(v => Number.isFinite(v)) : [];
  const historyHtml = history.length
    ? `<div class="word-stat-history" aria-label="Recent confidence samples">${history.map(v => {
        const cls = v >= 1 ? 'word-stat-history-bar-easy' : v >= 0.5 ? 'word-stat-history-bar-pass' : 'word-stat-history-bar-miss';
        const h = Math.max(20, Math.round(v * 100));
        return `<span class="word-stat-history-bar ${cls}" style="height:${h}%"></span>`;
      }).join('')}</div>`
    : '<div class="word-stat-history-empty">No reviews yet</div>';

  // Grammar/morph cards use form/answer; vocab cards use Greek headword + English gloss.
  // The morph cards always have `kind: 'morph'` so we can distinguish without a
  // separate parameter — the rest of the stat card layout is identical because
  // the per-card progress fields are the same for both directions.
  const isMorph = card?.kind === 'morph' || !!card?.form;
  const headword = isMorph
    ? escapeHtml(card.form || card.lemma || '—')
    : (typeof window !== 'undefined' && typeof window.formatGreekHeadword === 'function'
        ? window.formatGreekHeadword(card.g)
        : (card.g || '—'));
  const gloss = isMorph ? escapeHtml(card.answer || card.gloss || '') : escapeHtml(card.e || '');

  const tile = (label, value) => `
    <div class="word-stat-tile">
      <div class="word-stat-tile-label">${escapeHtml(label)}</div>
      <div class="word-stat-tile-value">${escapeHtml(value)}</div>
    </div>
  `;

  return `
    <div class="word-stat-card">
      <div class="word-stat-head">
        <div class="word-stat-head-text">
          <div class="word-stat-headword">${headword}</div>
          <div class="word-stat-gloss">${gloss}</div>
        </div>
        <div class="word-stat-head-pct">
          <div class="word-stat-pct-value">${escapeHtml(pctDisplay)}</div>
          <div class="word-stat-status ${statusClass}">${escapeHtml(statusLabel)}</div>
        </div>
      </div>
      <div class="word-stat-grid">
        ${tile('Seen', `×${seenCount}`)}
        ${tile('Pass / Fail', `${passCount} / ${failCount}`)}
        ${tile('Accuracy', accuracyDisplay)}
        ${tile('Streak', `${progress.streak || 0}`)}
        ${tile('Easy streak', `${progress.easyStreak || 0}`)}
        ${tile('SRS stage', `${progress.srsStage || 0}`)}
        ${tile('Interval', intervalDisplay)}
        ${tile('Next due', dueDisplay)}
        ${tile('Last reviewed', lastReviewedDisplay)}
        ${tile('First seen', firstSeenDisplay)}
        ${tile('First confirmed', firstConfirmedDisplay)}
        ${tile('Ease', (progress.ease || 2.3).toFixed(2))}
      </div>
      <div class="word-stat-history-wrap">
        <div class="word-stat-history-label">Recent reviews (oldest → newest)</div>
        ${historyHtml}
      </div>
    </div>
  `;
}

