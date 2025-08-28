import React, { useEffect } from 'react';
import { usePersonalNotifications } from '@/hooks/usePersonalNotifications';
import { getNotificationsEnabled } from '@/hooks/useAlertSound';

/**
 * Personal Notification Manager
 * This component handles personal notifications based on user's settings
 * ⚠️ CRITICAL: Only works when notifications are enabled AND user has active settings
 */
export const GlobalNotificationManager: React.FC = () => {
  console.log('👤 PersonalNotificationManager: Initializing...');
  
  // ตรวจสอบการตั้งค่าแจ้งเตือนทั่วไป
  const globalNotificationsEnabled = getNotificationsEnabled();
  
  // Initialize personal notifications (only for users with settings)
  const { hasActiveSettings } = usePersonalNotifications();
  
  useEffect(() => {
    // 🔒 STRICT VALIDATION: ต้องผ่านเงื่อนไขทั้งหมด
    const shouldActivate = globalNotificationsEnabled && hasActiveSettings;
    
    if (shouldActivate) {
      console.log('✅ PersonalNotificationManager: ACTIVE - Global enabled + User has settings');
    } else {
      console.log('🚫 PersonalNotificationManager: INACTIVE', {
        globalEnabled: globalNotificationsEnabled,
        hasSettings: hasActiveSettings
      });
    }
  }, [globalNotificationsEnabled, hasActiveSettings]);
  
  // 🔒 CRITICAL GATE: ไม่ทำงานเลยถ้าไม่ผ่านเงื่อนไข
  if (!globalNotificationsEnabled) {
    console.log('🚫 PersonalNotificationManager: Global notifications disabled - component inactive');
    return null;
  }
  
  if (!hasActiveSettings) {
    console.log('🚫 PersonalNotificationManager: No active settings - component inactive');
    return null;
  }
  
  console.log('🔔 PersonalNotificationManager: All conditions met - notifications active');
  
  // This component doesn't render anything - it just manages personal notifications
  return null;
};