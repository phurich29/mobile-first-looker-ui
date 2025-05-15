
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NotificationSetting } from "../types";

export const useNotificationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch notification settings that are enabled
      const { data: notificationSettings, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('enabled', true);
        
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
          const device = deviceSettings.find(d => d.device_code === setting.device_code);
          return {
            ...setting,
            device_name: device?.display_name || setting.device_code
          };
        });
        
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
    fetchSettings();
  }, [toast]);

  return { settings, loading, error, fetchSettings };
};
