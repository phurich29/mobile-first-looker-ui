
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

export function usePriceData() {
  const { toast } = useToast();

  // Function to fetch rice prices
  const fetchRicePrices = async () => {
    console.log('Fetching rice prices...');
    try {
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
    } catch (err) {
      console.error('Exception in fetchRicePrices:', err);
      throw err;
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
      
      console.log('Rice price documents data:', data);
      return data as unknown as RicePriceDocument[];
    } catch (err) {
      console.error('Exception in fetchRicePriceDocuments:', err);
      throw err;
    }
  };

  // Use React Query to fetch and cache rice prices with better error handling
  const { 
    data: ricePrices, 
    isLoading: isPricesLoading, 
    error: pricesError, 
    refetch: refetchPrices 
  } = useQuery({
    queryKey: ['ricePrices'],
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
    queryKey: ['ricePriceDocuments'],
    queryFn: fetchRicePriceDocuments,
    retry: 3,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  // Show error toast if there's an error after retry attempts
  useEffect(() => {
    if (pricesError) {
      console.error('Error in ricePrices query:', pricesError);
      toast({
        title: "ไม่สามารถโหลดข้อมูลราคาข้าวได้",
        description: "กรุณาลองใหม่อีกครั้งในภายหลัง",
        variant: "destructive"
      });
    }
  }, [pricesError, toast]);

  // Show error toast if there's an error after retry attempts
  useEffect(() => {
    if (docsError) {
      console.error('Error in ricePriceDocuments query:', docsError);
      toast({
        title: "ไม่สามารถโหลดข้อมูลเอกสารได้",
        description: "กรุณาลองใหม่อีกครั้งในภายหลัง",
        variant: "destructive"
      });
    }
  }, [docsError, toast]);

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
