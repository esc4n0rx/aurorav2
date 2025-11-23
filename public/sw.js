
const APP_VERSION = '1.1.3';

const CACHE_NAME = `aurora-cache-v${APP_VERSION}`;
const STATIC_CACHE = `aurora-static-v${APP_VERSION}`;
const DYNAMIC_CACHE = `aurora-dynamic-v${APP_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/login',
  '/home',
  '/manifest.json',
];

const NETWORK_FIRST_PATTERNS = [
  '/api/',
  'supabase',
  'firebase',
];

self.addEventListener('install', (event) => {
  console.log(`[SW] Instalando versão ${APP_VERSION}`);

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log(`[SW] Ativando versão ${APP_VERSION}`);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('aurora-') &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE) {
              console.log(`[SW] Removendo cache antigo: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
      .then(() => {
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: APP_VERSION,
            });
          });
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (!url.protocol.startsWith('http')) {
    return;
  }

  const isNetworkFirst = NETWORK_FIRST_PATTERNS.some(pattern =>
    request.url.includes(pattern)
  );

  if (isNetworkFirst) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      fetchAndCache(request);
      return cachedResponse;
    }

    return await fetchAndCache(request);
  } catch (error) {
    console.error('[SW] Erro no cache-first:', error);
    return await caches.match('/');
  }
}
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, tentando cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

async function fetchAndCache(request) {
  try {
    const response = await fetch(request);

    if (!response || response.status !== 200) {
      return response;
    }

    if (response.type === 'opaque') {
      return response;
    }

    const responseToCache = response.clone();

    caches.open(DYNAMIC_CACHE).then((cache) => {
      cache.put(request, responseToCache);
    });

    return response;
  } catch (error) {
    throw error;
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Recebido comando para atualizar');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: APP_VERSION,
    });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Limpando todo o cache');
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('aurora-')) {
            return caches.delete(cacheName);
          }
        })
      );
    });
  }
});

self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nova atualização disponível!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Aurora', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log(`[SW] Service Worker carregado - Versão ${APP_VERSION}`);
