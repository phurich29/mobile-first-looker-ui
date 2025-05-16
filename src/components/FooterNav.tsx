
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Home, User, PackageOpen, Bell, Info, Monitor } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "./AuthProvider";

export const FooterNav = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthenticated(!!user);
      
      if (user) {
        // Changed to check if user has a token, which implies they are a user
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };
    
    checkAuth();
  }, [user]);
  
  // เมื่อไม่ได้อยู่บนมือถือ ให้แสดง Sidebar แทน
  if (!isMobile) {
    return (
      <div className="fixed bottom-0 left-0 top-[72px] w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <nav className="p-4 space-y-1">
          <NavLink to="/" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Home className="h-5 w-5 mr-3 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">หน้าแรก</span>
          </NavLink>
          
          {isAuthenticated && isAuthorized && (
            <>
              <NavLink to="/equipment" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <PackageOpen className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">อุปกรณ์</span>
              </NavLink>
              
              <NavLink to="/notifications" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">การแจ้งเตือน</span>
              </NavLink>

              <NavLink to="/graph-monitor" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Monitor className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Graph Monitor</span>
              </NavLink>
            </>
          )}
          
          <NavLink to="/rice-prices" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Info className="h-5 w-5 mr-3 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">ราคาข้าว</span>
          </NavLink>
          
          <NavLink to="/news" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Info className="h-5 w-5 mr-3 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">ข่าวสาร</span>
          </NavLink>
          
          <NavLink to="/profile" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <User className="h-5 w-5 mr-3 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">โปรไฟล์</span>
          </NavLink>
        </nav>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Green curved background */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-16 rounded-t-3xl shadow-lg">
        <nav className="flex justify-around items-center h-full">
          <NavLink to="/" className="flex flex-col items-center justify-center w-1/5 h-full">
            <Home className="h-5 w-5 text-white" />
            <span className="text-xs mt-1 text-white">หน้าแรก</span>
          </NavLink>
          
          {isAuthenticated && isAuthorized ? (
            <>
              <NavLink to="/equipment" className="flex flex-col items-center justify-center w-1/5 h-full">
                <PackageOpen className="h-5 w-5 text-white" />
                <span className="text-xs mt-1 text-white">อุปกรณ์</span>
              </NavLink>
              
              <NavLink to="/graph-monitor" className="flex flex-col items-center justify-center w-1/5 h-full">
                <Monitor className="h-5 w-5 text-white" />
                <span className="text-xs mt-1 text-white">กราฟ</span>
              </NavLink>
              
              <NavLink to="/notifications" className="flex flex-col items-center justify-center w-1/5 h-full">
                <Bell className="h-5 w-5 text-white" />
                <span className="text-xs mt-1 text-white">แจ้งเตือน</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/rice-prices" className="flex flex-col items-center justify-center w-1/5 h-full">
                <Info className="h-5 w-5 text-white" />
                <span className="text-xs mt-1 text-white">ราคาข้าว</span>
              </NavLink>
              
              <NavLink to="/news" className="flex flex-col items-center justify-center w-1/5 h-full">
                <Info className="h-5 w-5 text-white" />
                <span className="text-xs mt-1 text-white">ข่าวสาร</span>
              </NavLink>
            </>
          )}
          
          <NavLink to={isAuthenticated ? "/profile" : "/login"} className="flex flex-col items-center justify-center w-1/5 h-full">
            <User className="h-5 w-5 text-white" />
            <span className="text-xs mt-0.5 text-white">{isAuthenticated ? "โปรไฟล์" : "เข้าสู่ระบบ"}</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default FooterNav;
