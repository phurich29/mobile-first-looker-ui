
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RiceQualityData } from './types';

export const useHistoryData = (deviceIds?: string[]) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['deviceHistory', deviceIds || 'all', currentPage, itemsPerPage],
    queryFn: async () => {
      console.log('Fetching history data for devices:', deviceIds);
      const offset = (currentPage - 1) * itemsPerPage;
      
      let query = supabase
        .from('rice_quality_analysis')
        .select('*', { count: 'exact' });

            // Filter by device_ids if the array is provided and not empty
      if (deviceIds && deviceIds.length > 0) {
        query = query.in('device_code', deviceIds);
        console.log('Filtering by device_ids:', deviceIds);
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
