
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { fetchSuperAdminDevices, fetchUserDevices } from '@/features/equipment/services/deviceDataService';

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
        let deviceList;
        
        if (isSuperAdmin) {
          console.log('Fetching devices for superadmin');
          deviceList = await fetchSuperAdminDevices();
        } else {
          console.log('Fetching authorized devices for user...');
          deviceList = await fetchUserDevices(user.id, isAdmin);
        }

        // Fetch display names for devices
        if (deviceList.length > 0) {
          const deviceCodes = deviceList.map(d => d.device_code);
          const { data: settingsData } = await supabase
            .from('device_settings')
            .select('device_code, display_name')
            .in('device_code', deviceCodes);

          // Merge display names
          const devicesWithNames = deviceList.map(device => {
            const setting = settingsData?.find(s => s.device_code === device.device_code);
            return {
              device_code: device.device_code,
              display_name: setting?.display_name || device.device_code
            };
          });

          setDevices(devicesWithNames);
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setIsLoadingDevices(false);
      }
    };

    fetchDevices();
  }, [user, isAdmin, isSuperAdmin]);

  return { devices, isLoadingDevices };
};
