const CACHE_NAME = 'controle-financas-cache-v5';
// Only cache the bare minimum for the app shell to be available offline.
// This makes the installation much more robust.
const urlsToCache = [
  '/',
  '/index.html',
];

// Install: cache the app shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching app shell.');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache app shell, PWA might not be installable:', error);
      })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Claim clients immediately
  );
});

// Fetch: serve from cache, fallback to network, and update cache
self.addEventListener('fetch', event => {
  // For navigation requests, go to the network first to get the latest HTML,
  // but fall back to the cache if the network is unavailable.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  
  // For all other requests (assets, scripts, manifest, etc.),
  // use a "cache-first" strategy for speed and offline capability.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return response from cache if found.
        if (response) {
          return response;
        }

        // Otherwise, fetch from the network.
        return fetch(event.request).then(
          networkResponse => {
            // If the fetch is successful, clone it and cache the new response for future use.
            // This ensures that assets like the manifest and icons get cached on first request.
            if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }
        );
      })
  );
});
