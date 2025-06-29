
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RiceQualityData } from './types';

export const useHistoryData = (deviceCode?: string) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['deviceHistory', deviceCode || 'all', currentPage, itemsPerPage],
    queryFn: async () => {
      console.log('Fetching history data for device:', deviceCode);
      const offset = (currentPage - 1) * itemsPerPage;
      
      let query = supabase
        .from('rice_quality_analysis')
        .select('*', { count: 'exact' });

      // Only filter by device_code if it's provided and not 'default'
      if (deviceCode && deviceCode !== 'default') {
        query = query.eq('device_code', deviceCode);
        console.log('Filtering by device_code:', deviceCode);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (error) {
        console.error('Error fetching history data:', error);
        throw error;
      }
      
      console.log('Successfully fetched history data:', { count, dataLength: data?.length });
      return { data: data as RiceQualityData[], count: count || 0 };
    },
    enabled: true, // Always enable the query
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const totalPages = historyData ? Math.ceil(historyData.count / itemsPerPage) : 0;

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    historyData: historyData?.data || [],
    totalCount: historyData?.count || 0,
    currentPage,
    totalPages,
    itemsPerPage,
    isLoading,
    error,
    setCurrentPage,
    setItemsPerPage: handleItemsPerPageChange
  };
};
