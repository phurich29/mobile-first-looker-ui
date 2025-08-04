// Script to generate firebase config for service worker at build time
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBlZ8ZXcCFqEnqvAr3y7vGWX8J8V0yNw7Y",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "wasurus.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "wasurus",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "wasurus.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1028142170099",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:1028142170099:android:a49b8cc1183c870fc05c86"
};

// Generate service worker content
const serviceWorkerContent = `// firebase-messaging-sw.js - Auto-generated

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - Auto-generated from environment variables
const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};

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
`;

// Write to public directory
const outputPath = join(__dirname, '..', 'public', 'firebase-messaging-sw.js');
writeFileSync(outputPath, serviceWorkerContent, 'utf8');

console.log('✅ Firebase service worker generated with current environment configuration');
console.log('📍 Written to:', outputPath);
