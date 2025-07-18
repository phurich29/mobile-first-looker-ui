import { useAuth } from "@/components/AuthProvider";
import { useMemo } from "react";

/**
 * Unified permissions hook - รองรับ visitor mode แทน guest mode เดิม
 */
export const useUnifiedPermissions = () => {
  const { user, userRoles } = useAuth();

  const permissions = useMemo(() => {
    const isAuthenticated = !!user;
    const isVisitor = !user; // ผู้เยี่ยมชมที่ไม่ได้ login
    const isAdmin = isAuthenticated && userRoles.includes('admin');
    const isSuperAdmin = isAuthenticated && userRoles.includes('superadmin');
    
    return {
      // User states
      isVisitor, // แทน isGuest
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      
      // Permission checks
      canViewAllDevices: isSuperAdmin,
      canViewAdminDevices: isAdmin || isSuperAdmin,
      canViewVisitorDevices: isVisitor, // visitor สามารถดูอุปกรณ์ที่กำหนดให้ได้
      canManageUsers: isSuperAdmin,
      canManageDevices: isAdmin || isSuperAdmin,
      canViewNotifications: isAuthenticated,
      
      // Data access patterns
      deviceAccessMode: isSuperAdmin ? 'all' : isAdmin ? 'admin' : isAuthenticated ? 'user' : 'visitor',
      
      // UI display flags
      showAdminUI: isAdmin || isSuperAdmin,
      showUserManagement: isSuperAdmin,
      showDeviceManagement: isAdmin || isSuperAdmin,
    };
  }, [user, userRoles]);

  // Function to check device access
  const canAccessDevice = (deviceCode: string) => {
    if (permissions.isSuperAdmin) return true;
    if (permissions.isAdmin || permissions.isAuthenticated) return true;
    // Visitor สามารถเข้าถึงอุปกรณ์ที่เปิดให้ได้ (จะ check ใน component)
    if (permissions.isVisitor) return true;
    return false;
  };

  return {
    ...permissions,
    canAccessDevice,
  };
};