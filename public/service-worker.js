self.__WB_MANIFEST;

// Handle push events
self.addEventListener("push", (event) => {
  console.log("Push received", event);
  const data = event.data.json();
  const title = data.title || "Default Title";
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("https://app.dysperse.com"));
});
