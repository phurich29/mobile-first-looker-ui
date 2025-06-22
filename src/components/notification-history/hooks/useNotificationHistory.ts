
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Notification, NotificationFilters } from "../types";

export function useNotificationHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [isCheckingNotifications, setIsCheckingNotifications] = useState(false);
  const rowsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to fetch notifications with filters
  const fetchNotifications = useCallback(async (): Promise<{
    notifications: Notification[];
    totalCount: number;
    totalPages: number;
  }> => {
    try {
      console.log("📊 Fetching notifications - Page:", currentPage, "Filters:", filters);
      
      // Build query with filters
      let query = supabase
        .from("notifications")
        .select("*", { count: "exact" });

      // Apply filters
      if (filters.deviceCode) {
        query = query.ilike("device_code", `%${filters.deviceCode}%`);
      }

      if (filters.searchTerm) {
        query = query.ilike("notification_message", `%${filters.searchTerm}%`);
      }

      if (filters.dateFrom) {
        query = query.gte("timestamp", filters.dateFrom);
      }

      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        query = query.lte("timestamp", dateTo.toISOString());
      }

      if (filters.onlyUnread) {
        query = query.eq("read", false);
      }

      // Get count first
      const { count, error: countError } = await query;
      
      if (countError) {
        console.error("❌ Count error:", countError);
        throw countError;
      }
      
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / rowsPerPage);
      
      // Calculate pagination
      const from = (currentPage - 1) * rowsPerPage;
      const to = from + rowsPerPage - 1;
      
      // Fetch actual data
      const { data, error } = await query
        .order("timestamp", { ascending: false })
        .range(from, to);
        
      if (error) {
        console.error("❌ Fetch error:", error);
        throw error;
      }
      
      console.log("✅ Fetched notifications:", data?.length || 0);
      
      return {
        notifications: (data as Notification[]) || [],
        totalCount,
        totalPages
      };
    } catch (error) {
      console.error("🚨 fetchNotifications error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลประวัติการแจ้งเตือนได้",
        variant: "destructive",
      });
      return {
        notifications: [],
        totalCount: 0,
        totalPages: 0
      };
    }
  }, [currentPage, filters, rowsPerPage, toast]);

  // Use React Query for data management
  const { 
    data: queryResult = { notifications: [], totalCount: 0, totalPages: 0 },
    isLoading,
    refetch,
    isFetching,
    error
  } = useQuery({
    queryKey: ['notification_history', currentPage, filters],
    queryFn: fetchNotifications,
    staleTime: 10000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { notifications, totalCount, totalPages } = queryResult;

  // Manual notification check
  const handleManualCheck = useCallback(async () => {
    console.log("🔄 Manual notification check started");
    
    toast({
      title: "กำลังตรวจสอบการแจ้งเตือน...",
      description: "กำลังเรียกใช้ฟังก์ชันตรวจสอบ",
    });
    
    setIsCheckingNotifications(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('check_notifications', {
        method: 'POST',
        body: { 
          timestamp: new Date().toISOString(),
          checkType: 'manual'
        }
      });
      
      if (error) {
        console.error("❌ Manual check error:", error);
        throw error;
      }
      
      const notificationCount = data?.notificationCount || 0;
      console.log("✅ Manual check result:", notificationCount);
      
      toast({
        title: "ตรวจสอบการแจ้งเตือนสำเร็จ",
        description: notificationCount > 0
          ? `พบการแจ้งเตือนใหม่/อัปเดต ${notificationCount} รายการ`
          : "ไม่พบการแจ้งเตือนใหม่", 
        variant: "update",
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notification_history'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
    } catch (error) {
      console.error("🚨 Manual check failed:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเรียกใช้ฟังก์ชันตรวจสอบการแจ้งเตือนได้",
        variant: "destructive",
      });
    } finally {
      setIsCheckingNotifications(false);
    }
  }, [toast, queryClient]);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    console.log("🔄 Manual refresh triggered");
    refetch();
    toast({
      title: "รีเฟรชข้อมูล",
      description: "อัปเดตข้อมูลประวัติการแจ้งเตือนล่าสุด",
    });
  }, [refetch, toast]);

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    
    console.log("📄 Page change:", currentPage, "→", page);
    setCurrentPage(page);
  }, [totalPages, currentPage]);

  // Filters change handler
  const handleFiltersChange = useCallback((newFilters: NotificationFilters) => {
    console.log("🔍 Filters changed:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  return {
    notifications,
    isLoading,
    isFetching,
    error,
    totalCount,
    totalPages,
    currentPage,
    filters,
    isCheckingNotifications,
    handleManualCheck,
    handleRefresh,
    handlePageChange,
    handleFiltersChange,
    refetch
  };
}
