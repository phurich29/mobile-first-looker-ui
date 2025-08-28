import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAlertSound, getNotificationsEnabled, NOTIFICATIONS_ENABLED_KEY } from '@/hooks/useAlertSound';
import { useNotificationControl, shouldBlockAlerts } from '@/hooks/useNotificationControl';

/**
 * Global Notification Hook - ใช้สำหรับแจ้งเตือนทั่วทั้งระบบ
 */
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
  const { shouldBlockAlerts: shouldBlock } = useNotificationControl();
  const lastNotificationRef = useRef<string | null>(null);
  const processedNotificationsRef = useRef<Set<string>>(new Set());
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAlertActive, setIsAlertActive] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(getNotificationsEnabled());

  // ติดตามการเปลี่ยนแปลงการตั้งค่าแจ้งเตือนแบบเรียลไทม์ผ่าน storage event
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === NOTIFICATIONS_ENABLED_KEY) {
        setNotificationsEnabled(getNotificationsEnabled());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // หากถูกปิดแจ้งเตือน ให้หยุดเสียงทันที
  useEffect(() => {
    if (!notificationsEnabled) {
      setIsAlertActive(false);
    }
  }, [notificationsEnabled]);

  // Use alert sound - เล่นแค่ครั้งเดียวต่อการแจ้งเตือน
  useAlertSound(isAlertActive, {
    enabled: notificationsEnabled,
    playOnce: true, // เล่นแค่ครั้งเดียว
    intervalMs: 5000 // ไม่ใช้แล้วเพราะ playOnce = true
  });

  // Fetch notifications every 30 seconds
  const { data: notifications, refetch } = useQuery({
    queryKey: ['global-notifications'],
    queryFn: async () => {
      console.log('🔍 Fetching global notifications...');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Failed to fetch notifications:', error);
        return [];
      }

      console.log('✅ Fetched notifications:', data?.length || 0, 'items');
      return data as NotificationItem[];
    },
    refetchInterval: 5000, // Check every 5 seconds during testing
    staleTime: 4000, // Consider data fresh for 4 seconds
  });

  // Check for new notifications and show alerts
  useEffect(() => {
    console.log('🔔 useGlobalNotifications: Checking for new notifications...', notifications?.length || 0);
    if (!notifications || notifications.length === 0) return;

    const latestNotification = notifications[0];
    const notificationId = `${latestNotification.id}-${latestNotification.notification_count}`;

    // Check if this is a new notification we haven't processed
    if (
      latestNotification.id !== lastNotificationRef.current &&
      !processedNotificationsRef.current.has(notificationId)
    ) {
      // 🔒 CRITICAL CHECK: ตรวจสอบสถานะการแจ้งเตือนก่อนเล่นเสียง
      if (shouldBlock(latestNotification.device_code)) {
        console.log('🚫 Global notification blocked due to control settings:', latestNotification.device_code);
        // อัปเดต refs แต่ไม่เล่นเสียง
        lastNotificationRef.current = latestNotification.id;
        processedNotificationsRef.current.add(notificationId);
        return;
      }

      // 🔒 ADDITIONAL CHECK: ตรวจสอบ global notifications
      if (!getNotificationsEnabled()) {
        console.log('🚫 Global notifications disabled - no sound');
        lastNotificationRef.current = latestNotification.id;
        processedNotificationsRef.current.add(notificationId);
        return;
      }

      console.log('🚨 New notification detected - activating alert:', {
        id: latestNotification.id,
        message: latestNotification.notification_message,
        isAlertCurrentlyActive: isAlertActive
      });

      // Clear any existing timeout
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }

      // Activate alert sound
      setIsAlertActive(true);

      // Show toast notification in bottom-right corner
      console.log('🚨 Showing notification toast:', latestNotification.notification_message);
      toast({
        title: "🚨 แจ้งเตือนคุณภาพข้าว",
        description: latestNotification.notification_message,
        variant: "destructive",
        duration: 10000, // Show for 10 seconds
      });

      // Stop alert sound after notification duration (10 seconds)
      alertTimeoutRef.current = setTimeout(() => {
        setIsAlertActive(false);
        console.log('🔕 Alert sound stopped after timeout');
        alertTimeoutRef.current = null;
      }, 10000);

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
            // 🔒 CRITICAL CHECK: ตรวจสอบสถานะการแจ้งเตือนก่อนเล่นเสียง
            if (shouldBlock(newNotification.device_code)) {
              console.log('🚫 Real-time notification blocked due to control settings:', newNotification.device_code);
              processedNotificationsRef.current.add(notificationId);
              return;
            }

            // 🔒 ADDITIONAL CHECK: ตรวจสอบ global notifications
            if (!getNotificationsEnabled()) {
              console.log('🚫 Global notifications disabled - no real-time sound');
              processedNotificationsRef.current.add(notificationId);
              return;
            }

            console.log('🚨 Real-time notification - activating alert:', {
              id: newNotification.id,
              message: newNotification.notification_message
            });

            // Clear any existing timeout
            if (alertTimeoutRef.current) {
              clearTimeout(alertTimeoutRef.current);
              alertTimeoutRef.current = null;
            }

            // Activate alert sound for real-time notification
            setIsAlertActive(true);

            toast({
              title: "🚨 แจ้งเตือนคุณภาพข้าว",
              description: newNotification.notification_message,
              variant: "destructive",
              duration: 10000,
            });

            // Stop alert sound after notification duration
            alertTimeoutRef.current = setTimeout(() => {
              setIsAlertActive(false);
              console.log('🔕 Real-time alert sound stopped after timeout');
              alertTimeoutRef.current = null;
            }, 10000);

            processedNotificationsRef.current.add(notificationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }
    };
  }, [refetch]);

  return {
    notifications,
    refetch
  };
};
