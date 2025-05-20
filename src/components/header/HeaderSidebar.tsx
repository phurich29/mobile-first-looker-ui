
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarContent } from "./sidebar/SidebarContent";
import { SidebarFooter } from "./sidebar/SidebarFooter";

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
  
  const toggleCollapse = () => {
    // Don't allow collapse on mobile
    if (isMobile) return;
    
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Save preference to localStorage (desktop only)
    localStorage.setItem('sidebarCollapsed', newCollapsedState.toString());
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('sidebarStateChanged', { 
      detail: { isCollapsed: newCollapsedState } 
    }));
  };
  
  return (
    <>
      {/* Overlay for responsive menu */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar for Desktop and Mobile */}
      <div className={cn(
        "fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-in-out shadow-sm border-r border-gray-100 bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800", 
        sidebarOpen ? "translate-x-0" : "-translate-x-full", 
        isMobile ? "w-64" : (isCollapsed ? "w-20" : "w-64"),
        "md:translate-x-0" // Always visible on larger screens
      )}>
        <div className={cn(
          "flex flex-col h-full bg-[#fff9df] dark:bg-gray-900",
          isCollapsed ? "p-2" : "p-4" 
        )}>
          {/* Mobile Close Button */}
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
          
          {/* Header with Logo and Collapse Button */}
          <SidebarHeader
            isCollapsed={isCollapsed}
            toggleCollapse={toggleCollapse}
            isMobile={isMobile}
          />
          
          {/* Navigation Content */}
          <SidebarContent
            user={user}
            userRoles={userRoles}
            isCollapsed={isCollapsed}
            isMobile={isMobile}
          />
          
          {/* Footer with Theme Switcher and Logout */}
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
