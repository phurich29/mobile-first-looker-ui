import React, { useEffect } from 'react';
import { usePersonalNotifications } from '@/hooks/usePersonalNotifications';
import { getNotificationsEnabled } from '@/hooks/useAlertSound';

/**
 * Personal Notification Manager
 * This component handles personal notifications based on user's settings
 * ⚠️ CRITICAL: Only works when notifications are enabled AND user has active settings
 */
export const GlobalNotificationManager: React.FC = () => {
  // TEMPORARILY DISABLED FOR iOS PWA COMPATIBILITY
  console.log('🔇 GlobalNotificationManager: Temporarily disabled for iOS PWA compatibility');
  return null;
};