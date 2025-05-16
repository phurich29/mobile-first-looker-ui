
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { DeviceInfo } from "../types";
import { countUniqueDevices, fetchSuperAdminDevices, fetchUserDevices } from "../services/deviceDataService";

export function useDeviceData() {
  const { user, userRoles } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalUniqueDevices, setTotalUniqueDevices] = useState(0);
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  
  // Fetches device display names from device_settings
  const fetchDeviceSettings = useCallback(async (deviceList: DeviceInfo[]) => {
    try {
      console.log('Fetching device settings...');
      
      // Get all device codes
      const deviceCodes = deviceList.map(d => d.device_code);
      
      if (deviceCodes.length === 0) {
        return deviceList;
      }
      
      // Fetch device settings
      const { data, error } = await supabase
        .from('device_settings')
        .select('device_code, display_name')
        .in('device_code', deviceCodes);
      
      if (error) {
        throw error;
      }
      
      // Create a map of device code to display name
      const displayNameMap: Record<string, string> = {};
      data?.forEach(setting => {
        if (setting.display_name) {
          displayNameMap[setting.device_code] = setting.display_name;
        }
      });
      
      // Merge display names with device info
      return deviceList.map(device => ({
        ...device,
        display_name: displayNameMap[device.device_code] || null
      }));
    } catch (error) {
      console.error('Error fetching device settings:', error);
      return deviceList;
    }
  }, []);
  
  // Fetch devices for the current user
  const fetchDevices = useCallback(async () => {
    if (!user) {
      setDevices([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsRefreshing(true);
      
      let deviceList: DeviceInfo[] = [];
      
      // Superadmin can see all devices
      if (isSuperAdmin) {
        console.log('Fetching devices for superadmin');
        deviceList = await fetchSuperAdminDevices();
      } 
      // Regular users see only authorized devices
      else {
        console.log('Fetching devices for user');
        deviceList = await fetchUserDevices(user.id, isAdmin);
      }
      
      // Fetch display names for devices
      const devicesWithNames = await fetchDeviceSettings(deviceList);
      
      console.log(`Fetched ${devicesWithNames.length} devices`);
      setDevices(devicesWithNames);
      
      // Count total unique devices
      const totalCount = await countUniqueDevices();
      setTotalUniqueDevices(totalCount);
      
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
  }, [user, isAdmin, isSuperAdmin, toast, fetchDeviceSettings]);
  
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
