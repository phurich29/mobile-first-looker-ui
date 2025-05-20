import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { Login } from "@/pages/Login";
import { Logout } from "@/pages/Logout";
import { Register } from "@/pages/Register";
import { Home } from "@/pages/Home";
import { Profile } from "@/pages/Profile";
import { UserManagement } from "@/pages/UserManagement";
import { NewsManagement } from "@/pages/NewsManagement";
import { NotificationHistory } from "@/pages/NotificationHistory";
import { DeviceManagement } from "@/pages/DeviceManagement";
import { News } from "@/pages/News";
import { DeviceDetails } from "@/pages/DeviceDetails";
import { Equipment } from "@/pages/Equipment";
import { NotFound } from "@/pages/NotFound";
import { GraphMonitor } from "@/pages/GraphMonitor";
import { GraphSummary } from "@/pages/GraphSummary";
import { GraphSummaryDetail } from "@/pages/GraphSummaryDetail";
import { Measurements } from "@/pages/Measurements";
import { Notifications } from "@/pages/Notifications";
import { NotificationSettings } from "@/pages/NotificationSettings";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { userRoles, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    } else if (
      requiredRoles.length > 0 &&
      !requiredRoles.some((role) => userRoles.includes(role))
    ) {
      navigate("/not-found");
    }
  }, [isLoggedIn, userRoles, requiredRoles, navigate]);

  return isLoggedIn &&
    (requiredRoles.length === 0 ||
      requiredRoles.some((role) => userRoles.includes(role))) ? (
    <Outlet />
  ) : null;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <div className="flex">
            <Header />
            <div id="page-content" className="w-full transition-all duration-300 ease-in-out pt-[76px] md:pt-[82px]">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/graph-monitor" element={<GraphMonitor />} />
                <Route path="/graph-summary" element={<GraphSummary />} />
                <Route path="/graph-summary-detail" element={<GraphSummaryDetail />} />
                <Route path="/measurements" element={<Measurements />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route
                  path="/notification-settings"
                  element={<NotificationSettings />}
                />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/user-management"
                  element={
                    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/news-management"
                  element={
                    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
                      <NewsManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notification-history"
                  element={<NotificationHistory />}
                />
                <Route
                  path="/device-management"
                  element={<DeviceManagement />}
                />
                <Route path="/news/:id" element={<News />} />
                <Route path="/device/:id" element={<DeviceDetails />} />
                <Route path="/equipment" element={<Equipment />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <FooterNav />
            </div>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
