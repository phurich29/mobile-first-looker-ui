
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Home, User, PackageOpen, Bell, Info, Monitor, Layout, BarChart2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "./AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const FooterNav = () => {
  const {
    user
  } = useAuth();
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

  // เมื่อไม่ได้อยู่บนมือถือ จะไม่แสดงเมนูใดๆ เพราะมี HeaderSidebar อยู่แล้ว
  if (!isMobile) {
    // ไม่ต้องแสดงอะไรในโหมดเดสก์ท็อป เพราะมี HeaderSidebar อยู่แล้ว
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Modern glass-morphism footer with fixed height */}
      <div className="bg-emerald-600 dark:bg-emerald-800 h-16 rounded-t-2xl shadow-lg backdrop-blur-sm bg-opacity-90">
        <nav className="flex justify-around items-center h-full">
          <NavLink to="/" className={({
          isActive
        }) => cn("flex flex-col items-center justify-center w-1/5 h-full", isActive && "font-bold")}>
            <Home className="h-5 w-5 text-white mb-1" />
            <span className="text-xs text-white font-medium">หน้าแรก</span>
          </NavLink>
          
          {isAuthenticated && isAuthorized ? <>
              <NavLink to="/equipment" className={({
            isActive
          }) => cn("flex flex-col items-center justify-center w-1/5 h-full", isActive && "font-bold")}>
                <PackageOpen className="h-5 w-5 text-white mb-1" />
                <span className="text-xs text-white font-medium">อุปกรณ์</span>
              </NavLink>
              
              <NavLink to="/graph-summary" className={({
            isActive
          }) => cn("flex flex-col items-center justify-center w-1/5 h-full", isActive && "font-bold")}>
                <BarChart2 className="h-5 w-5 text-white mb-1" />
                <span className="text-xs text-white font-medium">กราฟ</span>
              </NavLink>
              
              <NavLink to="/notifications" className={({
            isActive
          }) => cn("flex flex-col items-center justify-center w-1/5 h-full", isActive && "font-bold")}>
                <Bell className="h-5 w-5 text-white mb-1" />
                <span className="text-xs text-white font-medium">แจ้งเตือน</span>
              </NavLink>
            </> : <>
              <NavLink to="/rice-prices" className={({
            isActive
          }) => cn("flex flex-col items-center justify-center w-1/5 h-full", isActive && "font-bold")}>
                <Info className="h-5 w-5 text-white mb-1" />
                <span className="text-xs text-white font-medium">ราคาข้าว</span>
              </NavLink>
              
              <NavLink to="/news" className={({
            isActive
          }) => cn("flex flex-col items-center justify-center w-1/5 h-full", isActive && "font-bold")}>
                <Info className="h-5 w-5 text-white mb-1" />
                <span className="text-xs text-white font-medium">ข่าวสาร</span>
              </NavLink>
            </>}
          
          <NavLink to={isAuthenticated ? "/profile" : "/login"} className={({
          isActive
        }) => cn("flex flex-col items-center justify-center w-1/5 h-full", isActive && "font-bold")}>
            <User className="h-5 w-5 text-white mb-1" />
            <span className="text-xs text-white font-medium">{isAuthenticated ? "โปรไฟล์" : "เข้าสู่ระบบ"}</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default FooterNav;
