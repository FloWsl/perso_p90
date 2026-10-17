// Service worker minimal : cache de l'app pour le hors ligne.
// Sert depuis le cache, puis met à jour en arrière-plan (la nouvelle version s'affiche au lancement suivant).
const CACHE = 'p90log-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req)
      .then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
      .catch(() => hit);
    e.waitUntil(net.catch(() => {}));
    return hit || net;
  }));
});
