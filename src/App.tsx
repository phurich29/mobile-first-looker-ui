import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Equipment from "./pages/Equipment";
import Measurements from "./pages/Measurements";
import NotFound from "./pages/NotFound";
import RicePrices from "./pages/RicePrices";
import UserManagement from "./pages/UserManagement";
import Waiting from "./pages/Waiting";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Logout component that will sign out users and redirect to login
function LogoutRoute() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      await signOut();
      navigate("/login");
    };
    
    performLogout();
  }, [signOut, navigate]);
  
  return <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
  </div>;
}

// Route guard for waiting list users - redirects to waiting page
function WaitingListGuard({ children }: { children: React.ReactNode }) {
  const { user, userRoles, isLoading } = useAuth();
  
  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  
  // If user is in waiting list only (and doesn't have other roles), redirect to waiting page
  if (user && userRoles.includes('waiting_list') && 
      !userRoles.includes('user') && 
      !userRoles.includes('admin') && 
      !userRoles.includes('superadmin')) {
    return <Navigate to="/waiting" replace />;
  }
  
  // Otherwise, render children
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/waiting" element={<Waiting />} />
          <Route path="/logout" element={<LogoutRoute />} />
          
          {/* Routes that need protection from waiting_list users */}
          <Route element={<WaitingListGuard />}>
            <Route path="/" element={<Index />} />
            <Route path="/rice-prices" element={<RicePrices />} />
            
            {/* Protected routes requiring authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/measurements" element={<Measurements />} />
              <Route path="/equipment/:deviceCode?" element={<Equipment />} />
            </Route>
            
            {/* Admin routes */}
            <Route element={<ProtectedRoute requiredRoles={["admin", "superadmin"]} redirectTo="/" />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
            
            {/* Superadmin routes */}
            <Route element={<ProtectedRoute requiredRoles={["superadmin"]} redirectTo="/" />}>
              <Route path="/user-management" element={<UserManagement />} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
