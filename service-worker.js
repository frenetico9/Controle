const CACHE_NAME = 'controle-financas-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // Ícones e outros assets serão cacheados dinamicamente pelo handler de fetch
  // para tornar a instalação do SW mais resiliente.
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Apenas tratar requisições GET.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Se o recurso estiver no cache, servi-lo (estratégia Cache-First).
        if (cachedResponse) {
          return cachedResponse;
        }

        // Se não, buscar na rede.
        return fetch(event.request).then(
          networkResponse => {
            // Se a requisição de rede for bem-sucedida, armazenar em cache e retornar.
            // Respostas opacas (de requisições cross-origin no-cors) também são armazenadas.
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }
        ).catch(() => {
          // Se a requisição de rede falhar e for para uma navegação de página,
          // retornar a página principal do cache como fallback.
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          // Para outras requisições de assets que falharem, a promise será rejeitada.
          return;
        });
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
            // Deleta caches antigos.
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Garante que o SW assuma o controle imediatamente.
  );
});
