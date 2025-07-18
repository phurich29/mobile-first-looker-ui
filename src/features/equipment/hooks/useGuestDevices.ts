import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeviceInfo } from '../types';
import { useMountedRef } from './useMountedRef';

/**
 * Hook for fetching guest devices
 */
export function useGuestDevices() {
  const isMountedRef = useMountedRef();

  const fetchGuestDevices = useCallback(async (): Promise<DeviceInfo[]> => {
    if (!isMountedRef.current) {
      console.log('📱 Component unmounted, skipping guest device fetch');
      return [];
    }

    try {
      console.log('📱 Fetching guest devices...');
      
      // ดึงรายการอุปกรณ์ที่เปิดให้ guest ดู
      const { data: guestAccessData, error: guestError } = await supabase
        .from('guest_device_access')
        .select('device_code')
        .eq('enabled', true);

      if (!isMountedRef.current) return [];

      if (guestError) {
        console.error('Error fetching guest access:', guestError);
        throw guestError;
      }

      if (!guestAccessData || guestAccessData.length === 0) {
        console.log('No guest devices found');
        return [];
      }

      const deviceCodes = guestAccessData.map(item => item.device_code);
      console.log('📱 Guest device codes:', deviceCodes);
      
      // ดึงข้อมูล display name
      const { data: settingsData } = await supabase
        .from('device_settings')
        .select('device_code, display_name')
        .in('device_code', deviceCodes);

      if (!isMountedRef.current) return [];

      // ดึงข้อมูลล่าสุดจาก rice_quality_analysis พร้อมข้อมูลทั้งหมด
      const { data: analysisData } = await supabase
        .from('rice_quality_analysis')
        .select('*')
        .in('device_code', deviceCodes)
        .order('created_at', { ascending: false });

      if (!isMountedRef.current) return [];

      // สร้าง map ของข้อมูลล่าสุดสำหรับแต่ละ device
      const latestDeviceData: Record<string, any> = {};
      analysisData?.forEach(record => {
        if (!latestDeviceData[record.device_code]) {
          latestDeviceData[record.device_code] = record;
        }
      });

      const devicesWithDetails = deviceCodes.map(code => {
        const setting = settingsData?.find(s => s.device_code === code);
        const deviceAnalysisData = latestDeviceData[code];
        
        console.log(`📱 Guest device ${code} data:`, deviceAnalysisData);
        
        return {
          device_code: code,
          display_name: setting?.display_name || code,
          updated_at: deviceAnalysisData?.created_at || new Date().toISOString(),
          deviceData: deviceAnalysisData || null
        };
      });

      console.log(`📱 Fetched ${devicesWithDetails.length} guest devices with data`);
      return devicesWithDetails;
    } catch (error) {
      console.error('Error fetching guest devices:', error);
      throw error;
    }
  }, [isMountedRef]);

  return { fetchGuestDevices };
}