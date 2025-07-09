const CACHE_NAME = 'controle-financas-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  // Assumes these icon files exist as specified in manifest.json
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Make sure the new SW activates immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching core assets for PWA installation.');
        // Use addAll to fetch and cache all essential assets.
        // If any of these fail, the installation will fail, which is intended
        // because the app won't be installable without them.
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache core assets, PWA might not be installable:', error);
      })
  );
});

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
    })
  );
});

self.addEventListener('fetch', event => {
  // Always go to the network first for navigation requests to get the latest version.
  // Fallback to cache for offline support.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }
  
  // For all other requests (assets, scripts, etc.), use a cache-first strategy.
  // This ensures the app loads quickly and works offline.
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
