
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Equipment from "./pages/Equipment";
import Measurements from "./pages/Measurements";
import NotFound from "./pages/NotFound";
import RicePrices from "./pages/RicePrices";
import UserManagement from "./pages/UserManagement";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/rice-prices" element={<RicePrices />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/measurements" element={<Measurements />} />
            <Route path="/equipment/:deviceCode?" element={<Equipment />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<ProtectedRoute requiredRoles={["admin", "superadmin"]} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          
          {/* Superadmin routes */}
          <Route element={<ProtectedRoute requiredRoles={["superadmin"]} />}>
            <Route path="/user-management" element={<UserManagement />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
