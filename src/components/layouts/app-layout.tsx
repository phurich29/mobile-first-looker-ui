import React, { ReactNode, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { LAYOUT_STYLES, cn } from '@/lib/layout-styles';
import { HeaderSidebar } from '@/components/header/HeaderSidebar';
import { TopHeader } from './top-header'; // Import the new TopHeader
import { FooterNav } from '@/components/FooterNav';

/**
 * AppLayout เป็น component หลักสำหรับจัดการโครงสร้างของแอปพลิเคชัน
 * ประกอบด้วย 3 ส่วนหลัก: Sidebar, Header และ Content
 */
interface AppLayoutProps {
  /** เนื้อหาหลักของหน้า */
  children: ReactNode;
  
  /** กำหนดว่าควรแสดง FooterNav หรือไม่ (เฉพาะบน mobile) */
  showFooterNav?: boolean;
  
  /** กำหนดให้ content มีความกว้างมากขึ้น (max-w-7xl แทน max-w-5xl) */
  wideContent?: boolean;
  
  /** กำหนดพื้นหลังของ container */
  className?: string;
  
  /** padding-bottom เพิ่มเติมสำหรับ content เพื่อป้องกัน FooterNav ทับซ้อน */
  contentPaddingBottom?: string;
}

export function AppLayout({
  children,
  showFooterNav = true,
  wideContent = false,
  className,
  contentPaddingBottom = 'pb-32 md:pb-16' // ค่าเริ่มต้นสำหรับหน้าที่มี FooterNav
}: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const updateSidebarState = (event?: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent?.detail) {
        setIsCollapsed(customEvent.detail.isCollapsed);
      } else {
        const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
        setIsCollapsed(savedCollapsedState === 'true');
      }
    };
    updateSidebarState();
    window.addEventListener('storage', () => updateSidebarState());
    window.addEventListener('sidebarStateChanged', updateSidebarState);
    return () => {
      window.removeEventListener('storage', () => updateSidebarState());
      window.removeEventListener('sidebarStateChanged', updateSidebarState);
    };
  }, []);

  return (
    <>
      {/* Render TopHeader if not on mobile OR if on mobile and sidebar is closed (to show mobile header) */}
      {/* This logic might need refinement based on exact UX desired for mobile header vs sidebar */}
      <TopHeader 
        isMobile={isMobile} 
        isCollapsed={isCollapsed} 
        setSidebarOpen={setSidebarOpen} 
        // pageTitle={...} // We can make pageTitle dynamic later
      />
      {/* Outermost div removed, LAYOUT_STYLES.content.container.base and its className are no longer applied here */}
      {/* Sidebar */}
      {!isMobile && (
        <HeaderSidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
      )}
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isMobile ? "ml-0" : (isCollapsed ? "md:ml-20" : "md:ml-64"),
        // "pt-16", // Removed top padding, will be handled by page content itself or specific AppLayout props if needed
        showFooterNav && isMobile ? (contentPaddingBottom || "pb-24") : "pb-6",
        className
      )}>
        {/* Add an inner div for page-specific top padding if needed, or adjust pt-16 above */}
        {/* For example, if some pages need less/more space below TopHeader */}
        {/* <div className="pt-4 md:pt-6"> */}
        {/* {children} */}
        {/* </div> */} 
          {/* Content wrapper div removed, children are now direct descendants of main */}
          {children}
      </main>
      
      {/* Footer Navigation - Mobile only */}
      {isMobile && showFooterNav && <FooterNav />}
    </>
  );
}
