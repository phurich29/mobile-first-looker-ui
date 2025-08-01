<<<<<<< HEAD
// firebase-messaging-sw.js - Auto-generated

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - Auto-generated from environment variables
const firebaseConfig = {
  "apiKey": "AIzaSyD8J2uKgF-7yO3RnK4Qg2l1M6vH0wX9ZcQ",
  "authDomain": "riceflow-958a2.firebaseapp.com",
  "projectId": "riceflow-958a2",
  "storageBucket": "riceflow-958a2.firebasestorage.app",
  "messagingSenderId": "123456789012",
  "appId": "1:123456789012:web:abc123def456"
=======
// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0LzVIlcdwOfT8woWkjwSMUVHRcqII2XY",
  authDomain: "pushnotificationriceflow.firebaseapp.com",
  projectId: "pushnotificationriceflow",
  storageBucket: "pushnotificationriceflow.firebasestorage.app",
  messagingSenderId: "277653837166",
  appId: "1:277653837166:web:1ca1f799d4ae4d75461d7f"
>>>>>>> e443fae84cc3472e014a505b09ab7122ce88219e
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

<<<<<<< HEAD
// Get messaging instance
=======
// Retrieve an instance of Firebase Messaging so that it can handle background messages
>>>>>>> e443fae84cc3472e014a505b09ab7122ce88219e
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
<<<<<<< HEAD
  console.log('🔔 Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
    tag: payload.data?.tag || 'default',
=======
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'notification-tag',
>>>>>>> e443fae84cc3472e014a505b09ab7122ce88219e
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

<<<<<<< HEAD
  return self.registration.showNotification(notificationTitle, notificationOptions);
=======
  self.registration.showNotification(notificationTitle, notificationOptions);
>>>>>>> e443fae84cc3472e014a505b09ab7122ce88219e
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
<<<<<<< HEAD
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
=======
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
>>>>>>> e443fae84cc3472e014a505b09ab7122ce88219e
});
