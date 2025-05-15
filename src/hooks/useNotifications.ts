
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Notification, transformNotificationData } from "@/components/sharedNotificationData";

export const useNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // Function to fetch notification data from the database
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
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
        setNotifications([]);
        return [];
      }

      // Transform the data
      const transformedData = transformNotificationData(data);
      setNotifications(transformedData);
      setLastRefreshTime(new Date());
      return transformedData;
    } catch (error) {
      console.error("Error in fetchNotifications:", error);
      setTimeout(() => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดรายการการแจ้งเตือนได้",
          variant: "destructive",
        });
      }, 0);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to manually check notifications via the edge function
  const checkNotifications = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('check_notifications');
      
      if (error) {
        console.error("Error checking notifications:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถตรวจสอบการแจ้งเตือนได้",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "ตรวจสอบการแจ้งเตือนสำเร็จ",
        variant: "update",
      });
      
      // Reload notifications after checking
      await fetchNotifications();
      return true;
    } catch (error) {
      console.error("Error invoking check_notifications function:", error);
      return false;
    }
  };

  return {
    notifications,
    loading,
    lastRefreshTime,
    fetchNotifications,
    checkNotifications
  };
};
