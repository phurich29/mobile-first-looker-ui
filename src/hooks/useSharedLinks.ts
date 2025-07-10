import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Tables } from '@/integrations/supabase/types';

type SharedLink = Tables<'shared_analysis_links'>;

export const useSharedLinks = () => {
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchSharedLinks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shared_analysis_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSharedLinks(data || []);
    } catch (error) {
      console.error('Error fetching shared links:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSharedLink = async (analysisId: number, title: string) => {
    if (!user) {
      console.error('User not authenticated');
      throw new Error('กรุณาเข้าสู่ระบบก่อนแชร์ข้อมูล');
    }

    const shareToken = generateShareToken();
    
    try {
      console.log('Creating shared link for analysis ID:', analysisId);
      const { data, error } = await supabase
        .from('shared_analysis_links')
        .insert({
          analysis_id: analysisId,
          user_id: user.id,
          share_token: shareToken,
          title,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Successfully created shared link:', data);
      setSharedLinks(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating shared link:', error);
      throw error;
    }
  };

  const updateSharedLink = async (id: string, updates: Partial<Pick<SharedLink, 'title' | 'is_active'>>) => {
    try {
      const { data, error } = await supabase
        .from('shared_analysis_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSharedLinks(prev => 
        prev.map(link => link.id === id ? data : link)
      );
      return data;
    } catch (error) {
      console.error('Error updating shared link:', error);
      return null;
    }
  };

  const deleteSharedLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shared_analysis_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSharedLinks(prev => prev.filter(link => link.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting shared link:', error);
      return false;
    }
  };

  const getPublicLink = (shareToken: string) => {
    return `${window.location.origin}/shared/${shareToken}`;
  };

  useEffect(() => {
    if (user) {
      fetchSharedLinks();
    }
  }, [user]);

  return {
    sharedLinks,
    loading,
    createSharedLink,
    updateSharedLink,
    deleteSharedLink,
    getPublicLink,
    refetch: fetchSharedLinks,
  };
};

const generateShareToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};