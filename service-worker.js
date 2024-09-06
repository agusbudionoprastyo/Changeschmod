const CACHE_NAME = 'regcard_v1';
const urlsToCache = [
  '/',
  '/index.php',
  '/css/styles.css',
  '/js/app.js',
  '/js/script.js',
  '/js/signature_pad.umd.js',
  '/images/icon',
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event with network-first strategy
self.addEventListener('fetch', event => {
    event.respondWith(
      fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        if (event.request.url.startsWith('http')) { // Hanya cache permintaan yang menggunakan skema HTTP/HTTPS
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then(response => {
          return response || fetch(event.request);
        });
      })
    );
  });  

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Listen for messages from clients
self.addEventListener('message', event => {
  if (event.data.type === 'clearCache') {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
});