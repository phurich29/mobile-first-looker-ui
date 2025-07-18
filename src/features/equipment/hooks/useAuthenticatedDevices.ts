import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeviceInfo } from '../types';
import { fetchDevicesWithDetails } from '../services';
import { useMountedRef } from './useMountedRef';

interface UseAuthenticatedDevicesProps {
  userId: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Hook for fetching authenticated user devices
 */
export function useAuthenticatedDevices({ userId, isAdmin, isSuperAdmin }: UseAuthenticatedDevicesProps) {
  const isMountedRef = useMountedRef();

  const fetchAuthenticatedDevices = useCallback(async (): Promise<DeviceInfo[]> => {
    if (!isMountedRef.current) {
      console.log('🔐 Component unmounted, skipping authenticated device fetch');
      return [];
    }

    try {
      console.log('🔐 Fetching devices for authenticated user...');
      
      // Use the existing optimized function
      const deviceList = await fetchDevicesWithDetails(
        userId,
        isAdmin,
        isSuperAdmin
      );
      
      if (!isMountedRef.current) return [];
      
      // เพิ่มข้อมูล deviceData สำหรับ authenticated users
      if (deviceList.length > 0) {
        const deviceCodes = deviceList.map(d => d.device_code);
        
        const { data: analysisData } = await supabase
          .from('rice_quality_analysis')
          .select('*')
          .in('device_code', deviceCodes)
          .order('created_at', { ascending: false });

        if (!isMountedRef.current) return [];

        const latestDeviceData: Record<string, any> = {};
        analysisData?.forEach(record => {
          if (!latestDeviceData[record.device_code]) {
            latestDeviceData[record.device_code] = record;
          }
        });

        const enrichedDeviceList = deviceList.map(device => {
          const deviceAnalysisData = latestDeviceData[device.device_code];
          console.log(`🔐 User device ${device.device_code} data:`, deviceAnalysisData);
          
          return {
            ...device,
            deviceData: deviceAnalysisData || null
          };
        });

        console.log(`🔐 Fetched ${enrichedDeviceList.length} devices with data for authenticated user`);
        return enrichedDeviceList;
      }
      
      console.log('🔐 No devices found for authenticated user');
      return deviceList;
    } catch (error) {
      console.error('Error fetching authenticated devices:', error);
      throw error;
    }
  }, [userId, isAdmin, isSuperAdmin, isMountedRef]);

  return { fetchAuthenticatedDevices };
}