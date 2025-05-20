
import { Home, Settings, BarChart2, AlertCircle, History, Monitor, Layout, User, Users, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useActivePath } from "./sidebar-utils";
import { SidebarMenuItem } from "./SidebarMenuItem";

interface SidebarMenuProps {
  isCollapsed: boolean;
  isMobile: boolean;
  userRoles: string[];
  user: any | null;
}

export const SidebarMenu = ({ isCollapsed, isMobile, userRoles, user }: SidebarMenuProps) => {
  const { isActive } = useActivePath();
  
  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการเข้าถึงหน้าจัดการผู้ใช้งานหรือไม่
  const canAccessUserManagement = userRoles.includes('admin') || userRoles.includes('superadmin');
  
  return (
    <ScrollArea className={cn(
      "flex-1",
      isCollapsed ? "-mr-2 pr-2" : "-mr-4 pr-4" // ปรับ margin และ padding ตามขนาดของ sidebar
    )}>
      <nav className="flex flex-col space-y-1 mt-4">
        <SidebarMenuItem 
          path="/" 
          icon={Home}
          label="หน้าหลัก"
          isActive={isActive("/")}
          isCollapsed={isCollapsed}
        />
        
        <SidebarMenuItem 
          path="/equipment" 
          icon={Settings}
          label="อุปกรณ์"
          isActive={isActive("/equipment")}
          isCollapsed={isCollapsed}
        />
        
        <SidebarMenuItem 
          path="/new-quality-measurements" 
          icon={BarChart2}
          label="ค่าวัดคุณภาพ"
          isActive={isActive("/new-quality-measurements")}
          isCollapsed={isCollapsed}
          pathStartsWith="/measurement-detail"
        />
        
        {user && (
          <SidebarMenuItem 
            path="/notifications" 
            icon={AlertCircle}
            label="การแจ้งเตือนที่กำหนดไว้"
            isActive={isActive("/notifications") || isActive("/notification-settings")}
            isCollapsed={isCollapsed}
          />
        )}
        
        {user && (
          <SidebarMenuItem 
            path="/notification-history" 
            icon={History}
            label="ประวัติการแจ้งเตือน"
            isActive={isActive("/notification-history")}
            isCollapsed={isCollapsed}
          />
        )}
        
        <SidebarMenuItem 
          path="/graph-monitor" 
          icon={Monitor}
          label="Graph Monitor"
          isActive={isActive("/graph-monitor")}
          isCollapsed={isCollapsed}
        />
        
        <SidebarMenuItem 
          path="/graph-summary" 
          icon={Layout}
          label="Graph Summary"
          isActive={isActive("/graph-summary") || isActive("/graph-summary-detail")}
          isCollapsed={isCollapsed}
        />
        
        {user && (
          <SidebarMenuItem 
            path="/profile" 
            icon={User}
            label="ข้อมูลส่วนตัว"
            isActive={isActive("/profile")}
            isCollapsed={isCollapsed}
          />
        )}
        
        {user && canAccessUserManagement && (
          <SidebarMenuItem 
            path="/user-management" 
            icon={Users}
            label="จัดการผู้ใช้งาน"
            isActive={isActive("/user-management")}
            isCollapsed={isCollapsed}
          />
        )}
        
        {user && canAccessUserManagement && (
          <SidebarMenuItem 
            path="/news-management" 
            icon={FileText}
            label="จัดการข่าวสาร"
            isActive={isActive("/news-management")}
            isCollapsed={isCollapsed}
          />
        )}
      </nav>
    </ScrollArea>
  );
};
