// iOS PWA Compatible Service Worker - No WebSocket connections
console.log('🔧 PWA Service Worker: Starting with WebSocket blocking...');

// Block WebSocket in Service Worker context
if (typeof WebSocket !== 'undefined') {
  self.WebSocket = function BlockedWebSocket(url, protocols) {
    console.error('🚫 SW: WebSocket blocked in service worker:', url);
    
    // Return mock instead of throwing
    const mockSocket = {
      readyState: 3, // CLOSED
      close: () => {},
      send: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      url: url.toString(),
      protocol: '',
      extensions: '',
      bufferedAmount: 0,
      binaryType: 'blob',
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    };

    // Simulate immediate close
    setTimeout(() => {
      if (mockSocket.onclose) {
        mockSocket.onclose({ code: 1006, reason: 'WebSocket blocked in service worker' });
      }
    }, 0);

    return mockSocket;
  };
}

// Block EventSource as well
if (typeof EventSource !== 'undefined') {
  self.EventSource = function BlockedEventSource(url) {
    console.error('🚫 SW: EventSource blocked in service worker:', url);
    return {
      readyState: 2, // CLOSED
      close: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      onopen: null,
      onmessage: null,
      onerror: null
    };
  };
}

// Simple PWA caching strategy - no external connections
const CACHE_NAME = 'riceflow-pwa-v1';
const urlsToCache = [
  '/',
  '/manifest.webmanifest',
  '/equipment',
  '/notifications',
  '/notification-settings',
  '/devices',
  '/about-riceflow'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🔧 SW: Caching essential resources');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('🔧 SW: Cache installation failed:', error);
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔧 SW: Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🔧 SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients
  self.clients.claim();
});

// Fetch event - network first for API, cache first for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip WebSocket upgrade requests
  if (request.headers.get('upgrade') === 'websocket') {
    console.log('🚫 SW: Blocked WebSocket upgrade request:', request.url);
    return;
  }
  
  // Skip realtime or WebSocket related requests
  if (url.pathname.includes('realtime') || 
      url.pathname.includes('websocket') ||
      url.protocol === 'ws:' || 
      url.protocol === 'wss:') {
    console.log('🚫 SW: Blocked realtime/WebSocket request:', request.url);
    return;
  }
  
  // API requests - network first
  if (url.origin.includes('supabase.co') || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response for caching
          const responseClone = response.clone();
          
          // Cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Fallback to cache on network failure
          return caches.match(request);
        })
    );
    return;
  }
  
  // Static assets - cache first
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseClone = response.clone();
            
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
            
            return response;
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('🔧 SW: Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ SW: PWA Service Worker registered successfully (WebSocket blocked)');
