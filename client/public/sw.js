// Auto-unregistering Service Worker to eliminate legacy/zombie workers on localhost & production
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll({ type: 'window' });
    }).then((clients) => {
      clients.forEach((client) => {
        if (client.url && 'navigate' in client) {
          try {
            client.navigate(client.url);
          } catch (e) {
            // Ignore navigation errors
          }
        }
      });
    })
  );
});

// Pass-through fetch handler ensuring NO request is ever rejected with TypeError
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('', { status: 404, statusText: 'Not Found' });
    })
  );
});
