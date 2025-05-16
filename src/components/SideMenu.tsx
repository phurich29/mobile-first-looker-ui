
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, PackageOpen, Bell, Info, Monitor, User } from "lucide-react";
import { useAuth } from "./AuthProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarProvider,
} from "@/components/ui/sidebar";

export const SideMenu = () => {
  const { user, userRoles } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  
  React.useEffect(() => {
    setIsAuthenticated(!!user);
    
    if (user) {
      // If user is logged in, they're authorized
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [user]);
  
  return (
    <Sidebar variant="inset" className="bg-white dark:bg-gray-900">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={({ isActive }) => isActive ? "text-emerald-500 font-medium" : ""}>
                    <Home className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                    <span>หน้าแรก</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isAuthenticated && isAuthorized && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/equipment" className={({ isActive }) => isActive ? "text-emerald-500 font-medium" : ""}>
                        <PackageOpen className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                        <span>อุปกรณ์</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/notifications" className={({ isActive }) => isActive ? "text-emerald-500 font-medium" : ""}>
                        <Bell className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                        <span>การแจ้งเตือน</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/graph-monitor" className={({ isActive }) => isActive ? "text-emerald-500 font-medium" : ""}>
                        <Monitor className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                        <span>Graph Monitor</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/rice-prices" className={({ isActive }) => isActive ? "text-emerald-500 font-medium" : ""}>
                    <Info className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                    <span>ราคาข้าว</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/news" className={({ isActive }) => isActive ? "text-emerald-500 font-medium" : ""}>
                    <Info className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                    <span>ข่าวสาร</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/profile" className={({ isActive }) => isActive ? "text-emerald-500 font-medium" : ""}>
                    <User className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                    <span>โปรไฟล์</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideMenu;
