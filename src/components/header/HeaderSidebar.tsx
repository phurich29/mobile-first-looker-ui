
import { Menu, Home, Wheat, BarChart2, User, X, Settings, LogOut, Users, FileText, AlertCircle, History, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HeaderSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const HeaderSidebar = ({ sidebarOpen, setSidebarOpen }: HeaderSidebarProps) => {
  const location = useLocation();
  const { user, userRoles } = useAuth();

  // ตรวจสอบหน้าที่ผู้ใช้กำลังอยู่เพื่อไฮไลท์เมนูที่ตรงกัน
  const isActive = (path: string) => location.pathname === path;

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการเข้าถึงหน้าจัดการผู้ใช้งานหรือไม่
  const canAccessUserManagement = userRoles.includes('admin') || userRoles.includes('superadmin');
  
  return (
    <>
      {/* Overlay ที่จะแสดงเมื่อเมนูเปิดในโหมด responsive */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar for Desktop */}
      <div className={cn("fixed left-0 top-0 bottom-0 z-40 w-64 bg-white text-gray-800 transition-transform duration-300 ease-in-out shadow-sm border-r border-gray-100", 
        sidebarOpen ? "translate-x-0" : "-translate-x-full", 
        "md:translate-x-0" // แสดงเสมอในหน้าจอขนาดใหญ่
      )}>
        <div className="flex flex-col h-full p-4 bg-[#fff9df]">
          <div className="flex justify-between items-center mb-8 mt-4">
            <div className="flex items-center gap-2">
              <img src="/lovable-uploads/649554cd-4d80-484a-995d-e49f2721a07d.png" alt="RiceFlow Logo" className="h-10 w-auto rounded-full" />
              <h2 className="text-xl font-semibold text-emerald-700">RiceFlow</h2>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-500 md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 -mr-4 pr-4">
            <nav className="flex flex-col space-y-1 mt-4">
              <Link to="/" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                <Home className="h-5 w-5" />
                <span className="text-sm">หน้าหลัก</span>
              </Link>
              
              <Link to="/equipment" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/equipment") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                <Settings className="h-5 w-5" />
                <span className="text-sm">อุปกรณ์</span>
              </Link>
              
              <Link to="/device/default" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/device/default") || location.pathname.startsWith("/device") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                <BarChart2 className="h-5 w-5" />
                <span className="text-sm">ค่าวัดคุณภาพ</span>
              </Link>
              
              {user && <Link to="/notifications" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/notifications") || isActive("/notification-settings") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">การแจ้งเตือนที่กำหนดไว้</span>
                </Link>}
                
              {user && <Link to="/notification-history" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/notification-history") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                  <History className="h-5 w-5" />
                  <span className="text-sm">ประวัติการแจ้งเตือน</span>
                </Link>}
              
              <Link to="/graph-monitor" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/graph-monitor") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                  <Monitor className="h-5 w-5" />
                  <span className="text-sm">Graph Monitor</span>
              </Link>
              
              {user && <Link to="/profile" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/profile") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                  <User className="h-5 w-5" />
                  <span className="text-sm">ข้อมูลส่วนตัว</span>
                </Link>}
              
              {user && canAccessUserManagement && <Link to="/user-management" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/user-management") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                  <Users className="h-5 w-5" />
                  <span className="text-sm">จัดการผู้ใช้งาน</span>
                </Link>}
              
              {user && canAccessUserManagement && <Link to="/news-management" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/news-management") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">จัดการข่าวสาร</span>
                </Link>}
            </nav>
          </ScrollArea>
          
          <div className="mt-auto pt-4">
            {user && <div className="border-t border-gray-200 pt-4">
                <Link to="/logout" className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:border hover:border-red-200">
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">ออกจากระบบ</span>
                </Link>
              </div>}
          </div>
        </div>
      </div>
    </>
  );
};
