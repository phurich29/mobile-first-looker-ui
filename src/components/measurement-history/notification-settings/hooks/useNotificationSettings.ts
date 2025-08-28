
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  saveNotificationSettings, 
  getNotificationSettings 
} from "../../api";
import { validateNotificationUser, useNotificationValidation } from "@/utils/notificationValidation";

export const useNotificationSettings = (deviceCode: string, symbol: string, name: string) => {
  const { toast } = useToast();
  const { validatePayload, logValidation, currentUserId } = useNotificationValidation();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [minEnabled, setMinEnabled] = useState(false);
  const [maxEnabled, setMaxEnabled] = useState(false);
  const [minThreshold, setMinThreshold] = useState(0);
  const [maxThreshold, setMaxThreshold] = useState(100);

  // Reset all states to default values with validation
  const resetStates = useCallback(() => {
    if (!currentUserId) {
      console.warn('🚫 Cannot reset states: No authenticated user');
      return;
    }
    
    console.log('🔄 Resetting notification states for user:', currentUserId);
    setEnabled(false);
    setMinEnabled(false);
    setMaxEnabled(false);
    setMinThreshold(0);
    setMaxThreshold(100);
  }, [currentUserId]);

  const loadSettings = useCallback(async () => {
    if (!currentUserId) {
      console.warn('🚫 Cannot load settings: No authenticated user');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Loading notification settings for user:', currentUserId, 'device:', deviceCode, 'symbol:', symbol);
      
      const settings = await getNotificationSettings(deviceCode, symbol);
      
      if (settings) {
        // Validate that settings belong to current user
        if (settings.user_id && settings.user_id !== currentUserId) {
          console.error('🚫 Settings belong to different user:', {
            settings_user: settings.user_id,
            current_user: currentUserId
          });
          toast({
            title: "เกิดข้อผิดพลาดด้านความปลอดภัย",
            description: "ไม่สามารถโหลดการตั้งค่าได้ กรุณาลองใหม่",
            variant: "destructive"
          });
          return;
        }

        console.log('✅ Valid settings loaded for user:', currentUserId);
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
  }, [deviceCode, symbol, toast, currentUserId]);

  const handleSaveSettings = async () => {
    if (!currentUserId) {
      console.error('🚫 Cannot save settings: No authenticated user');
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาเข้าสู่ระบบก่อนบันทึกการตั้งค่า",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoading(true);
      
      console.log('💾 Saving notification settings for user:', currentUserId);
      
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
      
      console.log('✅ Settings saved successfully for user:', currentUserId);
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
    handleSaveSettings,
    resetStates
  };
};

export default useNotificationSettings;
