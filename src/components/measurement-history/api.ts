
import { supabase } from "@/integrations/supabase/client";
import { TimeFrame } from "./MeasurementHistory";

// Function to get hours based on timeframe
export const getTimeFrameHours = (frame: TimeFrame): number => {
  switch (frame) {
    case '1h': return 1;
    case '24h': return 24;
    case '7d': return 24 * 7;
    case '30d': return 24 * 30;
    default: return 24;
  }
};

// Fetch measurement history data
export const fetchMeasurementHistory = async (
  deviceCode: string, 
  symbol: string, 
  timeFrame: TimeFrame
) => {
  if (!deviceCode || !symbol) throw new Error("Missing device code or measurement symbol");
  
  try {
    // Dynamic select query
    const selectQuery = `id, ${symbol}, created_at, thai_datetime`;
    
    // Calculate cutoff date based on timeframe
    const hours = getTimeFrameHours(timeFrame);
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    const { data, error } = await supabase
      .from('rice_quality_analysis')
      .select(selectQuery)
      .eq('device_code', deviceCode)
      .gt('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching history for ${symbol} on device ${deviceCode}:`, error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (err) {
    console.error('Error in fetchMeasurementHistory:', err);
    return [];
  }
};

// Format Bangkok time (+7)
export const formatBangkokTime = (dateString?: string): { thaiDate: string; thaiTime: string } => {
  if (!dateString) return { thaiDate: "ไม่มีข้อมูล", thaiTime: "ไม่มีข้อมูล" };
  
  const date = new Date(dateString);
  const adjustedDate = new Date(date);
  adjustedDate.setHours(adjustedDate.getHours() + 7);
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  const thaiDate = new Intl.DateTimeFormat('th-TH', dateOptions).format(adjustedDate);
  const thaiTime = new Intl.DateTimeFormat('th-TH', timeOptions).format(adjustedDate);
  
  return { thaiDate, thaiTime };
};

// Calculate average value
export const calculateAverage = (historyData: any[], symbol: string): number => {
  if (!historyData || historyData.length === 0) return 0;
  
  const values = historyData
    .map((item: any) => (item as any)[symbol])
    .filter((value: any) => value !== null && value !== undefined);
    
  if (values.length === 0) return 0;
  
  const sum = values.reduce((acc: number, val: number) => acc + val, 0);
  return sum / values.length;
};

// Notification Settings Interface
export interface NotificationSettings {
  id?: string;
  device_code: string;
  rice_type_id: string;
  rice_type_name: string;
  enabled: boolean;
  min_enabled: boolean;
  max_enabled: boolean;
  min_threshold: number;
  max_threshold: number;
}

// Fetch notification settings for a device and measurement
export const getNotificationSettings = async (deviceCode: string, symbol: string): Promise<NotificationSettings | null> => {
  try {
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('device_code', deviceCode)
      .eq('rice_type_id', symbol)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching notification settings:', error);
      return null;
    }
    
    return settings;
  } catch (err) {
    console.error('Exception in getNotificationSettings:', err);
    return null;
  }
};

// Save notification settings
export const saveNotificationSettings = async (settings: {
  deviceCode: string;
  symbol: string;
  name: string;
  enabled: boolean;
  minEnabled: boolean;
  maxEnabled: boolean;
  minThreshold: number;
  maxThreshold: number;
}): Promise<void> => {
  const { deviceCode, symbol, name, enabled, minEnabled, maxEnabled, minThreshold, maxThreshold } = settings;
  
  // First check if settings already exist
  const existingSettings = await getNotificationSettings(deviceCode, symbol);
  
  try {
    if (existingSettings?.id) {
      // Update existing settings
      const { error } = await supabase
        .from('notification_settings')
        .update({
          enabled,
          min_enabled: minEnabled,
          max_enabled: maxEnabled,
          min_threshold: minThreshold,
          max_threshold: maxThreshold,
        })
        .eq('id', existingSettings.id);
      
      if (error) throw error;
    } else {
      // Create new settings
      const { error } = await supabase
        .from('notification_settings')
        .insert({
          device_code: deviceCode,
          rice_type_id: symbol,
          rice_type_name: name,
          enabled,
          min_enabled: minEnabled,
          max_enabled: maxEnabled,
          min_threshold: minThreshold,
          max_threshold: maxThreshold,
        });
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error saving notification settings:', error);
    throw new Error('Failed to save notification settings');
  }
};
