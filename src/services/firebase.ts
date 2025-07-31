// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';

// Firebase configuration - Replace with your actual values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD8J2uKgF-7yO3RnK4Qg2l1M6vH0wX9ZcQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "riceflow-958a2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "riceflow-958a2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "riceflow-958a2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: Messaging | null = null;

// Only initialize messaging in web environment
if (!Capacitor.isNativePlatform()) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
  }
}

export { app, messaging };

// Function to get FCM registration token
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Firebase Messaging not available');
    return null;
  }

  try {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BNxV4F2o8KxJ3hL9mN1pQ2rS4tU6vW8xY0zA1bC3dE5fG7hI9jK0lM2nO4pQ6rS8tU0vW2xY4zA6bC8dE0fG2hI4';
    
    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey
    });
    
    if (currentToken) {
      console.log('FCM registration token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Function to handle foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.warn('Firebase Messaging not available');
    return;
  }

  return onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
};

export default app;
