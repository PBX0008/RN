const CACHE_NAME = 'nclex-rn-practice-v43';
const APP_SHELL = [
  './',
  './index.html',
  './main.html',
  './assets/styles.css',
  './assets/app.js',
  './assets/css/main.css',
  './repo-config.js',
  './data/tests.json',
  './site.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => null));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isDataOrQuestion = url.pathname.includes('/data/') || url.pathname.includes('/questions/');
  const isAppShell = /\.(?:html|css|js|webmanifest)$/i.test(url.pathname) || url.pathname.endsWith('/');

  // Network-first keeps mobile users from being stuck on an older cached layout.
  if (isDataOrQuestion || isAppShell) {
    event.respondWith(
      fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
