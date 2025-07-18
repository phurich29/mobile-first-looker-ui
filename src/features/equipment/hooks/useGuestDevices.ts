
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeviceInfo } from '../types';
import { useMountedRef } from './useMountedRef';

/**
 * Hook for fetching guest devices with optimized single query
 */
export function useGuestDevices() {
  const isMountedRef = useMountedRef();

  const fetchGuestDevices = useCallback(async (): Promise<DeviceInfo[]> => {
    if (!isMountedRef.current) {
      console.log('📱 Component unmounted, skipping guest device fetch');
      return [];
    }

    try {
      console.log('📱 Fetching guest devices with optimized query...');
      
      // Single optimized query using database function
      const { data: devicesData, error } = await supabase.rpc('get_guest_devices_fast');

      if (!isMountedRef.current) return [];

      if (error) {
        console.error('Error fetching guest devices:', error);
        throw error;
      }

      if (!devicesData || devicesData.length === 0) {
        console.log('No guest devices found');
        return [];
      }

      console.log(`📱 Fetched ${devicesData.length} guest devices`);
      
      // Get the latest analysis data for each device in a single query
      const deviceCodes = devicesData.map(d => d.device_code);
      
      const { data: analysisData } = await supabase
        .from('rice_quality_analysis')
        .select('*')
        .in('device_code', deviceCodes)
        .order('created_at', { ascending: false });

      if (!isMountedRef.current) return [];

      // Create map of latest device data
      const latestDeviceData: Record<string, any> = {};
      analysisData?.forEach(record => {
        if (!latestDeviceData[record.device_code]) {
          latestDeviceData[record.device_code] = record;
        }
      });

      const enrichedDevices = devicesData.map(device => {
        const deviceAnalysisData = latestDeviceData[device.device_code];
        console.log(`📱 Guest device ${device.device_code} data:`, !!deviceAnalysisData);
        
        return {
          device_code: device.device_code,
          display_name: device.display_name || device.device_code,
          updated_at: device.updated_at || new Date().toISOString(),
          deviceData: deviceAnalysisData || null
        };
      });

      console.log(`📱 Successfully enriched ${enrichedDevices.length} guest devices`);
      return enrichedDevices;
      
    } catch (error) {
      console.error('Error fetching guest devices:', error);
      throw error;
    }
  }, [isMountedRef]);

  return { fetchGuestDevices };
}
