import { Header } from "@/components/Header";
import { NewsSlider } from "@/components/NewsSlider";
import { WatchlistSection } from "@/components/WatchlistSection";
import { FooterNav } from "@/components/FooterNav";
import { IconMenu } from "@/components/IconMenu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice } from "@/features/user-management/types";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

const Index = () => {
  const { toast } = useToast();
  
  // Function to fetch rice prices for the homepage
  const fetchRicePrices = async () => {
    console.log('Fetching home rice prices...');
    try {
      // First attempt - try to get rice prices with order and limit
      const { data, error } = await supabase
        .from('rice_prices')
        .select('*')
        .order('name', { ascending: true })
        .limit(8);
      
      if (error) {
        console.error('Error fetching home rice prices:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Home rice prices fetched successfully:', data.length, 'items');
        return data as unknown as RicePrice[];
      }
      
      // If no data found with ordering, try without ordering as fallback
      console.log('No rice prices found with ordering, trying without ordering...');
      const fallbackResult = await supabase
        .from('rice_prices')
        .select('*')
        .limit(8);
        
      if (fallbackResult.error) {
        console.error('Error in fallback rice price fetch:', fallbackResult.error);
        throw fallbackResult.error;
      }
      
      console.log('Fallback rice prices fetch result:', fallbackResult.data?.length || 0, 'items');
      return fallbackResult.data as unknown as RicePrice[];
    } catch (err) {
      console.error('Exception in fetchRicePrices:', err);
      throw err;
    }
  };

  // Use React Query to fetch rice prices with retry logic for better reliability
  const { data: ricePrices, isLoading, error, refetch } = useQuery({
    queryKey: ['homeRicePrices'],
    queryFn: fetchRicePrices,
    retry: 3, // Retry failed requests up to 3 times
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });

  // Effect to refetch data if initial load has no results
  useEffect(() => {
    if (!isLoading && !error && (!ricePrices || ricePrices.length === 0)) {
      // Wait 2 seconds and try again if we didn't get any data
      const timer = setTimeout(() => {
        console.log('No rice prices found initially, refetching...');
        refetch();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [ricePrices, isLoading, error, refetch]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      
      <main className="flex-1 pb-32">
        <div className="mt-4">
          {/* News slider section */}
          <div className="mt-4 mx-4">
            <NewsSlider />
          </div>
          
          {/* Replace RicePriceCarousel with IconMenu */}
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
