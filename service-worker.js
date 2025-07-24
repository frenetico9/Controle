// A robust service worker for PWA functionality.
// This version is based on a proven, working example to ensure reliability.

const CACHE_NAME = 'controle-financas-cache-v1'; // Change this on app updates
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',

  // Key CDN assets. These are defined in index.html
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];
// Note: JavaScript modules from esm.sh will be cached on-the-fly by the fetch handler.

// Install: Open cache and add app shell files
self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        // Use addAll for atomic caching. We catch to prevent SW install from failing if one resource is unavailable.
        return cache.addAll(urlsToCache).catch(err => {
          console.error("Service Worker: Failed to cache some URLs during install.", err);
        });
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
    }).then(() => self.clients.claim()) // Take control of the page immediately
  );
});

// Fetch: Serve from cache, fallback to network, and provide offline fallback for navigation
self.addEventListener('fetch', (event) => {
  // We only cache GET requests. Database and API calls are typically POST and will be ignored.
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
          (response) => {
            // Check if we received a valid response to cache.
            // We allow 'opaque' for CDN requests (no-cors).
            if (
              !response || 
              response.status !== 200 || 
              (response.type !== 'basic' && response.type !== 'opaque')
            ) {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and must be cloned to be consumed by both the cache and the browser.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Network request failed, probably offline.
          // If it's a navigation request, serve the main app shell page as a fallback.
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          // For other failed requests (e.g., images), we don't have a specific fallback,
          // so the browser's default error will show.
        });
      })
  );
});
