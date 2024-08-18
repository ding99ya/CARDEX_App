importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

const CACHE_NAME = "Cardex-cache-v1";
const urlsToCache = ["/", "/index.html", "/manifest.json", "/Cardex_logo.png"];

const firebaseConfig = {
  apiKey: "AIzaSyAzt0L-e0BHdgRTIUHYaxzOdhDxdb2FnSs",
  authDomain: "cardex-96b70.firebaseapp.com",
  projectId: "cardex-96b70",
  storageBucket: "cardex-96b70.appspot.com",
  messagingSenderId: "447559129333",
  appId: "1:447559129333:web:471fabe7db5855d57e8dbc",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/Cardex_logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
