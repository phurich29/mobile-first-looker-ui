import React, { useEffect } from 'react';
import { usePersonalNotifications } from '@/hooks/usePersonalNotifications';
import { useMobileNotificationSound } from '@/hooks/useMobileNotificationSound';
import { getNotificationsEnabled } from '@/hooks/useAlertSound';

/**
 * Global Notification Manager
 * This component handles personal notifications with mobile audio support
 * ✅ Now supports native mobile audio through Capacitor
 */
export const GlobalNotificationManager: React.FC = () => {
  const { notifications, userSettings, hasActiveSettings } = usePersonalNotifications();
  const notificationsEnabled = getNotificationsEnabled();
  
  // Calculate if there are currently active notifications that should trigger sound
  const hasActiveNotifications = Boolean(
    notifications && 
    notifications.length > 0 && 
    hasActiveSettings &&
    notificationsEnabled
  );

  // Use mobile-optimized notification sound
  const { playSound, testAudio, getAudioInfo, isInitialized } = useMobileNotificationSound(
    hasActiveNotifications,
    {
      enabled: notificationsEnabled,
      playOnce: true,
      repeatCount: 2, // Play twice for better mobile attention
      repeatInterval: 1500
    }
  );

  // Log audio status for debugging
  useEffect(() => {
    if (isInitialized) {
      const audioInfo = getAudioInfo();
      console.log('🎵 Mobile audio service status:', audioInfo);
      
      // Test audio on first initialization for mobile platforms
      if (audioInfo.nativeSupport) {
        console.log('📱 Native mobile platform detected - audio testing enabled');
      }
    }
  }, [isInitialized, getAudioInfo]);

  // Log notification status changes
  useEffect(() => {
    if (hasActiveNotifications) {
      console.log('🔔 Active notifications detected:', notifications?.length || 0);
    }
  }, [hasActiveNotifications, notifications]);

  return null; // This is a service component, no UI needed
};