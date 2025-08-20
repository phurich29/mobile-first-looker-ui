import React, { useEffect } from 'react';
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';
import { toast } from '@/hooks/use-toast';
import { runNotificationSystemTest } from '@/utils/notificationTester';

/**
 * Global Notification Manager
 * This component handles notifications across the entire application
 * regardless of which page the user is currently viewing.
 */
export const GlobalNotificationManager: React.FC = () => {
  console.log('🌍 GlobalNotificationManager: Initializing...');
  
  // Initialize global notifications
  useGlobalNotifications();
  
  // Run comprehensive notification system test on mount
  useEffect(() => {
    console.log('🌍 GlobalNotificationManager: Mounted and active');
    
    // Run test after 2 seconds
    setTimeout(async () => {
      console.log('🧪 Starting notification system diagnostics...');
      
      // Run the comprehensive test
      const results = await runNotificationSystemTest();
      
      // Show result toast
      if (results.testNotification.success) {
        toast({
          title: "🧪 ระบบแจ้งเตือนทำงานแล้ว!",
          description: "สร้างการแจ้งเตือนทดสอบสำเร็จ - ตรวจสอบการแสดงผล",
          variant: "destructive",
          duration: 10000,
        });
      }
    }, 2000);
  }, []);
  
  // This component doesn't render anything - it just manages global notifications
  return null;
};