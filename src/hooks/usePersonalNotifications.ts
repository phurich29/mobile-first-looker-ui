import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAlertSound } from '@/hooks/useAlertSound';
import { useAuth } from '@/components/AuthProvider';

/**
 * Personal Notification Hook - ระบบแจ้งเตือนส่วนตัวตามการตั้งค่าของผู้ใช้
 */
interface PersonalNotification {
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

interface NotificationSetting {
  rice_type_id: string;
  device_code: string;
  enabled: boolean;
  min_enabled: boolean;
  max_enabled: boolean;
  min_threshold: number;
  max_threshold: number;
  user_id: string;
}

export const usePersonalNotifications = () => {
  const { user } = useAuth();
  const lastNotificationRef = useRef<string | null>(null);
  const processedNotificationsRef = useRef<Set<string>>(new Set());
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAlertActive, setIsAlertActive] = useState<boolean>(false);
  
  // Use alert sound
  useAlertSound(isAlertActive, {
    enabled: true,
    playOnce: true,
    intervalMs: 5000
  });

  // Fetch user's notification settings
  const { data: userSettings } = useQuery({
    queryKey: ['user-notification-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('enabled', true); // เฉพาะการตั้งค่าที่เปิดใช้งาน
      
      if (error) {
        console.error('❌ Failed to fetch notification settings:', error);
        return [];
      }
      
      console.log('✅ Fetched user notification settings:', data?.length || 0, 'items');
      return data as NotificationSetting[];
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  // Fetch relevant notifications based on user settings
  const { data: notifications, refetch } = useQuery({
    queryKey: ['personal-notifications', user?.id, userSettings],
    queryFn: async () => {
      if (!user?.id || !userSettings || userSettings.length === 0) {
        console.log('🔍 No user settings found, skipping notification fetch');
        return [];
      }

      console.log('🔍 Fetching personal notifications for user:', user.id);
      
      // สร้าง condition สำหรับ device_code และ rice_type_id ที่ผู้ใช้ตั้งค่าไว้
      const deviceCodes = [...new Set(userSettings.map(s => s.device_code))];
      const riceTypeIds = [...new Set(userSettings.map(s => s.rice_type_id))];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id) // 🔒 กรองเฉพาะการแจ้งเตือนของผู้ใช้นี้เท่านั้น
        .in('device_code', deviceCodes)
        .in('rice_type_id', riceTypeIds)
        .order('timestamp', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('❌ Failed to fetch personal notifications:', error);
        return [];
      }
      
      // Filter notifications based on user's threshold settings
      const relevantNotifications = data.filter((notification) => {
        const setting = userSettings.find(
          s => s.device_code === notification.device_code && 
               s.rice_type_id === notification.rice_type_id
        );
        
        if (!setting) return false;
        
        // Check if notification value exceeds user's thresholds
        if (notification.threshold_type === 'min' && setting.min_enabled) {
          return notification.value < setting.min_threshold;
        }
        
        if (notification.threshold_type === 'max' && setting.max_enabled) {
          return notification.value > setting.max_threshold;
        }
        
        return false;
      });
      
      console.log('✅ Filtered personal notifications:', relevantNotifications.length, 'relevant items');
      return relevantNotifications as PersonalNotification[];
    },
    enabled: !!user?.id && !!userSettings && userSettings.length > 0,
    refetchInterval: 10000, // Check every 10 seconds
    staleTime: 8000,
  });

  // Check for new notifications and show alerts
  useEffect(() => {
    if (!notifications || notifications.length === 0 || !userSettings || userSettings.length === 0) return;

    const latestNotification = notifications[0];
    const notificationId = `${latestNotification.id}-${latestNotification.notification_count}`;
    
    // Check if this is a new notification we haven't processed
    if (
      latestNotification.id !== lastNotificationRef.current &&
      !processedNotificationsRef.current.has(notificationId)
    ) {
      console.log('🚨 New personal notification detected:', {
        id: latestNotification.id,
        message: latestNotification.notification_message,
        device: latestNotification.device_code,
        value: latestNotification.value,
        type: latestNotification.threshold_type
      });
      
      // Clear any existing timeout
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }
      
      // Activate alert sound
      setIsAlertActive(true);
      
      // Show toast notification
      toast({
        title: "🚨 แจ้งเตือนคุณภาพข้าว",
        description: latestNotification.notification_message,
        variant: "destructive",
        duration: 10000,
      });

      // Stop alert sound after notification duration
      alertTimeoutRef.current = setTimeout(() => {
        setIsAlertActive(false);
        console.log('🔕 Personal alert sound stopped after timeout');
        alertTimeoutRef.current = null;
      }, 10000);

      // Update refs
      lastNotificationRef.current = latestNotification.id;
      processedNotificationsRef.current.add(notificationId);
      
      // Clean up old processed notifications
      if (processedNotificationsRef.current.size > 20) {
        const processedArray = Array.from(processedNotificationsRef.current);
        processedNotificationsRef.current = new Set(processedArray.slice(-20));
      }
    }
  }, [notifications, userSettings]);

  // Enhanced real-time subscription with strict user filtering
  useEffect(() => {
    if (!user?.id || !userSettings || userSettings.length === 0) {
      console.log("🚫 Personal notifications: Skipping real-time - no user or settings");
      return;
    }

    console.log("🔗 Personal notifications: Setting up user-filtered real-time subscription for user:", user.id);

    const channel = supabase
      .channel('personal-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}` // ⭐ CRITICAL: Server-side user filtering
        },
        (payload) => {
          console.log('🔔 Real-time personal notification received:', payload);
          
          const newNotification = payload.new as PersonalNotification;
          
          // 🔒 TRIPLE VALIDATION: Server filter + client validation + user check
          if (!newNotification.user_id) {
            console.warn('🚫 Notification missing user_id, blocking');
            return;
          }
          
          if (newNotification.user_id !== user.id) {
            console.warn('🚫 Cross-user notification detected and blocked:', {
              notification_user: newNotification.user_id,
              current_user: user.id,
              device_code: newNotification.device_code,
              rice_type_id: newNotification.rice_type_id
            });
            return;
          }
          
          // Additional validation: Check if notification belongs to user's enabled settings
          const setting = userSettings.find(
            s => s.device_code === newNotification.device_code && 
                 s.rice_type_id === newNotification.rice_type_id &&
                 s.user_id === user.id // Extra safety check
          );
          
          if (!setting) {
            console.log('🚫 Notification not relevant to user settings, ignoring');
            return;
          }
          
          // Check threshold relevance with validation
          let isRelevant = false;
          if (newNotification.threshold_type === 'min' && setting.min_enabled) {
            isRelevant = newNotification.value < setting.min_threshold;
          } else if (newNotification.threshold_type === 'max' && setting.max_enabled) {
            isRelevant = newNotification.value > setting.max_threshold;
          }
          
          if (!isRelevant) {
            console.log('🚫 Notification not relevant to threshold settings, ignoring');
            return;
          }
          
          console.log('✅ Valid user notification processed:', {
            user_id: newNotification.user_id,
            device_code: newNotification.device_code,
            rice_type_id: newNotification.rice_type_id,
            threshold_type: newNotification.threshold_type,
            value: newNotification.value
          });
          
          // Only refetch if validation passes
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('📡 Personal notifications real-time status:', status, 'for user:', user.id);
      });

    return () => {
      console.log('🔌 Personal notifications: Cleaning up user-filtered real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, userSettings, refetch]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    notifications,
    userSettings,
    hasActiveSettings: userSettings && userSettings.length > 0,
    refetch
  };
};