// A robust service worker inspired by a working PWA example (v6)
const CACHE_NAME = 'controle-financas-cache-v6'; // Incremented version to force update

// All critical resources needed for the app to work offline
const urlsToCache = [
  // App Shell
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',

  // CDNs
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',

  // Import-map modules (ESM)
  "https://esm.sh/react@^19.1.0",
  "https://esm.sh/react-dom@^19.1.0/",
  "https://esm.sh/react@^19.1.0/",
  "https://esm.sh/recharts@^3.0.2",
  "https://esm.sh/@neondatabase/serverless@^0.9.4",
  "https://esm.sh/@vercel/postgres@^0.10.0",
  "https://esm.sh/@google/genai@^1.8.0"
];


// Install: Open cache and add all app shell files and dependencies
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`Service Worker (v6): Caching ${urlsToCache.length} resources.`);
        // Use addAll for atomic caching. If one fails, the entire cache operation fails.
        // This is crucial for debugging missing resources.
        return cache.addAll(urlsToCache);
      }).catch(err => {
        console.error("Service Worker: Failed to cache app shell and dependencies.", err);
      })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

// Fetch: Serve from cache, fallback to network, cache new responses, and provide offline fallback
self.addEventListener('fetch', (event) => {
  // We only care about GET requests
  if (event.request.method !== 'GET') {
      return;
  }
    
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache, go to network
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response to cache.
            // We don't cache non-GET requests or responses from chrome-extension://
            if (
              !networkResponse || 
              networkResponse.status !== 200 || 
              (networkResponse.type !== 'basic' && networkResponse.type !== 'opaque') // Opaque for CDN
            ) {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(() => {
          // Network request failed, probably offline
          // If it's a navigation request, serve the main app shell page as a fallback
          if (event.request.mode === 'navigate') {
            console.log('Service Worker: Serving offline fallback for navigation.');
            return caches.match('/');
          }
          // For other failed requests (e.g., images, scripts), let the browser's default error show.
        });
      })
  );
});
