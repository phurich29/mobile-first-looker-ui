
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { saveSidebarState } from "./sidebar/sidebar-utils";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarMenu } from "./sidebar/SidebarMenu";
import { SidebarFooter } from "./sidebar/SidebarFooter";

interface HeaderSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const HeaderSidebar = ({ sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed }: HeaderSidebarProps) => {
  const { user, userRoles } = useAuth();
  const isMobile = useIsMobile();
  
  const toggleCollapse = () => {
    // ไม่อนุญาตให้ทำงาน collapse บน mobile
    if (isMobile) return;
    
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Save preference to localStorage
    saveSidebarState(newCollapsedState);
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
          isCollapsed ? "p-2" : "p-4", // ลด padding ลงเมื่อ sidebar หดตัวเพื่อให้ไม่มีพื้นที่ว่างด้านขวา
          isMobile ? "pb-20" : "" // เพิ่ม padding-bottom บน mobile เพื่อเว้นพื้นที่สำหรับ footer menu
        )}>
          {/* Header with logo and mobile close button */}
          <SidebarHeader 
            isCollapsed={isCollapsed}
            isMobile={isMobile}
            setSidebarOpen={setSidebarOpen}
            toggleCollapse={toggleCollapse}
          />
          
          {/* Main navigation menu */}
          <SidebarMenu 
            isCollapsed={isCollapsed}
            isMobile={isMobile}
            userRoles={userRoles}
            user={user}
          />
          
          {/* Footer with theme switcher and logout */}
          <SidebarFooter 
            user={user}
            isCollapsed={isCollapsed}
            isMobile={isMobile}
          />
        </div>
      </div>
    </>
  );
};
