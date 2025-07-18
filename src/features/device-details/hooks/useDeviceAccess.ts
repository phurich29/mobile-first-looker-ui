
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useUnifiedPermissions } from "@/hooks/useUnifiedPermissions";
import { fetchDevicesWithDetails } from "@/features/equipment/services";
import { supabase } from "@/integrations/supabase/client";

export const useDeviceAccess = (deviceCode: string | undefined) => {
  const { user, userRoles } = useAuth();
  const { isAuthenticated } = useUnifiedPermissions();
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Check device access permissions for authenticated users without cache
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
    enabled: !!user && isAuthenticated,
    staleTime: 0, // No cache
    gcTime: 0, // No cache
  });

  // Check if user has access to the current device
  let hasDeviceAccess = false;
  
  if (isAuthenticated) {
    // For authenticated users, admin and superadmin have access to all devices
    if (isAdmin || isSuperAdmin) {
      hasDeviceAccess = true; // Admin and SuperAdmin have access to all devices
    } else {
      // Regular users need to check their specific device access
      hasDeviceAccess = accessibleDevices?.some(device => device.device_code === deviceCode) ?? false;
    }
  }

  const isLoading = isCheckingAccess;

  return {
    hasDeviceAccess,
    isLoading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin
  };
};
