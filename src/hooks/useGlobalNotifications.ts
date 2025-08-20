import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAlertSound } from '@/hooks/useAlertSound';

interface NotificationItem {
  id: string;
  device_code: string;
  rice_type_id: string;
  threshold_type: 'min' | 'max';
  value: number;
  notification_message: string;
  timestamp: string;
  notification_count: number;
  user_id: string;
}

export const useGlobalNotifications = () => {
  const lastNotificationRef = useRef<string | null>(null);
  const processedNotificationsRef = useRef<Set<string>>(new Set());
  
  // Fetch notifications every 30 seconds
  const { data: notifications, refetch } = useQuery({
    queryKey: ['global-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
      }
      
      return data as NotificationItem[];
    },
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 25000, // Consider data fresh for 25 seconds
  });

  // Check for new notifications and show alerts
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const latestNotification = notifications[0];
    const notificationId = `${latestNotification.id}-${latestNotification.notification_count}`;
    
    // Check if this is a new notification we haven't processed
    if (
      latestNotification.id !== lastNotificationRef.current &&
      !processedNotificationsRef.current.has(notificationId)
    ) {
      // Show toast notification
      toast({
        title: "🚨 แจ้งเตือนคุณภาพข้าว",
        description: latestNotification.notification_message,
        variant: "destructive",
        duration: 10000, // Show for 10 seconds
      });

      // Update refs
      lastNotificationRef.current = latestNotification.id;
      processedNotificationsRef.current.add(notificationId);
      
      // Clean up old processed notifications (keep only last 20)
      if (processedNotificationsRef.current.size > 20) {
        const processedArray = Array.from(processedNotificationsRef.current);
        processedNotificationsRef.current = new Set(processedArray.slice(-20));
      }

      console.log('🔔 Global notification triggered:', {
        id: latestNotification.id,
        device: latestNotification.device_code,
        message: latestNotification.notification_message,
        timestamp: latestNotification.timestamp
      });
    }
  }, [notifications]);

  // Set up real-time subscription for immediate notifications
  useEffect(() => {
    const channel = supabase
      .channel('global-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('🔔 Real-time notification received:', payload);
          
          // Immediately refetch notifications to get the latest data
          refetch();
          
          // Show immediate notification if it's for the current user
          const newNotification = payload.new as NotificationItem;
          const notificationId = `${newNotification.id}-${newNotification.notification_count}`;
          
          if (!processedNotificationsRef.current.has(notificationId)) {
            toast({
              title: "🚨 แจ้งเตือนคุณภาพข้าว",
              description: newNotification.notification_message,
              variant: "destructive",
              duration: 10000,
            });
            
            processedNotificationsRef.current.add(notificationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    notifications,
    refetch
  };
};
