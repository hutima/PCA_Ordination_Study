// Time utilities — no app-specific imports

export function formatUsageDuration(ms) {
  const totalMinutes = Math.max(0, Math.round((ms || 0) / (60 * 1000)));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
}

export function formatAnalyticsDate(ts) {
  if (!ts) return '\u2014';
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatAnalyticsDateTime(ts) {
  if (!ts) return '\u2014';
  return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function getUsageDayKey(ts = Date.now()) {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Day key for the unspaced auto-archive reset. The "day" rolls over at the
// given cutoff hour (default 5 AM local time) so a late-night study session
// stays grouped with the previous calendar day's archives instead of being
// wiped at midnight.
export function getUnspacedArchiveDayKey(ts = Date.now(), cutoffHour = 5) {
  const d = new Date(ts);
  if (d.getHours() < cutoffHour) {
    d.setDate(d.getDate() - 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDailyDurationSlice(bucket, startTs, durationMs) {
  if (!durationMs || durationMs <= 0) return;
  let cursor = startTs;
  let remaining = durationMs;
  while (remaining > 0) {
    const endOfDay = new Date(cursor);
    endOfDay.setHours(24, 0, 0, 0);
    const slice = Math.min(remaining, endOfDay.getTime() - cursor);
    const dayKey = getUsageDayKey(cursor);
    bucket[dayKey] = (bucket[dayKey] || 0) + slice;
    cursor += slice;
    remaining -= slice;
  }
}
