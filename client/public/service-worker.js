// const CACHE_NAME = "Cardex-cache-v1";
// // Cached URL
// const urlsToCache = ["/", "/index.html", "/manifest.json", "/Cardex_logo.png"];

// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
//   );
// });

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         return response;
//       }
//       return fetch(event.request);
//     })
//   );
// });

// self.addEventListener("activate", (event) => {
//   const cacheWhitelist = [CACHE_NAME];
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheWhitelist.indexOf(cacheName) === -1) {
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
// });

self.addEventListener("push", function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/Cardex_logo.png",
    data: data.data,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url;
  if (url) {
    event.waitUntil(
      clients
        .matchAll({
          type: "window",
        })
        .then((clientList) => {
          for (client of clientList) {
            if (client.url == url && "focus" in client) return client.focus();
          }
          if (clients.openWindow) return clients.openWindow(url);
        })
    );
  }
});
