// ============================================
// AURORA PWA - Service Worker com Versionamento
// ============================================
const APP_VERSION = '1.1.6';
// ============================================

const CACHE_NAME = `aurora-cache-v${APP_VERSION}`;
const STATIC_CACHE = `aurora-static-v${APP_VERSION}`;
const DYNAMIC_CACHE = `aurora-dynamic-v${APP_VERSION}`;

// Recursos estáticos para cache inicial
const STATIC_ASSETS = [
  '/',
  '/login',
  '/home',
  '/manifest.json',
];

// Recursos que devem sempre buscar da rede (network-first)
const NETWORK_FIRST_PATTERNS = [
  '/api/',
  'supabase',
  'firebase',
];

// Install event - Cacheia recursos estáticos
self.addEventListener('install', (event) => {
  console.log(`[SW] Instalando versão ${APP_VERSION}`);

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Força ativação imediata da nova versão
        return self.skipWaiting();
      })
  );
});

// Activate event - Limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log(`[SW] Ativando versão ${APP_VERSION}`);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remove caches que não correspondem à versão atual
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
        // Toma controle de todas as páginas imediatamente
        return self.clients.claim();
      })
      .then(() => {
        // Notifica todos os clientes sobre a atualização
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

// Fetch event - Estratégia de cache inteligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requests não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignora extensões do Chrome e outros protocolos
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Network-first para APIs e recursos dinâmicos
  const isNetworkFirst = NETWORK_FIRST_PATTERNS.some(pattern =>
    request.url.includes(pattern)
  );

  if (isNetworkFirst) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first para recursos estáticos
  event.respondWith(cacheFirst(request));
});

// Estratégia Cache-First (para recursos estáticos)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Atualiza cache em background (stale-while-revalidate)
      fetchAndCache(request);
      return cachedResponse;
    }

    return await fetchAndCache(request);
  } catch (error) {
    console.error('[SW] Erro no cache-first:', error);
    return await caches.match('/');
  }
}

// Estratégia Network-First (para APIs)
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

// Busca e cacheia recurso
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);

    // Só cacheia respostas válidas
    if (!response || response.status !== 200) {
      return response;
    }

    // Não cacheia respostas opacas de CDNs
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

// Message event - Comunicação com o cliente
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

// Push notification event (para futuras notificações)
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

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log(`[SW] Service Worker carregado - Versão ${APP_VERSION}`);
