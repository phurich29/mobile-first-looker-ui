
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { fetchDevicesWithDetails } from "../services/deviceDataService";
import { supabase } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";
import { useCallback, useRef, useState, useEffect } from "react";

/**
 * React Query hook for fetching devices with improved loading state management and race condition prevention
 */
export const useDevicesQuery = () => {
  const { user, userRoles, isLoading: authLoading } = useAuth();
  const { isGuest, isStable: guestModeStable } = useGuestMode();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  
  // Auth stability tracking - critical for preventing race conditions
  const [authStable, setAuthStable] = useState(false);
  const [stableUserType, setStableUserType] = useState<'guest' | 'authenticated' | null>(null);
  const authStabilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Loading state management
  const [isRefreshingState, setIsRefreshingState] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryStartTimeRef = useRef<number | null>(null);
  
  // Maximum loading time: 15 seconds
  const MAX_LOADING_TIME = 15000;
  
  // Auth stability detection with longer delay for post-refresh scenarios
  useEffect(() => {
    console.log('🔍 Auth stability check:', { 
      authLoading, 
      guestModeStable, 
      isGuest, 
      user: !!user,
      userRoles 
    });
    
    // Clear existing timeout
    if (authStabilityTimeoutRef.current) {
      clearTimeout(authStabilityTimeoutRef.current);
    }
    
    // Don't determine stability while auth is loading or guest mode is unstable
    if (authLoading || !guestModeStable) {
      console.log('⏳ Auth not ready - waiting for stability');
      setAuthStable(false);
      return;
    }
    
    // Determine stable user type with debounce to prevent rapid switches
    const currentUserType = isGuest ? 'guest' : 'authenticated';
    
    // Add extra stability delay especially after page refresh
    const stabilityDelay = 1500; // 1.5 seconds for extra stability
    
    authStabilityTimeoutRef.current = setTimeout(() => {
      console.log(`✅ Auth stable as: ${currentUserType}`);
      setAuthStable(true);
      setStableUserType(currentUserType);
    }, stabilityDelay);
    
    return () => {
      if (authStabilityTimeoutRef.current) {
        clearTimeout(authStabilityTimeoutRef.current);
      }
    };
  }, [authLoading, guestModeStable, isGuest, user?.id, userRoles.length]);
  
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
      if (authStabilityTimeoutRef.current) {
        clearTimeout(authStabilityTimeoutRef.current);
      }
    };
  }, []);
  
  // Enhanced query enablement logic - only enable when auth is stable and user type is determined
  const shouldEnableGuestQuery = authStable && stableUserType === 'guest' && !hasTimedOut;
  const shouldEnableAuthQuery = authStable && stableUserType === 'authenticated' && !!user?.id && !hasTimedOut;
  
  console.log('🎯 Query enablement check:', {
    authStable,
    stableUserType,
    shouldEnableGuestQuery,
    shouldEnableAuthQuery,
    hasTimedOut
  });
  
  // Guest devices query with enhanced stability checks
  const guestDevicesQuery = useQuery({
    queryKey: ['guest-devices-stable', stableUserType],
    queryFn: async (): Promise<DeviceInfo[]> => {
      handleQueryStart();
      console.log('📱 Fetching guest devices with stability checks...');
      
      // Direct query without cache - get guest-enabled devices
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

      console.log(`📱 Fetched ${enrichedDevices.length} stable guest devices`);
      handleQueryComplete();
      return enrichedDevices;
    },
    enabled: shouldEnableGuestQuery,
    staleTime: 0, // No cache
    gcTime: 0, // No cache
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000) // Max 5s retry delay
  });

  // Authenticated devices query with enhanced stability checks
  const authenticatedDevicesQuery = useQuery({
    queryKey: ['authenticated-devices-stable', user?.id, isAdmin, isSuperAdmin, stableUserType],
    queryFn: async (): Promise<DeviceInfo[]> => {
      handleQueryStart();
      if (!user?.id) return [];
      
      console.log('🔐 Fetching authenticated devices with stability checks...');
      
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

      console.log(`🔐 Fetched ${enrichedDeviceList.length} stable authenticated devices`);
      handleQueryComplete();
      return enrichedDeviceList;
    },
    enabled: shouldEnableAuthQuery,
    staleTime: 0, // No cache
    gcTime: 0, // No cache
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000) // Max 5s retry delay
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

  // Device count query with stability checks
  const deviceCountQuery = useQuery({
    queryKey: ['device-count-stable', user?.id, isAdmin, isSuperAdmin, stableUserType],
    queryFn: async (): Promise<number> => {
      if (stableUserType === 'guest') {
        return guestDevicesQuery.data?.length || 0;
      }
      
      if (!user?.id || stableUserType !== 'authenticated') return 0;
      
      // Use the same logic as fetchDevicesWithDetails for consistency
      const devices = await fetchDevicesWithDetails(user.id, isAdmin, isSuperAdmin);
      return devices.length;
    },
    enabled: authStable && stableUserType !== null,
    staleTime: 0, // No cache
    gcTime: 0, // No cache
    refetchOnWindowFocus: false
  });

  // Return the appropriate query based on stable user type
  const activeQuery = stableUserType === 'guest' ? guestDevicesQuery : authenticatedDevicesQuery;
  
  // Enhanced refetch with stability checks
  const enhancedRefetch = useCallback(async () => {
    if (!authStable) {
      console.warn('🚫 Cannot refetch - auth not stable');
      return;
    }
    
    console.log('🔄 Enhanced refetch triggered for stable user type:', stableUserType);
    setHasTimedOut(false);
    try {
      return await activeQuery.refetch();
    } catch (error) {
      console.error('❌ Enhanced refetch failed:', error);
      handleQueryComplete();
      throw error;
    }
  }, [activeQuery.refetch, handleQueryComplete, authStable, stableUserType]);
  
  return {
    devices: activeQuery.data || [],
    isLoading: !authStable || activeQuery.isLoading,
    isRefreshing: isRefreshingState || (activeQuery.isFetching && !activeQuery.isLoading),
    error: hasTimedOut ? new Error('Query timeout exceeded') : activeQuery.error,
    totalUniqueDevices: deviceCountQuery.data || 0,
    refetch: enhancedRefetch,
    isAdmin,
    isSuperAdmin,
    hasTimedOut, // New field to indicate timeout status
    authStable, // New field to indicate auth stability
    stableUserType // New field to show stable user type
  };
};
