
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useGuestMode } from '@/hooks/useGuestMode';
import { supabase } from '@/integrations/supabase/client';

interface Device {
  device_code: string;
  display_name?: string;
}

export const useDeviceData = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const { user, userRoles } = useAuth();
  const { isGuest } = useGuestMode();

  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  useEffect(() => {
    const fetchDevices = async () => {
      if (!user && !isGuest) return;
      
      setIsLoadingDevices(true);
      try {
        console.log('TopHeader: Fetching devices for dropdown...');
        
        let deviceList: Device[] = [];
        
        if (isGuest) {
          // For guests, use the fast guest devices function
          const { data, error } = await supabase.rpc('get_guest_devices_fast');
          
          if (error) {
            console.error('TopHeader: Error fetching guest devices:', error);
            // Try emergency fallback
            const { data: fallbackData } = await supabase.rpc('get_devices_emergency_fallback');
            deviceList = fallbackData?.map(d => ({
              device_code: d.device_code,
              display_name: d.display_name
            })) || [];
          } else {
            deviceList = data?.map(d => ({
              device_code: d.device_code,
              display_name: d.display_name
            })) || [];
          }
        } else if (user) {
          // For authenticated users, use the optimized function with timeout
          try {
            const { data, error } = await Promise.race([
              supabase.rpc('get_devices_with_details', {
                user_id_param: user.id,
                is_admin_param: isAdmin && !isSuperAdmin,
                is_superadmin_param: isSuperAdmin
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Header fetch timeout')), 8000)
              )
            ]);

            if (error) throw error;
            
            deviceList = data?.map(d => ({
              device_code: d.device_code,
              display_name: d.display_name
            })) || [];
            
          } catch (error) {
            console.error('TopHeader: Main fetch failed, trying emergency fallback:', error);
            // Emergency fallback
            const { data: fallbackData } = await supabase.rpc('get_devices_emergency_fallback');
            deviceList = fallbackData?.map(d => ({
              device_code: d.device_code,
              display_name: d.display_name
            })) || [];
          }
        }

        console.log(`TopHeader: Successfully fetched ${deviceList.length} devices for dropdown`);
        setDevices(deviceList);
        
      } catch (error) {
        console.error('TopHeader: Error fetching devices:', error);
        // Set empty array on final error to prevent loading hang
        setDevices([]);
      } finally {
        setIsLoadingDevices(false);
      }
    };

    fetchDevices();
  }, [user, isAdmin, isSuperAdmin, isGuest]);

  return { devices, isLoadingDevices };
};
