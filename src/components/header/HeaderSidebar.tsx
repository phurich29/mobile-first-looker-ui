
import { Menu, Home, Wheat, BarChart2, User, X, Settings, LogOut, Users, FileText, AlertCircle, History, Monitor, ChevronLeft, ChevronRight, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";

interface HeaderSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const HeaderSidebar = ({ sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed }: HeaderSidebarProps) => {
  const location = useLocation();
  const { user, userRoles } = useAuth();

  // ตรวจสอบหน้าที่ผู้ใช้กำลังอยู่เพื่อไฮไลท์เมนูที่ตรงกัน
  const isActive = (path: string) => location.pathname === path;

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการเข้าถึงหน้าจัดการผู้ใช้งานหรือไม่
  const canAccessUserManagement = userRoles.includes('admin') || userRoles.includes('superadmin');
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // Save preference to localStorage
    localStorage.setItem('sidebarCollapsed', (!isCollapsed).toString());
  };
  
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
      <div className={cn("fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-in-out shadow-sm border-r border-gray-100 bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800", 
        sidebarOpen ? "translate-x-0" : "-translate-x-full", 
        isCollapsed ? "w-20" : "w-64",
        "md:translate-x-0" // แสดงเสมอในหน้าจอขนาดใหญ่
      )}>
        <div className="flex flex-col h-full p-4 bg-[#fff9df] dark:bg-gray-900">
          {/* Added absolute positioned collapse button in top-right corner */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="absolute right-2 top-2 h-6 w-6 p-0 rounded-full border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/60 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-700/60"
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? 
              <ChevronRight className="h-3 w-3 text-emerald-700 dark:text-emerald-400" /> : 
              <ChevronLeft className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
            }
          </Button>
          
          <div className="flex justify-between items-center mb-8 mt-4">
            <div className={cn("flex items-center gap-2", isCollapsed && "justify-center w-full")}>
              <img src="/lovable-uploads/649554cd-4d80-484a-995d-e49f2721a07d.png" alt="RiceFlow Logo" className="h-10 w-auto rounded-full" />
              {!isCollapsed && <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">RiceFlow</h2>}
            </div>
            {!isCollapsed ? (
              <Button variant="ghost" size="icon" className="text-gray-500 md:hidden dark:text-gray-400" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            ) : null}
          </div>
          
          <ScrollArea className="flex-1 -mr-4 pr-4">
            <nav className="flex flex-col space-y-1 mt-4">
              <Link to="/" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
                isActive("/") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                <Home className="h-5 w-5" />
                {!isCollapsed && <span className="text-sm">หน้าหลัก</span>}
              </Link>
              
              <Link to="/equipment" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
                isActive("/equipment") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                <Settings className="h-5 w-5" />
                {!isCollapsed && <span className="text-sm">อุปกรณ์</span>}
              </Link>
              
              <Link to="/device/default" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
                isActive("/device/default") || location.pathname.startsWith("/device") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                <BarChart2 className="h-5 w-5" />
                {!isCollapsed && <span className="text-sm">ค่าวัดคุณภาพ</span>}
              </Link>
              
              {user && <Link to="/notifications" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
                isActive("/notifications") || isActive("/notification-settings") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <AlertCircle className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">การแจ้งเตือนที่กำหนดไว้</span>}
                </Link>}
                
              {user && <Link to="/notification-history" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
                isActive("/notification-history") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <History className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">ประวัติการแจ้งเตือน</span>}
                </Link>}
              
              <Link to="/graph-monitor" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
                isActive("/graph-monitor") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <Monitor className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">Graph Monitor</span>}
              </Link>
              
              <Link to="/graph-summary" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
                isActive("/graph-summary") || isActive("/graph-summary-detail") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <Layout className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">Graph Summary</span>}
              </Link>
              
              {user && <Link to="/profile" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
                isActive("/profile") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <User className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">ข้อมูลส่วนตัว</span>}
                </Link>}
              
              {user && canAccessUserManagement && <Link to="/user-management" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
                isActive("/user-management") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <Users className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">จัดการผู้ใช้งาน</span>}
                </Link>}
              
              {user && canAccessUserManagement && <Link to="/news-management" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
                isActive("/news-management") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <FileText className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">จัดการข่าวสาร</span>}
                </Link>}
            </nav>
          </ScrollArea>
          
          <div className="mt-auto pt-4">
            {user && <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                {!isCollapsed ? (
                  <div className="flex items-center justify-between">
                    <Link to="/logout" className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:border hover:border-red-200 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-800">
                      <LogOut className="h-5 w-5" />
                      <span className="text-sm">ออกจากระบบ</span>
                    </Link>
                    <ThemeSwitcher />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <ThemeSwitcher />
                    <Link to="/logout" className="flex items-center justify-center py-2.5 px-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:border hover:border-red-200 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-800">
                      <LogOut className="h-5 w-5" />
                    </Link>
                  </div>
                )}
              </div>}
              
            {!user && (
              <div className="flex justify-center mt-2">
                <ThemeSwitcher />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
