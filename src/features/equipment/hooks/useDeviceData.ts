
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useToast } from "@/components/ui/use-toast";
import { DeviceInfo } from "../types";
import { fetchDevicesWithDetails, countUniqueDevices } from "../services";
import { supabase } from "@/integrations/supabase/client";

export function useDeviceData() {
  const { user, userRoles } = useAuth();
  const { isGuest } = useGuestMode();
  const { toast } = useToast();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalUniqueDevices, setTotalUniqueDevices] = useState(0);
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  
  // Fetch guest devices
  const fetchGuestDevices = useCallback(async (): Promise<DeviceInfo[]> => {
    try {
      console.log('Fetching guest devices...');
      
      // ดึงรายการอุปกรณ์ที่เปิดให้ guest ดู
      const { data: guestAccessData, error: guestError } = await supabase
        .from('guest_device_access')
        .select('device_code')
        .eq('enabled', true);

      if (guestError) {
        console.error('Error fetching guest access:', guestError);
        return [];
      }

      if (!guestAccessData || guestAccessData.length === 0) {
        console.log('No guest devices found');
        return [];
      }

      const deviceCodes = guestAccessData.map(item => item.device_code);
      console.log('Guest device codes:', deviceCodes);
      
      // ดึงข้อมูล display name และ updated_at
      const { data: settingsData } = await supabase
        .from('device_settings')
        .select('device_code, display_name')
        .in('device_code', deviceCodes);

      // ดึงข้อมูล updated_at จาก rice_quality_analysis
      const { data: analysisData } = await supabase
        .from('rice_quality_analysis')
        .select('device_code, created_at')
        .in('device_code', deviceCodes)
        .order('created_at', { ascending: false });

      // สร้าง map ของ updated_at ล่าสุดสำหรับแต่ละ device
      const latestTimestamps: Record<string, string> = {};
      analysisData?.forEach(record => {
        if (!latestTimestamps[record.device_code]) {
          latestTimestamps[record.device_code] = record.created_at;
        }
      });

      const devicesWithDetails = deviceCodes.map(code => {
        const setting = settingsData?.find(s => s.device_code === code);
        return {
          device_code: code,
          display_name: setting?.display_name || code,
          updated_at: latestTimestamps[code] || new Date().toISOString()
        };
      });

      console.log(`Fetched ${devicesWithDetails.length} guest devices`);
      return devicesWithDetails;
    } catch (error) {
      console.error('Error fetching guest devices:', error);
      return [];
    }
  }, []);
  
  // Fetch devices using the new optimized function
  const fetchDevices = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      let deviceList: DeviceInfo[] = [];
      
      if (isGuest) {
        // สำหรับ Guest ใช้ฟังก์ชันพิเศษ
        deviceList = await fetchGuestDevices();
      } else if (user) {
        // สำหรับ User ที่ login แล้ว
        console.log('Fetching devices using optimized database function...');
        
        // Use the new single-query function
        deviceList = await fetchDevicesWithDetails(
          user.id,
          isAdmin,
          isSuperAdmin
        );
        
        console.log(`Fetched ${deviceList.length} devices in single query`);
      }
      
      setDevices(deviceList);
      
      // Count total unique devices (only for authenticated users)
      if (!isGuest && user) {
        const totalCount = await countUniqueDevices();
        setTotalUniqueDevices(totalCount);
      } else {
        setTotalUniqueDevices(deviceList.length);
      }
      
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Error",
        description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, isAdmin, isSuperAdmin, isGuest, toast, fetchGuestDevices]);
  
  // Initial fetch
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);
  
  // Handler for manual refresh
  const handleRefresh = useCallback(async () => {
    await fetchDevices();
  }, [fetchDevices]);
  
  return {
    devices,
    isLoading,
    isRefreshing,
    totalUniqueDevices,
    handleRefresh,
    isAdmin,
    isSuperAdmin
  };
}
