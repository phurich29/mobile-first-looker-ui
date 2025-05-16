
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatBangkokTime } from "@/components/measurement-history/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCcw, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export interface Notification {
  id: string;
  device_code: string;
  rice_type_id: string;
  threshold_type: string;
  value: number;
  notification_message: string;
  notification_count: number;
  timestamp: string;
  read: boolean;
  analysis_id?: number;
}

export const NotificationHistoryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const rowsPerPage = 10;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCheckingNotifications, setIsCheckingNotifications] = useState(false);

  // Use React Query for data fetching with auto-refresh
  const { 
    data: notifications = [], 
    isLoading: loading,
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

  // Subscribe to real-time notification changes
  useEffect(() => {
    // Set up subscription to notifications table
    const channel = supabase
      .channel('notification_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        (payload) => {
          console.log('Real-time notification update:', payload);
          // Trigger a refetch when notifications change
          refetch();
          
          // Show toast for new notifications
          if (payload.eventType === 'INSERT') {
            toast({
              title: "มีการแจ้งเตือนใหม่",
              description: "มีข้อมูลการแจ้งเตือนใหม่ถูกเพิ่ม",
              variant: "update",
            });
          }
        }
      )
      .subscribe();
      
    // Clean up subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  const handleViewDetails = (deviceCode: string, riceTypeId: string) => {
    navigate(`/device/${deviceCode}`);
  };

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

  const getThresholdBadge = (type: string) => {
    switch (type) {
      case "max":
        return <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">สูงกว่าค่าสูงสุด</Badge>;
      case "min":
        return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">ต่ำกว่าค่าต่ำสุด</Badge>;
      default:
        return <Badge variant="outline">ไม่ระบุ</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const { thaiDate, thaiTime } = formatBangkokTime(dateString);
    return `${thaiDate} ${thaiTime}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">ประวัติการแจ้งเตือน ({totalCount})</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleManualCheck}
            className="flex items-center gap-1"
            size="sm"
            disabled={isFetching || isCheckingNotifications}
          >
            <Bell className={`h-4 w-4 ${isCheckingNotifications ? 'animate-pulse' : ''}`} />
            <span>ตรวจสอบการแจ้งเตือน</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="flex items-center gap-1"
            size="sm"
            disabled={isFetching}
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-16" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">ไม่พบประวัติการแจ้งเตือน</p>
          <p className="text-sm text-gray-400 mt-1">ยังไม่มีการแจ้งเตือนใดๆ ในระบบ</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>เวลา</TableHead>
                  <TableHead>อุปกรณ์</TableHead>
                  <TableHead>ค่าที่วัด</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>ข้อความ</TableHead>
                  <TableHead className="text-right">จำนวนครั้ง</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-mono text-xs text-gray-500">
                      {notification.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(notification.timestamp)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {notification.device_code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {notification.value?.toFixed(2) || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getThresholdBadge(notification.threshold_type)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {notification.notification_message}
                    </TableCell>
                    <TableCell className="text-right">
                      {notification.notification_count}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(notification.device_code, notification.rice_type_id)}
                      >
                        ดูข้อมูล
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-gray-500">
                รวม {totalCount} รายการ • หน้า {currentPage} จากทั้งหมด {totalPages} หน้า
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationHistoryList;
