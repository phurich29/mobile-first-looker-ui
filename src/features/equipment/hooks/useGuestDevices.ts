
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeviceInfo } from '../types';

export function useGuestDevices() {
  const fetchGuestDevices = useCallback(async (): Promise<DeviceInfo[]> => {
    console.log("👤 Fetching guest devices with optimized query");
    
    try {
      // Try the fast guest devices function first
      const { data, error } = await supabase.rpc('get_guest_devices_fast');
      
      if (error) {
        console.error("👤 Error with get_guest_devices_fast:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("👤 No guest devices found");
        return [];
      }

      // Transform the data to match DeviceInfo interface
      const transformedDevices: DeviceInfo[] = data.map(device => ({
        device_code: device.device_code,
        display_name: device.display_name,
        updated_at: device.updated_at ? new Date(device.updated_at).toISOString() : new Date().toISOString(),
        deviceData: null // Guest devices don't need full device data
      }));

      console.log(`👤 Successfully fetched ${transformedDevices.length} guest devices`);
      return transformedDevices;
      
    } catch (error) {
      console.error('👤 Error in fetchGuestDevices:', error);
      
      // Emergency fallback for guests
      console.log('👤 Using emergency fallback for guest devices');
      try {
        const { data: fallbackData, error: fallbackError } = await supabase.rpc('get_devices_emergency_fallback');
        
        if (fallbackError) {
          console.error("👤 Emergency fallback also failed:", fallbackError);
          return [];
        }

        if (!fallbackData) {
          return [];
        }

        const fallbackDevices: DeviceInfo[] = fallbackData.map(device => ({
          device_code: device.device_code,
          display_name: device.display_name || device.device_code,
          updated_at: device.updated_at ? new Date(device.updated_at).toISOString() : new Date().toISOString(),
          deviceData: null
        }));

        console.log(`👤 Emergency fallback returned ${fallbackDevices.length} devices`);
        return fallbackDevices;
      } catch (fallbackError) {
        console.error('👤 Emergency fallback failed completely:', fallbackError);
        return [];
      }
    }
  }, []);

  return { fetchGuestDevices };
}
