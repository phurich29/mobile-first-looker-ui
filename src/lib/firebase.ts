import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration - using the same config as in firebase-messaging-sw.js
const firebaseConfig = {
  apiKey: "AIzaSyD0LzVIlcdwOfT8woWkjwSMUVHRcqII2XY",
  authDomain: "pushnotificationriceflow.firebaseapp.com",
  projectId: "pushnotificationriceflow",
  storageBucket: "pushnotificationriceflow.firebasestorage.app",
  messagingSenderId: "277653837166",
  appId: "1:277653837166:web:1ca1f799d4ae4d75461d7f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// VAPID Key for FCM (Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates)
const VAPID_KEY = "BMbbJ62A6UCQjbG3VML0KRiNEInlZchMg9ts5mm08eiZwyv3X77N7d0xhFDZzEc00282CvQs2hp0BBFTg0QPIVU"; // Replace with your actual VAPID key

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;

if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

export { messaging };

// Function to get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (!messaging) return null;
    
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY
    });
    
    if (token) {
      console.log('FCM Token:', token);
      return token;
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
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
