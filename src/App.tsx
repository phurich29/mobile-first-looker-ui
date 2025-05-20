
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import Login from "@/pages/Login";
// Import missing pages properly (removed Logout import)
// We'll use the built-in routes.tsx for routing instead of importing non-existent pages
import { router } from "./routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { userRoles, user } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!user;

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
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <div className="flex">
            <Header />
            <div id="page-content" className="w-full transition-all duration-300 ease-in-out pt-[76px] md:pt-[82px]">
              {/* Use the router configuration from routes.tsx */}
              <Routes>
                {router.routes.map((route) => (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={route.element} 
                  />
                ))}
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
