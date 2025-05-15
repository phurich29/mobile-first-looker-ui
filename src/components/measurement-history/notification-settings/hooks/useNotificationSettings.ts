
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  saveNotificationSettings, 
  getNotificationSettings 
} from "../../api";

export const useNotificationSettings = (deviceCode: string, symbol: string, name: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [minEnabled, setMinEnabled] = useState(false);
  const [maxEnabled, setMaxEnabled] = useState(false);
  const [minThreshold, setMinThreshold] = useState(0);
  const [maxThreshold, setMaxThreshold] = useState(100);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await getNotificationSettings(deviceCode, symbol);
      
      if (settings) {
        setEnabled(settings.enabled ?? true);
        setMinEnabled(settings.min_enabled ?? true);
        setMaxEnabled(settings.max_enabled ?? true);
        setMinThreshold(settings.min_threshold ?? 0);
        setMaxThreshold(settings.max_threshold ?? 100);
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
      toast({
        title: "ไม่สามารถโหลดการตั้งค่าได้",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [deviceCode, symbol, toast]);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      await saveNotificationSettings({
        deviceCode,
        symbol,
        name,
        enabled,
        minEnabled,
        maxEnabled,
        minThreshold,
        maxThreshold
      });
      
      toast({
        title: "บันทึกการตั้งค่าเรียบร้อย",
        description: "การแจ้งเตือนจะทำงานตามที่คุณตั้งค่าไว้",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "ไม่สามารถบันทึกการตั้งค่าได้",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    settings: {
      enabled,
      minEnabled,
      maxEnabled,
      minThreshold,
      maxThreshold
    },
    setEnabled,
    setMinEnabled,
    setMaxEnabled,
    setMinThreshold,
    setMaxThreshold,
    loadSettings,
    handleSaveSettings
  };
};

export default useNotificationSettings;
