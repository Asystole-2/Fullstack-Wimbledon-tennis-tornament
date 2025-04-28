const CACHE_NAME = 'wimbledon-travel-guide-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/app.js',
    '/data/locations.json',
    '/images/markers/stadium.png',
    '/images/markers/hotel.png',
    '/images/markers/restaurant.png',
    '/images/markers/attraction.png'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});