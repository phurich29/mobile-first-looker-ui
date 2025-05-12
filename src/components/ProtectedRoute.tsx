
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  requiredRoles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  requiredRoles = [],
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const { user, userRoles, isLoading } = useAuth();

  // Show detailed console logs for debugging
  console.log("Protected route checking access:");
  console.log("- Required roles:", requiredRoles);
  console.log("- Current user roles:", userRoles);
  console.log("- User authenticated:", !!user);
  console.log("- Is still loading auth:", isLoading);

  // If auth is still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Check if the user is logged in
  if (!user) {
    console.log("User not logged in, redirecting to", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }
  
  // If user is only in waiting_list (and doesn't have other roles), redirect to waiting page
  if (userRoles.includes('waiting_list') && 
      !userRoles.includes('user') && 
      !userRoles.includes('admin') && 
      !userRoles.includes('superadmin')) {
    console.log("User is in waiting list only, redirecting to waiting page");
    return <Navigate to="/waiting" replace />;
  }

  // Check if the user has the required role (if specified)
  const hasRequiredRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => userRoles.includes(role));
  
  if (!hasRequiredRole) {
    console.log("User doesn't have required role, redirecting to", redirectTo);
    console.log("User roles:", userRoles);
    console.log("Required roles:", requiredRoles);
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
