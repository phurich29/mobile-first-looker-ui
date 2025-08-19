
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NotificationSetting } from "../types";
import { fetchDevicesWithDetails } from "@/features/equipment/services";
import { useAuth } from "@/components/AuthProvider";

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
      
      // Fetch notification settings only for accessible devices
      // หมายเหตุ: RLS policies จะกรองให้เห็นเฉพาะการตั้งค่าของ user ปัจจุบันอัตโนมัติ
      const { data: notificationSettings, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .in('device_code', accessibleDeviceCodes) // Filter by accessible devices
        .order('id', { ascending: true });
        
      if (settingsError) throw settingsError;

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

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user, userRoles]);

  return { settings, loading, error, fetchSettings };
};
