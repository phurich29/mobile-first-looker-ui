
import { useState, useEffect, useCallback, useRef } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  
  // Fetch guest devices
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
  }, []);
  
  // Fetch devices using the new optimized function
  const fetchDevices = useCallback(async () => {
    if (!isMountedRef.current) {
      console.log("🔧 Component unmounted, skipping device fetch");
      return;
    }

    const startTime = Date.now();
    console.log("🔧 Starting device data fetch at:", new Date().toISOString());
    
    try {
      if (isMountedRef.current) {
        setIsRefreshing(true);
        setError(null);
      }
      
      let deviceList: DeviceInfo[] = [];
      
      if (isGuest) {
        console.log("👤 Fetching devices for guest user");
        deviceList = await fetchGuestDevices();
      } else if (user) {
        console.log('🔐 Fetching devices for authenticated user...');
        
        deviceList = await fetchDevicesWithDetails(
          user.id,
          isAdmin,
          isSuperAdmin
        );
        
        if (!isMountedRef.current) return;
        
        // เพิ่มข้อมูล deviceData สำหรับ authenticated users
        if (deviceList.length > 0) {
          const deviceCodes = deviceList.map(d => d.device_code);
          
          const { data: analysisData } = await supabase
            .from('rice_quality_analysis')
            .select('*')
            .in('device_code', deviceCodes)
            .order('created_at', { ascending: false });

          if (!isMountedRef.current) return;

          const latestDeviceData: Record<string, any> = {};
          analysisData?.forEach(record => {
            if (!latestDeviceData[record.device_code]) {
              latestDeviceData[record.device_code] = record;
            }
          });

          deviceList = deviceList.map(device => {
            const deviceAnalysisData = latestDeviceData[device.device_code];
            console.log(`🔐 User device ${device.device_code} data:`, deviceAnalysisData);
            
            return {
              ...device,
              deviceData: deviceAnalysisData || null
            };
          });
        }
        
        console.log(`🔐 Fetched ${deviceList.length} devices with data for authenticated user`);
      }
      
      if (!isMountedRef.current) return;
      
      const fetchTime = Date.now() - startTime;
      console.log(`🔧 Device fetch completed in ${fetchTime}ms`);
      console.log('🎯 Final device list with data:', deviceList.map(d => ({
        code: d.device_code,
        hasData: !!d.deviceData,
        timestamp: d.updated_at
      })));
      
      if (isMountedRef.current) {
        setDevices(deviceList);
      }
      
      // Count total unique devices (only for authenticated users)
      if (!isGuest && user && isMountedRef.current) {
        const totalCount = await countUniqueDevices();
        if (isMountedRef.current) {
          setTotalUniqueDevices(totalCount);
          console.log(`🔧 Total unique devices: ${totalCount}`);
        }
      } else if (isMountedRef.current) {
        setTotalUniqueDevices(deviceList.length);
        console.log(`🔧 Guest devices count: ${deviceList.length}`);
      }
      
    } catch (error) {
      console.error('Error fetching devices:', error);
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : "Unknown error");
        toast({
          title: "Error",
          description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
          variant: "destructive",
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🛑 useDeviceData unmounting");
      isMountedRef.current = false;
    };
  }, []);
  
  return {
    devices,
    isLoading,
    isRefreshing,
    totalUniqueDevices,
    error,
    handleRefresh,
    isAdmin,
    isSuperAdmin
  };
}
