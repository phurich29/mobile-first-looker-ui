
import { Header } from "@/components/Header";
import { NewsSlider } from "@/components/NewsSlider";
import { WatchlistSection } from "@/components/WatchlistSection";
import { FooterNav } from "@/components/FooterNav";
import { IconMenu } from "@/components/IconMenu";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      
      <main className="flex-1 pb-32 md:pb-16 md:mx-auto md:max-w-5xl md:px-8 w-full">
        <div className="mt-6">
          {/* News slider section */}
          <div className="mx-4 md:mx-0 mb-6">
            <NewsSlider />
          </div>
          
          {/* Menu icons */}
          <div className="md:mt-8">
            <IconMenu />
          </div>
          
          {/* Watchlist section */}
          <div className="md:mt-8">
            <WatchlistSection />
          </div>
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default Index;
