import { Capacitor } from '@capacitor/core';

// Type definitions for OneSignal
interface NotificationEvent {
  notification: {
    notificationId: string;
    additionalData?: object;
    display(): void;
  };
  preventDefault(): void;
}

interface ClickEvent {
  notification: {
    additionalData?: object;
  };
}

interface OneSignalInterface {
  initialize(appId: string): void;
  setConsentGiven(consent: boolean): void;
  login(externalId: string): void;
  logout(): void;
  Debug: {
    setLogLevel(level: number): void;
  };
  User: {
    getOnesignalId(): Promise<string>;
    addTags(tags: Record<string, string>): void;
    getTags(): Record<string, string>;
    pushSubscription: {
      optIn(): void;
      optOut(): void;
      getOptedIn(): boolean;
      getPushSubscriptionToken(): Promise<string>;
      addEventListener(event: string, callback: (event: unknown) => void): void;
    };
  };
  Notifications: {
    requestPermission(fallbackToSettings?: boolean): Promise<boolean>;
    getPermissionAsync(): Promise<boolean>;
    addEventListener(event: string, callback: (event: unknown) => void): void;
  };
}

// Global variable to store OneSignal instance
let OneSignalInstance: OneSignalInterface | null = null;

// Function to load OneSignal dynamically
async function loadOneSignal(): Promise<OneSignalInterface | null> {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  if (OneSignalInstance) {
    return OneSignalInstance;
  }

  try {
    const module = await import('react-native-onesignal');
    OneSignalInstance = module.OneSignal as OneSignalInterface;
    return OneSignalInstance;
  } catch (error) {
    console.warn('OneSignal not available:', error);
    return null;
  }
}

export interface OneSignalConfig {
  appId: string;
  requiresUserPrivacyConsent?: boolean;
  promptForPushNotificationsWithUserResponse?: boolean;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  userIds?: string[];
  segments?: string[];
}

export interface NotificationOpenedEvent {
  notification: {
    notificationId: string;
    additionalData?: Record<string, unknown>;
  };
}

export interface DeviceState {
  userId?: string;
  pushToken?: string;
  hasNotificationPermission?: boolean;
  pushDisabled?: boolean;
  subscribed?: boolean;
}

class OneSignalService {
  private initialized = false;
  private appId: string = '';

  /**
   * Initialize OneSignal with your app configuration
   * Call this in your App.tsx or main.tsx
   */
  async initialize(config: OneSignalConfig): Promise<void> {
    if (this.initialized) {
      console.log('OneSignal already initialized');
      return;
    }

    try {
      // Check if running on native platform
      if (!Capacitor.isNativePlatform()) {
        console.log('OneSignal: Not running on native platform, skipping initialization');
        return;
      }

      // Load OneSignal dynamically
      const OneSignal = await loadOneSignal();
      if (!OneSignal) {
        console.log('OneSignal: Not available on this platform');
        return;
      }

      this.appId = config.appId;

      // OneSignal Initialization
      OneSignal.initialize(config.appId);

      // Require user privacy consent (GDPR compliance)
      if (config.requiresUserPrivacyConsent) {
        OneSignal.Debug.setLogLevel(6);
        OneSignal.User.pushSubscription.optOut();
      }

      // Request push notification permissions
      if (config.promptForPushNotificationsWithUserResponse !== false) {
        const permission = await OneSignal.Notifications.requestPermission(true);
        console.log('Push notification permission response:', permission);
      }

      // Set up notification handlers
      await this.setupNotificationHandlers();

      this.initialized = true;
      console.log('OneSignal initialized successfully');
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
      throw error;
    }
  }

