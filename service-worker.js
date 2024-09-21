const CACHE_NAME = 'ndr-viewer-v1';
const urlsToCache = [
    './',
    'index.html',
    'styles.css',
    'script.js',
    'ndrs.db',
    'icon-192x192.png',
    'icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/sql-wasm.js',
    'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/sql-wasm.wasm'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});