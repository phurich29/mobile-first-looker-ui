import { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAlertSound, getNotificationsEnabled, NOTIFICATIONS_ENABLED_KEY } from '@/hooks/useAlertSound';
import { useAuth } from '@/components/AuthProvider';
import { useNotificationControl, shouldBlockAlerts } from '@/hooks/useNotificationControl';
import { usePageNavigation } from '@/hooks/usePageNavigation';

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
  const { canPlayAlert, shouldBlockAlerts: shouldBlock } = useNotificationControl();
  
  const lastNotificationRef = useRef<string | null>(null);
  const processedNotificationsRef = useRef<Set<string>>(new Set());
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityStopRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveAtRef = useRef<number>(0);
  const [isAlertActive, setIsAlertActive] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(getNotificationsEnabled());

  // 🚨 CRITICAL: Use page navigation hook with immediate check callback
  usePageNavigation(() => {
    console.log('🔔 Page change detected - performing immediate notification check');
    // 🔒 CRITICAL GATE: เช็คว่ามี active settings หรือไม่
    if (!hasActiveSettings) {
      console.log('🚫 No active settings - skipping page change notification check');
      return;
    }
    checkAndActivateOnRoute();
  });

  // ติดตามการเปลี่ยนแปลงการตั้งค่าแจ้งเตือนของผู้ใช้ (localStorage)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === NOTIFICATIONS_ENABLED_KEY) {
        const enabled = getNotificationsEnabled();
        setNotificationsEnabled(enabled);
        if (!enabled) {
          // ปิดเสียงทันทีเมื่อผู้ใช้ปิดแจ้งเตือน
          setIsAlertActive(false);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  
  // ใช้เสียงแจ้งเตือนแบบเล่นครั้งเดียว แต่จะถูกสั่งเล่นใหม่ทุกครั้งที่เปลี่ยนหน้า (ผ่าน checkAndActivateOnRoute)
  useAlertSound(isAlertActive, {
    enabled: notificationsEnabled && getNotificationsEnabled(), // Double check
    playOnce: true,
    repeatCount: 2,     // เล่น 2 รอบต่อหนึ่งทริกเกอร์
    repeatGapMs: 1000,  // เว้น 1 วินาทีระหว่างรอบ
  });

  // Fetch user's notification settings
  const { data: userSettings, refetch: refetchUserSettings } = useQuery({
    queryKey: ['user-notification-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('❌ Failed to fetch notification settings:', error);
        return [];
      }
      
      console.log('✅ Fetched user notification settings (all):', data?.length || 0, 'items');
      return data as NotificationSetting[];
    },
    enabled: !!user?.id,
    staleTime: 30000, // เพิ่มเป็น 30 วินาที
    refetchOnWindowFocus: false, // ปิด auto refetch
    // เอา refetchInterval ออก - ไม่ต้อง refetch อัตโนมัติ
  });

  // 🔒 CRITICAL: Calculate hasActiveSettings based on userSettings
  const hasActiveSettings = useMemo(() => {
    if (!user?.id || !userSettings) {
      console.log('🚫 No user or userSettings - hasActiveSettings = false');
      return false;
    }
    
    const activeCount = userSettings.filter((s: any) => s.enabled).length;
    const result = activeCount > 0;
    
    console.log('📊 hasActiveSettings calculation:', {
      totalSettings: userSettings.length,
      activeSettings: activeCount,
      hasActiveSettings: result
    });
    
    return result;
  }, [user?.id, userSettings]);

  // เมื่อเปิดใช้งานการแจ้งเตือน ให้ตรวจสอบเงื่อนไขและเล่นเสียงทันทีถ้าเข้าเงื่อนไข (ย้ายมาไว้หลัง userSettings)
  useEffect(() => {
    if (!user?.id) return;
    
    // 🔒 CRITICAL: ตรวจสอบสถานะการแจ้งเตือนก่อนเสมอ
    const globalEnabled = getNotificationsEnabled();
    if (!globalEnabled) {
      console.log('🚫 Global notifications disabled on mount - no check needed');
      return;
    }
    
    if (!notificationsEnabled) {
      console.log('🚫 Notifications disabled in state - no check needed');
      return;
    }
    
    // 🔒 STRICT GATE: ใช้ hasActiveSettings จาก useMemo
    if (!hasActiveSettings) {
      console.log('🚫 No active notification settings - skipping all checks');
      return;
    }
    
    console.log('✅ [usePersonalNotifications] All conditions met → immediate check');
    // ไม่บล็อก UI และหลีกเลี่ยง synchronous state thrash
    Promise.resolve().then(() => checkAndActivateOnRoute());
  }, [notificationsEnabled, user?.id, hasActiveSettings]); // ใช้ hasActiveSettings แทน userSettings

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
    enabled: !!user?.id && !!userSettings && userSettings.length > 0 && hasActiveSettings,
    // เอา refetchInterval ออก - ใช้ real-time subscription แทน
    staleTime: 60000, // เพิ่มเป็น 1 นาที
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
      
      // 🔒 CRITICAL CHECK: ตรวจสอบว่าควรบล็อคการแจ้งเตือนหรือไม่
      if (shouldBlock(latestNotification.device_code)) {
        console.log('🚫 Blocked notification due to control settings:', latestNotification.device_code);
        return;
      }
      
      // 🔒 ADDITIONAL CHECK: ตรวจสอบ global notifications อีกครั้ง
      if (!getNotificationsEnabled()) {
        console.log('🚫 Global notifications disabled - blocking sound');
        return;
      }
      
      // Clear any existing timeout
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }
      
      // Activate alert sound และบันทึกเวลาล่าสุดที่ active
      setIsAlertActive(true);
      lastActiveAtRef.current = Date.now();
      
      // Show toast notification
      toast({
        title: "🚨 แจ้งเตือนคุณภาพข้าว",
        description: latestNotification.notification_message,
        variant: "destructive",
        duration: 10000,
      });

      // ยืดอายุการเล่นเสียงต่อเนื่อง: หากไม่มีแจ้งเตือนใหม่ภายใน 5 นาที ให้หยุด
      if (inactivityStopRef.current) {
        clearTimeout(inactivityStopRef.current);
      }
      inactivityStopRef.current = setTimeout(() => {
        // หากไม่มีการอัปเดตล่าสุดเกิน 5 นาที จะหยุดเสียง
        setIsAlertActive(false);
        console.log('🔕 Personal alert sound stopped due to inactivity (5 minutes)');
        inactivityStopRef.current = null;
      }, 5 * 60 * 1000);

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
  
  // Force-check on route change: fetch directly if queries aren't ready and activate sound
  const checkAndActivateOnRoute = async () => {
    try {
      if (!user?.id) {
        console.log('❌ No user ID - skipping notification check');
        return;
      }

      // 🔒 CRITICAL GATE #1: ตรวจสอบว่ามี active settings หรือไม่
      if (!hasActiveSettings) {
        console.log('🚫 No active notification settings - completely skipping all checks');
        return;
      }

      // 🔒 FIRST CHECK: Global notifications enabled?
      const globalEnabled = getNotificationsEnabled();
      if (!globalEnabled) {
        console.log('🚫 Global notifications disabled - skipping check');
        return;
      }

      console.log('🔍 Starting immediate notification check...');

      // 1) Ensure we have user settings (use cache, else fetch) - ONLY ENABLED ONES
      let settings = userSettings ? userSettings.filter((s: any) => s.enabled) : [];
      if (!settings || settings.length === 0) {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .eq('enabled', true); // 🔒 CRITICAL: Only enabled settings
        if (error) {
          console.error('checkAndActivateOnRoute: settings fetch error', error);
          return;
        }
        settings = (data as any) || [];
      }

      // 🔒 FINAL CHECK: Still no enabled settings after fetch
      if (!settings || settings.length === 0) {
        console.log('📭 No ENABLED notification settings found - stopping all checks');
        return;
      }

      console.log('⚙️ Found', settings.length, 'ENABLED notification settings');

      // ... keep existing code (rest of the function)

      // 2) Fetch latest notifications relevant to settings directly
      const deviceCodes = [...new Set(settings.map((s: any) => s.device_code))];
      const riceTypeIds = [...new Set(settings.map((s: any) => s.rice_type_id))];

      const { data: rawNoti, error: notiError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .in('device_code', deviceCodes)
        .in('rice_type_id', riceTypeIds)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (notiError) {
        console.error('checkAndActivateOnRoute: notifications fetch error', notiError);
        return;
      }

      const relevant = (rawNoti || []).filter((notification: any) => {
        const setting = settings!.find(
          (s: any) => s.device_code === notification.device_code && s.rice_type_id === notification.rice_type_id
        );
        if (!setting) return false;
        
        // 🔒 DEVICE CHECK: Is this device's notifications enabled?
        if (shouldBlock(notification.device_code)) {
          console.log('🚫 Device blocked:', notification.device_code);
          return false;
        }
        
        if (notification.threshold_type === 'min' && setting.min_enabled) {
          return notification.value < setting.min_threshold;
        }
        if (notification.threshold_type === 'max' && setting.max_enabled) {
          return notification.value > setting.max_threshold;
        }
        return false;
      });

      // 3) If relevant notifications exist, activate the alert sound immediately
      if (relevant.length > 0) {
        console.log('🚨 Found', relevant.length, 'relevant notifications - activating alert');
        
        // บังคับให้เล่นใหม่แม้กำลัง active อยู่ โดย toggle สถานะ
        setIsAlertActive(false);
        setTimeout(() => setIsAlertActive(true), 100);
        
        if (inactivityStopRef.current) {
          clearTimeout(inactivityStopRef.current);
        }
        inactivityStopRef.current = setTimeout(() => {
          setIsAlertActive(false);
          inactivityStopRef.current = null;
        }, 5 * 60 * 1000);
        return;
      }

      console.log('📝 No relevant notifications found in database, checking live data...');

      // 4) Fallback: หากยังไม่มีแถวใน notifications ให้ตรวจจากค่าล่าสุดของ rice_quality_analysis
      const columnMapping: { [key: string]: string } = {
        whiteness: 'whiteness',
        yellow_rice_ratio: 'yellow_rice_rate',
        head_rice: 'head_rice',
        whole_kernels: 'whole_kernels',
        total_brokens: 'total_brokens',
        small_brokens: 'small_brokens',
        class1: 'class1',
        class2: 'class2',
        class3: 'class3',
        broken_rice: 'total_brokens',
        chalky_rice: 'heavy_chalkiness_rate',
        paddy_rate: 'paddy_rate',
        red_rice: 'red_line_rate',
        parboiled_rice: 'parboiled_white_rice',
        glutinous_rice: 'sticky_rice_rate',
      };

      const { data: raws, error: latestErr } = await supabase
        .from('rice_quality_analysis')
        .select('*')
        .in('device_code', deviceCodes)
        .order('created_at', { ascending: false })
        .limit(Math.max(deviceCodes.length * 3, 10));

      if (latestErr) {
        console.error('checkAndActivateOnRoute: latest measurements fetch error', latestErr);
        return;
      }

      const latestByDevice = new Map<string, any>();
      (raws || []).forEach((row: any) => {
        if (!latestByDevice.has(row.device_code)) {
          latestByDevice.set(row.device_code, row);
        }
      });

      let triggered = false;
      for (const setting of settings) {
        // 🔒 DEVICE CHECK: Skip if this device is disabled
        if (shouldBlock(setting.device_code)) {
          console.log('🚫 Skipping disabled device:', setting.device_code);
          continue;
        }
        
        const latest = latestByDevice.get(setting.device_code);
        if (!latest) continue;
        const columnName = columnMapping[setting.rice_type_id];
        if (!columnName) continue;
        const currentValue = latest[columnName];
        if (currentValue === null || currentValue === undefined) continue;
        
        if (setting.min_enabled && currentValue < setting.min_threshold) {
          console.log('🚨 MIN threshold triggered:', setting.device_code, setting.rice_type_id, currentValue, '<', setting.min_threshold);
          triggered = true; 
          break;
        }
        if (setting.max_enabled && currentValue > setting.max_threshold) {
          console.log('🚨 MAX threshold triggered:', setting.device_code, setting.rice_type_id, currentValue, '>', setting.max_threshold);
          triggered = true; 
          break;
        }
      }

      if (triggered) {
        console.log('🚨 Live data threshold triggered - activating alert');
        
        // บังคับให้เล่นใหม่แม้กำลัง active อยู่ โดย toggle สถานะ
        setIsAlertActive(false);
        setTimeout(() => setIsAlertActive(true), 100);
        
        if (inactivityStopRef.current) {
          clearTimeout(inactivityStopRef.current);
        }
        inactivityStopRef.current = setTimeout(() => {
          setIsAlertActive(false);
          inactivityStopRef.current = null;
        }, 5 * 60 * 1000);
      } else {
        console.log('✅ No thresholds triggered - no alert needed');
      }
    } catch (e) {
      console.warn('checkAndActivateOnRoute failed:', e);
    }
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }
      if (inactivityStopRef.current) {
        clearTimeout(inactivityStopRef.current);
        inactivityStopRef.current = null;
      }
    };
  }, []);

  return {
    notifications,
    userSettings,
    hasActiveSettings, // ใช้ hasActiveSettings จาก useMemo
    refetch,
    checkAndActivateOnRoute
  };
};