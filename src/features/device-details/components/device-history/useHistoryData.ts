
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
        .select('*, output', { count: 'exact' });

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
      
      // Get unique device codes from the results
      const deviceCodes = [...new Set(data?.map(item => item.device_code))];
      
      // Fetch device display names if we have device codes
      let deviceNamesMap: Record<string, string> = {};
      if (deviceCodes.length > 0) {
        const { data: deviceSettings, error: deviceError } = await supabase
          .from('device_settings')
          .select('device_code, display_name')
          .in('device_code', deviceCodes);
          
        if (deviceError) {
          console.error('Error fetching device settings:', deviceError);
        } else if (deviceSettings) {
          deviceNamesMap = deviceSettings.reduce((acc, device) => ({
            ...acc,
            [device.device_code]: device.display_name || device.device_code
          }), {});
        }
      }
      
      // Add device_display_name and ensure all required fields exist with defaults
      const enhancedData = data?.map(item => ({
        ...item,
        device_display_name: deviceNamesMap[item.device_code] || item.device_code,
        // Add default values for new columns if they don't exist
        mix_rate: item.mix_rate ?? null,
        sprout_rate: item.sprout_rate ?? null,
        unripe_rate: item.unripe_rate ?? null,
        brown_rice_rate: item.brown_rice_rate ?? null,
        main_rate: item.main_rate ?? null,
        mix_index: item.mix_index ?? null,
        main_index: item.main_index ?? null,
      }));
      
      return { data: enhancedData as RiceQualityData[], count: count || 0 };
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
