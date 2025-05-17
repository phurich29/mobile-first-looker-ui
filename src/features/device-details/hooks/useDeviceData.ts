
import { useQuery } from "@tanstack/react-query";
import { 
  fetchWholeGrainData, 
  fetchIngredientsData, 
  fetchImpuritiesData,
  fetchAllData
} from "@/utils/deviceMeasurementUtils";
import { supabase } from "@/integrations/supabase/client";

/**
 * Custom hook to fetch measurement data for a specific device
 */
export const useDeviceData = (deviceCode: string | undefined) => {
  // Determine if queries should be enabled
  const isQueryEnabled = !!deviceCode && deviceCode !== 'default';

  // Fetch notification settings for this device
  const { data: notificationSettings } = useQuery({
    queryKey: ['notificationSettings', deviceCode],
    queryFn: async () => {
      if (!deviceCode) return [];
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('device_code', deviceCode);
        
      if (error) {
        console.error("Error fetching notification settings:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: isQueryEnabled,
  });

  // Use React Query for data fetching
  const { data: wholeGrainData, isLoading: isLoadingWholeGrain } = useQuery({
    queryKey: ['wholeGrainData', deviceCode],
    queryFn: () => deviceCode ? fetchWholeGrainData(deviceCode) : Promise.resolve(null),
    enabled: isQueryEnabled,
  });

  const { data: ingredientsData, isLoading: isLoadingIngredients } = useQuery({
    queryKey: ['ingredientsData', deviceCode],
    queryFn: () => deviceCode ? fetchIngredientsData(deviceCode) : Promise.resolve(null),
    enabled: isQueryEnabled,
  });
  
  const { data: impuritiesData, isLoading: isLoadingImpurities } = useQuery({
    queryKey: ['impuritiesData', deviceCode],
    queryFn: () => deviceCode ? fetchImpuritiesData(deviceCode) : Promise.resolve(null),
    enabled: isQueryEnabled,
  });
  
  const { data: allData, isLoading: isLoadingAllData } = useQuery({
    queryKey: ['allData', deviceCode],
    queryFn: () => deviceCode ? fetchAllData(deviceCode) : Promise.resolve(null),
    enabled: isQueryEnabled,
  });

  return {
    wholeGrainData,
    ingredientsData,
    impuritiesData,
    allData,
    notificationSettings,
    isLoadingWholeGrain,
    isLoadingIngredients,
    isLoadingImpurities,
    isLoadingAllData
  };
};
