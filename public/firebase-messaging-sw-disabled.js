// Firebase Messaging Service Worker DISABLED for iOS PWA compatibility
console.log('🚫 Firebase Messaging Service Worker BLOCKED for iOS PWA');

// This file replaces firebase-messaging-sw.js to prevent WebSocket issues in iOS PWA
// All Firebase messaging functionality is disabled for iOS PWA compatibility

self.addEventListener('install', (event) => {
  console.log('🚫 Firebase SW install blocked');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🚫 Firebase SW activate blocked');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  console.log('🚫 Firebase SW message blocked:', event.data);
});

// Block push events
self.addEventListener('push', (event) => {
  console.log('🚫 Firebase SW push blocked');
});

// Block notification click events  
self.addEventListener('notificationclick', (event) => {
  console.log('🚫 Firebase SW notification click blocked');
});