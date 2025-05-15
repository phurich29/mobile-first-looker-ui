
import { Header } from "@/components/Header";
import { NewsSlider } from "@/components/NewsSlider";
import { FooterNav } from "@/components/FooterNav";
import { IconMenu } from "@/components/IconMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { CountdownTimer } from "@/components/CountdownTimer";
import { NotificationList } from "@/components/NotificationList";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-7xl px-4 ${!isMobile ? 'py-8' : 'pt-1'}`}>
          {/* News slider section with countdown timer */}
          <div className={`${!isMobile ? 'mb-8 mt-3' : 'mb-6 mt-3'}`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-emerald-600">
                  <path d="M6 4v16"></path>
                  <path d="M18 4v16"></path>
                  <path d="M6 8h12"></path>
                  <path d="M6 16h12"></path>
                  <path d="m8 16 4-4 4 4"></path>
                  <path d="m16 8-4 4-4-4"></path>
                </svg>
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
