
import { Menu, Home, Wheat, BarChart2, User, X, Settings, LogOut, Users, FileText, AlertCircle, History, Monitor, ChevronLeft, ChevronRight, Layout, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const HeaderSidebar = ({ sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed }: HeaderSidebarProps) => {
  const location = useLocation();
  const { user, userRoles } = useAuth();
  const isMobile = useIsMobile();

  // ตรวจสอบหน้าที่ผู้ใช้กำลังอยู่เพื่อไฮไลท์เมนูที่ตรงกัน
  const isActive = (path: string) => location.pathname === path;

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการเข้าถึงหน้าจัดการผู้ใช้งานหรือไม่
  const canAccessUserManagement = userRoles?.includes('admin') || userRoles?.includes('superadmin');
  
  // Listen for mobile sidebar toggle events
  useEffect(() => {
    const handleToggleMobileSidebar = () => {
      if (isMobile) {
        // Fixed: Pass a boolean value directly instead of a function
        setSidebarOpen(!sidebarOpen);
      }
    };
    
    window.addEventListener('toggleMobileSidebar', handleToggleMobileSidebar);
    
    return () => {
      window.removeEventListener('toggleMobileSidebar', handleToggleMobileSidebar);
    }
  }, [isMobile, setSidebarOpen, sidebarOpen]); // Added sidebarOpen as a dependency
  
  const toggleCollapse = () => {
    // ไม่อนุญาตให้ทำงาน collapse บน mobile
    if (isMobile) return;
    
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Save preference to localStorage เฉพาะบน desktop
    localStorage.setItem('sidebarCollapsed', newCollapsedState.toString());
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('sidebarStateChanged', { 
      detail: { isCollapsed: newCollapsedState } 
    }));
  };
  
  return (
    <>
      {/* Overlay ที่จะแสดงเมื่อเมนูเปิดในโหมด responsive */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar for Desktop and Mobile */}
      <div className={cn("fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-in-out shadow-sm border-r border-gray-100 bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800", 
        sidebarOpen ? "translate-x-0" : "-translate-x-full", 
        isMobile ? "w-64" : (isCollapsed ? "w-20" : "w-64"),
        "md:translate-x-0" // แสดงเสมอในหน้าจอขนาดใหญ่
      )}>
        <div className={cn(
          "flex flex-col h-full bg-[#fff9df] dark:bg-gray-900",
          isCollapsed ? "p-2" : "p-4" // ลด padding ลงเมื่อ sidebar หดตัวเพื่อให้ไม่มีพื้นที่ว่างด้านขวา
        )}>
          {/* Mobile Close Button - แสดงเฉพาะบน mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-2 top-2 md:hidden"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Add collapse toggle button */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="absolute right-2 top-2 hidden md:flex"
              aria-label={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
          
          <div className={cn(
            "flex justify-between items-center mt-4",
            isCollapsed ? "mb-6" : "mb-8" // ลดช่องว่างด้านล่างเมื่อหดตัว
          )}>
            <div className={cn("flex items-center gap-2", !isMobile && isCollapsed && "justify-center w-full")}>
              <img src="/lovable-uploads/649554cd-4d80-484a-995d-e49f2721a07d.png" alt="RiceFlow Logo" className={cn(
                "rounded-full", 
                isCollapsed ? "h-8 w-auto" : "h-10 w-auto" // ลดขนาดโลโก้ในโหมดหดตัว
              )} />
              {(isMobile || !isCollapsed) && <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">RiceFlow</h2>}
            </div>
          </div>
          
          <ScrollArea className={cn(
            "flex-1",
            isCollapsed ? "-mr-2 pr-2" : "-mr-4 pr-4" // ปรับ margin และ padding ตามขนาดของ sidebar
          )}>
            <nav className="flex flex-col space-y-1 mt-4">
              <Link to="/" className={cn(
                "flex items-center rounded-lg transition-colors", 
                isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3", // ปรับขนาดของเมนูตามขนาดของ sidebar
                isActive("/") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                <Home className="h-5 w-5" />
                {!isCollapsed && <span className="text-sm">หน้าหลัก</span>}
              </Link>
              
              <Link to="/equipment" className={cn(
                "flex items-center rounded-lg transition-colors",
                isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3", // ปรับขนาดของเมนูตามขนาดของ sidebar
                
                isActive("/equipment") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                <Settings className="h-5 w-5" />
                {!isCollapsed && <span className="text-sm">อุปกรณ์</span>}
              </Link>
              
              <Link to="/device/default" className={cn(
                "flex items-center rounded-lg transition-colors",
                isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3", // ปรับขนาดของเมนูตามขนาดของ sidebar
                
                isActive("/device/default") || location.pathname.startsWith("/device") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                <BarChart2 className="h-5 w-5" />
                {!isCollapsed && <span className="text-sm">ค่าวัดคุณภาพ</span>}
              </Link>
              
              {user && <Link to="/notifications" className={cn(
                "flex items-center rounded-lg transition-colors",
                isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3", // ปรับขนาดของเมนูตามขนาดของ sidebar
                
                isActive("/notifications") || isActive("/notification-settings") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <AlertCircle className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">การแจ้งเตือนที่กำหนดไว้</span>}
                </Link>}
                
              {user && <Link to="/notification-history" className={cn(
                "flex items-center rounded-lg transition-colors",
                isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3", // ปรับขนาดของเมนูตามขนาดของ sidebar
                
                isActive("/notification-history") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <History className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">ประวัติการแจ้งเตือน</span>}
                </Link>}
              
              <Link to="/graph-monitor" className={cn(
                "flex items-center rounded-lg transition-colors",
                isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3", // ปรับขนาดของเมนูตามขนาดของ sidebar
                
                isActive("/graph-monitor") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <Monitor className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">Graph Monitor</span>}
              </Link>
              
              <Link to="/graph-summary" className={cn(
                "flex items-center rounded-lg transition-colors",
                isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3", // ปรับขนาดของเมนูตามขนาดของ sidebar
                
                isActive("/graph-summary") || isActive("/graph-summary-detail") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <Layout className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">Graph Summary</span>}
              </Link>
              
              {user && <Link to="/profile" className={cn(
                "flex items-center rounded-lg transition-colors",
                isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3", // ปรับขนาดของเมนูตามขนาดข��ง sidebar
                
                isActive("/profile") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <User className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">ข้อมูลส่วนตัว</span>}
                </Link>}
              
              {user && canAccessUserManagement && <Link to="/user-management" className={cn(
                "flex items-center rounded-lg transition-colors",
                isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3", // ปรับขนาดของเมนูตามขนาดของ sidebar
                
                isActive("/user-management") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <Users className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">จัดการผู้ใช้งาน</span>}
                </Link>}
              
              {user && canAccessUserManagement && <Link to="/news-management" className={cn(
                "flex items-center rounded-lg transition-colors",
                isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3", // ปรับขนาดของเมนูตามขนาดของ sidebar
                
                isActive("/news-management") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
                isCollapsed && "justify-center"
              )}>
                  <FileText className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm">จัดการข่าวสาร</span>}
                </Link>}
            </nav>
          </ScrollArea>
          
          <div className={cn(
            "mt-auto",
            isCollapsed ? "pt-2" : "pt-4" // ลด padding เมื่อ sidebar หดตัว
          )}>
            {user && (
              <div className={cn(
                "border-t border-gray-200 dark:border-gray-700", 
                isCollapsed ? "pt-2" : "pt-4" // ลด padding เมื่อ sidebar หดตัว
              )}>
                {(isMobile || !isCollapsed) ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link to="/logout" className={cn(
                        "flex items-center rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:border hover:border-red-200 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-800",
                        isCollapsed ? "gap-2 py-2 px-1 justify-center" : "gap-3 py-2.5 px-3" // ปรับขนาดของปุ่มตามขนาดของ sidebar
                      )}>
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm">ออกจากระบบ</span>
                      </Link>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Mobile only notifications link */}
                      <Link 
                        to="/notifications" 
                        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </Link>
                      <ThemeSwitcher />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Link to="/logout" className="flex items-center justify-center h-7 w-7 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-800/30 transition-colors">
                      <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Link>
                    <ThemeSwitcher />
                  </div>
                )}
              </div>
            )}
            
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
