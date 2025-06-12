
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Home, User, PackageOpen, Bell, Info, Monitor, Layout, BarChart2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
// import { useAuth } from "./AuthProvider"; // No longer needed directly for menu visibility logic
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FooterNavProps {
  isUserLoggedIn: boolean;
}

export const FooterNav = ({ isUserLoggedIn }: FooterNavProps) => {
  const isMobile = useIsMobile();
  // Internal isAuthenticated and isAuthorized state removed, using isUserLoggedIn prop

  // เมื่อไม่ได้อยู่บนมือถือ จะไม่แสดงเมนูใดๆ เพราะมี HeaderSidebar อยู่แล้ว
  if (!isMobile) {
    // ไม่ต้องแสดงอะไรในโหมดเดสก์ท็อป เพราะมี HeaderSidebar อยู่แล้ว
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Modern glass-morphism footer with fixed height - removed gradient */}
      <div className="bg-emerald-600 dark:bg-emerald-800 h-16 rounded-t-2xl shadow-lg backdrop-blur-sm">
        <nav className="flex justify-around items-center h-full">
          <NavLink to="/" className={({
          isActive
        }) => cn("flex flex-col items-center justify-center w-1/5 h-full", isActive && "font-bold")}>
            <Home className="h-5 w-5 text-white mb-1" />
            <span className="text-xs text-white font-medium">หน้าแรก</span>
          </NavLink>
          
          {/* Conditional rendering based on isUserLoggedIn from AppLayout */}
          {isUserLoggedIn ? (
            <>
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
            </>
          ) : (
            // Show limited items or specific items for non-logged-in users if needed
            // For now, keeping it minimal to match sidebar (only Home is visible by default)
            // If 'Rice Prices' and 'News' should be visible to non-logged-in users, add them here.
            // Example: 
            // <>
            //   <NavLink to="/rice-prices" className={...}>
            //     <Info className="h-5 w-5 text-white mb-1" />
            //     <span className="text-xs text-white font-medium">ราคาข้าว</span>
            //   </NavLink>
            //   <NavLink to="/news" className={...}>
            //     <Info className="h-5 w-5 text-white mb-1" />
            //     <span className="text-xs text-white font-medium">ข่าวสาร</span>
            //   </NavLink>
            // <>
            <>
              {/* Placeholder for non-logged in specific items, if any, besides Login button */}
              {/* If 'Rice Prices' and 'News' should be visible to non-logged-in users, add them here cleanly. */}
            </>
          )}
          
          <NavLink to={isUserLoggedIn ? "/profile" : "/login"} className={({
          isActive
        }) => cn("flex flex-col items-center justify-center w-1/5 h-full", isActive && "font-bold")}>
            <User className="h-5 w-5 text-white mb-1" />
            <span className="text-xs text-white font-medium">{isUserLoggedIn ? "โปรไฟล์" : "เข้าสู่ระบบ"}</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default FooterNav;
