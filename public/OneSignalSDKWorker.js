// Import OneSignal SDK
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// Service Worker for OneSignal Push Notifications
const CACHE_NAME = 'onesignal-cache-v1';

// 🔥 Force notification display
const FORCE_SHOW_NOTIFICATIONS = true;

// Install event
self.addEventListener('install', function(event) {
  console.log('OneSignal Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('OneSignal Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Message event handler
self.addEventListener('message', function(event) {
  console.log('Service Worker received message:', event.data);
  
  // Handle different message types
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: '1.0.0' });
        break;
      default:
        console.log('Unknown message type:', event.data.type);
    }
  }
  
  // Send response back to main thread
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({ success: true });
  }
});

// Push event handler - แสดงการแจ้งเตือนทุกครั้งที่ได้รับ push
self.addEventListener('push', function(event) {
  console.log('✅✅✅ Push notification received:', event);
  
  // กำหนดข้อมูลเริ่มต้นในกรณีที่ไม่มีข้อมูล
  let title = 'RiceFlow แจ้งเตือน';
  let options = {
    body: 'คุณมีการแจ้งเตือนใหม่จาก RiceFlow!',
    icon: '/favicon.ico',
    vibrate: [200, 100, 200, 100, 200],
    badge: '/favicon.ico',
    tag: 'onesignal-notification-' + Date.now(),
    requireInteraction: true,
    renotify: true
  };
  
  try {
    // พยายามอ่านข้อมูลจาก push event ถ้ามี
    if (event.data) {
      const data = event.data.json();
      console.log('📲 Push data received:', data);
      
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
    console.error('⚠️ Error parsing push data, using default notification:', e);
    // ถ้าพาร์สข้อมูลไม่ได้ ก็ยังคงใช้การแจ้งเตือนเริ่มต้น
  }
  
  // 🔥 แสดงการแจ้งเตือนแบบบังคับ - ต้องแสดงทุกครั้ง!
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('🚀 Forcing notification display:', title, options);
      return self.registration.showNotification(title, options);
    })
    .then(() => {
      console.log('✅✅✅ Notification displayed successfully:', title);
      // ส่งข้อความกลับไปยัง main thread
      return self.clients.matchAll();
    })
    .then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_DISPLAYED',
          title: title,
          body: options.body,
          timestamp: Date.now()
        });
      });
    })
    .catch((error) => {
      console.error('❌❌❌ Failed to show notification:', error);
      // แม้ error ก็ยังพยายามแสดง notification อีกครั้ง
      return self.registration.showNotification('RiceFlow Alert', {
        body: 'คุณมีการแจ้งเตือนใหม่!',
        icon: '/favicon.ico',
        tag: 'fallback-notification-' + Date.now()
      });
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // If a window is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === self.location.origin + '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Fetch event handler (for caching if needed)
self.addEventListener('fetch', function(event) {
  // Let OneSignal handle its own requests
  if (event.request.url.includes('onesignal.com')) {
    return;
  }
  
  // Handle other requests normally
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});