import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  fetchWholeGrainData, 
  fetchIngredientsData, 
  fetchImpuritiesData,
  fetchAllData
} from "@/utils/deviceMeasurementUtils";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";

/**
 * Custom hook to fetch measurement data for a specific device
 */
export const useDeviceData = (deviceCode: string | undefined) => {
  // Get query client for invalidating queries
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Determine if queries should be enabled
  const isQueryEnabled = !!deviceCode && deviceCode !== 'default';

  // Function to refresh all data
  const refreshData = useCallback(() => {
    if (isQueryEnabled) {
      queryClient.invalidateQueries({ queryKey: ['wholeGrainData', deviceCode] });
      queryClient.invalidateQueries({ queryKey: ['ingredientsData', deviceCode] });
      queryClient.invalidateQueries({ queryKey: ['impuritiesData', deviceCode] });
      queryClient.invalidateQueries({ queryKey: ['allData', deviceCode] });
      queryClient.invalidateQueries({ queryKey: ['notificationSettings', deviceCode, user?.id] });
    }
  }, [queryClient, deviceCode, isQueryEnabled, user?.id]);

  // Fetch notification settings for this device
  const { data: notificationSettings } = useQuery({
    queryKey: ['notificationSettings', deviceCode, user?.id],
    queryFn: async () => {
      if (!deviceCode || !user?.id) return [];

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('device_code', deviceCode)
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error fetching notification settings:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: isQueryEnabled && !!user?.id,
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
    isLoadingAllData,
    refreshData
  };
};
