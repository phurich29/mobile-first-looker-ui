
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
  redirectTo = "/login",
  allowUnauthenticated = false,
  allowGuest = false,
  path = window.location.pathname,
}: ProtectedRouteProps) => {
  const { user, userRoles, isLoading } = useAuth();
  const { isGuest } = useGuestMode();

  console.log("Protected route checking access:");
  console.log("- Required roles:", requiredRoles);
  console.log("- Current user roles:", userRoles);
  console.log("- User authenticated:", !!user);
  console.log("- Is guest:", isGuest);
  console.log("- Is still loading auth:", isLoading);
  console.log("- Allow unauthenticated:", allowUnauthenticated);
  console.log("- Allow guest:", allowGuest);

  // If auth is still loading, show loading indicator
  if (isLoading) {
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
