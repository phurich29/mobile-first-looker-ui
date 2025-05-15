
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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

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
}

export const NotificationHistoryList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const rowsPerPage = 10;
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Fetch total count for pagination
      const { count, error: countError } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true });
        
      if (countError) {
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
        throw error;
      }
      
      setNotifications(data as Notification[]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลประวัติการแจ้งเตือนได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (deviceCode: string, riceTypeId: string) => {
    navigate(`/measurement-history/${deviceCode}/${riceTypeId}`);
  };

  const handleRefresh = () => {
    fetchNotifications();
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
        <h2 className="text-lg font-semibold">ประวัติการแจ้งเตือน</h2>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          className="flex items-center gap-1"
          size="sm"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>รีเฟรช</span>
        </Button>
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
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เวลา</TableHead>
                  <TableHead>อุปกรณ์</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>ค่าวัด</TableHead>
                  <TableHead>ข้อความ</TableHead>
                  <TableHead className="text-right">จำนวนครั้ง</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(notification.timestamp)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {notification.device_code}
                    </TableCell>
                    <TableCell>
                      {getThresholdBadge(notification.threshold_type)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {notification.value.toFixed(2)}
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
