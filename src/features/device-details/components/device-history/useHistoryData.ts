
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RiceQualityData } from './types';

const ITEMS_PER_PAGE = 20;

export const useHistoryData = (deviceCode: string) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['deviceHistory', deviceCode, currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      
      const { data, error, count } = await supabase
        .from('rice_quality_analysis')
        .select('*', { count: 'exact' })
        .eq('device_code', deviceCode)
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) throw error;
      
      return { data: data as RiceQualityData[], count: count || 0 };
    },
  });

  const totalPages = historyData ? Math.ceil(historyData.count / ITEMS_PER_PAGE) : 0;

  return {
    historyData: historyData?.data || [],
    totalCount: historyData?.count || 0,
    currentPage,
    totalPages,
    isLoading,
    error,
    setCurrentPage
  };
};
