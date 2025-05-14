
import { Header } from "@/components/Header";
import { NewsSlider } from "@/components/NewsSlider";
import { WatchlistSection } from "@/components/WatchlistSection";
import { FooterNav } from "@/components/FooterNav";
import { IconMenu } from "@/components/IconMenu";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-7xl px-4 ${!isMobile && 'py-8'}`}>
          {/* News slider section */}
          <div className={`${!isMobile && 'mb-8'} ${isMobile && 'mb-6'}`}>
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
