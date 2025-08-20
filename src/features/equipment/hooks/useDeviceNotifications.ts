import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDeviceNotifications = (deviceCode: string) => {
  return useQuery({
    queryKey: ['device-notifications', deviceCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('enabled')
        .eq('device_code', deviceCode)
        .eq('enabled', true);
      
      if (error) {
        console.error('Error fetching device notifications:', error);
        return false;
      }
      
      return data && data.length > 0;
    },
    staleTime: 30000, // Cache for 30 seconds
  });
};