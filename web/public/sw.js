// ShopMule Service Worker
// Offline-first caching for truck shop technicians

const CACHE_VERSION = 'v1';
const SHELL_CACHE   = `shopmule-shell-${CACHE_VERSION}`;
const API_CACHE     = `shopmule-api-${CACHE_VERSION}`;

// App shell: static assets that never change between page loads
const SHELL_URLS = [
  '/',
  '/work-orders',
  '/invoices',
  '/offline',
];

// ─── Install ────────────────────────────────────────────────────────────────
// Pre-cache the app shell so navigation works offline immediately.

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Cache as many shell URLs as possible; ignore failures (pages may require auth)
      Promise.allSettled(SHELL_URLS.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

// ─── Activate ───────────────────────────────────────────────────────────────
// Clean up old cache versions.

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ──────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // ── API GET requests: stale-while-revalidate ──────────────────────────────
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(staleWhileRevalidate(request, API_CACHE, 5 * 60));
    return;
  }

  // ── API mutations (POST / PATCH / DELETE): network only ───────────────────
  // The React-side offline queue handles these when the network is unavailable.
  if (url.pathname.startsWith('/api/') && request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // ── Navigation requests: network-first → shell fallback ──────────────────
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithShellFallback(request));
    return;
  }

  // ── Static assets: cache-first ────────────────────────────────────────────
  event.respondWith(cacheFirst(request, SHELL_CACHE));
});

// ─── Strategy helpers ────────────────────────────────────────────────────────

async function staleWhileRevalidate(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    const cachedAge = getCachedAge(cached);
    if (cachedAge < maxAgeSeconds) {
      // Fresh enough — return immediately, update in background
      fetchPromise; // fire and forget
      return cached;
    }
  }

  // Cache miss or stale — wait for network
  const networkResponse = await fetchPromise;
  if (networkResponse) return networkResponse;

  // Network failed — return stale cache if available
  if (cached) return cached;

  // Nothing available — return an offline JSON response
  return new Response(
    JSON.stringify({ error: 'offline', cached: false }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}

async function networkFirstWithShellFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network failed — try cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fall back to home page shell
    const shell = await caches.match('/');
    if (shell) return shell;

    return new Response('<h1>Offline</h1><p>Please reconnect to use ShopMule.</p>', {
      headers: { 'Content-Type': 'text/html' },
      status: 503,
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

function getCachedAge(response) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return Infinity;
  return (Date.now() - new Date(dateHeader).getTime()) / 1000;
}
