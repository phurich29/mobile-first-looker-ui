
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Home, User, PackageOpen, Bell, Wheat, LogIn } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "./AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const FooterNav = () => {
  const { user } = useAuth();
  const { isGuest } = useGuestMode();
  const isMobile = useIsMobile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthenticated(!!user);
      if (user) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };
    checkAuth();
  }, [user]);

  // เมื่อไม่ได้อยู่บนมือถือ จะไม่แสดงเมนูใดๆ เพราะมี HeaderSidebar อยู่แล้ว
  if (!isMobile) {
    return null;
  }

  // เมนูสำหรับ Guest (4 เมนู)
  if (isGuest) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-emerald-600 dark:bg-emerald-800 h-16 rounded-t-2xl shadow-lg backdrop-blur-sm">
          <nav className="flex justify-around items-center h-full">
            <NavLink to="/" className={({ isActive }) => cn("flex flex-col items-center justify-center w-1/4 h-full", isActive && "font-bold")}>
              <Home className="h-5 w-5 text-white mb-1" />
              <span className="text-xs text-white font-medium">หน้าแรก</span>
            </NavLink>
            
            <NavLink to="/equipment" className={({ isActive }) => cn("flex flex-col items-center justify-center w-1/4 h-full", isActive && "font-bold")}>
              <PackageOpen className="h-5 w-5 text-white mb-1" />
              <span className="text-xs text-white font-medium">อุปกรณ์</span>
            </NavLink>
            
            <NavLink to="/about-riceflow" className={({ isActive }) => cn("flex flex-col items-center justify-center w-1/4 h-full", isActive && "font-bold")}>
              <Wheat className="h-5 w-5 text-white mb-1" />
              <span className="text-xs text-white font-medium">รู้จัก Riceflow</span>
            </NavLink>
            
            <NavLink to="/auth/login" className={({ isActive }) => cn("flex flex-col items-center justify-center w-1/4 h-full", isActive && "font-bold")}>
              <LogIn className="h-5 w-5 text-white mb-1" />
              <span className="text-xs text-white font-medium">เข้าสู่ระบบ</span>
            </NavLink>
          </nav>
        </div>
      </div>
    );
  }
  
  // เมนูสำหรับผู้ใช้ที่ login แล้ว (เหมือนเดิม)
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-emerald-600 dark:bg-emerald-800 h-16 rounded-t-2xl shadow-lg backdrop-blur-sm">
        <nav className="flex justify-around items-center h-full">
          <NavLink to="/" className={({ isActive }) => cn("flex flex-col items-center justify-center w-1/4 h-full", isActive && "font-bold")}>
            <Home className="h-5 w-5 text-white mb-1" />
            <span className="text-xs text-white font-medium">หน้าแรก</span>
          </NavLink>
          
          {isAuthenticated && isAuthorized ? (
            <>
              <NavLink to="/equipment" className={({ isActive }) => cn("flex flex-col items-center justify-center w-1/4 h-full", isActive && "font-bold")}>
                <PackageOpen className="h-5 w-5 text-white mb-1" />
                <span className="text-xs text-white font-medium">อุปกรณ์</span>
              </NavLink>
              
              <NavLink to="/notifications" className={({ isActive }) => cn("flex flex-col items-center justify-center w-1/4 h-full", isActive && "font-bold")}>
                <Bell className="h-5 w-5 text-white mb-1" />
                <span className="text-xs text-white font-medium">แจ้งเตือน</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/rice-prices" className={({ isActive }) => cn("flex flex-col items-center justify-center w-1/4 h-full", isActive && "font-bold")}>
                <Wheat className="h-5 w-5 text-white mb-1" />
                <span className="text-xs text-white font-medium">ราคาข้าว</span>
              </NavLink>
              
              <NavLink to="/news" className={({ isActive }) => cn("flex flex-col items-center justify-center w-1/4 h-full", isActive && "font-bold")}>
                <Wheat className="h-5 w-5 text-white mb-1" />
                <span className="text-xs text-white font-medium">ข่าวสาร</span>
              </NavLink>
            </>
          )}
          
          <NavLink to={isAuthenticated ? "/profile" : "/auth/login"} className={({ isActive }) => cn("flex flex-col items-center justify-center w-1/4 h-full", isActive && "font-bold")}>
            <User className="h-5 w-5 text-white mb-1" />
            <span className="text-xs text-white font-medium">{isAuthenticated ? "โปรไฟล์" : "เข้าสู่ระบบ"}</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default FooterNav;
