import React, { useEffect } from 'react';
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';
import { toast } from '@/hooks/use-toast';

/**
 * Global Notification Manager
 * This component handles notifications across the entire application
 * regardless of which page the user is currently viewing.
 */
export const GlobalNotificationManager: React.FC = () => {
  console.log('🌍 GlobalNotificationManager: Initializing...');
  
  // Initialize global notifications
  useGlobalNotifications();
  
  // Test toast on mount (temporary for debugging)
  useEffect(() => {
    console.log('🌍 GlobalNotificationManager: Mounted and active');
    
    // Test toast after 3 seconds
    setTimeout(() => {
      console.log('🧪 Testing toast notification...');
      toast({
        title: "🧪 ทดสอบ Toast",
        description: "นี่คือการทดสอบกล่องแจ้งเตือน",
        variant: "destructive",
        duration: 5000,
      });
    }, 3000);
  }, []);
  
  // This component doesn't render anything - it just manages global notifications
  return null;
};