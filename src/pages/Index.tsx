
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
    console.log('Fetching home rice prices...');
    const { data, error } = await supabase
      .from('rice_prices')
      .select('*')
      .order('name', { ascending: true })
      .limit(8); // Limit to a reasonable number for display
    
    if (error) {
      console.error('Error fetching home rice prices:', error);
      throw error;
    }
    
    console.log('Home rice prices fetched successfully:', data);
    // Cast the data to match our RicePrice interface
    return data as unknown as RicePrice[];
  };

  // Use React Query to fetch rice prices with retry logic for better reliability
  const { data: ricePrices, isLoading, error } = useQuery({
    queryKey: ['homeRicePrices'],
    queryFn: fetchRicePrices,
    retry: 2, // Retry failed requests up to 2 times
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false // Don't refetch when window regains focus
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
