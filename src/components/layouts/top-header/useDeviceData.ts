
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { fetchDevicesWithDetails } from '@/features/equipment/services';

interface Device {
  device_code: string;
  display_name?: string;
}

export const useDeviceData = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const { user, userRoles } = useAuth();

  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) return;
      
      setIsLoadingDevices(true);
      try {
        console.log('TopHeader: Fetching devices using optimized function...');
        
        // Use the new optimized function
        const deviceList = await fetchDevicesWithDetails(
          user.id,
          isAdmin,
          isSuperAdmin
        );

        // Transform to match the expected interface
        const devicesWithNames = deviceList.map(device => ({
          device_code: device.device_code,
          display_name: device.display_name || device.device_code
        }));

        console.log(`TopHeader: Fetched ${devicesWithNames.length} devices in single query`);
        setDevices(devicesWithNames);
        
      } catch (error) {
        console.error('TopHeader: Error fetching devices:', error);
      } finally {
        setIsLoadingDevices(false);
      }
    };

    fetchDevices();
  }, [user, isAdmin, isSuperAdmin]);

  return { devices, isLoadingDevices };
};
