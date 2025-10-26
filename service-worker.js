const CACHE_NAME = 'bia-caregiver-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/biafavicom.png',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/bia3.jpeg',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/biacardqrcodewpp.png',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/biacardqrcodeinsta.png',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/biacardqrcodesms.png',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/biacardqrcodelink.png'
];

// Instalação - cacheia arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Ativação - limpa cache antigo
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - estratégia Cache First, depois Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna do cache
        if (response) {
          return response;
        }

        // Cache miss - busca na rede
        return fetch(event.request).then(response => {
          // Verifica se é uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona a resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Fallback offline (opcional)
        return caches.match('/');
      })
  );
});

// Sincronização em background (opcional)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-qr-codes') {
    event.waitUntil(
      // Pode adicionar lógica de sincronização aqui
      Promise.resolve()
    );
  }
});

// Notificações push (opcional - para futuro)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nova mensagem da Bia!',
    icon: 'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/biafavicom.png',
    badge: 'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/biafavicom.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Bia Caregiver', options)
  );
});

// Click em notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
