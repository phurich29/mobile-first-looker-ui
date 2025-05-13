
import { Header } from "@/components/Header";
import { NewsSlider } from "@/components/NewsSlider";
import { RicePriceCarousel } from "@/components/RicePriceCarousel";
import { WatchlistSection } from "@/components/WatchlistSection";
import { FooterNav } from "@/components/FooterNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice } from "@/features/user-management/types";

const Index = () => {
  // Function to fetch rice prices for the homepage
  const fetchRicePrices = async () => {
    const { data, error } = await supabase
      .from('rice_prices')
      .select('*')
      .limit(8); // Limit to a reasonable number for display
    
    if (error) {
      throw error;
    }
    
    // Cast the data to match our RicePrice interface
    return data as unknown as RicePrice[];
  };

  // Use React Query to fetch rice prices
  const { data: ricePrices, isLoading, error } = useQuery({
    queryKey: ['homeRicePrices'],
    queryFn: fetchRicePrices
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      
      <main className="flex-1 pb-32">
        <div className="mt-4">
          {/* News slider section */}
          <div className="mt-4 mx-4">
            <NewsSlider />
          </div>
          
          {/* Rice prices carousel */}
          <RicePriceCarousel 
            ricePrices={ricePrices} 
            isLoading={isLoading} 
            error={error as Error | null} 
          />
          
          {/* Watchlist section */}
          <WatchlistSection />
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default Index;
