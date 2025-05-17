
import { Header } from "@/components/Header";
import { NewsSlider } from "@/components/NewsSlider";
import { FooterNav } from "@/components/FooterNav";
import { IconMenu } from "@/components/IconMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { CountdownTimer } from "@/components/CountdownTimer";
import { NotificationList } from "@/components/NotificationList";
import { File } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    // Get sidebar collapsed state from localStorage
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState) {
      setIsCollapsed(savedCollapsedState === 'true');
    }
    
    // Listen for changes in localStorage
    const handleStorageChange = () => {
      const currentState = localStorage.getItem('sidebarCollapsed');
      setIsCollapsed(currentState === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes within the same window
    const interval = setInterval(() => {
      const currentState = localStorage.getItem('sidebarCollapsed');
      if (currentState === 'true' !== isCollapsed) {
        setIsCollapsed(currentState === 'true');
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isCollapsed]);
  
  // Calculate sidebar width for layout
  const sidebarWidth = !isMobile ? (isCollapsed ? 'ml-20' : 'ml-64') : '';
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950 overflow-y-auto overflow-x-hidden">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-20' : `pb-16 ${sidebarWidth}`}`}>
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
