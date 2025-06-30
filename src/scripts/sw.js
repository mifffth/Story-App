import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'; 

const BASE_URL = 'https://story-api.dicoding.dev';

const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/images/'),
  new StaleWhileRevalidate({
    cacheName: 'story-images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
    fetchOptions: {
      mode: 'no-cors',
    },
  }),
  'GET'
);

registerRoute(
  ({ url }) => url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome'),
  new CacheFirst({
    cacheName: 'fontawesome',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  })
);

registerRoute(
  ({ request }) => ['script', 'style'].includes(request.destination),
  new CacheFirst({
    cacheName: 'assets-cache',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'story-app-api',
  }),
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'story-app-api-images',
  }),
);

registerRoute(
  ({ url }) => url.origin.includes('tile.openstreetmap.org'),
  new StaleWhileRevalidate({
    cacheName: 'osm-tiles',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  })
);

registerRoute(
  ({ request, url }) => request.mode === 'navigate' && !url.pathname.includes('/login'),
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  })
);

setCatchHandler(async ({ event }) => {
  if (event.request.mode === 'navigate') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  event.waitUntil(
    (async () => {
      let title = 'Story App';
      let options = {
        body: 'Push message received',
        icon: './icons/icon-512x512.png',
        tag: 'story-app-tag',
      };

      if (event.data) {
        try {
          const data = await event.data.json();
          title = data.title || title;
          options = { ...options, ...(data.options || {}) };
        } catch (e) {
          const fallbackText = await event.data.text();
          title = fallbackText || title;
          options.body = 'Fallback: ' + fallbackText;
        }
      }

      await self.registration.showNotification(title, options);
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());