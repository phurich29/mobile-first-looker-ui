import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Equipment from "./pages/Equipment";
import GraphMonitor from "./pages/GraphMonitor";
import UserManagement from "./pages/UserManagement";
import DeviceManagement from "./pages/DeviceManagement";
import DeviceDetails from "./pages/DeviceDetails";
import { QueryClient } from "@tanstack/react-query";
import DeviceAccessManagement from "@/pages/DeviceAccessManagement";

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClient>
          <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Equipment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/equipment"
                element={
                  <ProtectedRoute>
                    <Equipment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/device/:deviceCode"
                element={
                  <ProtectedRoute>
                    <DeviceDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/graph-monitor"
                element={
                  <ProtectedRoute>
                    <GraphMonitor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-management"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/device-management"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <DeviceManagement />
                  </ProtectedRoute>
                }
              />
              
              {/* New Device Access Management route */}
              <Route
                path="/device-access-management"
                element={
                  <ProtectedRoute requiredRoles={['superadmin']}>
                    <DeviceAccessManagement />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </QueryClient>
      </AuthProvider>
    </Router>
  );
}

export default App;
