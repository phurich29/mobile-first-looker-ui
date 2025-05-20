
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Home, Settings, BarChart2, AlertCircle, User, Users, FileText, History, Monitor, Layout, Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNavItem } from "./SidebarNavItem";
import { cn } from "@/lib/utils";

interface SidebarContentProps {
  user: any;
  userRoles: string[];
  isCollapsed: boolean;
  isMobile: boolean;
}

export const SidebarContent = ({ user, userRoles, isCollapsed, isMobile }: SidebarContentProps) => {
  const location = useLocation();
  
  // Check if current page matches the path
  const isActive = (path: string) => location.pathname === path;
  
  // Check if user has admin access
  const canAccessUserManagement = userRoles.includes('admin') || userRoles.includes('superadmin');
  
  return (
    <ScrollArea className={cn(
      "flex-1",
      isCollapsed ? "-mr-2 pr-2" : "-mr-4 pr-4"
    )}>
      <nav className="flex flex-col space-y-1 mt-4">
        <SidebarNavItem 
          to="/" 
          icon={Home} 
          label="หน้าหลัก" 
          isActive={isActive("/")} 
          isCollapsed={isCollapsed}
        />
        
        <SidebarNavItem 
          to="/equipment" 
          icon={Settings} 
          label="อุปกรณ์" 
          isActive={isActive("/equipment")} 
          isCollapsed={isCollapsed} 
        />
        
        <SidebarNavItem 
          to="/device/default" 
          icon={BarChart2} 
          label="ค่าวัดคุณภาพ" 
          isActive={isActive("/device/default") || location.pathname.startsWith("/device")} 
          isCollapsed={isCollapsed} 
        />
        
        {user && (
          <SidebarNavItem 
            to="/notifications" 
            icon={AlertCircle} 
            label="การแจ้งเตือนที่กำหนดไว้" 
            isActive={isActive("/notifications") || isActive("/notification-settings")} 
            isCollapsed={isCollapsed} 
          />
        )}
        
        {user && (
          <SidebarNavItem 
            to="/notification-history" 
            icon={History} 
            label="ประวัติการแจ้งเตือน" 
            isActive={isActive("/notification-history")} 
            isCollapsed={isCollapsed} 
          />
        )}
        
        <SidebarNavItem 
          to="/graph-monitor" 
          icon={Monitor} 
          label="Graph Monitor" 
          isActive={isActive("/graph-monitor")} 
          isCollapsed={isCollapsed} 
        />
        
        <SidebarNavItem 
          to="/graph-summary" 
          icon={Layout} 
          label="Graph Summary" 
          isActive={isActive("/graph-summary") || isActive("/graph-summary-detail")} 
          isCollapsed={isCollapsed} 
        />
        
        {user && (
          <SidebarNavItem 
            to="/profile" 
            icon={User} 
            label="ข้อมูลส่วนตัว" 
            isActive={isActive("/profile")} 
            isCollapsed={isCollapsed} 
          />
        )}
        
        {user && canAccessUserManagement && (
          <SidebarNavItem 
            to="/user-management" 
            icon={Users} 
            label="จัดการผู้ใช้งาน" 
            isActive={isActive("/user-management")} 
            isCollapsed={isCollapsed} 
          />
        )}
        
        {user && canAccessUserManagement && (
          <SidebarNavItem 
            to="/news-management" 
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
