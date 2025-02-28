import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
} from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import {
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Take control immediately
self.skipWaiting();
clientsClaim();

// Clean up old caches
cleanupOutdatedCaches();

// Precache all assets with versioning
precacheAndRoute(self.__WB_MANIFEST);

// Handle runtime caching with network-first strategy for HTML
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3, // Timeout if network is slow
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Use StaleWhileRevalidate for API requests to always check for updates
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60, // 1 minute
      }),
    ],
  })
);

// Enhanced update handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Check for update requests
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    self.registration.update().then(() => {
      // Notify clients about update check
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'UPDATE_CHECKED' });
        });
      });
    });
  }
});

// Handle cache updates and notify clients
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .map((cacheName) => {
              // Only delete caches that aren't current
              if (!cacheName.includes(self.registration.scope)) {
                return caches.delete(cacheName);
              }
            })
            .filter(Boolean)
        );
      }),

      // Take control of all clients
      clients.claim(),

      // Notify all clients about the update
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'CONTENT_UPDATED',
            timestamp: new Date().getTime(),
          });
        });
      }),
    ])
  );
});

// Listen for updates from the server
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation

  // Notify clients about new version
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'NEW_VERSION_INSTALLING',
          timestamp: new Date().getTime(),
        });
      });
    })
  );
});

// Check for updates every minute
setInterval(() => {
  self.registration.update();
}, 60000); // 1 minute
