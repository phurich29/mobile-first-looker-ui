import { useAuth } from "@/components/AuthProvider";

/**
 * Utility functions for validating notification data to prevent cross-user contamination
 */

interface NotificationPayload {
  user_id?: string;
  device_code?: string;
  rice_type_id?: string;
  [key: string]: any;
}

interface UserContext {
  id: string;
}

/**
 * Validates that notification payload belongs to current user
 */
export const validateNotificationUser = (
  payload: NotificationPayload, 
  currentUser: UserContext
): boolean => {
  // Basic validation
  if (!payload || !currentUser?.id) {
    console.warn('🚫 Validation failed: Missing payload or user context');
    return false;
  }

  // Check user_id match
  if (!payload.user_id) {
    console.warn('🚫 Validation failed: Notification missing user_id');
    return false;
  }

  if (payload.user_id !== currentUser.id) {
    console.warn('🚫 Validation failed: Cross-user notification detected:', {
      notification_user: payload.user_id,
      current_user: currentUser.id,
      device_code: payload.device_code,
      rice_type_id: payload.rice_type_id
    });
    return false;
  }

  console.log('✅ Notification validation passed:', {
    user_id: payload.user_id,
    device_code: payload.device_code,
    rice_type_id: payload.rice_type_id
  });

  return true;
};

/**
 * Hook for validating real-time notification payloads
 */
export const useNotificationValidation = () => {
  const { user } = useAuth();

  const validatePayload = (payload: any): boolean => {
    if (!user?.id) {
      console.warn('🚫 No authenticated user for validation');
      return false;
    }

    // Extract notification data from payload
    const notificationData = payload.new || payload.old;
    if (!notificationData) {
      console.warn('🚫 No notification data in payload');
      return false;
    }

    return validateNotificationUser(notificationData, user);
  };

  const logValidation = (
    source: string, 
    payload: any, 
    isValid: boolean
  ): void => {
    const notificationData = payload.new || payload.old;
    console.log(`🔍 ${source} validation:`, {
      isValid,
      user_id: notificationData?.user_id,
      current_user: user?.id,
      device_code: notificationData?.device_code,
      rice_type_id: notificationData?.rice_type_id,
      timestamp: new Date().toISOString()
    });
  };

  return {
    validatePayload,
    logValidation,
    currentUserId: user?.id
  };
};

/**
 * Creates a secure filter string for Supabase real-time subscriptions
 */
export const createUserFilter = (userId: string): string => {
  if (!userId) {
    throw new Error('User ID is required for creating filter');
  }
  return `user_id=eq.${userId}`;
};

/**
 * Validates notification settings data
 */
export const validateNotificationSettings = (
  settings: any,
  currentUser: UserContext
): boolean => {
  if (!settings || !currentUser?.id) {
    return false;
  }

  // Check if settings belong to current user
  if (settings.user_id && settings.user_id !== currentUser.id) {
    console.warn('🚫 Settings validation failed: Cross-user settings detected:', {
      settings_user: settings.user_id,
      current_user: currentUser.id
    });
    return false;
  }

  return true;
};