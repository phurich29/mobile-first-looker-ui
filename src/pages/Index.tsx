
import { Header } from "@/components/Header";
import { NewsSlider } from "@/components/NewsSlider";
import { WatchlistSection } from "@/components/WatchlistSection";
import { FooterNav } from "@/components/FooterNav";
import { IconMenu } from "@/components/IconMenu";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      
      <main className="flex-1 pb-32">
        <div className="mt-4">
          {/* News slider section */}
          <div className="mt-4 mx-4">
            <NewsSlider />
          </div>
          
          {/* Menu icons */}
          <div className="my-4">
            <IconMenu />
          </div>
          
          {/* Watchlist section */}
          <WatchlistSection />
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default Index;
