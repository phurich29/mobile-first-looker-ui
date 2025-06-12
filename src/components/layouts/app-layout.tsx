import React, { ReactNode, useEffect, useState } from 'react';
import { LoginForm } from '../auth/login-form'; // เพิ่มการ import LoginForm
import { useIsMobile } from '@/hooks/use-mobile';
import { LAYOUT_STYLES, cn } from '@/lib/layout-styles';
import { HeaderSidebar } from '@/components/header/HeaderSidebar';
import { useAuth } from '@/components/AuthProvider'; // Import the new TopHeader
import { TopHeader } from './top-header'; // Import the new TopHeader
import { MeyerAndTimeBar } from './meyer-and-time-bar'; // Import MeyerAndTimeBar
import { FooterNav } from '@/components/FooterNav';

/**
 * AppLayout เป็น component หลักสำหรับจัดการโครงสร้างของแอปพลิเคชัน
 * ประกอบด้วย 3 ส่วนหลัก: Sidebar, Header และ Content
 */
interface AppLayoutProps {
  /** แสดงสถานะการ login ของผู้ใช้ */
  // เราจะใช้ state ภายใน แต่เผื่อ props นี้ไว้ถ้าต้องการควบคุมจากภายนอกในอนาคต
  // initialIsLoggedIn?: boolean; 

  /** เนื้อหาหลักของหน้า */
  children: ReactNode;
  
  /** กำหนดว่าควรแสดง FooterNav หรือไม่ (เฉพาะบน mobile) */
  showFooterNav?: boolean;
  
  /** กำหนดให้ content มีความกว้างมากขึ้น (max-w-7xl แทน max-w-5xl) */
  wideContent?: boolean;
  
  /** กำหนดพื้นหลังของ container */
  className?: string;
  
  /** padding-bottom เพิ่มเติมสำหรับ content (จะถูกรวมกับค่าเริ่มต้น) */
  contentPaddingBottom?: string;
}

export function AppLayout({
  children,
  showFooterNav = true,
  wideContent = false,
  className,
  contentPaddingBottom
}: AppLayoutProps) {
  const isMobile = useIsMobile();
  const { user, isLoading } = useAuth(); // Use user from auth context
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner component
  }

  const isUserLoggedIn = !!user;

  // คำนวณ padding-bottom อัตโนมัติ
  const getMainPaddingBottom = () => {
    const basePadding = 'p-5'; // 20px padding รอบๆ
    
    if (isMobile && showFooterNav) {
      // เพิ่ม padding-bottom 80px (20 พื้นฐาน + 60 สำหรับ footer) บน mobile เมื่อมี footer
      return cn(basePadding, 'pb-20', contentPaddingBottom);
    } else {
      // ใช้ padding ปกติบน desktop หรือเมื่อไม่มี footer
      return cn(basePadding, contentPaddingBottom);
    }
  };

  const mainContentMargin = isMobile ? "ml-0" : (isCollapsed ? "md:ml-20" : "md:ml-64");

  return (
    <>
      {/* Render TopHeader */}
      <TopHeader 
        isMobile={isMobile} 
        isCollapsed={isCollapsed}
        setSidebarOpen={setSidebarOpen} 
        isUserLoggedIn={isUserLoggedIn} 
      />
      
      {/* Sidebar - now renders for both mobile and desktop */}
      <HeaderSidebar 
        sidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isUserLoggedIn={isUserLoggedIn} 
      />
      
      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <div className="p-5">
          {!isUserLoggedIn ? (
            <div className="flex items-center justify-center h-full">
              <LoginForm />
            </div>
          ) : (
            <>
              <MeyerAndTimeBar />
              {children}
            </>
          )}
        </div>
      </main>
      
      {/* Footer Navigation - Mobile only */}
      {isMobile && showFooterNav && <FooterNav isUserLoggedIn={isUserLoggedIn} />}
    </>
  );
}
