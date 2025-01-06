const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

// Install event - Cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Error caching static assets:', error);
      })
  );
});

// Fetch event - Serve cached assets or fetch from network
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Serve cached response if available and valid
        if (response && isResponseValid(response)) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }

        // Fallback to network fetch if not cached or invalid
        return fetch(event.request)
          .then((response) => {
            // Cache the fetched response for future requests
            if (shouldCacheResponse(response)) {
              const responseClone = response.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                  console.log('Cached response:', event.request.url);
                })
                .catch((error) => {
                  console.error('Error caching fetched response:', error);
                });
            }
            return response;
          })
          .catch((error) => {
            console.error('Error fetching from network:', error);
            // Handle network errors gracefully (e.g., display an error message)
            return new Response('Network error occurred.', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
  );
});

// Activate event - Clear old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        )
      )
      .catch((error) => {
        console.error('Error clearing old caches:', error);
      })
  );
});

// Helper functions (optional)
function isResponseValid(response: Response): boolean {
  // Implement logic to check if the cached response is still valid
  // (e.g., based on expiration time, headers, etc.)
  return true; // Placeholder for now
}

function shouldCacheResponse(response: Response): boolean {
  // Implement logic to determine if the fetched response should be cached
  // (e.g., based on content type, status code, etc.)
  return response.ok; // Cache successful responses by default
}
