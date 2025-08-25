import React, { useEffect } from 'react';
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';

/**
 * Global Notification Manager
 * This component handles notifications across the entire application
 * regardless of which page the user is currently viewing.
 */
export const GlobalNotificationManager: React.FC = () => {
  console.log('🌍 GlobalNotificationManager: Initializing...');
  
  // Initialize global notifications
  useGlobalNotifications();
  
  useEffect(() => {
    console.log('🌍 GlobalNotificationManager: Mounted and active');
  }, []);
  
  // This component doesn't render anything - it just manages global notifications
  return null;
};