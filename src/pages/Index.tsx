
import { Header } from "@/components/Header";
import { NewsSlider } from "@/components/NewsSlider";
import { WatchlistSection } from "@/components/WatchlistSection";
import { FooterNav } from "@/components/FooterNav";
import { IconMenu } from "@/components/IconMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { CountdownTimer } from "@/components/CountdownTimer";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const isMobile = useIsMobile();
  
  const handleCountdownComplete = () => {
    console.log("Countdown complete - triggering refresh or other actions");
    // This function will be called every minute (60 seconds)
    // Here you can add any periodic tasks that need to run every minute
    // For demonstration purposes, let's show a toast
    toast({
      title: "ระบบกำลังอัปเดตข้อมูล",
      description: "ระบบได้ทำการอัปเดตข้อมูลล่าสุดจากเซิร์ฟเวอร์",
      duration: 3000,
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-7xl px-4 ${!isMobile ? 'py-8' : 'pt-1'}`}>
          {/* News slider section with countdown timer */}
          <div className={`${!isMobile ? 'mb-8 mt-3' : 'mb-6 mt-3'}`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg text-gray-800">ข่าวสารและประกาศ</h2>
              <CountdownTimer 
                onComplete={handleCountdownComplete}
                initialSeconds={60}
                className="bg-white border border-gray-100 shadow-sm"
              />
            </div>
            <NewsSlider />
          </div>
          
          {/* Menu icons */}
          <div className={`${!isMobile ? 'mt-8' : ''}`}>
            <IconMenu />
          </div>
          
          {/* Watchlist section */}
          <div className={`${!isMobile ? 'mt-10' : ''}`}>
            <WatchlistSection />
          </div>
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default Index;
