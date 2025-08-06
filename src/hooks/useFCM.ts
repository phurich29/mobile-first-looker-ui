import { useEffect, useState, useCallback } from 'react';

// FCM Service stub - Firebase was removed from the project
const fcmService = {
  initialize: async () => ({ success: false, error: 'FCM not available - Firebase was removed' }),
  getToken: async () => null,
  requestPermission: async () => 'denied' as NotificationPermission,
  onMessage: () => () => {},
  sendTokenToServer: async (token: string, userId?: string) => ({ success: false }),
  removeTokenFromServer: async (token: string) => ({ success: false }),
  // Event handler properties that can be assigned
  onTokenReceived: null as ((token: string) => void) | null,
  onNotificationReceived: null as ((notification: any) => void) | null,
  onNotificationOpened: null as ((notification: any) => void) | null,
  onRegistrationError: null as ((error: any) => void) | null
};

export interface UseFCMOptions {
  enabled?: boolean; // Add enabled flag to control initialization
  onTokenReceived?: (token: string) => void;
  onNotificationReceived?: (notification: any) => void;
  onNotificationOpened?: (notification: any) => void;
  onError?: (error: any) => void;
  autoSendToServer?: boolean;
  userId?: string;
}

export interface UseFCMReturn {
  isInitialized: boolean;
  token: string | null;
  error: string | null;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
  sendTokenToServer: (userId?: string) => Promise<void>;
  removeTokenFromServer: () => Promise<void>;
}

export const useFCM = (options: UseFCMOptions = {}): UseFCMReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    enabled = true, // Default to enabled for backward compatibility
    onTokenReceived,
    onNotificationReceived,
    onNotificationOpened,
    onError,
    autoSendToServer = false,
    userId
  } = options;

  // Initialize FCM service - COMPLETELY DISABLED
  useEffect(() => {
    // FCM completely disabled to prevent all notifications and errors
    console.log(' FCM initialization completely disabled to prevent popups');
    setIsLoading(false);
    setError(null);
    setIsInitialized(false);
    // All FCM functionality is disabled
  }, []);

  // Request permission manually - DISABLED
  const requestPermission = useCallback(async () => {
    console.log('🔔 FCM requestPermission disabled to prevent popups');
    // FCM completely disabled - no permission requests
  }, []);

  // Send token to server
  const sendTokenToServer = useCallback(async (userIdParam?: string) => {
    if (!token) {
      throw new Error('No FCM token available');
    }

    try {
      await fcmService.sendTokenToServer(token, userIdParam || userId);
    } catch (err: any) {
      setError(err.message || 'Failed to send token to server');
      onError?.(err);
      throw err;
    }
  }, [token, userId, onError]);

  // Remove token from server
  const removeTokenFromServer = useCallback(async () => {
    if (!token) {
      throw new Error('No FCM token available');
    }

    try {
      await fcmService.removeTokenFromServer(token);
    } catch (err: any) {
      setError(err.message || 'Failed to remove token from server');
      onError?.(err);
      throw err;
    }
  }, [token, onError]);

  // Auto-initialize on mount - DISABLED
  useEffect(() => {
    console.log('🔔 FCM auto-initialize disabled to prevent popups');
    // FCM completely disabled - no auto-initialization
  }, []);

  return {
    isInitialized,
    token,
    error,
    isLoading,
    requestPermission,
    sendTokenToServer,
    removeTokenFromServer
  };
};
