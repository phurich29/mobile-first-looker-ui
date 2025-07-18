
import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useGlobalDeviceCache } from "@/features/equipment/hooks/useGlobalDeviceCache";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useDeviceAccess = (deviceCode: string | undefined) => {
  const { user, userRoles } = useAuth();
  const { isGuest } = useGuestMode();
  const { devices: cachedDevices, isLoading: isLoadingCache } = useGlobalDeviceCache();
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Check guest device access
  const {
    data: guestAccessibleDevices,
    isLoading: isCheckingGuestAccess
  } = useQuery({
    queryKey: ['guestDeviceAccess'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guest_device_access')
        .select('device_code')
        .eq('enabled', true);
      
      if (error) {
        console.error('Error fetching guest device access:', error);
        return [];
      }
      
      return data?.map(item => ({ device_code: item.device_code })) || [];
    },
    enabled: isGuest
  });

  // Check if user has access to the current device
  let hasDeviceAccess = false;
  
  if (isGuest) {
    // For guests, check guest_device_access
    hasDeviceAccess = guestAccessibleDevices?.some(device => device.device_code === deviceCode) ?? false;
  } else {
    // For authenticated users, admin and superadmin have access to all devices
    if (isAdmin || isSuperAdmin) {
      hasDeviceAccess = true; // Admin and SuperAdmin have access to all devices
    } else {
      // Regular users use cached devices for faster access check
      hasDeviceAccess = cachedDevices.some(device => device.device_code === deviceCode);
    }
  }

  const isLoading = (isGuest && isCheckingGuestAccess) || (!isGuest && isLoadingCache);

  return {
    hasDeviceAccess,
    isLoading,
    isGuest,
    isAdmin,
    isSuperAdmin
  };
};
