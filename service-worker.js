const CACHE_NAME = 'controle-financas-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event: caches the app shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: cleans up old caches
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
    }).then(() => self.clients.claim())
  );
});

// Fetch event: serves assets from cache or network, with offline fallback
self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200) {
              // Only cache basic responses to avoid caching opaque responses from CDNs
              if (networkResponse.type !== 'basic') {
                 return networkResponse;
              }
            }
            
            // Clone the response to cache it
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(() => {
          // If the network request fails and it's a navigation request,
          // return the cached index page as a fallback.
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          // For other failed requests, the browser will handle it (e.g., show a broken image).
        });
      })
    );
});
