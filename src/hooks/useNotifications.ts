
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Notification, transformNotificationData } from "@/components/sharedNotificationData";
import { useQueryClient, useQuery } from "@tanstack/react-query";

export const useNotifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCheckingNotifications, setIsCheckingNotifications] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Function to fetch notification data from the database
  const fetchNotifications = useCallback(async () => {
    if (!isMountedRef.current) {
      console.log("📡 Component unmounted, skipping notification fetch");
      return [];
    }

    const startTime = Date.now();
    console.log("📡 Starting notification fetch at:", new Date().toISOString());
    
    try {
      setError(null);
      
      // Fetch data from notification_settings table with user_id filter (RLS will handle this automatically)
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
          max_enabled,
          user_id
        `)
        .order("id", { ascending: true });

      if (!isMountedRef.current) {
        console.log("📡 Component unmounted during fetch, discarding result");
        return [];
      }

      const fetchTime = Date.now() - startTime;
      console.log(`📡 Notification fetch completed in ${fetchTime}ms`);

      if (error) {
        console.error("❌ Error fetching notification settings:", error);
        if (isMountedRef.current) {
          setError(error.message);
        }
        return [];
      }

      if (!data || data.length === 0) {
        console.log("📡 No notification settings found");
        return [];
      }

      console.log(`📡 Fetched ${data.length} notification settings from DB`);

      // Transform the data
      const transformedData = transformNotificationData(data);
      console.log(`📡 Transformed into ${transformedData.length} notification items`);
      
      return transformedData;
    } catch (error) {
      console.error("❌ Error in fetchNotifications:", error);
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : "Unknown error");
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดรายการการแจ้งเตือนได้",
          variant: "destructive",
        });
      }
      return [];
    }
  }, [toast]);

  // Use React Query to handle data fetching with caching
  const { data: notifications = [], isLoading: loading, isFetching, dataUpdatedAt, error: queryError } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    staleTime: 30000,
    refetchInterval: 45000,
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      console.log(`📡 Query retry attempt ${failureCount}:`, error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Log success when data changes
  useEffect(() => {
    if (notifications.length > 0) {
      console.log("✅ Notifications query success:", {
        count: notifications.length,
        updatedAt: new Date().toISOString()
      });
    }
  }, [notifications]);

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
          if (!isMountedRef.current) return;
          console.log('Real-time notification update:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notification_history'] });
        }
      )
      .subscribe();

    return () => {
      console.log("🔌 Cleaning up notification real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🛑 useNotifications unmounting");
      isMountedRef.current = false;
    };
  }, []);

  // Function to manually check notifications via the edge function
  const checkNotifications = useCallback(async (): Promise<boolean> => {
    if (!isMountedRef.current) return false;
    
    try {
      if (isMountedRef.current) {
        setIsCheckingNotifications(true);
      }
      
      toast({
        title: "กำลังตรวจสอบการแจ้งเตือน...",
        description: "กำลังเรียกใช้ฟังก์ชันตรวจสอบ",
      });
      
      const { data, error } = await supabase.functions.invoke('check_notifications', {
        method: 'POST',
        body: { 
          timestamp: new Date().toISOString(),
          checkType: 'manual'
        },
      });
      
      if (!isMountedRef.current) return false;
      
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
      
      if (isMountedRef.current) {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notification_history'] });
      }
      
      return true;
    } catch (error) {
      console.error("Error invoking check_notifications function:", error);
      if (isMountedRef.current) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเรียกใช้ฟังก์ชันตรวจสอบการแจ้งเตือนได้",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsCheckingNotifications(false);
      }
    }
  }, [toast, queryClient]);

  return {
    notifications,
    loading,
    isFetching,
    isCheckingNotifications,
    error: error || (queryError as Error)?.message || null,
    lastRefreshTime: dataUpdatedAt,
    fetchNotifications: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    checkNotifications
  };
};
