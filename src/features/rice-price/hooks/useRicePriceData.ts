
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";

export function useRicePriceData() {
  // Function to fetch rice prices
  const fetchRicePrices = async () => {
    console.log('Fetching rice prices for public view...');
    try {
      const { data, error } = await supabase
        .from('rice_prices')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching rice prices:', error);
        throw error;
      }
      
      console.log('Rice prices data retrieved:', data?.length || 0, 'items');
      return data as unknown as RicePrice[];
    } catch (err) {
      console.error('Exception in fetchRicePrices:', err);
      throw err;
    }
  };

  // Function to fetch rice price documents
  const fetchRicePriceDocuments = async () => {
    console.log('Fetching rice price documents for public view...');
    try {
      const { data, error } = await supabase
        .from('rice_price_documents')
        .select('*')
        .order('document_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching rice price documents:', error);
        throw error;
      }
      
      console.log('Rice price documents data retrieved:', data?.length || 0, 'items');
      return data as unknown as RicePriceDocument[];
    } catch (err) {
      console.error('Exception in fetchRicePriceDocuments:', err);
      throw err;
    }
  };

  // Use React Query to fetch and cache rice prices
  const { 
    data: ricePrices, 
    isLoading: isPricesLoading, 
    error: pricesError 
  } = useQuery({
    queryKey: ['ricePricesPublic'],
    queryFn: fetchRicePrices,
    retry: 2,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });

  // Use React Query to fetch and cache rice price documents
  const { 
    data: ricePriceDocuments, 
    isLoading: isDocsLoading, 
    error: docsError 
  } = useQuery({
    queryKey: ['ricePriceDocumentsPublic'],
    queryFn: fetchRicePriceDocuments,
    retry: 2,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });

  return {
    ricePrices,
    ricePriceDocuments,
    isPricesLoading,
    isDocsLoading,
    pricesError,
    docsError
  };
}
