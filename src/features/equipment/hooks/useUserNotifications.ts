import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export const useUserNotifications = (deviceCode: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-notifications', deviceCode, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('enabled')
        .eq('device_code', deviceCode)
        .eq('user_id', user.id)
        .eq('enabled', true);
      
      if (error) {
        console.error('Error fetching user notifications:', error);
        return false;
      }
      
      return data && data.length > 0;
    },
    staleTime: 30000, // Cache for 30 seconds
    enabled: !!user?.id,
  });
};