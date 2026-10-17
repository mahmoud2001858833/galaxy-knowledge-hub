/**
 * Zarwat Al-Elm 2.0 — Sovereign Offline-First Service Worker
 * Caches:
 * - App Shell & Static Bundles (JS, CSS, Fonts, Icons)
 * - 49 Interactive Simulations & Local HTML5 Engines (/simulations/*.html)
 * - Offline SPA Navigation Fallback
 */

const CACHE_VERSION = 'zarwat-sovereign-v2.4';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const SIMULATIONS_CACHE = `${CACHE_VERSION}-simulations`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const CORE_PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/logo.png',
  '/simulations/hookes-law.html',
  '/simulations/pendulum-lab.html',
  '/simulations/energy-skate-park.html',
  '/simulations/circuit-construction-kit-dc.html',
  '/simulations/geometric-optics-basics.html',
  '/simulations/bending-light.html',
  '/simulations/ph-scale.html',
  '/simulations/build-a-nucleus.html',
  '/simulations/balloons-and-static-electricity.html',
  '/simulations/faradays-electromagnetic-lab.html',
  '/simulations/wave-interference.html',
  '/simulations/my-solar-system.html',
  '/simulations/natural-selection.html',
  '/simulations/membrane-transport.html',
  '/simulations/neuron.html',
  '/simulations/models-of-the-hydrogen-atom.html',
  '/simulations/quantum-wave-interference.html',
  '/simulations/quantum-measurement.html',
  '/simulations/projectile-sampling-distributions.html',
  '/simulations/quadrilateral.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Cache core app shell safely without failing entire install if one optional asset fails
      for (const url of ['/', '/index.html', '/manifest.json', '/favicon.png']) {
        try {
          await cache.add(url);
        } catch (err) {
          // Ignore individual asset error during install
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((oldKey) => caches.delete(oldKey))
      )
    ).then(() => self.clients.claim())
  );
});

// Listen for on-demand Field Pack Pre-caching from the UI
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'PRECACHE_FIELD_PACK') {
    const urls = event.data.urls || CORE_PRECACHE_URLS;
    event.waitUntil(
      (async () => {
        const simCache = await caches.open(SIMULATIONS_CACHE);
        let completed = 0;
        for (const url of urls) {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response.ok) {
              await simCache.put(url, response.clone());
            }
          } catch (e) {
            // Continue even if offline or single file unavailable
          }
          completed++;
          const clientsList = await self.clients.matchAll();
          for (const client of clientsList) {
            client.postMessage({
              type: 'FIELD_PACK_PROGRESS',
              completed,
              total: urls.length,
              percent: Math.round((completed / urls.length) * 100),
            });
          }
        }
      })()
    );
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip external API calls (Supabase / Gemini streaming) so they always hit live network
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com') ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/auth/')
  ) {
    return;
  }

  // 1. Simulation HTML files: Cache-First with background update
  if (url.pathname.startsWith('/simulations/')) {
    event.respondWith(
      caches.open(SIMULATIONS_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Fonts, Images): Stale-While-Revalidate
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              cache.put(request, networkRes.clone());
            }
            return networkRes;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 3. SPA Navigation Requests: Network-First with Offline /index.html Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          const cache = await caches.open(STATIC_CACHE);
          cache.put('/index.html', response.clone());
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(STATIC_CACHE);
          const cachedIndex = await cache.match('/index.html');
          return cachedIndex || caches.match('/');
        })
    );
  }
});
