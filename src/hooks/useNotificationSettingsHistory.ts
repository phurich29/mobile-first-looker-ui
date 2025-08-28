import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationSettingsHistoryItem {
  id: string;
  user_id: string;
  device_code: string;
  rice_type_id: string;
  rice_type_name: string;
  action_type: 'created' | 'updated' | 'deleted';
  old_settings?: any;
  new_settings?: any;
  created_at: string;
  created_by: string;
}

export const useNotificationSettingsHistory = (deviceCode?: string, riceTypeId?: string) => {
  const [history, setHistory] = useState<NotificationSettingsHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [deviceCode, riceTypeId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('notification_settings_history')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by device code and rice type if provided
      if (deviceCode) {
        query = query.eq('device_code', deviceCode);
      }
      if (riceTypeId) {
        query = query.eq('rice_type_id', riceTypeId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Type assertion to ensure compatibility
      const typedData: NotificationSettingsHistoryItem[] = (data || []).map(item => ({
        ...item,
        action_type: item.action_type as 'created' | 'updated' | 'deleted'
      }));

      setHistory(typedData);
    } catch (err: any) {
      console.error('Error fetching notification settings history:', err);
      setError(err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  return {
    history,
    loading,
    error,
    refetch: fetchHistory
  };
};