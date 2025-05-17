
import { useState, useEffect } from "react";
import { HeaderSidebar } from "./header/HeaderSidebar";
import { HeaderMainContent } from "./header/HeaderMainContent";

export const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Initialize sidebar collapsed state from localStorage
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState) {
      setIsCollapsed(savedCollapsedState === 'true');
    }
    
    // Handle responsive sidebar behavior
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    // Dispatch custom event when sidebar state changes
    const dispatchSidebarEvent = () => {
      window.dispatchEvent(new CustomEvent('sidebarStateChanged', { 
        detail: { isCollapsed: savedCollapsedState === 'true' } 
      }));
    };

    // เปิด sidebar ทันทีเมื่อหน้าจอมีขนาดใหญ่กว่า md
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Call once on mount to ensure all components are updated
    dispatchSidebarEvent();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Effect to dispatch event when isCollapsed changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebarStateChanged', { 
      detail: { isCollapsed } 
    }));
  }, [isCollapsed]);

  return (
    <>
      <HeaderSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <HeaderMainContent setSidebarOpen={setSidebarOpen} />
    </>
  );
};
