
import { useState, useEffect } from "react";
import { HeaderSidebar } from "./header/HeaderSidebar";
import { HeaderMainContent } from "./header/HeaderMainContent";

export const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ทำงานเมื่อหน้าจอเปลี่ยนขนาด
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // เปิด sidebar ทันทีเมื่อหน้าจอมีขนาดใหญ่กว่า md
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <HeaderSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <HeaderMainContent setSidebarOpen={setSidebarOpen} />
    </>
  );
};
