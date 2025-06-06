/* eslint-disable no-undef */

// Import Workbox scripts
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js"
);

if (workbox) {


  // Precache files
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

  // Runtime caching
  workbox.routing.registerRoute(
    new RegExp(".*\\.(?:png|jpg|jpeg|svg|gif)"),
    new workbox.strategies.CacheFirst({
      cacheName: "images",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 1000,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );
} else {

}

// Handle push events
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Default Title";
  const options = {
    body: data.body,
    badge: "https://go.dysperse.com/assets/notification.png",
    icon: "https://go.dysperse.com/assets/notification-icon.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/"));
});

self.addEventListener("install", () => {
  self.skipWaiting();
});
