// firebase-messaging-sw.js - Auto-generated

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - Auto-generated from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyDO5lYCkbXExFEmf3x7H1WSC6qiE2W-Jrs",
  authDomain: "riceflow-958a2.firebaseapp.com",
  projectId: "riceflow-958a2",
  storageBucket: "riceflow-958a2.firebasestorage.app",
  messagingSenderId: "1043235929904",
  appId: "1:1043235929904:web:3e3a53a31e51fca8f292f5",
  measurementId: "G-4WV9Z264DT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
    tag: payload.data?.tag || 'default',
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

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
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
});
