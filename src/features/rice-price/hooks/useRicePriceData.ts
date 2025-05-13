
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";
import { toast } from "@/hooks/use-toast";

export function useRicePriceData() {
  // Function to fetch rice prices
  const fetchRicePrices = async () => {
    console.log('Fetching public rice prices...');
    try {
      const { data, error } = await supabase
        .from('rice_prices')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching rice prices:', error);
        throw error;
      }
      
      console.log('Rice prices data fetched:', data);
      return data as unknown as RicePrice[];
    } catch (error) {
      console.error('Exception when fetching rice prices:', error);
      throw error;
    }
  };

  // Function to fetch rice price documents
  const fetchRicePriceDocuments = async () => {
    console.log('Fetching rice price documents...');
    try {
      const { data, error } = await supabase
        .from('rice_price_documents')
        .select('*')
        .order('document_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching rice price documents:', error);
        throw error;
      }
      
      console.log('Rice price documents data fetched:', data);
      return data as unknown as RicePriceDocument[];
    } catch (error) {
      console.error('Exception when fetching rice price documents:', error);
      throw error;
    }
  };

  // Use React Query to fetch and cache rice prices
  const { 
    data: ricePrices, 
    isLoading: isPricesLoading, 
    error: pricesError 
  } = useQuery({
    queryKey: ['ricePricesPublic'],
    queryFn: fetchRicePrices
  });

  // Use React Query to fetch and cache rice price documents
  const { 
    data: ricePriceDocuments, 
    isLoading: isDocsLoading, 
    error: docsError 
  } = useQuery({
    queryKey: ['ricePriceDocumentsPublic'],
    queryFn: fetchRicePriceDocuments
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
