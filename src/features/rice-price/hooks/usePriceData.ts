
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";

export function usePriceData() {
  // Function to fetch rice prices
  const fetchRicePrices = async () => {
    console.log('Fetching rice prices...');
    const { data, error } = await supabase
      .from('rice_prices')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching rice prices:', error);
      throw error;
    }
    
    console.log('Rice prices data:', data);
    return data as unknown as RicePrice[];
  };

  // Function to fetch rice price documents
  const fetchRicePriceDocuments = async () => {
    console.log('Fetching rice price documents...');
    const { data, error } = await supabase
      .from('rice_price_documents')
      .select('*')
      .order('document_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching rice price documents:', error);
      throw error;
    }
    
    console.log('Rice price documents data:', data);
    return data as unknown as RicePriceDocument[];
  };

  // Use React Query to fetch and cache rice prices
  const { 
    data: ricePrices, 
    isLoading: isPricesLoading, 
    error: pricesError, 
    refetch: refetchPrices 
  } = useQuery({
    queryKey: ['ricePrices'],
    queryFn: fetchRicePrices
  });

  // Use React Query to fetch and cache rice price documents
  const { 
    data: ricePriceDocuments, 
    isLoading: isDocsLoading, 
    error: docsError, 
    refetch: refetchDocs 
  } = useQuery({
    queryKey: ['ricePriceDocuments'],
    queryFn: fetchRicePriceDocuments
  });

  return {
    ricePrices,
    ricePriceDocuments,
    isPricesLoading,
    isDocsLoading,
    pricesError,
    docsError,
    refetchPrices,
    refetchDocs
  };
}
