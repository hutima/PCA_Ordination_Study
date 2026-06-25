// PCA Ordination & Licensure Study — service worker.
//
// Offline shell cache + a self-healing update. Bump CACHE (and the ?v=N params
// in index.html) together on every release: a new CACHE name makes the browser
// install a fresh worker. The worker now skipWaiting()s on install and claims
// clients on activate, so a new release takes over on the browser's own sw.js
// refresh — it does NOT depend on the page promoting it (the old "promote on
// Refresh-now tap" model deadlocked when the cached app JS was broken). The page
// surfaces an "Update available" banner (see registerServiceWorker in
// js/app/pca.js) and reloads only when the user taps "Refresh now" — never
// automatically, which would freeze iOS standalone PWAs.
const CACHE = 'pca-v55';

const PRECACHE = [
  './',
  'index.html',
  'manifest.json',
  'favicon.svg',
  'styles.css',
  'css/pca.css',
  'js/app/pca.js',
  'js/app/store.js',
  'js/app/content.js',
  'js/app/quiz.js',
  'js/app/answer.js',
  'js/app/refs.js',
  'js/app/srs.js',
  'js/app/modes.js',
  'js/app/progress.js',
  'js/app/gamification.js',
  'js/utils/markdown.js',
  'js/utils/text.js',
  'js/utils/helpers.js',
  'js/utils/clickShield.js',
  'js/domain/srs/constants.js',
  'js/domain/srs/scheduler.js',
  'js/domain/srs/confidence.js',
  'js/data/subjects/bible_content.js',
  'js/data/subjects/bible_books.js',
  'js/data/subjects/bco.js',
  'js/data/subjects/bco_governance.js',
  'js/data/subjects/bco_comprehensive.js',
  'js/data/subjects/sacraments.js',
  'js/data/subjects/church_history.js',
  'js/data/subjects/theology.js',
  'js/data/subjects/theology_wcf.js',
  'js/data/subjects/theology_other.js',
  'js/data/subjects/doctrines_proofs.js',
  'js/data/subjects/personal_call.js',
  'js/data/subjects/catechism_wsc.js',
  'js/data/week_plan.js',
  'js/data/catechisms.js',
  'js/data/catechisms_bco.js',
  'js/data/quiz/bible_content.js',
  'js/data/quiz/bco.js',
  'js/data/quiz/sacraments.js',
  'js/data/quiz/church_history.js',
  'js/data/quiz/theology.js',
  'js/data/quiz/hot_topics.js',
  'js/data/subjects/hot_topics.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  // Activate as soon as we're installed, WITHOUT waiting for the page to ask.
  // The page-driven "promote on Refresh-now tap" model deadlocks if the
  // currently-cached app JS is broken: it can never run the code that promotes
  // the fix. The browser updates sw.js on its own (on navigation), so letting
  // the new worker skip waiting here is what lets a bad release self-heal on a
  // plain refresh. We still NEVER auto-reload the page (that froze iOS
  // standalone PWAs) — the page only reloads on a user tap.
  self.skipWaiting();
  // cache: 'reload' bypasses the HTTP cache so a new worker never precaches
  // stale copies of assets the browser had cached from the previous release.
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page posts this when it detects a waiting worker — promote immediately.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first so a fresh deploy is picked up, cache fallback
  // for offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('index.html', { ignoreSearch: true }))
    );
    return;
  }

  // Assets: cache-first (ignoring ?v= params), then network with cache write.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
