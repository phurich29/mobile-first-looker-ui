import { useCallback, useRef } from 'react';
import { getNotificationsEnabled, NOTIFICATIONS_ENABLED_KEY } from '@/hooks/useAlertSound';
import { storage } from '@/utils/storage';

/**
 * Enhanced notification control for device-specific and immediate stopping
 */

const DEVICE_NOTIFICATIONS_KEY = 'device-notifications-disabled';
const GLOBAL_ALERT_LOCK_KEY = '__alertSoundGlobalLock';
const EMERGENCY_STOP_KEY = '__emergencyStopAlerts';

// Device-specific notification control
export const getDeviceNotificationsEnabled = (deviceCode: string): boolean => {
  try {
    const disabled = JSON.parse(storage.getItem(DEVICE_NOTIFICATIONS_KEY) || '{}');
    return !disabled[deviceCode];
  } catch {
    return true;
  }
};

export const setDeviceNotificationsEnabled = (deviceCode: string, enabled: boolean): void => {
  try {
    const disabled = JSON.parse(storage.getItem(DEVICE_NOTIFICATIONS_KEY) || '{}');
    if (enabled) {
      delete disabled[deviceCode];
    } else {
      disabled[deviceCode] = true;
    }
    storage.setItem(DEVICE_NOTIFICATIONS_KEY, JSON.stringify(disabled));
    
    // Trigger storage event for other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: DEVICE_NOTIFICATIONS_KEY,
      newValue: JSON.stringify(disabled),
      storageArea: localStorage
    }));
  } catch (error) {
    console.warn('Failed to update device notification settings:', error);
  }
};

// Emergency stop mechanism
export const emergencyStopAllAlerts = (): void => {
  // Set emergency stop flag
  (window as any)[EMERGENCY_STOP_KEY] = true;
  
  // Stop global audio lock
  const globalLock = (window as any)[GLOBAL_ALERT_LOCK_KEY];
  if (globalLock) {
    globalLock.running = false;
    globalLock.ownerId = null;
    if (globalLock.cancelRef) {
      globalLock.cancelRef.canceled = true;
    }
  }
  
  // Stop all audio elements
  document.querySelectorAll('audio').forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  
  // Clear emergency stop after 1 second
  setTimeout(() => {
    (window as any)[EMERGENCY_STOP_KEY] = false;
  }, 1000);
};

// Check if alerts should be blocked
export const shouldBlockAlerts = (deviceCode?: string): boolean => {
  // Check emergency stop
  if ((window as any)[EMERGENCY_STOP_KEY]) {
    return true;
  }
  
  // Check global notifications
  if (!getNotificationsEnabled()) {
    return true;
  }
  
  // Check device-specific notifications
  if (deviceCode && !getDeviceNotificationsEnabled(deviceCode)) {
    return true;
  }
  
  return false;
};

export const useNotificationControl = () => {
  const emergencyStopRef = useRef<boolean>(false);
  
  const stopDevice = useCallback((deviceCode: string) => {
    setDeviceNotificationsEnabled(deviceCode, false);
    emergencyStopAllAlerts();
    console.log(`🔇 Emergency stopped notifications for device: ${deviceCode}`);
  }, []);
  
  const enableDevice = useCallback((deviceCode: string) => {
    setDeviceNotificationsEnabled(deviceCode, true);
    console.log(`🔔 Re-enabled notifications for device: ${deviceCode}`);
  }, []);
  
  const emergencyStopAll = useCallback(() => {
    emergencyStopRef.current = true;
    emergencyStopAllAlerts();
    
    // Also disable global notifications
    storage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
    window.dispatchEvent(new StorageEvent('storage', {
      key: NOTIFICATIONS_ENABLED_KEY,
      newValue: 'false',
      storageArea: localStorage
    }));
    
    console.log('🚨 EMERGENCY STOP: All notifications disabled');
    
    // Reset emergency flag after 2 seconds
    setTimeout(() => {
      emergencyStopRef.current = false;
    }, 2000);
  }, []);
  
  const isDeviceEnabled = useCallback((deviceCode: string) => {
    return getDeviceNotificationsEnabled(deviceCode);
  }, []);
  
  const canPlayAlert = useCallback((deviceCode?: string) => {
    return !shouldBlockAlerts(deviceCode) && !emergencyStopRef.current;
  }, []);
  
  return {
    stopDevice,
    enableDevice,
    emergencyStopAll,
    isDeviceEnabled,
    canPlayAlert,
    shouldBlockAlerts: (deviceCode?: string) => shouldBlockAlerts(deviceCode)
  };
};