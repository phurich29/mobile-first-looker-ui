
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
  allowUnauthenticated?: boolean;
  allowGuest?: boolean;
  path?: string;
  requireDeviceAccess?: boolean;
  deviceCode?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRoles = [],
  redirectTo = "/login",
  allowUnauthenticated = false,
  allowGuest = false,
  path = window.location.pathname,
  requireDeviceAccess = false,
  deviceCode,
}: ProtectedRouteProps) => {
  const { user, userRoles, isLoading } = useAuth();
  const { isGuest } = useGuestMode();

  // Check guest device access if guest and device access is required
  const { data: guestDeviceAccess, isLoading: isLoadingGuestAccess } = useQuery({
    queryKey: ['guestDeviceAccess', deviceCode],
    queryFn: async () => {
      if (!isGuest || !requireDeviceAccess || !deviceCode) return null;
      
      const { data, error } = await supabase
        .from('guest_device_access')
        .select('device_code, enabled')
        .eq('device_code', deviceCode)
        .eq('enabled', true)
        .single();
        
      if (error) {
        console.error('Error checking guest device access:', error);
        return null;
      }
      
      return data;
    },
    enabled: isGuest && requireDeviceAccess && !!deviceCode
  });

  console.log("Protected route checking access:");
  console.log("- Required roles:", requiredRoles);
  console.log("- Current user roles:", userRoles);
  console.log("- User authenticated:", !!user);
  console.log("- Is guest:", isGuest);
  console.log("- Is still loading auth:", isLoading);
  console.log("- Allow unauthenticated:", allowUnauthenticated);
  console.log("- Allow guest:", allowGuest);
  console.log("- Require device access:", requireDeviceAccess);
  console.log("- Device code:", deviceCode);
  console.log("- Guest device access:", guestDeviceAccess);

  // If auth is still loading, show loading indicator
  if (isLoading || (isGuest && requireDeviceAccess && isLoadingGuestAccess)) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // If user is guest and guest access is allowed
  if (isGuest && allowGuest) {
    // If device access is required, check guest device access
    if (requireDeviceAccess && deviceCode) {
      if (!guestDeviceAccess) {
        console.log("Guest doesn't have access to this device, redirecting");
        return <Navigate to="/equipment" replace />;
      }
    }
    console.log("Guest access allowed, showing page");
    return <>{children}</>;
  }

  // If user not logged in and not allowed unauthenticated access and not guest allowed, redirect to login
  if (!user && !allowUnauthenticated && !allowGuest) {
    console.log("User not logged in, redirecting to", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }
  
  // If unauthenticated access is allowed and user is not logged in, show page
  if (!user && allowUnauthenticated) {
    return <>{children}</>;
  }
  
  // If user is logged in, check for required roles
  // Superadmin users can access everything
  if (userRoles.includes('superadmin')) {
    console.log("User is a superadmin, granting access");
    return <>{children}</>;
  }

  // Check if user has required roles (if any specified)
  const hasRequiredRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => userRoles.includes(role));
  
  if (!hasRequiredRole) {
    console.log("User doesn't have required role, redirecting to", redirectTo);
    console.log("User roles:", userRoles);
    console.log("Required roles:", requiredRoles);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
