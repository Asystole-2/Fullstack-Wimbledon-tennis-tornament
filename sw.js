const CACHE_NAME = 'wimbledon-travel-guide-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/main.js',
    '/js/map.js',
    '/js/api.js',
    '/data/locations.json',
    '/images/markers/stadium.png',
    '/images/markers/hotel.png',
    '/images/markers/restaurant.png',
    '/images/markers/attraction.png',
    '/images/icons/icon-192x192.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                }
            )
    );
});