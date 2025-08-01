import { useEffect, useState } from 'react';
import { getFCMToken, onMessageListener } from '@/lib/firebase';

interface FCMNotification {
  title?: string;
  body?: string;
  icon?: string;
}

export const useFCM = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<FCMNotification | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if FCM is supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
      setIsSupported(true);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        
        // Register service worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker registered:', registration);
        }
        
        // Get FCM token
        const fcmToken = await getFCMToken();
        setToken(fcmToken);
        
        return fcmToken;
      } else {
        console.log('Notification permission denied.');
        return null;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  };

  useEffect(() => {
    if (isSupported) {
      // Listen for foreground messages
      onMessageListener()
        .then((payload: any) => {
          console.log('Foreground message received:', payload);
          setNotification({
            title: payload.notification?.title,
            body: payload.notification?.body,
            icon: payload.notification?.icon
          });
        })
        .catch((error) => {
          console.error('Error listening for messages:', error);
        });
    }
  }, [isSupported]);

  const clearNotification = () => {
    setNotification(null);
  };

  return {
    token,
    notification,
    isSupported,
    requestPermission,
    clearNotification
  };
};
