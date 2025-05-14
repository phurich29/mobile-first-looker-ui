
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Equipment from "./pages/Equipment";
import DeviceDetails from "./pages/DeviceDetails";
import MeasurementDetail from "./pages/MeasurementDetail";
import Measurements from "./pages/Measurements";
import NotFound from "./pages/NotFound";
import RicePrices from "./pages/RicePrices";
import UserManagement from "./pages/UserManagement";
import RicePriceManagement from "./pages/RicePriceManagement";
import Waiting from "./pages/Waiting";
import Profile from "./pages/Profile";
import DeviceManagement from "./pages/DeviceManagement";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a QueryClient instance
const queryClient = new QueryClient();

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

function App() {
  return (
    // Wrap the entire application with QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes - ไม่จำเป็นต้องล็อกอิน */}
            <Route path="/login" element={<Login />} />
            <Route path="/waiting" element={<Waiting />} />
            <Route path="/logout" element={<LogoutRoute />} />
            
            {/* หน้าแรก - อนุญาตให้เข้าชมได้โดยไม่ต้องล็อกอิน */}
            <Route path="/" element={
              <ProtectedRoute allowUnauthenticated={true}>
                <Index />
              </ProtectedRoute>
            } />
            
            {/* ทำให้หน้า rice-prices สามารถเข้าถึงได้โดยไม่ต้องล็อกอิน */}
            <Route path="/rice-prices" element={
              <ProtectedRoute allowUnauthenticated={true}>
                <RicePrices />
              </ProtectedRoute>
            } />
            
            {/* Routes ที่ต้องล็อกอินเท่านั้น */}
            <Route path="/measurements" element={
              <ProtectedRoute>
                <Measurements />
              </ProtectedRoute>
            } />
            
            <Route path="/equipment/:deviceCode?" element={
              <ProtectedRoute>
                <Equipment />
              </ProtectedRoute>
            } />
            
            {/* เส้นทางสำหรับหน้าแสดงรายละเอียดอุปกรณ์ */}
            <Route path="/device/:deviceCode" element={
              <ProtectedRoute>
                <DeviceDetails />
              </ProtectedRoute>
            } />
            
            {/* เพิ่มเส้นทางใหม่สำหรับหน้าแสดงกราฟข้อมูลรายละเอียดการวัด */}
            <Route path="/device/:deviceCode/measurement/:measurementKey" element={
              <ProtectedRoute>
                <MeasurementDetail />
              </ProtectedRoute>
            } />
            
            {/* เพิ่มเส้นทางใหม่สำหรับหน้า Profile */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Device Management - สำหรับ admin และ superadmin */}
            <Route path="/device-management" element={
              <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
                <DeviceManagement />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
                <Admin />
              </ProtectedRoute>
            } />
            
            {/* User Management - สำหรับ admin และ superadmin */}
            <Route path="/user-management" element={
              <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
                <UserManagement />
              </ProtectedRoute>
            } />
            
            {/* Rice Price Management - เฉพาะ superadmin เท่านั้น */}
            <Route path="/rice-price-management" element={
              <ProtectedRoute requiredRoles={["superadmin"]}>
                <RicePriceManagement />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
