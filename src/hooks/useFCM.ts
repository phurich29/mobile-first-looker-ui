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

  // Initialize FCM service
  const initialize = useCallback(async () => {
    if (isInitialized || !enabled) {
      if (!enabled) {
        console.log('🔔 FCM initialization skipped - disabled by configuration');
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await fcmService.initialize();
      
      // Set up event handlers
      fcmService.onTokenReceived = (receivedToken: string) => {
        setToken(receivedToken);
        onTokenReceived?.(receivedToken);
        
        if (autoSendToServer) {
          fcmService.sendTokenToServer(receivedToken, userId).catch((err) => {
            console.error('Failed to send token to server:', err);
            onError?.(err);
          });
        }
      };

      fcmService.onNotificationReceived = (notification: any) => {
        console.log('Notification received in hook:', notification);
        onNotificationReceived?.(notification);
        
        // Toast notification removed to prevent popup on app load
        // Notifications will be handled by the parent component instead
      };

      fcmService.onNotificationOpened = (notification: any) => {
        console.log('Notification opened in hook:', notification);
        onNotificationOpened?.(notification);
      };

      fcmService.onRegistrationError = (registrationError: any) => {
        console.error('FCM Registration error:', registrationError);
        setError(registrationError.message || 'Registration failed');
        onError?.(registrationError);
      };

      // Get initial token if available
      const initialToken = await fcmService.getToken();
      if (initialToken) {
        setToken(initialToken);
      }

      setIsInitialized(true);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize FCM');
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, onTokenReceived, onNotificationReceived, onNotificationOpened, onError, autoSendToServer, userId]);

  // Request permission manually
  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await initialize();
    } catch (err: any) {
      setError(err.message || 'Failed to request permission');
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [initialize, onError]);

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

  // Auto-initialize on mount
  useEffect(() => {
    if (enabled) {
      initialize();
    }
  }, [initialize, enabled]);

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
