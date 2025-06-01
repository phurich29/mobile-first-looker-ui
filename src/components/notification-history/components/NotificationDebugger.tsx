
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Notification } from "../types";

export function NotificationDebugger() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ฟังก์ชั่นสำหรับเรียกข้อมูลจาก Edge Function
  async function fetchNotifications() {
    setLoading(true);
    setError(null);
    
    try {
      const { data: response, error } = await supabase.functions.invoke('get_notifications', {
        method: 'GET',
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setNotifications(response.data || []);
      setTotalCount(response.metadata?.totalCount || 0);
      console.log("Fetched notifications:", response);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  }

  // เรียกข้อมูลครั้งแรกเมื่อโหลดคอมโพเนนท์
  useEffect(() => {
    fetchNotifications();
  }, []);

  // ฟังก์ชั่นสำหรับรีเฟรชข้อมูล
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
  };

  return (
    <Card className="w-full shadow-md dark:bg-slate-800 dark:border-slate-700">
      <CardHeader className="bg-slate-50 dark:bg-slate-800 dark:border-b dark:border-slate-700">
        <CardTitle className="text-lg flex items-center justify-between text-gray-900 dark:text-slate-100">
          <span>ข้อมูลการแจ้งเตือนในระบบ</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={loading || isRefreshing}
            className="flex items-center gap-1 text-gray-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            {isRefreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            รีเฟรช
          </Button>
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-slate-400">
          พบข้อมูลทั้งหมด: {totalCount} รายการ
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <Button className="mt-4" variant="outline" onClick={handleRefresh}>ลองใหม่อีกครั้ง</Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400">
            <p>ไม่พบข้อมูลการแจ้งเตือนในระบบ</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex justify-between">
                  <p className="font-medium text-gray-900 dark:text-slate-200">{notification.rice_type_id}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {new Date(notification.timestamp).toLocaleString('th-TH')}
                  </p>
                </div>
                
                <div className="mt-1 flex items-center gap-2">
                  <span 
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      notification.threshold_type === 'max' 
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                    }`}
                  >
                    {notification.threshold_type === 'max' ? 'สูงเกินเกณฑ์' : 'ต่ำกว่าเกณฑ์'}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    ค่าที่วัดได้: <span className="font-medium">{notification.value}</span>
                  </span>
                </div>
                
                <div className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  <p>อุปกรณ์: {notification.device_code}</p>
                  {notification.notification_message && (
                    <p className="mt-1 text-gray-600 dark:text-slate-300">{notification.notification_message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-slate-50 dark:bg-slate-800 dark:border-t dark:border-slate-700 p-3 justify-end">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          สามารถดึงข้อมูลล่าสุดโดยกดปุ่มรีเฟรช
        </p>
      </CardFooter>
    </Card>
  );
}
