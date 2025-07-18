
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { fetchDevicesWithDetails } from '@/features/equipment/services';

interface Device {
  device_code: string;
  display_name?: string;
}

export const useDeviceData = () => {
  const { user, userRoles } = useAuth();
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  const { data: devices = [], isLoading: isLoadingDevices } = useQuery({
    queryKey: ['header-devices', user?.id, isAdmin, isSuperAdmin],
    queryFn: async (): Promise<Device[]> => {
      if (!user) return [];
      
      console.log('TopHeader: Fetching devices using React Query...');
      
      const deviceList = await fetchDevicesWithDetails(
        user.id,
        isAdmin,
        isSuperAdmin
      );

      const devicesWithNames = deviceList.map(device => ({
        device_code: device.device_code,
        display_name: device.display_name || device.device_code
      }));

      console.log(`TopHeader: Fetched ${devicesWithNames.length} devices via React Query`);
      return devicesWithNames;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });

  return { devices, isLoadingDevices };
};
