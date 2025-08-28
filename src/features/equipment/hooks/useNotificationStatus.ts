import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export interface NotificationStatus {
  hasSettings: boolean;
  isTriggered: boolean;
  triggeredSettings: Array<{
    rice_type_id: string;
    threshold_type: 'min' | 'max';
    threshold: number;
    currentValue: number;
  }>;
}

export const useNotificationStatus = (deviceCode: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notification-status', deviceCode, user?.id],
    queryFn: async (): Promise<NotificationStatus> => {
      if (!user?.id) {
        return { hasSettings: false, isTriggered: false, triggeredSettings: [] };
      }

      // ดึงการตั้งค่าแจ้งเตือนของผู้ใช้
      const { data: settings, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('device_code', deviceCode)
        .eq('enabled', true);

      if (settingsError) {
        console.error('Error fetching notification settings:', settingsError);
        return { hasSettings: false, isTriggered: false, triggeredSettings: [] };
      }

      if (!settings || settings.length === 0) {
        return { hasSettings: false, isTriggered: false, triggeredSettings: [] };
      }

      // ดึงข้อมูลล่าสุดของเครื่อง
      const { data: latestData, error: dataError } = await supabase
        .from('rice_quality_analysis')
        .select('*')
        .eq('device_code', deviceCode)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (dataError || !latestData || latestData.length === 0) {
        console.error('Error fetching latest device data:', dataError);
        return { hasSettings: true, isTriggered: false, triggeredSettings: [] };
      }

      const latestMeasurement = latestData[0];
      const triggeredSettings = [];

      // ตรวจสอบแต่ละการตั้งค่าว่าเข้าเงื่อนไขหรือไม่
      for (const setting of settings) {
        // แปลง rice_type_id เป็น column name ในตาราง
        const columnMapping: { [key: string]: string } = {
          'whiteness': 'whiteness',
          'yellow_rice_ratio': 'yellow_rice_ratio', 
          'grade_1': 'grade_1',
          'grade_2': 'grade_2',
          'grade_3': 'grade_3',
          'grade_4': 'grade_4',
          'grade_5': 'grade_5',
          'broken_rice': 'broken_rice',
          'chalky_rice': 'chalky_rice',
          'damaged_rice': 'damaged_rice',
          'red_rice': 'red_rice',
          'parboiled_rice': 'parboiled_rice',
          'glutinous_rice': 'glutinous_rice'
        };

        const columnName = columnMapping[setting.rice_type_id];
        if (!columnName) continue;

        const currentValue = latestMeasurement[columnName];
        if (currentValue === null || currentValue === undefined) continue;

        // ตรวจสอบเกณฑ์ต่ำสุด
        if (setting.min_enabled && currentValue < setting.min_threshold) {
          triggeredSettings.push({
            rice_type_id: setting.rice_type_id,
            threshold_type: 'min' as const,
            threshold: setting.min_threshold,
            currentValue
          });
        }

        // ตรวจสอบเกณฑ์สูงสุด
        if (setting.max_enabled && currentValue > setting.max_threshold) {
          triggeredSettings.push({
            rice_type_id: setting.rice_type_id,
            threshold_type: 'max' as const,
            threshold: setting.max_threshold,
            currentValue
          });
        }
      }

      return {
        hasSettings: true,
        isTriggered: triggeredSettings.length > 0,
        triggeredSettings
      };
    },
    enabled: !!user?.id && !!deviceCode,
    staleTime: 30000, // 30 วินาที
    refetchInterval: 60000, // รีเฟรชทุก 1 นาที
  });
};