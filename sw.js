/* =====================================================================
   sw.js — service worker voor Mickey Design.
   Zorgt dat de site geïnstalleerd kan worden en offline blijft werken:
   bestanden worden in de cache bewaard en meteen getoond, terwijl op de
   achtergrond een frisse versie wordt opgehaald.
   ===================================================================== */

const CACHE = "md-cache-v1";

// Bestanden die nodig zijn om de site (offline) te tonen.
const CORE = [
  "./",
  "./index.html",
  "./assets/css/styles.css",
  "./assets/js/data.js",
  "./assets/js/app.js",
  "./assets/icons/icon.svg",
  "./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Alleen eigen bestanden cachen; externe bronnen (fonts, Discord, afbeeldingen
  // op andere domeinen) laten we gewoon via het netwerk lopen.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
