/*
 * Firebase Messaging Service Worker
 * 
 * This script handles background push notifications for Firebase Cloud Messaging (FCM).
 * It uses Firebase SDK v10.7.1 and the production configuration for 'pushnotificationriceflow'.
 * 
 * Key functionalities:
 * - Initializes Firebase app and messaging.
 * - Listens for incoming messages when the app is in the background.
 * - Displays a notification to the user with dynamic content from the payload.
 * - Handles notification click events to open or focus the application window.
 */

// Import and configure the Firebase SDK (using v10.7.1 for latest features and security)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Your production Firebase configuration for 'pushnotificationriceflow'
const firebaseConfig = {
  apiKey: "AIzaSyD0LzVIlcdwOfT8woWkjwSMUVHRcqII2XY",
  authDomain: "pushnotificationriceflow.firebaseapp.com",
  projectId: "pushnotificationriceflow",
  storageBucket: "pushnotificationriceflow.firebasestorage.app",
  messagingSenderId: "277653837166",
  appId: "1:277653837166:web:1ca1f799d4ae4d75461d7f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 [firebase-messaging-sw.js] Received background message:', payload);

  // Construct the notification with data from the payload
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification.',
    icon: payload.notification?.icon || '/icon-192x192.png', // Default icon
    badge: payload.data?.badge || '/badge-72x72.png', // Custom badge from data or default
    data: payload.data, // Pass along all data from the payload
    tag: payload.data?.tag || 'default-notification-tag', // Use a tag to group or replace notifications
    requireInteraction: true, // Keep the notification visible until the user interacts with it
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

  // The service worker should return the promise from showNotification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [firebase-messaging-sw.js] Notification clicked:', event);
  
  // Always close the notification when it's clicked
  event.notification.close();

  // Do nothing if the 'close' action was clicked
  if (event.action === 'close') {
    return;
  }

  // This function handles opening or focusing the app window
  const openOrFocusClient = async () => {
    const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    // Determine the URL to open, default to root
    const urlToOpen = event.notification.data?.url || '/';

    // If a client window is already open, focus it
    for (const client of clientList) {
      // Check if the client URL matches and the client can be focused
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        console.log('🔔 Focusing existing client...');
        return client.focus();
      }
    }
    
    // If no client window is found, open a new one
    if (clients.openWindow) {
      console.log(`🔔 Opening new window at: ${urlToOpen}`);
      return clients.openWindow(urlToOpen);
    }
  };

  // Use waitUntil to ensure the browser doesn't terminate the service worker before the async operation completes
  event.waitUntil(openOrFocusClient());
});
