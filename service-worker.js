const CACHE_NAME = "smiles-cache-v1";
const SHELL_FILES = [
  "./index.html",
  "./manifest.json",
  "./styles/main.css",
  "./scripts/app.js",
  "./scripts/games.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Always go to network for the data file so new letters show up; fall back to cache offline.
  if (url.pathname.endsWith("/data/days.json")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Shell files: cache-first for speed and offline support.
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// If a notification (shown while the app was open) is tapped, focus/open the app.
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow("./index.html");
    })
  );
});
