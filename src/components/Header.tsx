
import { useState, useEffect } from "react";
import { HeaderSidebar } from "./header/HeaderSidebar";
import { HeaderMainContent } from "./header/HeaderMainContent";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Only use localStorage for desktop
    if (!isMobile) {
      // Initialize sidebar collapsed state from localStorage
      const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
      if (savedCollapsedState) {
        setIsCollapsed(savedCollapsedState === 'true');
      }
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('sidebarStateChanged', { 
        detail: { isCollapsed: savedCollapsedState === 'true' } 
      }));
    }
    
    // Handle responsive sidebar behavior
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint - always open sidebar on desktop
        setSidebarOpen(true);
      } else {
        // always close sidebar initially on mobile
        setSidebarOpen(false);
      }
    };

    // Open sidebar immediately when screen is larger than md
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Update document body class for main content adjustment
    document.body.classList.add('has-sidebar');
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('has-sidebar');
    }
  }, [isMobile]);
  
  // Effect to dispatch event when isCollapsed changes - desktop only
  useEffect(() => {
    if (!isMobile) {
      window.dispatchEvent(new CustomEvent('sidebarStateChanged', { 
        detail: { isCollapsed } 
      }));
      
      // Update body class for content adjustment
      if (isCollapsed) {
        document.body.classList.add('sidebar-collapsed');
      } else {
        document.body.classList.remove('sidebar-collapsed');
      }
    }
  }, [isCollapsed, isMobile]);

  return (
    <>
      <HeaderSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <HeaderMainContent 
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
      />
    </>
  );
};
