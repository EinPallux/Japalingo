/* Japalingo service worker — offline support for the learning app.
 *
 * Strategy:
 *  - immutable static assets (/_next/static, fonts, images): cache-first, so the
 *    app shell loads instantly and works fully offline after the first visit;
 *  - everything else same-origin (page navigations, RSC payloads): network-first
 *    with a cache fallback, so online users always get fresh content but a
 *    dropped connection still serves the last-seen page — or the offline screen.
 *
 * All learning state lives in localStorage, so once the shell is cached the whole
 * app (lessons, games, SRS) keeps working with no network.
 */
const CACHE = "japalingo-v1";
const OFFLINE_URL = "/offline";
// Precache the offline screen + the app's entry route, so opening the installed
// app offline lands on the learning path (not a dead page). allSettled so one
// failed fetch never aborts the whole install.
const PRECACHE = [OFFLINE_URL, "/learn"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:woff2?|ttf|otf|png|svg|jpg|jpeg|webp|gif|ico|mp3|wav)$/i.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Cache-first for hashed/immutable assets.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Network-first for navigations + data; fall back to cache, then offline page.
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === "navigate") return caches.match(OFFLINE_URL);
          return Response.error();
        }),
      ),
  );
});
