
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

  // If auth is still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Check if the user is logged in and has the required role (if specified)
  const hasRequiredRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => userRoles.includes(role));

  if (!user || !hasRequiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
