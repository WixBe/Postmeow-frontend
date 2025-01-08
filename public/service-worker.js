const CACHE_NAME = 'pwa-cache-v1';
const STATIC_CACHE_NAME = 'static-cache-v1';
const API_CACHE_NAME = 'api-cache-v1';

// Add all your static assets here
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/static/js/main.js',
  '/static/css/main.css',
  // Add any other static assets your app needs
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static files');
        return cache.addAll(urlsToCache);
      }),
      // Create API cache
      caches.open(API_CACHE_NAME)
    ])
  );
  // Force activation
  self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  event.waitUntil(clients.claim());
});

// Helper function to determine if a request is API call
const isApiRequest = (request) => {
  return request.url.includes('api.sampleapis.com');
};

// Fetch event - Handle both static and API requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        if (isApiRequest(event.request)) {
          // Handle API requests
          // Try cache first for API requests
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse && !navigator.onLine) {
            return cachedResponse;
          }

          try {
            // If online, try network and update cache
            const response = await fetch(event.request);
            const responseToCache = response.clone();
            
            // Cache the new response
            const cache = await caches.open(API_CACHE_NAME);
            await cache.put(event.request, responseToCache);
            
            return response;
          } catch (error) {
            // If network fails, return cached version if available
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cache, return offline response
            return new Response(
              JSON.stringify({ error: 'No cached data available and network request failed' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
        } else {
          // Handle static assets - Cache First strategy
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // If not in cache, try network
          try {
            const response = await fetch(event.request);
            // Cache the new static asset
            const cache = await caches.open(STATIC_CACHE_NAME);
            await cache.put(event.request, response.clone());
            return response;
          } catch (error) {
            // For HTML requests when offline, return the offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            throw error;
          }
        }
      } catch (error) {
        console.error('Service Worker fetch error:', error);
        // Return a basic offline response
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      }
    })()
  );
});