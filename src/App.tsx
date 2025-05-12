
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

// กำหนดให้เฉพาะผู้ที่ล็อกอินและมีสิทธิ์อนุมัติแล้วเท่านั้นที่สามารถเข้าถึงพื้นที่หวงห้ามได้
// หากเป็น waiting_list จะถูกเปลี่ยนเส้นทางไปยังหน้า waiting
// ไม่จำเป็นต้องมีแล้วเนื่องจากเราใช้ ProtectedRoute ที่ปรับปรุงแล้ว
// function WaitingListGuard({ children }: { children: React.ReactNode }) {
//   const { user, userRoles, isLoading } = useAuth();
//   
//   // If still loading, show loading indicator
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
//       </div>
//     );
//   }
//   
//   // If user is in waiting list only (and doesn't have other roles), redirect to waiting page
//   if (user && userRoles.includes('waiting_list') && 
//       !userRoles.includes('user') && 
//       !userRoles.includes('admin') && 
//       !userRoles.includes('superadmin')) {
//     return <Navigate to="/waiting" replace />;
//   }
//   
//   // Otherwise, render children
//   return <>{children}</>;
// }

function App() {
  return (
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
          
          {/* Routes ที่ต้องล็อกอินเท่านั้น - แม้แต่ waiting_list ก็ไม่สามารถเข้าถึงได้ */}
          <Route path="/rice-prices" element={
            <ProtectedRoute>
              <RicePrices />
            </ProtectedRoute>
          } />
          
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
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
              <Admin />
            </ProtectedRoute>
          } />
          
          {/* Superadmin routes */}
          <Route path="/user-management" element={
            <ProtectedRoute requiredRoles={["superadmin"]}>
              <UserManagement />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
