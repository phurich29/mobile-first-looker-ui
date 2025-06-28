
import { Home, Settings, AlertCircle, History, User, Users, FileText, Wheat } from "lucide-react";
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
  const isGuest = !user; // Check if user is a guest
  
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
        
        {/* Show "รู้จัก Riceflow" only for guests */}
        {isGuest && (
          <SidebarMenuItem 
            path="/about-riceflow" 
            icon={Wheat}
            label="รู้จัก Riceflow"
            isActive={isActive("/about-riceflow")}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Guest users can't access notification history */}
        {user && (
          <SidebarMenuItem 
            path="/notification-history" 
            icon={History}
            label="ประวัติการแจ้งเตือน"
            isActive={isActive("/notification-history")}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Profile only for logged-in users */}
        {user && (
          <SidebarMenuItem 
            path="/profile" 
            icon={User}
            label="ข้อมูลส่วนตัว"
            isActive={isActive("/profile")}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Admin features only for authenticated admin users */}
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
        
        {/* Show login option for guests */}
        {isGuest && (
          <SidebarMenuItem 
            path="/auth/login" 
            icon={User}
            label="เข้าสู่ระบบ"
            isActive={isActive("/auth/login")}
            isCollapsed={isCollapsed}
          />
        )}
      </nav>
    </ScrollArea>
  );
};
