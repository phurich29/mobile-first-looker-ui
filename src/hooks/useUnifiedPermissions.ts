import { useAuth } from "@/components/AuthProvider";
import { useMemo } from "react";

/**
 * Simplified permissions hook - single source of truth
 * ใช้แทน multiple permission checks ที่อาจขัดแย้งกัน - ลบ Guest mode ออก
 */
export const useUnifiedPermissions = () => {
  const { user, userRoles } = useAuth();

  const permissions = useMemo(() => {
    // Simple permission resolution - only authenticated users
    const isAuthenticated = !!user;
    const isAdmin = isAuthenticated && userRoles.includes('admin');
    const isSuperAdmin = isAuthenticated && userRoles.includes('superadmin');
    
    return {
      // User states - no guest mode
      isGuest: false,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      
      // Permission checks
      canViewAllDevices: isSuperAdmin,
      canViewAdminDevices: isAdmin || isSuperAdmin,
      canViewGuestDevices: false, // No guest mode
      canManageUsers: isSuperAdmin,
      canManageDevices: isAdmin || isSuperAdmin,
      canViewNotifications: isAuthenticated,
      
      // Data access patterns - no guest mode
      deviceAccessMode: isSuperAdmin ? 'all' : isAdmin ? 'admin' : isAuthenticated ? 'user' : 'none',
      
      // UI display flags
      showAdminUI: isAdmin || isSuperAdmin,
      showUserManagement: isSuperAdmin,
      showDeviceManagement: isAdmin || isSuperAdmin,
    };
  }, [user, userRoles]);

  // Single function to check device access - no guest mode
  const canAccessDevice = (deviceCode: string) => {
    if (permissions.isSuperAdmin) return true;
    // Only authenticated users can access devices
    return permissions.isAuthenticated;
  };

  return {
    ...permissions,
    canAccessDevice,
  };
};