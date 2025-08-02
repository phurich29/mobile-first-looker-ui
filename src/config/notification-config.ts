/**
 * Notification System Configuration
 * 
 * This file controls which notification systems are active.
 * You can switch between OneSignal only, FCM only, or both systems.
 */

export interface NotificationConfig {
  useOneSignal: boolean;
  useFCM: boolean;
  primarySystem: 'onesignal' | 'fcm';
  fallbackEnabled: boolean;
}

// Current recommended configuration
export const notificationConfig: NotificationConfig = {
  useOneSignal: true,     // Primary system - easy to use, feature-rich
  useFCM: false,          // Backup system - keep code but don't initialize
  primarySystem: 'onesignal',
  fallbackEnabled: false  // Set to true if you want automatic fallback
};

// Alternative configurations for different scenarios:

// For cost optimization (when scaling up):
export const costOptimizedConfig: NotificationConfig = {
  useOneSignal: false,
  useFCM: true,
  primarySystem: 'fcm',
  fallbackEnabled: false
};

// For maximum reliability (both systems):
export const redundantConfig: NotificationConfig = {
  useOneSignal: true,
  useFCM: true,
  primarySystem: 'onesignal',
  fallbackEnabled: true
};

// Environment-based configuration
export const getNotificationConfig = (): NotificationConfig => {
  const environment = import.meta.env.MODE;
  
  switch (environment) {
    case 'development':
      return notificationConfig; // OneSignal only for easier testing
    
    case 'production':
      return notificationConfig; // OneSignal only for production
    
    case 'staging':
      return redundantConfig; // Test both systems in staging
    
    default:
      return notificationConfig;
  }
};

// Helper functions
export const shouldInitializeOneSignal = (): boolean => {
  const config = getNotificationConfig();
  return config.useOneSignal;
};

export const shouldInitializeFCM = (): boolean => {
  const config = getNotificationConfig();
  return config.useFCM;
};

export const getPrimaryNotificationSystem = (): 'onesignal' | 'fcm' => {
  const config = getNotificationConfig();
  return config.primarySystem;
};
