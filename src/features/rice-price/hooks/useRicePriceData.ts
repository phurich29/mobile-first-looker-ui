
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";

export function useRicePriceData() {
  // Function to fetch rice prices
  const fetchRicePrices = async () => {
    const { data, error } = await supabase
      .from('rice_prices')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as unknown as RicePrice[];
  };

  // Function to fetch rice price documents
  const fetchRicePriceDocuments = async () => {
    const { data, error } = await supabase
      .from('rice_price_documents')
      .select('*')
      .order('document_date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as unknown as RicePriceDocument[];
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
