
import { Header } from "@/components/Header";
import { NewsSlider } from "@/components/NewsSlider";
import { FooterNav } from "@/components/FooterNav";
import { IconMenu } from "@/components/IconMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { CountdownTimer } from "@/components/CountdownTimer";
import { NotificationList } from "@/components/NotificationList";
import { File } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Index = () => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    // Listen for sidebar state changes using custom event
    const updateSidebarState = (event?: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent?.detail) {
        setIsCollapsed(customEvent.detail.isCollapsed);
      } else {
        const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
        setIsCollapsed(savedCollapsedState === 'true');
      }
    };
    
    // Initial state
    updateSidebarState();
    
    // Listen for changes in localStorage
    window.addEventListener('storage', () => updateSidebarState());
    
    // Listen for custom event from Header component
    window.addEventListener('sidebarStateChanged', updateSidebarState);
    
    return () => {
      window.removeEventListener('storage', () => updateSidebarState());
      window.removeEventListener('sidebarStateChanged', updateSidebarState);
    };
  }, []);
  
  // สำหรับ desktop เท่านั้น mobile จะไม่มีการปรับ margin
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950 overflow-y-auto overflow-x-hidden">
      <Header />
      
      <main className={cn(
        "flex-1 transition-all duration-300",
        isMobile ? "pb-20" : "pb-16",
        // สำหรับหน้าจอ desktop ให้มี margin-left ที่เปลี่ยนตาม sidebar
        !isMobile && "ml-0 md:ml-[5rem]", // สำหรับ default ให้ margin เท่ากับความกว้างของ sidebar ที่หดตัว (w-20 = 5rem)
        !isMobile && !isCollapsed && "md:ml-64" // เมื่อ sidebar ขยาย ให้เพิ่ม margin เป็น 64 (เท่ากับความกว้างของ sidebar ที่ขยาย w-64)
      )}>
        <div className={`mx-auto max-w-7xl px-4 ${!isMobile ? 'py-8' : 'pt-1'}`}>
          {/* News slider section with countdown timer */}
          <div className={`${!isMobile ? 'mb-8 mt-3' : 'mb-6 mt-3'}`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                <File className="text-white bg-emerald-600 dark:bg-emerald-700 p-0.5 rounded-sm" size={20} />
                ข่าวสารและประกาศ
              </h2>
              <CountdownTimer 
                useGlobal={true}
                initialSeconds={60}
              />
            </div>
            <NewsSlider />
          </div>
          
          {/* Menu icons */}
          <div className={`${!isMobile ? 'mt-8' : ''}`}>
            <IconMenu />
          </div>
          
          {/* Notification settings section at the bottom */}
          <div className={`mt-8 ${!isMobile ? 'mb-8' : 'mb-20'}`}>
            <NotificationList />
          </div>
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default Index;
