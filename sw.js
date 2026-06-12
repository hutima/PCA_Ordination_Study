// PCA Ordination & Licensure Study — service worker.
//
// Offline shell cache + auto-update. Bump CACHE (and the ?v=N params in
// index.html) together on every release: a new CACHE name makes the browser
// install a fresh worker, which the page promotes immediately (see the
// registration block in js/app/pca.js) so users auto-refresh onto the new
// version without a manual reload.
const CACHE = 'pca-v32';

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
  'js/utils/markdown.js',
  'js/utils/text.js',
  'js/utils/helpers.js',
  'js/domain/srs/constants.js',
  'js/domain/srs/scheduler.js',
  'js/domain/srs/confidence.js',
  'js/data/subjects/bible_content.js',
  'js/data/subjects/bco.js',
  'js/data/subjects/bco_governance.js',
  'js/data/subjects/bco_comprehensive.js',
  'js/data/subjects/sacraments.js',
  'js/data/subjects/church_history.js',
  'js/data/subjects/theology.js',
  'js/data/subjects/theology_wcf.js',
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
