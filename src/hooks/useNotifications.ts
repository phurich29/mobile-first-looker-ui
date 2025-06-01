
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Notification, transformNotificationData } from "@/components/sharedNotificationData";
import { useQueryClient, useQuery } from "@tanstack/react-query";

export const useNotifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Removed lastRefreshTime state
  const [isCheckingNotifications, setIsCheckingNotifications] = useState(false);

  // Function to fetch notification data from the database
  const fetchNotifications = useCallback(async () => {
    try {
      // Fetch data from notification_settings table
      const { data, error } = await supabase
        .from("notification_settings")
        .select(`
          id,
          rice_type_id,
          rice_type_name,
          min_threshold,
          max_threshold,
          enabled,
          device_code,
          min_enabled,
          max_enabled
        `)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching notification settings:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Transform the data
      const transformedData = transformNotificationData(data);
      // setLastRefreshTime removed, will use dataUpdatedAt from useQuery
      return transformedData;
    } catch (error) {
      console.error("Error in fetchNotifications:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายการการแจ้งเตือนได้",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Use React Query to handle data fetching with caching
  const { data: notifications = [], isLoading: loading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 45000, // Auto-refetch every 45 seconds
    refetchIntervalInBackground: true, // Refetch even when tab is not active
  });

  // Subscribe to real-time notification updates
  useEffect(() => {
    const channel = supabase
      .channel('notification_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        (payload) => {
          console.log('Real-time notification update:', payload);
          // Invalidate the queries to refresh the data
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notification_history'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Function to manually check notifications via the edge function
  const checkNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setIsCheckingNotifications(true);
      
      toast({
        title: "กำลังตรวจสอบการแจ้งเตือน...",
        description: "กำลังเรียกใช้ฟังก์ชันตรวจสอบ",
      });
      
      const { data, error } = await supabase.functions.invoke('check_notifications', {
        method: 'POST',
        body: { 
          timestamp: new Date().toISOString(),
          checkType: 'manual' // Adding parameter to indicate this is a manual check
        },
      });
      
      if (error) {
        console.error("Error checking notifications:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถตรวจสอบการแจ้งเตือนได้",
          variant: "destructive",
        });
        return false;
      }
      
      const notificationCount = data?.notificationCount || 0;
      
      toast({
        title: "ตรวจสอบการแจ้งเตือนสำเร็จ",
        description: notificationCount > 0
          ? `พบการแจ้งเตือนใหม่/อัพเดท ${notificationCount} รายการ`
          : "ไม่พบการแจ้งเตือนใหม่", 
        variant: "update",
      });
      
      // Invalidate query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Also invalidate notification history
      queryClient.invalidateQueries({ queryKey: ['notification_history'] });
      
      return true;
    } catch (error) {
      console.error("Error invoking check_notifications function:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเรียกใช้ฟังก์ชันตรวจสอบการแจ้งเตือนได้",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCheckingNotifications(false);
    }
  }, [toast, queryClient]);

  return {
    notifications,
    loading,
    isFetching,
    isCheckingNotifications,
    lastRefreshTime: dataUpdatedAt, // Use dataUpdatedAt from useQuery
    fetchNotifications: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    checkNotifications
  };
};
