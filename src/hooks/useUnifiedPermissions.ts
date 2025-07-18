import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useMemo } from "react";

/**
 * Simplified permissions hook - single source of truth
 * ใช้แทน multiple permission checks ที่อาจขัดแย้งกัน
 */
export const useUnifiedPermissions = () => {
  const { user, userRoles } = useAuth();
  const { isGuest } = useGuestMode();

  const permissions = useMemo(() => {
    // Simple permission resolution - no complex nested checks
    const isAuthenticated = !!user && !isGuest;
    const isAdmin = isAuthenticated && userRoles.includes('admin');
    const isSuperAdmin = isAuthenticated && userRoles.includes('superadmin');
    
    return {
      // User states
      isGuest,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      
      // Permission checks
      canViewAllDevices: isSuperAdmin,
      canViewAdminDevices: isAdmin || isSuperAdmin,
      canViewGuestDevices: true, // Everyone can view guest devices
      canManageUsers: isSuperAdmin,
      canManageDevices: isAdmin || isSuperAdmin,
      canViewNotifications: isAuthenticated || isGuest,
      
      // Data access patterns
      deviceAccessMode: isSuperAdmin ? 'all' : isAdmin ? 'admin' : isAuthenticated ? 'user' : 'guest',
      
      // UI display flags
      showAdminUI: isAdmin || isSuperAdmin,
      showUserManagement: isSuperAdmin,
      showDeviceManagement: isAdmin || isSuperAdmin,
    };
  }, [user, userRoles, isGuest]);

  // Single function to check device access
  const canAccessDevice = (deviceCode: string) => {
    if (permissions.isSuperAdmin) return true;
    if (permissions.isGuest) return true; // Guest devices are filtered by RLS
    // For authenticated users, let RLS handle the filtering
    return permissions.isAuthenticated;
  };

  return {
    ...permissions,
    canAccessDevice,
  };
};