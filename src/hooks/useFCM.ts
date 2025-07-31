import { useEffect, useState, useCallback } from 'react';
import { fcmService } from '../services/fcmService';
import { toast } from 'sonner';

export interface UseFCMOptions {
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
    onTokenReceived,
    onNotificationReceived,
    onNotificationOpened,
    onError,
    autoSendToServer = false,
    userId
  } = options;

  // Initialize FCM service
  const initialize = useCallback(async () => {
    if (isInitialized) return;

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
        
        // Show toast notification
        toast(notification.notification?.title || 'New Notification', {
          description: notification.notification?.body || '',
          action: {
            label: 'View',
            onClick: () => onNotificationOpened?.(notification)
          }
        });
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
      const initialToken = fcmService.getToken();
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
    initialize();
  }, [initialize]);

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
