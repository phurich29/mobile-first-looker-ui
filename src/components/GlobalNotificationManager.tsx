import React, { useEffect } from 'react';
import { usePersonalNotifications } from '@/hooks/usePersonalNotifications';

/**
 * Personal Notification Manager
 * This component handles personal notifications based on user's settings
 * Only shows notifications when user has enabled notification settings.
 */
export const GlobalNotificationManager: React.FC = () => {
  console.log('👤 PersonalNotificationManager: Initializing...');
  
  // Initialize personal notifications (only for users with settings)
  const { hasActiveSettings } = usePersonalNotifications();
  
  useEffect(() => {
    if (hasActiveSettings) {
      console.log('👤 PersonalNotificationManager: Active with user settings');
    } else {
      console.log('👤 PersonalNotificationManager: No active settings, notifications disabled');
    }
  }, [hasActiveSettings]);
  
  // This component doesn't render anything - it just manages personal notifications
  return null;
};