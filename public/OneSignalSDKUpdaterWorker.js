// Import OneSignal SDK
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// OneSignal SDK Updater Worker
const UPDATER_CACHE_NAME = 'onesignal-updater-cache-v1';

// Install event
self.addEventListener('install', function(event) {
  console.log('OneSignal Updater Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('OneSignal Updater Worker activating...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== UPDATER_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Message event handler with proper response
self.addEventListener('message', function(event) {
  console.log('Updater Worker received message:', event.data);
  
  // Handle different message types
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ version: '1.0.0-updater' });
        }
        break;
      case 'UPDATE_CHECK':
        console.log('Checking for updates...');
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ updateAvailable: false });
        }
        break;
      default:
        console.log('Unknown message type:', event.data.type);
    }
  }
  
  // Always send response back to main thread
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({ 
      success: true, 
      timestamp: Date.now(),
      worker: 'updater'
    });
  }
});

// Push event handler - แสดงการแจ้งเตือนทุกครั้งที่ได้รับ push
self.addEventListener('push', function(event) {
  console.log('✅✅✅ Updater Worker: Push notification received:', event);
  
  // กำหนดข้อมูลเริ่มต้นในกรณีที่ไม่มีข้อมูล
  let title = 'RiceFlow แจ้งเตือน';
  let options = {
    body: 'คุณมีการแจ้งเตือนใหม่จาก RiceFlow!',
    icon: '/favicon.ico',
    vibrate: [200, 100, 200, 100, 200],
    badge: '/favicon.ico',
    tag: 'onesignal-notification-updater-' + Date.now(),
    requireInteraction: true,
    renotify: true
  };
  
  try {
    // พยายามอ่านข้อมูลจาก push event ถ้ามี
    if (event.data) {
      const data = event.data.json();
      console.log('📲 Updater Worker: Push data received:', data);
      
      // อัพเดทข้อมูลถ้ามีค่าจาก push
      if (data) {
        title = data.title || title;
        options.body = data.message || data.body || data.content || options.body;
        if (data.icon) options.icon = data.icon;
        if (data.image) options.image = data.image;
        if (data.actions) options.actions = data.actions;
        options.data = data;
      }
    }
  } catch (e) {
    console.error('⚠️ Updater Worker: Error parsing push data, using default notification:', e);
    // ถ้าพาร์สข้อมูลไม่ได้ ก็ยังคงใช้การแจ้งเตือนเริ่มต้น
  }
  
  // แสดงการแจ้งเตือนทุกครั้ง ไม่ว่าจะมีข้อมูลหรือไม่ก็ตาม
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('🔔🔔🔔 Updater Worker: Notification shown successfully'))
      .catch(error => console.error('❌❌❌ Updater Worker: Error showing notification:', error))
      .then(() => {
        // ยืนยันว่าแสดงแล้วโดยส่งข้อมูลไปยัง client
        return self.clients.matchAll({
          includeUncontrolled: true,
          type: 'window'
        }).then(clients => {
          if (clients && clients.length) {
            clients.forEach(client => {
              client.postMessage({
                type: 'NOTIFICATION_DISPLAYED_FROM_UPDATER',
                title: title,
                options: options,
                timestamp: Date.now()
              });
            });
          }
        });
      })
  );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  console.log('Updater Worker: Notification clicked:', event);
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === self.location.origin + '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Fetch event handler
self.addEventListener('fetch', function(event) {
  // Let OneSignal handle its own requests
  if (event.request.url.includes('onesignal.com')) {
    return;
  }
  
  // Handle other requests
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
