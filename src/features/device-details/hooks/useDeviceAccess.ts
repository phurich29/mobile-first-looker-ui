
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { fetchDevicesWithDetails } from "@/features/equipment/services";
import { supabase } from "@/integrations/supabase/client";

export const useDeviceAccess = (deviceCode: string | undefined) => {
  const { user, userRoles } = useAuth();
  const { isGuest } = useGuestMode();
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Check device access permissions for authenticated users
  const {
    data: accessibleDevices,
    isLoading: isCheckingAccess
  } = useQuery({
    queryKey: ['deviceAccess', user?.id, userRoles],
    queryFn: async () => {
      if (!user) return [];
      // Both admin and superadmin get full access to all devices
      return await fetchDevicesWithDetails(user.id, isAdmin, isSuperAdmin);
    },
    enabled: !!user && !isGuest
  });

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
      // Regular users need to check their specific device access
      hasDeviceAccess = accessibleDevices?.some(device => device.device_code === deviceCode) ?? false;
    }
  }

  const isLoading = (isGuest && isCheckingGuestAccess) || (!isGuest && isCheckingAccess);

  return {
    hasDeviceAccess,
    isLoading,
    isGuest,
    isAdmin,
    isSuperAdmin
  };
};
