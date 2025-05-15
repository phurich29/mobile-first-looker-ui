
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
