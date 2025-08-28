import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { NotificationSetting } from "../types";
import { fetchDevicesWithDetails } from "@/features/equipment/services";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

export const useNotificationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRoles } = useAuth();

  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Function to fetch accessible device codes for the current user
  const fetchAccessibleDeviceCodes = useCallback(async (): Promise<string[]> => {
    if (!user) return [];

    try {
      // Use the same device access logic as other pages
      const devices = await fetchDevicesWithDetails(user.id, isAdmin, isSuperAdmin);
      return devices.map(device => device.device_code);
    } catch (error) {
      console.error("Error fetching accessible devices:", error);
      return [];
    }
  }, [user, isAdmin, isSuperAdmin]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Get accessible device codes first
      const accessibleDeviceCodes = await fetchAccessibleDeviceCodes();
      console.log("🔐 User has access to devices:", accessibleDeviceCodes);
      
      if (accessibleDeviceCodes.length === 0) {
        console.log("❌ No accessible devices found for notification settings");
        setSettings([]);
        return;
      }
      
      // ✅ ใช้ API ที่มี validation แทนการเรียก supabase โดยตรง
      const notificationSettings: NotificationSetting[] = [];
      
      // Fetch settings for each device using validated API
      for (const deviceCode of accessibleDeviceCodes) {
        try {
          // เนื่องจากต้องระบุ rice_type_id เราจึงดึงการตั้งค่าทั้งหมดของ device นี้
          // โดยใช้ query จาก supabase แต่ผ่าน API validation
          console.log(`📥 Fetching settings for device: ${deviceCode}`);
          
          // TODO: ปรับ API ให้รองรับการดึงการตั้งค่าทั้งหมดของ device
          // ตอนนี้ใช้วิธี direct query แต่มี user validation
          const { data: deviceSettings, error: deviceSettingsError } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('device_code', deviceCode)
            .eq('user_id', user?.id) // ✅ CRITICAL: กรองด้วย user_id
            .order('rice_type_name', { ascending: true });
            
          if (deviceSettingsError) {
            console.warn(`Failed to fetch settings for device ${deviceCode}:`, deviceSettingsError);
            continue;
          }
          
          if (deviceSettings) {
            notificationSettings.push(...deviceSettings);
          }
        } catch (error) {
          console.error(`Error fetching settings for device ${deviceCode}:`, error);
        }
      }

      // Get unique device codes to fetch device names
      const deviceCodes = [...new Set(notificationSettings.map(setting => setting.device_code))];
      
      // Fetch device names if there are any settings
      if (deviceCodes.length > 0) {
        const { data: deviceSettings, error: deviceError } = await supabase
          .from('device_settings')
          .select('device_code, display_name')
          .in('device_code', deviceCodes);
          
        if (deviceError) throw deviceError;
        
        // Map device names to notification settings
        const enrichedSettings = notificationSettings.map(setting => {
          const device = deviceSettings?.find(d => d.device_code === setting.device_code);
          return {
            ...setting,
            device_name: device?.display_name || setting.device_code
          };
        });
        
        console.log("✅ Fetched notification settings for accessible devices:", enrichedSettings.length);
        setSettings(enrichedSettings);
      } else {
        setSettings(notificationSettings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      setError('ไม่สามารถโหลดการตั้งค่าแจ้งเตือนได้');
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดการตั้งค่าแจ้งเตือนได้"
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time updates for notification settings
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notification_settings_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notification_settings',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('🔔 Real-time notification settings update:', payload);
          // Refresh settings when any changes occur
          fetchSettings();
        }
      )
      .subscribe();

    console.log('🔌 Subscribed to notification settings real-time updates');

    return () => {
      console.log('🔌 Cleaning up notification settings real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user, userRoles]);

  return { settings, loading, error, fetchSettings };
};