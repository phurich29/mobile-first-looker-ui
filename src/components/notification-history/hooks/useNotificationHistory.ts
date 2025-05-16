
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "../types";

export function useNotificationHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isCheckingNotifications, setIsCheckingNotifications] = useState(false);
  const rowsPerPage = 10;
  const { toast } = useToast();

  // Use React Query for data fetching with auto-refresh
  const { 
    data: notifications = [], 
    isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['notification_history', currentPage, rowsPerPage],
    queryFn: async () => {
      try {
        // Fetch total count for pagination
        const { count, error: countError } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true });
          
        if (countError) {
          console.error("Error fetching notification count:", countError);
          throw countError;
        }
        
        setTotalCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / rowsPerPage));
        
        // Calculate pagination range
        const from = (currentPage - 1) * rowsPerPage;
        const to = from + rowsPerPage - 1;
        
        // Fetch notifications with pagination
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("timestamp", { ascending: false })
          .range(from, to);
          
        if (error) {
          console.error("Error fetching notifications:", error);
          throw error;
        }
        
        console.log("Fetched notifications:", data);
        return data as Notification[];
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลประวัติการแจ้งเตือนได้",
          variant: "destructive",
        });
        return [];
      }
    },
    staleTime: 15000, // Consider data fresh for 15 seconds
    refetchInterval: 30000, // Auto-refetch every 30 seconds
  });

  const handleManualCheck = async () => {
    toast({
      title: "กำลังตรวจสอบการแจ้งเตือน...",
      description: "กำลังเรียกใช้ฟังก์ชันตรวจสอบ",
    });
    
    setIsCheckingNotifications(true);
    
    try {
      // Call the edge function to manually trigger notification check
      const { data, error } = await supabase.functions.invoke('check_notifications', {
        method: 'POST',
        body: { timestamp: new Date().toISOString() }
      });
      
      if (error) {
        console.error("Error invoking notification check:", error);
        throw error;
      }
      
      toast({
        title: "ตรวจสอบการแจ้งเตือนสำเร็จ",
        description: "ระบบได้ตรวจสอบการแจ้งเตือนล่าสุดแล้ว",
        variant: "update",
      });
      
      // Refetch notifications after manual check
      refetch();
    } catch (error) {
      console.error("Error invoking notification check:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเรียกใช้ฟังก์ชันตรวจสอบการแจ้งเตือนได้",
        variant: "destructive",
      });
    } finally {
      setIsCheckingNotifications(false);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "รีเฟรชข้อมูล",
      description: "อัปเดตข้อมูลประวัติการแจ้งเตือนล่าสุด",
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  return {
    notifications,
    isLoading,
    isFetching,
    totalCount,
    totalPages,
    currentPage,
    isCheckingNotifications,
    handleManualCheck,
    handleRefresh,
    handlePageChange,
    refetch
  };
}
