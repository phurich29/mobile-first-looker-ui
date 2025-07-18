import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { fetchDevicesWithDetails } from "../services/deviceDataService";
import { supabase } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";

/**
 * React Query hook for fetching devices with improved loading state management
 */
export const useDevicesQuery = () => {
  const { user, userRoles, isAuthReady } = useAuth();
  const { isGuest, isStable } = useGuestMode();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  
  // Don't run queries until auth is stable
  const isQueryEnabled = isAuthReady && isStable;
  
  // Loading state management
  const [isRefreshingState, setIsRefreshingState] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryStartTimeRef = useRef<number | null>(null);
  
  // Reduced maximum loading time: 8 seconds
  const MAX_LOADING_TIME = 8000;
  
  // Reset timeout when query starts
  const handleQueryStart = useCallback(() => {
    console.log('📊 Query started - setting timeout');
    queryStartTimeRef.current = Date.now();
    setHasTimedOut(false);
    setIsRefreshingState(true);
    
    // Clear existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Set new timeout
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn('⚠️ Query timeout reached (15s)');
      setHasTimedOut(true);
      setIsRefreshingState(false);
    }, MAX_LOADING_TIME);
  }, []);
  
  // Clear timeout when query completes
  const handleQueryComplete = useCallback(() => {
    const duration = queryStartTimeRef.current ? Date.now() - queryStartTimeRef.current : 0;
    console.log(`✅ Query completed in ${duration}ms`);
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    setIsRefreshingState(false);
    queryStartTimeRef.current = null;
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);
  
  // Memoized query keys for stability
  const guestQueryKey = useMemo(() => ['guest-devices'], []);
  const authenticatedQueryKey = useMemo(() => ['devices-details', user?.id], [user?.id]);

  // Guest devices query with auth stability check
  const guestDevicesQuery = useQuery({
    queryKey: guestQueryKey,
    queryFn: async (): Promise<DeviceInfo[]> => {
      handleQueryStart();
      console.log('📱 Fetching guest devices with cache...');
      
      // Direct query - get guest-enabled devices
      const { data: guestDevicesData, error: guestError } = await supabase
        .from('guest_device_access')
        .select('device_code')
        .eq('enabled', true);
      
      if (guestError) {
        console.error('Error fetching guest devices:', guestError);
        throw guestError;
      }

      if (!guestDevicesData || guestDevicesData.length === 0) {
        console.log('No guest devices found');
        return [];
      }

      const deviceCodes = guestDevicesData.map(d => d.device_code);
      console.log('Guest device codes:', deviceCodes);

      // Get device settings separately
      const { data: settingsData } = await supabase
        .from('device_settings')
        .select('device_code, display_name')
        .in('device_code', deviceCodes);

      // Get latest analysis data for each device
      const { data: analysisData } = await supabase
        .from('rice_quality_analysis')
        .select('device_code, created_at, *')
        .in('device_code', deviceCodes)
        .order('created_at', { ascending: false });

      // Create maps
      const deviceSettings: Record<string, any> = {};
      settingsData?.forEach(setting => {
        deviceSettings[setting.device_code] = setting;
      });

      const latestDeviceData: Record<string, any> = {};
      analysisData?.forEach(record => {
        if (!latestDeviceData[record.device_code]) {
          latestDeviceData[record.device_code] = record;
        }
      });

      const enrichedDevices: DeviceInfo[] = guestDevicesData.map(device => ({
        device_code: device.device_code,
        display_name: deviceSettings[device.device_code]?.display_name || device.device_code,
        updated_at: latestDeviceData[device.device_code]?.created_at || new Date().toISOString(),
        deviceData: latestDeviceData[device.device_code] || null
      }));

      console.log(`📱 Fetched ${enrichedDevices.length} guest devices`);
      handleQueryComplete();
      return enrichedDevices;
    },
    enabled: isQueryEnabled && isGuest,
    retry: (failureCount) => failureCount < 2, // Max 2 retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchOnWindowFocus: false,
    staleTime: 20000, // Reduced from 30s to 20s
    gcTime: 60000, // 1 minute garbage collection
  });

  // Authenticated devices query with auth stability check
  const authenticatedDevicesQuery = useQuery({
    queryKey: authenticatedQueryKey,
    queryFn: async (): Promise<DeviceInfo[]> => {
      handleQueryStart();
      if (!user?.id) return [];
      
      console.log('🔐 Fetching authenticated devices...');
      
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

      console.log(`🔐 Fetched ${enrichedDeviceList.length} authenticated devices`);
      handleQueryComplete();
      return enrichedDeviceList;
    },
    enabled: isQueryEnabled && !!user && !isGuest,
    retry: (failureCount) => failureCount < 2, // Max 2 retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchOnWindowFocus: false,
    staleTime: 15000, // Keep 15s for auth users
    gcTime: 90000, // 1.5 minutes garbage collection
  });

  // Monitor query state changes
  useEffect(() => {
    if (guestDevicesQuery.isError || authenticatedDevicesQuery.isError) {
      console.error('❌ Query failed');
      handleQueryComplete();
    }
    if (guestDevicesQuery.isSuccess || authenticatedDevicesQuery.isSuccess) {
      console.log('✅ Query succeeded');
      handleQueryComplete();
    }
  }, [guestDevicesQuery.isError, guestDevicesQuery.isSuccess, authenticatedDevicesQuery.isError, authenticatedDevicesQuery.isSuccess, handleQueryComplete]);

  // Device count query with stability check
  const deviceCountQuery = useQuery({
    queryKey: ['device-count', isGuest, isAuthReady],
    queryFn: async () => {
      if (isGuest) {
        return guestDevicesQuery.data?.length || 0;
      }
      
      if (!user?.id) return 0;
      
      // Use the same logic as fetchDevicesWithDetails for consistency
      const devices = await fetchDevicesWithDetails(user.id, isAdmin, isSuperAdmin);
      return devices.length;
    },
    enabled: isQueryEnabled,
    retry: 1,
    staleTime: 60000, // 1 minute cache for count
  });

  // Return the appropriate query based on user type
  const activeQuery = isGuest ? guestDevicesQuery : authenticatedDevicesQuery;
  
  // Enhanced refetch with timeout management
  const enhancedRefetch = useCallback(async () => {
    console.log('🔄 Enhanced refetch triggered');
    setHasTimedOut(false);
    try {
      return await activeQuery.refetch();
    } catch (error) {
      console.error('❌ Enhanced refetch failed:', error);
      handleQueryComplete();
      throw error;
    }
  }, [activeQuery.refetch, handleQueryComplete]);
  
  return {
    devices: activeQuery.data || [],
    isLoading: activeQuery.isLoading,
    isRefreshing: isRefreshingState || (activeQuery.isFetching && !activeQuery.isLoading),
    error: hasTimedOut ? new Error('Query timeout exceeded') : activeQuery.error,
    totalUniqueDevices: deviceCountQuery.data || 0,
    refetch: enhancedRefetch,
    isAdmin,
    isSuperAdmin,
    hasTimedOut // New field to indicate timeout status
  };
};