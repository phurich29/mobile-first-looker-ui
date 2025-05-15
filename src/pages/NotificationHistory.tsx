
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, BellOff, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Badge } from "@/components/ui/badge";

interface NotificationHistoryItem {
  id: string;
  device_code: string;
  device_name?: string;
  timestamp: string;
  threshold_type: 'min' | 'max';
  value: number;
  rice_type_id: string;
  notification_message: string | null;
  read: boolean;
  notification_count: number;
}

const NotificationHistory = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Fetch notifications
        const { data: notificationData, error: notificationError } = await supabase
          .from('notifications')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);
          
        if (notificationError) throw notificationError;

        // Get unique device codes to fetch device names
        const deviceCodes = [...new Set(notificationData.map((n: any) => n.device_code))];
        
        if (deviceCodes.length > 0) {
          const { data: deviceData, error: deviceError } = await supabase
            .from('device_settings')
            .select('device_code, display_name')
            .in('device_code', deviceCodes);
            
          if (deviceError) throw deviceError;
          
          // Map device names to notifications
          const enrichedNotifications = notificationData.map((notification: any) => {
            const device = deviceData.find((d: any) => d.device_code === notification.device_code);
            return {
              ...notification,
              device_name: device?.display_name || notification.device_code
            };
          });
          
          setNotifications(enrichedNotifications);
        } else {
          setNotifications(notificationData);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('ไม่สามารถโหลดประวัติการแจ้งเตือนได้');
        toast({
          variant: "destructive",
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดประวัติการแจ้งเตือนได้"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [toast]);

  const handleGoBack = () => {
    window.history.back();
  };

  // Function to format timestamp into Thai date-time format
  const formatThaiDateTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Function to create a readable notification message
  const getNotificationMessage = (notification: NotificationHistoryItem) => {
    if (notification.notification_message) {
      return notification.notification_message;
    }
    
    const thresholdType = notification.threshold_type === 'max' ? 'สูงกว่า' : 'ต่ำกว่า';
    return `ค่า "${notification.rice_type_id}" ${thresholdType} "${notification.value}"`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-60">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
          <p className="text-emerald-700">กำลังโหลดประวัติการแจ้งเตือน...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-60 text-center">
          <BellOff className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 font-medium text-lg mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-gray-600">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            ลองใหม่
          </Button>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-60 text-center">
          <BellOff className="h-12 w-12 text-amber-500 mb-4" />
          <p className="text-gray-700 font-medium text-lg mb-2">ไม่มีประวัติการแจ้งเตือน</p>
          <p className="text-gray-600">ยังไม่มีการแจ้งเตือนใดๆ ที่บันทึกไว้</p>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Bell className="mr-2 h-5 w-5 text-emerald-600" />
            ประวัติการแจ้งเตือนทั้งหมด
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            // Mobile view - Card list
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`border rounded-lg p-4 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <div className="flex justify-between mb-2">
                    <p className="font-medium text-emerald-700">
                      {notification.device_name || notification.device_code}
                    </p>
                    <Badge variant={notification.threshold_type === 'max' ? 'destructive' : 'warning'}>
                      {notification.threshold_type === 'max' ? 'สูงเกินกำหนด' : 'ต่ำกว่ากำหนด'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    {getNotificationMessage(notification)}
                  </p>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <p>{formatThaiDateTime(notification.timestamp)}</p>
                    <p>แจ้งเตือนแล้ว {notification.notification_count} ครั้ง</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop view - Table
            <ResponsiveTable>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่ เวลา</TableHead>
                  <TableHead>การแจ้งเตือน</TableHead>
                  <TableHead>อุปกรณ์</TableHead>
                  <TableHead>จำนวนครั้ง</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id} className={notification.read ? '' : 'bg-blue-50'}>
                    <TableCell className="whitespace-nowrap">
                      {formatThaiDateTime(notification.timestamp)}
                    </TableCell>
                    <TableCell>
                      {getNotificationMessage(notification)}
                    </TableCell>
                    <TableCell>
                      {notification.device_name || notification.device_code}
                    </TableCell>
                    <TableCell className="text-center">
                      {notification.notification_count}
                    </TableCell>
                    <TableCell>
                      <Badge variant={notification.read ? 'outline' : 'secondary'}>
                        {notification.read ? 'อ่านแล้ว' : 'ยังไม่ได้อ่าน'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ResponsiveTable>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-7xl px-4 ${!isMobile ? 'py-8' : 'pt-4 pb-6'}`}>
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="mb-4 flex items-center text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>ย้อนกลับ</span>
          </Button>

          <h1 className="text-2xl font-semibold text-emerald-800 mb-6">ประวัติการแจ้งเตือน</h1>
          {renderContent()}
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default NotificationHistory;
