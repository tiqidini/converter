const CACHE_NAME = 'power-converter-v5';
const urlsToCache = [
    '/converter/',
    '/converter/index.html',
    '/converter/styles.css',
    '/converter/script.js',
    '/converter/icon.png',
    'https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.4.4/math.js'
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