  /**
   * Set up notification event handlers
   */
  private async setupNotificationHandlers(): Promise<void> {
    const OneSignal = await loadOneSignal();
    if (!OneSignal) return;

    // Handle notification will show in foreground
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: unknown) => {
      console.log('OneSignal: notification will show in foreground:', event);
      
      // Type guard for the event
      if (event && typeof event === 'object' && 'preventDefault' in event && 'notification' in event) {
        const notificationEvent = event as { preventDefault(): void; notification: { display(): void } };
        notificationEvent.preventDefault();
        notificationEvent.notification.display();
      }
    });

    // Handle notification clicked/opened
    OneSignal.Notifications.addEventListener('click', (event: unknown) => {
      console.log('OneSignal: notification clicked:', event);
      
      // Type guard for the event
      if (event && typeof event === 'object' && 'notification' in event) {
        const clickEvent = event as { notification: { additionalData?: object } };
        this.handleNotificationOpened(clickEvent);
      }
    });

    // Handle push subscription changed
    OneSignal.User.pushSubscription.addEventListener('change', (event: unknown) => {
      console.log('OneSignal: push subscription changed:', event);
    });
  }

  /**
   * Handle notification opened/tapped
   */
  private handleNotificationOpened(event: { notification: { additionalData?: object } }): void {
    const data = event.notification.additionalData as Record<string, unknown> | undefined;
    
    if (data) {
      // Navigate based on notification data
      if (data.screen) {
        // You can implement navigation logic here
        console.log('Navigate to screen:', data.screen);
        // Example: NavigationService.navigate(data.screen, data.params);
      }
      
      if (data.deviceCode) {
        // Navigate to specific device
        console.log('Navigate to device:', data.deviceCode);
        // Example: NavigationService.navigate('DeviceDetails', { deviceCode: data.deviceCode });
      }
    }
  }

  /**
   * Get the current user's OneSignal player ID
   */
  async getPlayerId(): Promise<string | null> {
    try {
      if (!this.initialized || !Capacitor.isNativePlatform()) {
        return null;
      }

      const OneSignal = await loadOneSignal();
      if (!OneSignal) return null;

      return await OneSignal.User.getOnesignalId() || null;
    } catch (error) {
      console.error('Error getting OneSignal player ID:', error);
      return null;
    }
  }

  /**
   * Set external user ID (your app's user ID)
   */
  async setExternalUserId(userId: string): Promise<void> {
    try {
      if (!this.initialized || !Capacitor.isNativePlatform()) {
        return;
      }

      const OneSignal = await loadOneSignal();
      if (!OneSignal) return;

      OneSignal.login(userId);
      console.log('External user ID set:', userId);
    } catch (error) {
      console.error('Error setting external user ID:', error);
    }
  }

  /**
   * Remove external user ID
   */
  async removeExternalUserId(): Promise<void> {
    try {
      if (!this.initialized || !Capacitor.isNativePlatform()) {
        return;
      }

      const OneSignal = await loadOneSignal();
      if (!OneSignal) return;

      OneSignal.logout();
      console.log('External user ID removed');
    } catch (error) {
      console.error('Error removing external user ID:', error);
    }
  }

  /**
   * Send tags to OneSignal for user segmentation
   */
  async sendTags(tags: Record<string, string>): Promise<void> {
    try {
      if (!this.initialized || !Capacitor.isNativePlatform()) {
        return;
      }

      const OneSignal = await loadOneSignal();
      if (!OneSignal) return;

      OneSignal.User.addTags(tags);
      console.log('Tags sent to OneSignal:', tags);
    } catch (error) {
      console.error('Error sending tags:', error);
    }
  }

  /**
   * Get current tags
   */
  async getTags(): Promise<Record<string, string> | null> {
    try {
      if (!this.initialized || !Capacitor.isNativePlatform()) {
        return null;
      }

      const OneSignal = await loadOneSignal();
      if (!OneSignal) return null;

      return OneSignal.User.getTags();
    } catch (error) {
      console.error('Error getting tags:', error);
      return null;
    }
  }

  /**
   * Set notification subscription status
   */
  async setSubscription(subscribed: boolean): Promise<void> {
    try {
      if (!this.initialized || !Capacitor.isNativePlatform()) {
        return;
      }

      const OneSignal = await loadOneSignal();
      if (!OneSignal) return;

      if (subscribed) {
        OneSignal.User.pushSubscription.optIn();
      } else {
        OneSignal.User.pushSubscription.optOut();
      }
    } catch (error) {
      console.error('Error setting subscription:', error);
    }
  }

  /**
   * Check if user has granted notification permissions
   */
  async hasNotificationPermission(): Promise<boolean> {
    try {
      if (!this.initialized || !Capacitor.isNativePlatform()) {
        return false;
      }

      const OneSignal = await loadOneSignal();
      if (!OneSignal) return false;

      const permission = await OneSignal.Notifications.getPermissionAsync();
      return permission;
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }

  /**
   * Check if push notifications are enabled
   */
  async isPushNotificationsEnabled(): Promise<boolean> {
    try {
      if (!this.initialized || !Capacitor.isNativePlatform()) {
        return false;
      }

      const OneSignal = await loadOneSignal();
      if (!OneSignal) return false;

      const isOptedIn = OneSignal.User.pushSubscription.getOptedIn();
      return isOptedIn;
    } catch (error) {
      console.error('Error checking push notification status:', error);
      return false;
    }
  }

  /**
   * Provide user privacy consent (for GDPR compliance)
   */
  async provideUserConsent(consent: boolean): Promise<void> {
    try {
      if (!this.initialized || !Capacitor.isNativePlatform()) {
        return;
      }

      const OneSignal = await loadOneSignal();
      if (!OneSignal) return;

      OneSignal.setConsentGiven(consent);
    } catch (error) {
      console.error('Error providing user consent:', error);
    }
  }

  /**
   * Check if user privacy consent is required
   */
  async userProvidedPrivacyConsent(): Promise<boolean> {
    try {
      if (!this.initialized || !Capacitor.isNativePlatform()) {
        return true; // Assume consent for web
      }

      // For OneSignal v5, check if consent is required
      return true; // You may need to implement your own consent tracking
    } catch (error) {
      console.error('Error checking user consent:', error);
      return false;
    }
  }

  /**
   * Get device information
   */
  async getDeviceState(): Promise<DeviceState | null> {
    try {
      if (!this.initialized || !Capacitor.isNativePlatform()) {
        return null;
      }

      const OneSignal = await loadOneSignal();
      if (!OneSignal) return null;

      const userId = await OneSignal.User.getOnesignalId();
      const pushToken = await OneSignal.User.pushSubscription.getPushSubscriptionToken();
      const hasPermission = await OneSignal.Notifications.getPermissionAsync();
      const isOptedIn = OneSignal.User.pushSubscription.getOptedIn();

      return {
        userId: userId || undefined,
        pushToken: pushToken || undefined,
        hasNotificationPermission: hasPermission,
        pushDisabled: !isOptedIn,
        subscribed: isOptedIn,
      };
    } catch (error) {
      console.error('Error getting device state:', error);
      return null;
    }
  }
}

// Export singleton instance
export const oneSignalService = new OneSignalService();
export default oneSignalService;
