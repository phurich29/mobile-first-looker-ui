import { Capacitor } from '@capacitor/core';
import { PushNotifications, type PushNotificationSchema, type ActionPerformed, type PushNotificationToken } from '@capacitor/push-notifications';
import { getFCMToken, onForegroundMessage } from './firebase';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  image?: string;
}

export class FCMService {
  private isInitialized = false;
  private registrationToken: string | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }
      
      this.isInitialized = true;
      console.log('FCM Service initialized successfully');
    } catch (error) {
      console.error('Error initializing FCM Service:', error);
      throw error;
    }
  }

  private async initializeNative(): Promise<void> {
    // Request permissions
    const permStatus = await PushNotifications.requestPermissions();
    
    if (permStatus.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();
    } else {
      throw new Error('Push notification permissions not granted');
    }

    // Setup listeners
    this.setupNativeListeners();
  }

  private async initializeWeb(): Promise<void> {
    console.log('🔔 Initializing FCM for web platform...');
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    console.log('🔔 Notification permission:', permission);
    
    if (permission === 'granted') {
      try {
        // Get FCM token for web
        this.registrationToken = await getFCMToken();
        console.log('🔔 FCM token obtained:', this.registrationToken ? 'Yes' : 'No');
        
        if (this.registrationToken) {
          this.onTokenReceived?.(this.registrationToken);
        }
        
        // Setup foreground message listener
        const unsubscribe = onForegroundMessage((payload) => {
          console.log('🔔 Foreground message received:', payload);
          this.handleForegroundMessage(payload);
        });
        
        console.log('🔔 Foreground message listener setup complete');
      } catch (error) {
        console.error('🔔 Error getting FCM token or setting up listeners:', error);
        throw error;
      }
    } else {
      throw new Error(`Notification permission ${permission}`);
    }
  }

  private setupNativeListeners(): void {
    // On successful registration
    PushNotifications.addListener('registration', (token: PushNotificationToken) => {
      console.log('Push registration success, token: ' + token.value);
      this.registrationToken = token.value;
      this.onTokenReceived?.(token.value);
    });

    // Some issue with the registration
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Registration error:', error);
      this.onRegistrationError?.(error);
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);
      this.onNotificationReceived?.(notification);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push notification action performed:', notification);
      this.onNotificationOpened?.(notification);
    });
  }

  private handleForegroundMessage(payload: any): void {
    console.log('🔔 Handling foreground message:', payload);
    
    // Call the notification received callback first
    this.onNotificationReceived?.(payload);
    
    // Show browser notification if the app is in foreground and browser supports it
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(payload.notification?.title || 'New Message', {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/favicon.ico',
        badge: payload.notification?.badge,
        data: payload.data,
        tag: payload.data?.tag || 'fcm-notification'
      });

      notification.onclick = () => {
        console.log('🔔 Browser notification clicked');
        window.focus();
        notification.close();
        this.onNotificationOpened?.(payload);
      };
      
      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  // Get the registration token
  getToken(): string | null {
    return this.registrationToken;
  }

  // Event handlers - can be overridden
  onTokenReceived?: (token: string) => void;
  onRegistrationError?: (error: any) => void;
  onNotificationReceived?: (notification: any) => void;
  onNotificationOpened?: (notification: any) => void;

  // Send token to your server
  async sendTokenToServer(token: string, userId?: string): Promise<void> {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/fcm/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId,
          platform: Capacitor.getPlatform(),
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send token to server');
      }

      console.log('Token sent to server successfully');
    } catch (error) {
      console.error('Error sending token to server:', error);
      throw error;
    }
  }

  // Remove token from server when user logs out
  async removeTokenFromServer(token: string): Promise<void> {
    try {
      const response = await fetch('/api/fcm/unregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove token from server');
      }

      console.log('Token removed from server successfully');
    } catch (error) {
      console.error('Error removing token from server:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const fcmService = new FCMService();
