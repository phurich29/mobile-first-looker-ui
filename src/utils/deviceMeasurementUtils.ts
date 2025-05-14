
import { supabase } from "@/integrations/supabase/client";

// Type definitions
export type MeasurementItem = {
  symbol: string;
  name: string;
  price: string;
  percentageChange: number;
  iconColor: string;
  updatedAt: Date;
};

// Fetch data functions
export const fetchWholeGrainData = async (deviceCode: string) => {
  if (!deviceCode) throw new Error("No device code provided");
  
  const { data, error } = await supabase
    .from('rice_quality_analysis')
    .select('id, class1, class2, class3, short_grain, slender_kernel, created_at, thai_datetime')
    .eq('device_code', deviceCode)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error(`Error fetching whole grain data for device ${deviceCode}:`, error);
    throw new Error(error.message);
  }
  
  return data;
};

export const fetchIngredientsData = async (deviceCode: string) => {
  if (!deviceCode) throw new Error("No device code provided");
  
  const { data, error } = await supabase
    .from('rice_quality_analysis')
    .select('id, whole_kernels, head_rice, total_brokens, small_brokens, small_brokens_c1, created_at, thai_datetime')
    .eq('device_code', deviceCode)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error(`Error fetching ingredients data for device ${deviceCode}:`, error);
    throw new Error(error.message);
  }
  
  return data;
};

export const fetchImpuritiesData = async (deviceCode: string) => {
  if (!deviceCode) throw new Error("No device code provided");
  
  const { data, error } = await supabase
    .from('rice_quality_analysis')
    .select('id, red_line_rate, parboiled_red_line, parboiled_white_rice, honey_rice, yellow_rice_rate, black_kernel, partly_black_peck, partly_black, imperfection_rate, sticky_rice_rate, impurity_num, paddy_rate, whiteness, process_precision, created_at, thai_datetime')
    .eq('device_code', deviceCode)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error(`Error fetching impurities data for device ${deviceCode}:`, error);
    throw new Error(error.message);
  }
  
  return data;
};

export const fetchAllData = async (deviceCode: string) => {
  if (!deviceCode) throw new Error("No device code provided");
  
  const { data, error } = await supabase
    .from('rice_quality_analysis')
    .select('*')
    .eq('device_code', deviceCode)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error(`Error fetching all data for device ${deviceCode}:`, error);
    throw new Error(error.message);
  }
  
  return data;
};
