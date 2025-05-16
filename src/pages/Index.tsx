
import { Header } from "@/components/Header";
import { NewsSlider } from "@/components/NewsSlider";
import { FooterNav } from "@/components/FooterNav";
import { SideMenu } from "@/components/SideMenu";
import { IconMenu } from "@/components/IconMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { CountdownTimer } from "@/components/CountdownTimer";
import { NotificationList } from "@/components/NotificationList";
import { File } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950 w-full">
        <Header />
        
        <div className="flex flex-1">
          {/* Sidebar on desktop */}
          {!isMobile && <SideMenu />}
          
          <main className={`flex-1 ${isMobile ? 'pb-20' : 'pb-16'}`}>
            <div className="mx-auto max-w-7xl px-4 py-4">
              {/* News slider section with countdown timer */}
              <div className={`${!isMobile ? 'mb-8' : 'mb-6'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <File className="text-white bg-emerald-600 p-0.5 rounded-sm" size={20} />
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
              <div>
                <IconMenu />
              </div>
              
              {/* Notification settings section at the bottom */}
              <div className={`mt-8 ${!isMobile ? 'mb-8' : 'mb-20'}`}>
                <NotificationList />
              </div>
            </div>
          </main>
        </div>

        <FooterNav />
      </div>
    </SidebarProvider>
  );
};

export default Index;
