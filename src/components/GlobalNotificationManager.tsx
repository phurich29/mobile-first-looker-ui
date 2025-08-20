import React from 'react';
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';

/**
 * Global Notification Manager
 * This component handles notifications across the entire application
 * regardless of which page the user is currently viewing.
 */
export const GlobalNotificationManager: React.FC = () => {
  // Initialize global notifications
  useGlobalNotifications();
  
  // This component doesn't render anything - it just manages global notifications
  return null;
};