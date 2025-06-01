
import { useState, useEffect } from "react";
import { HeaderSidebar } from "./header/HeaderSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // สำหรับ desktop เท่านั้นที่จะใช้ localStorage และการ collapse
    if (!isMobile) {
      // Initialize sidebar collapsed state from localStorage
      const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
      if (savedCollapsedState) {
        setIsCollapsed(savedCollapsedState === 'true');
      }
      
      // Dispatch custom event when sidebar state changes
      window.dispatchEvent(new CustomEvent('sidebarStateChanged', { 
        detail: { isCollapsed: savedCollapsedState === 'true' } 
      }));
    }
    
    // Handle responsive sidebar behavior
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint - เปิด sidebar เสมอบน desktop
        setSidebarOpen(true);
      } else {
        // ปิด sidebar เสมอเมื่อเริ่มต้นบน mobile
        setSidebarOpen(false);
      }
    };

    // เปิด sidebar ทันทีเมื่อหน้าจอมีขนาดใหญ่กว่า md
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);
  
  // Effect to dispatch event when isCollapsed changes - เฉพาะ desktop
  useEffect(() => {
    if (!isMobile) {
      window.dispatchEvent(new CustomEvent('sidebarStateChanged', { 
        detail: { isCollapsed } 
      }));
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
    </>
  );
};
