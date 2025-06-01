
import { useState } from "react";
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
// Header and FooterNav are handled by AppLayout
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellDot, List, History, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const NotificationManagement = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");
  
  // Fetch notification settings
  const { data: notificationSettings } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .order('device_code', { ascending: true });
      
      if (error) {
        console.error('Error fetching notification settings:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    },
  });
  
  // Fetch notification history
  const { data: notificationHistory } = useQuery({
    queryKey: ['notificationHistory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching notification history:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    },
  });

  const handleViewHistory = () => {
    navigate('/notification-history');
  };
  
  return (
    <AppLayout showFooterNav={true}>
      {/* Main content container with original padding and max-width. Dynamic margins/paddings are now handled by AppLayout. */}
      <div className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16'}`}> {/* Retain flex-1 and conditional padding-bottom */}
        <div className={`mx-auto max-w-7xl px-4 ${!isMobile ? 'py-8' : 'pt-6'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BellDot className="mr-2 h-6 w-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-800">จัดการการแจ้งเตือน</h1>
            </div>
            <Button variant="outline" onClick={handleViewHistory} className="flex items-center">
              <History className="mr-2 h-4 w-4" />
              ดูประวัติการแจ้งเตือน
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                <span>การตั้งค่า</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                <span>ประวัติการแจ้งเตือน</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">การตั้งค่าการแจ้งเตือน</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">ตั้งค่าและกำหนดรูปแบบการแจ้งเตือนสำหรับอุปกรณ์ของคุณ</p>
                  
                  {notificationSettings && notificationSettings.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold">การตั้งค่าที่บันทึกไว้:</h3>
                      <div className="border rounded-md divide-y">
                        {notificationSettings.map((setting) => (
                          <div key={setting.id} className="p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{setting.rice_type_name}</p>
                              <p className="text-sm text-gray-500">รหัสอุปกรณ์: {setting.device_code}</p>
                            </div>
                            <div className="text-sm">
                              {setting.min_enabled && (
                                <p>ต่ำกว่า: {setting.min_threshold}</p>
                              )}
                              {setting.max_enabled && (
                                <p>สูงกว่า: {setting.max_threshold}</p>
                              )}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/measurement-history/${setting.device_code}/${setting.rice_type_id}?name=${encodeURIComponent(setting.rice_type_name)}`)}
                            >
                              แก้ไข
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <List className="mx-auto h-12 w-12 opacity-30 mb-2" />
                      <p>ยังไม่มีการตั้งค่าการแจ้งเตือน</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ประวัติการแจ้งเตือน</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">ดูประวัติการแจ้งเตือนทั้งหมดที่คุณได้รับ</p>
                  
                  {notificationHistory && notificationHistory.length > 0 ? (
                    <div className="space-y-4">
                      <div className="border rounded-md divide-y">
                        {notificationHistory.slice(0, 5).map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-3 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                          >
                            <div className="flex justify-between">
                              <p className="font-medium">
                                {notification.threshold_type === 'max' ? 'สูงเกินกำหนด' : 'ต่ำเกินกำหนด'} 
                                {' - '} 
                                {notification.rice_type_id}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(notification.timestamp).toLocaleString('th-TH')}
                              </p>
                            </div>
                            <p className="text-sm mt-1">
                              ค่าที่วัดได้: <span className="font-medium">{notification.value}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                              อุปกรณ์: {notification.device_code}
                            </p>
                            {notification.notification_message && (
                              <p className="text-sm mt-2 text-gray-700">
                                {notification.notification_message}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {notificationHistory.length > 5 && (
                        <div className="flex justify-center mt-4">
                          <Button variant="outline" onClick={handleViewHistory}>
                            ดูประวัติการแจ้งเตือนทั้งหมด
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="mx-auto h-12 w-12 opacity-30 mb-2" />
                      <p>ไม่มีประวัติการแจ้งเตือน</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationManagement;
