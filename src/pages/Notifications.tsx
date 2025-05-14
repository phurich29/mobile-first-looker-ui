
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { BellRing, Bell, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: "info" | "warning" | "alert";
};

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "คุณภาพน้ำต่ำกว่าเกณฑ์",
    description: "คุณภาพน้ำในแปลงนาที่ 1 มีค่า pH ต่ำกว่าเกณฑ์ที่กำหนด",
    timestamp: "2025-05-14T08:30:00",
    isRead: false,
    type: "warning"
  },
  {
    id: "2",
    title: "อุปกรณ์แจ้งเตือนสถานะแบตเตอรี่",
    description: "อุปกรณ์ IoT ในแปลงนาที่ 2 มีแบตเตอรี่เหลือน้อยกว่า 20%",
    timestamp: "2025-05-13T14:15:00",
    isRead: false,
    type: "alert"
  },
  {
    id: "3",
    title: "อัพเดทราคาข้าวประจำวัน",
    description: "ราคาข้าวหอมมะลิมีการปรับเพิ่มขึ้น 5% จากราคาเมื่อวาน",
    timestamp: "2025-05-12T09:00:00",
    isRead: true,
    type: "info"
  },
  {
    id: "4",
    title: "การบำรุงรักษาอุปกรณ์",
    description: "ถึงเวลาในการตรวจสอบและบำรุงรักษาอุปกรณ์ในแปลงนาที่ 3",
    timestamp: "2025-05-10T11:45:00",
    isRead: true,
    type: "info"
  },
];

const Notifications = () => {
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  // Format date to Thai locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Return date in format: วันที่ DD เดือน YYYY, HH:MM น.
    return date.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' น.';
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, isRead: true } 
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };

  const getTypeStyles = (type: string, isRead: boolean) => {
    switch (type) {
      case 'warning':
        return {
          bgColor: isRead ? 'bg-yellow-50' : 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          iconColor: 'text-yellow-500',
          gradient: 'from-yellow-100 to-yellow-50'
        };
      case 'alert':
        return {
          bgColor: isRead ? 'bg-red-50' : 'bg-red-100',
          borderColor: 'border-red-300',
          iconColor: 'text-red-500',
          gradient: 'from-red-100 to-red-50'
        };
      default:
        return {
          bgColor: isRead ? 'bg-emerald-50' : 'bg-emerald-100',
          borderColor: 'border-emerald-300',
          iconColor: 'text-emerald-500',
          gradient: 'from-emerald-100 to-emerald-50'
        };
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-4xl px-4 ${!isMobile ? 'py-8' : 'pt-6 pb-20'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BellRing className="mr-2 h-6 w-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-800">ประวัติการแจ้งเตือน</h1>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              onClick={markAllAsRead}
            >
              <Check className="h-4 w-4 mr-1" /> 
              อ่านทั้งหมด
            </Button>
          </div>
          
          {/* Decorative rice seeds */}
          <div className="relative">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-3 h-5"
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 98}%`,
                  opacity: 0.2 + Math.random() * 0.3,
                  zIndex: 0
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path 
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
                    fill="currentColor" 
                    className="text-amber-600"
                  />
                </svg>
              </div>
            ))}
          </div>
          
          <div className="space-y-4 relative z-10">
            {notifications.length > 0 ? (
              notifications.map((notification) => {
                const typeStyles = getTypeStyles(notification.type, notification.isRead);
                
                return (
                  <Card 
                    key={notification.id}
                    className={cn(
                      `border transition-all duration-300 overflow-hidden`,
                      notification.isRead ? 'bg-opacity-60' : 'shadow-md',
                      typeStyles.borderColor
                    )}
                  >
                    <CardContent className="p-0">
                      <div className={cn(
                        "bg-gradient-to-r p-4 relative h-full", 
                        typeStyles.gradient
                      )}>
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "rounded-full p-2 mt-1 flex items-center justify-center",
                            typeStyles.iconColor,
                            "bg-white/80"
                          )}>
                            <Bell className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className={cn(
                                "font-semibold",
                                !notification.isRead && "text-gray-800",
                                notification.isRead && "text-gray-600"
                              )}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <span className="bg-blue-500 rounded-full w-2 h-2"></span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.description}
                            </p>
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-gray-500">
                                {formatDate(notification.timestamp)}
                              </span>
                              
                              {!notification.isRead && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-1 h-auto"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4 mr-1" /> 
                                  <span className="text-xs">อ่านแล้ว</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Bell className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">ไม่มีการแจ้งเตือนในขณะนี้</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default Notifications;
