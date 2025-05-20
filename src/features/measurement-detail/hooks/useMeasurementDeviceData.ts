
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { REQUIRED_DEVICE_CODES } from "@/features/equipment/services/deviceDataService";
import { formatBangkokTime } from "@/components/measurement-history/api";

export interface DeviceData {
  deviceCode: string;
  deviceName: string;
  value: number | null;
  timestamp: string | null;
}

export const useMeasurementDeviceData = (measurementSymbol: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  
  // Fetch device data and latest measurement values
  useEffect(() => {
    const fetchDeviceData = async () => {
      setIsLoading(true);
      try {
        // Get custom display names from device_settings
        const { data: deviceSettings, error: settingsError } = await supabase
          .from('device_settings')
          .select('device_code, display_name')
          .in('device_code', REQUIRED_DEVICE_CODES);
          
        if (settingsError) {
          console.error("Error fetching device settings:", settingsError);
        }
        
        // Create a map of device_code to display_name
        const displayNameMap: Record<string, string> = {};
        if (deviceSettings) {
          deviceSettings.forEach(setting => {
            if (setting.display_name) {
              displayNameMap[setting.device_code] = setting.display_name;
            }
          });
        }
        
        // For each required device, fetch the latest measurement
        const devicePromises = REQUIRED_DEVICE_CODES.map(async (deviceCode) => {
          // Only proceed if we have a valid measurement symbol
          if (!measurementSymbol) {
            return {
              deviceCode,
              deviceName: displayNameMap[deviceCode] || `อุปกรณ์วัด ${deviceCode}`,
              value: null,
              timestamp: null
            };
          }

          // Select dynamically based on the measurement symbol
          const selectQuery = `device_code, ${measurementSymbol}, created_at`;
          
          const { data, error } = await supabase
            .from('rice_quality_analysis')
            .select(selectQuery)
            .eq('device_code', deviceCode)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (error) {
            console.error(`Error fetching data for device ${deviceCode}:`, error);
            // Return default object with null values to maintain the correct type
            return {
              deviceCode,
              deviceName: displayNameMap[deviceCode] || `อุปกรณ์วัด ${deviceCode}`,
              value: null,
              timestamp: null
            };
          }
          
          // Create device name - either from settings or default format
          const deviceName = displayNameMap[deviceCode] || `อุปกรณ์วัด ${deviceCode}`;
          
          // Handle the case where data might be null or undefined
          if (!data) {
            return {
              deviceCode,
              deviceName,
              value: null,
              timestamp: null
            };
          }
          
          // Check if data has the necessary properties before accessing them
          const timestamp = typeof data === 'object' && data !== null && 'created_at' in data 
            ? String(data.created_at) 
            : null;
          
          // Ensure value is cast to number or null to match DeviceData type
          const measurementValue = data[measurementSymbol as keyof typeof data];
          const parsedValue = typeof measurementValue === 'number' ? measurementValue : 
                             (measurementValue ? Number(measurementValue) : null);
          
          return {
            deviceCode,
            deviceName,
            value: parsedValue,
            timestamp
          };
        });
        
        const devicesData = await Promise.all(devicePromises);
        // Cast to ensure type safety
        setDevices(devicesData as DeviceData[]);
      } catch (error) {
        console.error("Error fetching device data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeviceData();
  }, [measurementSymbol]);

  return { isLoading, devices };
};
