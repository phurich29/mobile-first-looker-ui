import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { useGuestMode } from '@/hooks/useGuestMode';
import { DeviceInfo } from '@/features/equipment/types';
import { fetchDevicesWithDetails } from '@/features/equipment/services/deviceDataService';

// Query keys for React Query
export const deviceQueryKeys = {
  all: ['devices'] as const,
  lists: () => [...deviceQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...deviceQueryKeys.lists(), { filters }] as const,
  details: () => [...deviceQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...deviceQueryKeys.details(), id] as const,
  count: () => [...deviceQueryKeys.all, 'count'] as const,
};

interface UseDeviceDataQueryOptions {
  staleTime?: number;
  gcTime?: number; // Renamed from cacheTime to gcTime
  refetchInterval?: number;
  enabled?: boolean;
}

export function useDeviceDataQuery(options: UseDeviceDataQueryOptions = {}) {
  const { user, userRoles } = useAuth();
  const { isGuest } = useGuestMode();
  const queryClient = useQueryClient();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  const {
    staleTime = 30000, // 30 seconds - data is fresh for 30s
    gcTime = 300000, // 5 minutes - keep in cache for 5 min
    refetchInterval = 60000, // 1 minute - background refresh
    enabled = true,
  } = options;

  // Create unique query key based on user state
  const queryKey = deviceQueryKeys.list(
    `${user?.id || 'guest'}-${isAdmin}-${isSuperAdmin}-${isGuest}`
  );

  const {
    data: devices = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<DeviceInfo[]> => {
      console.log('🔄 React Query: Fetching devices with details');
      const startTime = Date.now();
      
      try {
        const deviceList = await fetchDevicesWithDetails(
          user?.id,
          isAdmin,
          isSuperAdmin
        );
        
        const fetchTime = Date.now() - startTime;
        console.log(`✅ React Query: Device fetch completed in ${fetchTime}ms`);
        console.log(`📱 React Query: Fetched ${deviceList.length} devices`);
        
        return deviceList;
      } catch (error) {
        console.error('❌ React Query: Device fetch failed:', error);
        throw error;
      }
    },
    staleTime,
    gcTime,
    refetchInterval,
    enabled: enabled && (!!user || isGuest),
    // Use stale data while refetching for better UX
    refetchIntervalInBackground: true,
    // Retry failed requests
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error
      if (error?.message?.includes('access denied') || 
          error?.message?.includes('unauthorized')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Prefetch device count if needed
  const deviceCountQuery = useQuery({
    queryKey: deviceQueryKeys.count(),
    queryFn: async () => {
      if (isGuest) return devices.length;
      
      // This would need to be implemented as a separate service
      // For now, return device count from the main query
      return devices.length;
    },
    enabled: !!devices.length,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  // Invalidate and refetch data
  const handleRefresh = async () => {
    console.log('🔄 React Query: Manual refresh triggered');
    await queryClient.invalidateQueries({ queryKey });
    return refetch();
  };

  // Prefetch next likely data
  const prefetchDeviceDetails = (deviceCode: string) => {
    queryClient.prefetchQuery({
      queryKey: deviceQueryKeys.detail(deviceCode),
      queryFn: () => {
        // This would fetch individual device details
        // Implementation depends on your device details service
        return Promise.resolve(null);
      },
      staleTime: 30000,
    });
  };

  return {
    devices,
    isLoading,
    isRefetching,
    error,
    refetch: handleRefresh,
    totalUniqueDevices: deviceCountQuery.data || devices.length,
    // Additional utilities
    prefetchDeviceDetails,
    // React Query utilities
    queryClient,
    queryKey,
  };
}