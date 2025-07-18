import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDevicesWithDetails } from '../services/deviceDataService';
import { useAuth } from '@/components/AuthProvider';
import { DeviceInfo } from '../types';

// Global device cache with request deduplication
export const useGlobalDeviceCache = () => {
  const { user, userRoles } = useAuth();
  const queryClient = useQueryClient();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  const isGuest = !user;

  // Use different cache keys for guests vs authenticated users
  const queryKey = isGuest 
    ? ['devices', 'guest'] 
    : ['devices', user?.id];

  const deviceQuery = useQuery({
    queryKey,
    queryFn: () => fetchDevicesWithDetails(user?.id, isAdmin, isSuperAdmin),
    enabled: true, // Always enabled for both guest and authenticated
    staleTime: isGuest ? 600000 : 300000, // Guest cache longer (10 min vs 5 min)
    gcTime: isGuest ? 1200000 : 600000, // Guest GC longer (20 min vs 10 min)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const invalidateDevices = () => {
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  };

  const prefetchDevices = () => {
    const key = isGuest ? ['devices', 'guest'] : ['devices', user?.id];
    queryClient.prefetchQuery({
      queryKey: key,
      queryFn: () => fetchDevicesWithDetails(user?.id, isAdmin, isSuperAdmin),
      staleTime: isGuest ? 600000 : 300000,
    });
  };

  return {
    devices: deviceQuery.data || [],
    isLoading: deviceQuery.isLoading,
    error: deviceQuery.error,
    invalidateDevices,
    prefetchDevices,
  };
};

// Hook สำหรับ components ที่ต้องการ device list แต่ไม่อยากรอ
export const useDeviceListOptimistic = (): DeviceInfo[] => {
  const queryClient = useQueryClient();
  const { user, userRoles } = useAuth();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  const isGuest = !user;
  
  // ลองหา cache ที่มีอยู่ก่อน
  const cachedData = queryClient.getQueryData<DeviceInfo[]>(
    isGuest ? ['devices', 'guest'] : ['devices', user?.id]
  );
  
  return cachedData || [];
};