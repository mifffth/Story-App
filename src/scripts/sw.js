import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

const BASE_URL = 'https://story-api.dicoding.dev';
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome'),
  new CacheFirst({
    cacheName: 'fontawesome',
    plugins: [ 
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) =>
    (request.destination === 'script' || request.destination === 'style') &&
    !url.pathname.endsWith('login-view.js'),
  new CacheFirst({
    cacheName: 'assets-cache',
    plugins: [ 
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) =>
    url.origin === BASE_URL && request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'StoryApp-API-images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) =>
    url.origin === BASE_URL && request.destination !== 'image',
  new NetworkFirst({
    cacheName: 'StoryApp-API-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.origin.includes('tile.openstreetmap.org'),
  new StaleWhileRevalidate({
    cacheName: 'osm-tiles',
    plugins: [ 
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [ 
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) =>
    request.mode === 'navigate' && !url.pathname.includes('/login'),
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  })
);

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');

  event.waitUntil(
    (async () => {
      let title = 'Story App';
      let options = {
        body: 'Push message received',
        icon: '/icons/icon-512x512.png',
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
      console.log('[Service Worker] Notification shown:', title, options);
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






