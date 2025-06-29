
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGuestMode } from "./useGuestMode";

export const useGuestDeviceAccess = (deviceCode?: string) => {
  const { isGuest } = useGuestMode();

  return useQuery({
    queryKey: ['guestDeviceAccess', deviceCode],
    queryFn: async () => {
      if (!isGuest) return { hasAccess: false, allowedDevices: [] };
      
      try {
        // Get all devices that guest can access
        const { data: guestAccessData, error: guestError } = await supabase
          .from('guest_device_access')
          .select('device_code, enabled')
          .eq('enabled', true);

        if (guestError) {
          console.error('Error fetching guest device access:', guestError);
          return { hasAccess: false, allowedDevices: [] };
        }

        const allowedDevices = guestAccessData?.map(item => item.device_code) || [];
        
        // If checking specific device
        if (deviceCode) {
          const hasAccess = allowedDevices.includes(deviceCode);
          return { hasAccess, allowedDevices };
        }
        
        return { hasAccess: allowedDevices.length > 0, allowedDevices };
      } catch (error) {
        console.error('Error in useGuestDeviceAccess:', error);
        return { hasAccess: false, allowedDevices: [] };
      }
    },
    enabled: isGuest
  });
};
