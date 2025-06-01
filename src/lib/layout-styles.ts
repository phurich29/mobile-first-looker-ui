/**
 * layout-styles.ts
 * 
 * ไฟล์นี้เก็บค่าคงที่ของสไตล์สำหรับเลย์เอาต์หลักของแอปพลิเคชัน
 * เพื่อสร้างความสอดคล้องระหว่างหน้าต่างๆ
 */

import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ฟังก์ชันสำหรับรวม Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ชื่อเรียกสำหรับส่วนต่างๆ ของเลย์เอาต์
 * ใช้สำหรับอ้างอิงในการสื่อสารและการพัฒนา
 */
export const LAYOUT_NAMES = {
  // ชื่อสำหรับเลย์เอาต์ทั้งหมดที่รวมทั้ง 3 ส่วนเข้าด้วยกัน
  MAIN_LAYOUT: 'AppLayout',
  
  // ส่วนเมนูด้านข้าง
  SIDEBAR: 'AppSidebar',
  
  // ส่วนหัวด้านบน
  HEADER: 'AppHeader',
  
  // ส่วนเนื้อหาหลัก
  CONTENT: 'PageContent',
} as const;

/**
 * สไตล์สำหรับส่วนต่างๆ ของเลย์เอาต์
 */
export const LAYOUT_STYLES = {
  // สไตล์สำหรับส่วนเมนูด้านข้าง (AppSidebar)
  sidebar: {
    base: "fixed top-0 left-0 z-30 h-screen transition-all duration-300 bg-white dark:bg-gray-900",
    expanded: "w-64",
    collapsed: "w-20",
    mobile: "hidden", // ซ่อนบน mobile
  },
  
  // สไตล์สำหรับส่วนหัวด้านบน (AppHeader)
  header: {
    base: "sticky top-0 z-20 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg dark:from-slate-800 dark:to-slate-900 transition-all duration-300 ease-in-out",
    withSidebar: {
      expanded: "left-64 right-0 w-auto",
      collapsed: "left-20 right-0 w-auto",
    },
    withoutSidebar: "left-0 right-0 w-full",
    padding: "py-5 px-4 md:px-4 md:py-6",
  },
  
  // สไตล์สำหรับส่วนเนื้อหาหลัก (PageContent)
  content: {
    // สไตล์พื้นฐานสำหรับ container หลัก
    container: {
      base: "flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950 overflow-x-hidden",
    },
    
    // สไตล์สำหรับ main element
    main: {
      base: "relative flex-1 w-full transition-all duration-300", // Removed all padding
      withSidebar: {
        expanded: "ml-0 md:ml-64", // สำหรับ desktop เมื่อ sidebar ขยาย
        collapsed: "ml-0 md:ml-[5rem]", // สำหรับ desktop เมื่อ sidebar หดตัว
      },
      withoutSidebar: "ml-0", // ไม่มี sidebar
    },
    
    // สไตล์สำหรับ wrapper ที่ครอบเนื้อหาเพื่อจัดการ max-width และการจัดกึ่งกลาง
    wrapper: {
      base: "w-full md:mx-auto px-4", // Added px-4 for consistent horizontal padding
      maxWidth: "md:max-w-5xl", // ความกว้างสูงสุดมาตรฐาน
      maxWidthWide: "md:max-w-7xl", // ความกว้างสูงสุดสำหรับหน้าที่ต้องการพื้นที่มากขึ้น
    },
    
    // padding สำหรับเนื้อหาใน home page (index.tsx)
    homePage: {
      wrapper: "mx-auto max-w-7xl px-4", 
      topSection: "py-8", // สำหรับ desktop
      mobileTopSection: "pt-1", // สำหรับ mobile
    },
  },
  
  // สไตล์สำหรับ footer nav (ถ้ามี)
  footerNav: {
    base: "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 px-2 shadow-lg z-30",
    height: "max-h-[65px]",
  },
} as const;

/**
 * ฟังก์ชันสำหรับสร้าง className ของส่วนต่างๆ ตามสถานะ
 */
export const getLayoutClasses = {
  // สร้าง className สำหรับ main element
  main: (isMobile: boolean, hasSidebar: boolean, isCollapsed: boolean) => {
    return cn(
      LAYOUT_STYLES.content.main.base,
      hasSidebar ? 
        (!isMobile && (isCollapsed ? 
          LAYOUT_STYLES.content.main.withSidebar.collapsed : 
          LAYOUT_STYLES.content.main.withSidebar.expanded)) : 
        LAYOUT_STYLES.content.main.withoutSidebar
    );
  },
  
  // สร้าง className สำหรับ content wrapper
  contentWrapper: (isWidePage: boolean = false) => {
    return cn(
      LAYOUT_STYLES.content.wrapper.base,
      isWidePage ? 
        LAYOUT_STYLES.content.wrapper.maxWidthWide : 
        LAYOUT_STYLES.content.wrapper.maxWidth
    );
  },
  
  // สร้าง className สำหรับ header
  header: (hasSidebar: boolean, isCollapsed: boolean) => {
    return cn(
      LAYOUT_STYLES.header.base,
      LAYOUT_STYLES.header.padding,
      hasSidebar ? 
        (isCollapsed ? 
          LAYOUT_STYLES.header.withSidebar.collapsed : 
          LAYOUT_STYLES.header.withSidebar.expanded) : 
        LAYOUT_STYLES.header.withoutSidebar
    );
  },
  
  // สร้าง className สำหรับ sidebar
  sidebar: (isCollapsed: boolean) => {
    return cn(
      LAYOUT_STYLES.sidebar.base,
      isCollapsed ? 
        LAYOUT_STYLES.sidebar.collapsed : 
        LAYOUT_STYLES.sidebar.expanded
    );
  }
};
