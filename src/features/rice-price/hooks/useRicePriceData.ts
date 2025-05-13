
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

export function useRicePriceData() {
  const { toast } = useToast();
  
  // Function to fetch rice prices
  const fetchRicePrices = async () => {
    console.log('Fetching rice prices for public view...');
    try {
      // First try with ordering
      const { data, error } = await supabase
        .from('rice_prices')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching rice prices:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Rice prices data retrieved:', data.length, 'items');
        return data as unknown as RicePrice[];
      }
      
      // Try without ordering as fallback
      console.log('No rice prices found with ordering, trying without ordering...');
      const fallbackResult = await supabase
        .from('rice_prices')
        .select('*');
        
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
    error: pricesError,
    refetch: refetchPrices 
  } = useQuery({
    queryKey: ['ricePricesPublic'],
    queryFn: fetchRicePrices,
    retry: 3,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });

  // Use React Query to fetch and cache rice price documents
  const { 
    data: ricePriceDocuments, 
    isLoading: isDocsLoading, 
    error: docsError,
    refetch: refetchDocs
  } = useQuery({
    queryKey: ['ricePriceDocumentsPublic'],
    queryFn: fetchRicePriceDocuments,
    retry: 3,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });

  // Effect to retry fetching if there's no data initially
  useEffect(() => {
    if (!isPricesLoading && !pricesError && (!ricePrices || ricePrices.length === 0)) {
      // Wait 2 seconds and try refetching if we didn't get any data
      const timer = setTimeout(() => {
        console.log('No rice prices found initially, refetching...');
        refetchPrices();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [ricePrices, isPricesLoading, pricesError, refetchPrices]);

  // Show error toast if there's an error after retry attempts
  useEffect(() => {
    if (pricesError) {
      toast({
        title: "ไม่สามารถโหลดข้อมูลราคาข้าวได้",
        description: "กรุณาลองใหม่อีกครั้งในภายหลัง",
        variant: "destructive"
      });
    }
  }, [pricesError, toast]);

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
