
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { fetchDevicesWithDetails } from "../services/deviceDataService";
import { supabase } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";

/**
 * React Query hook for fetching devices with proper caching
 */
export const useDevicesQuery = () => {
  const { user, userRoles } = useAuth();
  const { isGuest } = useGuestMode();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  
  // Guest devices query
  const guestDevicesQuery = useQuery({
    queryKey: ['guest-devices'],
    queryFn: async (): Promise<DeviceInfo[]> => {
      console.log('📱 Fetching guest devices via React Query...');
      
      const { data: devicesData, error } = await supabase.rpc('get_guest_devices_fast');
      
      if (error) {
        console.error('Error fetching guest devices:', error);
        throw error;
      }

      if (!devicesData || devicesData.length === 0) {
        console.log('No guest devices found');
        return [];
      }

      // Get analysis data for enrichment
      const deviceCodes = devicesData.map(d => d.device_code);
      const { data: analysisData } = await supabase
        .from('rice_quality_analysis')
        .select('*')
        .in('device_code', deviceCodes)
        .order('created_at', { ascending: false });

      // Create map of latest device data
      const latestDeviceData: Record<string, any> = {};
      analysisData?.forEach(record => {
        if (!latestDeviceData[record.device_code]) {
          latestDeviceData[record.device_code] = record;
        }
      });

      const enrichedDevices = devicesData.map(device => ({
        device_code: device.device_code,
        display_name: device.display_name || device.device_code,
        updated_at: device.updated_at || new Date().toISOString(),
        deviceData: latestDeviceData[device.device_code] || null
      }));

      console.log(`📱 React Query: Fetched ${enrichedDevices.length} guest devices`);
      return enrichedDevices;
    },
    enabled: isGuest,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Authenticated devices query
  const authenticatedDevicesQuery = useQuery({
    queryKey: ['authenticated-devices', user?.id, isAdmin, isSuperAdmin],
    queryFn: async (): Promise<DeviceInfo[]> => {
      if (!user?.id) return [];
      
      console.log('🔐 Fetching authenticated devices via React Query...');
      
      const deviceList = await fetchDevicesWithDetails(
        user.id,
        isAdmin,
        isSuperAdmin
      );

      if (deviceList.length === 0) {
        console.log('🔐 No devices found for authenticated user');
        return [];
      }

      // Get analysis data
      const deviceCodes = deviceList.map(d => d.device_code);
      const { data: analysisData } = await supabase
        .from('rice_quality_analysis')
        .select('*')
        .in('device_code', deviceCodes)
        .order('created_at', { ascending: false });

      // Create map of latest device data
      const latestDeviceData: Record<string, any> = {};
      analysisData?.forEach(record => {
        if (!latestDeviceData[record.device_code]) {
          latestDeviceData[record.device_code] = record;
        }
      });

      const enrichedDeviceList = deviceList.map(device => ({
        ...device,
        deviceData: latestDeviceData[device.device_code] || null
      }));

      console.log(`🔐 React Query: Fetched ${enrichedDeviceList.length} authenticated devices`);
      return enrichedDeviceList;
    },
    enabled: !isGuest && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Device count query
  const deviceCountQuery = useQuery({
    queryKey: ['device-count', user?.id, isAdmin, isSuperAdmin],
    queryFn: async (): Promise<number> => {
      if (isGuest) {
        return guestDevicesQuery.data?.length || 0;
      }
      
      if (!user?.id) return 0;
      
      // Use the same logic as fetchDevicesWithDetails for consistency
      const devices = await fetchDevicesWithDetails(user.id, isAdmin, isSuperAdmin);
      return devices.length;
    },
    enabled: !isGuest ? !!user?.id : true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Return the appropriate query based on user type
  const activeQuery = isGuest ? guestDevicesQuery : authenticatedDevicesQuery;
  
  return {
    devices: activeQuery.data || [],
    isLoading: activeQuery.isLoading,
    isRefreshing: activeQuery.isFetching && !activeQuery.isLoading,
    error: activeQuery.error,
    totalUniqueDevices: deviceCountQuery.data || 0,
    refetch: activeQuery.refetch,
    isAdmin,
    isSuperAdmin
  };
};
