const CACHE_VERSION = 'speedarti-anc-v3-20260928-plan-metrique-freeze';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './v3/anc-v3.css',
  './v3/anc-core.js',
  './v3/anc-connectors.js',
  './v3/anc-map.js',
  './v3/anc-ui.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        const network = fetch(req).then(res => {
          if (res && res.ok) caches.open(CACHE_VERSION).then(c => c.put(req, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Les APIs métier externes restent réseau-seulement :
  // aucune donnée BRGM, Géorisques, météo ou Géoplateforme n'est inventée hors connexion.
  if (/data\.geopf\.fr|geoservices\.brgm\.fr|georisques\.gouv\.fr|open-meteo\.com/.test(url.hostname)) {
    event.respondWith(fetch(req));
    return;
  }

  // Bibliothèques statiques tierces : cache après première utilisation.
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) caches.open(CACHE_VERSION).then(c => c.put(req, res.clone()));
      return res;
    }))
  );
});
