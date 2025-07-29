import { useEffect, useState, useCallback } from 'react';
import { oneSignalService, DeviceState } from '../services/OneSignalService';

export interface UseOneSignalResult {
  isInitialized: boolean;
  playerId: string | null;
  deviceState: DeviceState | null;
  hasPermission: boolean;
  isPushEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  setSubscription: (enabled: boolean) => Promise<void>;
  sendTags: (tags: Record<string, string>) => Promise<void>;
  getTags: () => Promise<Record<string, string> | null>;
  setExternalUserId: (userId: string) => Promise<void>;
  removeExternalUserId: () => Promise<void>;
  refreshDeviceState: () => Promise<void>;
}

export const useOneSignal = (): UseOneSignalResult => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [deviceState, setDeviceState] = useState<DeviceState | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh device state
  const refreshDeviceState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get player ID
      const id = await oneSignalService.getPlayerId();
      setPlayerId(id);

      // Get device state
      const state = await oneSignalService.getDeviceState();
      setDeviceState(state);

      // Get permission status
      const permission = await oneSignalService.hasNotificationPermission();
      setHasPermission(permission);

      // Get push notification status
      const pushEnabled = await oneSignalService.isPushNotificationsEnabled();
      setIsPushEnabled(pushEnabled);

      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error refreshing OneSignal device state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize OneSignal on mount
  useEffect(() => {
    const initializeOneSignal = async () => {
      try {
        // Only initialize if not already done
        const appId = process.env.REACT_APP_ONESIGNAL_APP_ID;
        
        if (!appId) {
          throw new Error('OneSignal App ID not found in environment variables');
        }

        await oneSignalService.initialize({
          appId,
          requiresUserPrivacyConsent: false,
          promptForPushNotificationsWithUserResponse: true,
        });

        // Refresh device state after initialization
        await refreshDeviceState();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize OneSignal';
        setError(errorMessage);
        console.error('Error initializing OneSignal:', err);
        setIsLoading(false);
      }
    };

    initializeOneSignal();
  }, [refreshDeviceState]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const permission = await oneSignalService.hasNotificationPermission();
      setHasPermission(permission);
      
      // Refresh device state after permission change
      await refreshDeviceState();
      
      return permission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      console.error('Error requesting permission:', err);
      return false;
    }
  }, [refreshDeviceState]);

  // Set subscription status
  const setSubscription = useCallback(async (enabled: boolean): Promise<void> => {
    try {
      setError(null);
      await oneSignalService.setSubscription(enabled);
      setIsPushEnabled(enabled);
      
      // Refresh device state after subscription change
      await refreshDeviceState();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set subscription';
      setError(errorMessage);
      console.error('Error setting subscription:', err);
    }
  }, [refreshDeviceState]);

  // Send tags
  const sendTags = useCallback(async (tags: Record<string, string>): Promise<void> => {
    try {
      setError(null);
      await oneSignalService.sendTags(tags);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send tags';
      setError(errorMessage);
      console.error('Error sending tags:', err);
    }
  }, []);

  // Get tags
  const getTags = useCallback(async (): Promise<Record<string, string> | null> => {
    try {
      setError(null);
      return await oneSignalService.getTags();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get tags';
      setError(errorMessage);
      console.error('Error getting tags:', err);
      return null;
    }
  }, []);

  // Set external user ID
  const setExternalUserId = useCallback(async (userId: string): Promise<void> => {
    try {
      setError(null);
      await oneSignalService.setExternalUserId(userId);
      
      // Refresh device state after setting external user ID
      await refreshDeviceState();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set external user ID';
      setError(errorMessage);
      console.error('Error setting external user ID:', err);
    }
  }, [refreshDeviceState]);

  // Remove external user ID
  const removeExternalUserId = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await oneSignalService.removeExternalUserId();
      
      // Refresh device state after removing external user ID
      await refreshDeviceState();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove external user ID';
      setError(errorMessage);
      console.error('Error removing external user ID:', err);
    }
  }, [refreshDeviceState]);

  return {
    isInitialized,
    playerId,
    deviceState,
    hasPermission,
    isPushEnabled,
    isLoading,
    error,
    
    // Actions
    requestPermission,
    setSubscription,
    sendTags,
    getTags,
    setExternalUserId,
    removeExternalUserId,
    refreshDeviceState,
  };
};

export default useOneSignal;
