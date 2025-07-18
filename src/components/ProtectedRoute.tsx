
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
  allowUnauthenticated?: boolean;
  allowGuest?: boolean;
  path?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRoles = [],
  redirectTo = "/auth/login",
  allowUnauthenticated = false,
  allowGuest = false,
  path = window.location.pathname,
}: ProtectedRouteProps) => {
  const { user, userRoles, isLoading } = useAuth();
  const { isGuest, isStable } = useGuestMode();

  // Only log when debug mode is enabled to reduce console spam
  const isDebugMode = process.env.NODE_ENV === 'development';
  if (isDebugMode && Math.random() < 0.1) { // Log only 10% of the time in dev
    console.log("🔒 Protected route check:", {
      requiredRoles,
      userRoles,
      authenticated: !!user,
      isGuest,
      isLoading,
      isStable,
      allowGuest,
      path: path.slice(0, 20) + '...'
    });
  }

  // Wait for auth and guest mode to be stable
  if (isLoading || !isStable) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // If user is guest and guest access is allowed, show page with guest permissions
  if (isGuest && allowGuest) {
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
