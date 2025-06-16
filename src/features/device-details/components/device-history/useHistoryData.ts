
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RiceQualityData } from './types';

export const useHistoryData = (deviceCode: string) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['deviceHistory', deviceCode, currentPage, itemsPerPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * itemsPerPage;
      
      const { data, error, count } = await supabase
        .from('rice_quality_analysis')
        .select('*', { count: 'exact' })
        .eq('device_code', deviceCode)
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (error) throw error;
      
      return { data: data as RiceQualityData[], count: count || 0 };
    },
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
