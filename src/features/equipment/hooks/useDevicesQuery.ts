
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { fetchDevicesWithDetails } from "../services/deviceDataService";
import { supabase } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";

/**
 * Optimized React Query hook with Lazy Loading approach
 */
export const useDevicesQuery = () => {
  const { user, userRoles, isAuthReady } = useAuth();
  const { isGuest, isStable } = useGuestMode();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  
  // Only run queries when auth is ready and stable
  const isQueryEnabled = isAuthReady && isStable;
  
  // Simplified loading state management
  const [isRefreshingState, setIsRefreshingState] = useState(false);
  
  // Memoized query keys for stability
  const guestQueryKey = useMemo(() => ['guest-devices'], []);
  const authenticatedQueryKey = useMemo(() => ['devices-details', user?.id], [user?.id]);

  // Basic devices query for guests - minimal data
  const guestDevicesQuery = useQuery({
    queryKey: guestQueryKey,
    queryFn: async (): Promise<DeviceInfo[]> => {
      console.log('📱 Fetching basic guest devices...');
      
      // Get guest-enabled devices (basic info only)
      const { data: guestDevicesData, error: guestError } = await supabase
        .from('guest_device_access')
        .select('device_code')
        .eq('enabled', true)
        .limit(20); // Limit for performance
      
      if (guestError) throw guestError;
      if (!guestDevicesData?.length) return [];

      const deviceCodes = guestDevicesData.map(d => d.device_code);

      // Get basic display names only
      const { data: settingsData } = await supabase
        .from('device_settings')
        .select('device_code, display_name')
        .in('device_code', deviceCodes);

      // Get only latest timestamp (no full analysis data)
      const { data: timestampData } = await supabase
        .from('rice_quality_analysis')
        .select('device_code, created_at')
        .in('device_code', deviceCodes)
        .order('created_at', { ascending: false })
        .limit(deviceCodes.length);

      // Create maps
      const deviceSettings: Record<string, any> = {};
      settingsData?.forEach(setting => {
        deviceSettings[setting.device_code] = setting;
      });

      const latestTimestamps: Record<string, string> = {};
      timestampData?.forEach(record => {
        if (!latestTimestamps[record.device_code]) {
          latestTimestamps[record.device_code] = record.created_at;
        }
      });

      const basicDevices: DeviceInfo[] = guestDevicesData.map(device => ({
        device_code: device.device_code,
        display_name: deviceSettings[device.device_code]?.display_name || device.device_code,
        updated_at: latestTimestamps[device.device_code] || new Date().toISOString(),
        deviceData: null // No device data in basic loading
      }));

      console.log(`📱 Loaded basic info for ${basicDevices.length} guest devices`);
      return basicDevices;
    },
    enabled: isQueryEnabled && isGuest,
    retry: 1, // Reduced retries
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds stale time
    gcTime: 120000, // 2 minutes garbage collection
  });

  // Authenticated devices query - also lazy loaded
  const authenticatedDevicesQuery = useQuery({
    queryKey: authenticatedQueryKey,
    queryFn: async (): Promise<DeviceInfo[]> => {
      if (!user?.id) return [];
      
      console.log('🔐 Fetching basic authenticated devices...');
      
      const deviceList = await fetchDevicesWithDetails(
        user.id,
        isAdmin,
        isSuperAdmin
      );

      if (deviceList.length === 0) return [];

      // Return basic device info without analysis data initially
      const basicDeviceList = deviceList.map(device => ({
        ...device,
        deviceData: null // No device data in basic loading
      }));

      console.log(`🔐 Loaded basic info for ${basicDeviceList.length} authenticated devices`);
      return basicDeviceList;
    },
    enabled: isQueryEnabled && !!user && !isGuest,
    retry: 1, // Reduced retries
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 20000, // 20 seconds stale time
    gcTime: 180000, // 3 minutes garbage collection
  });

  // Device count query - simplified
  const deviceCountQuery = useQuery({
    queryKey: ['device-count', isGuest, user?.id],
    queryFn: async () => {
      const activeQuery = isGuest ? guestDevicesQuery : authenticatedDevicesQuery;
      return activeQuery.data?.length || 0;
    },
    enabled: isQueryEnabled,
    retry: 1,
    staleTime: 60000, // 1 minute cache for count
  });

  // Return the appropriate query based on user type
  const activeQuery = isGuest ? guestDevicesQuery : authenticatedDevicesQuery;
  
  // Enhanced refetch with minimal loading state
  const enhancedRefetch = useCallback(async () => {
    console.log('🔄 Enhanced refetch triggered');
    setIsRefreshingState(true);
    try {
      const result = await activeQuery.refetch();
      return result;
    } catch (error) {
      console.error('❌ Enhanced refetch failed:', error);
      throw error;
    } finally {
      setIsRefreshingState(false);
    }
  }, [activeQuery.refetch]);
  
  return {
    devices: activeQuery.data || [],
    isLoading: activeQuery.isLoading,
    isRefreshing: isRefreshingState || activeQuery.isFetching,
    error: activeQuery.error,
    totalUniqueDevices: deviceCountQuery.data || 0,
    refetch: enhancedRefetch,
    isAdmin,
    isSuperAdmin,
  };
};
