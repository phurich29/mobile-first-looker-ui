
import { useState } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellDot, List, History, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const NotificationSettings = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");
  
  // Fetch notification settings
  const { data: notificationSettings, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .order('device_code', { ascending: true });
      
      if (error) {
        console.error('Error fetching notification settings:', error);
        throw error;
      }
      
      return data || [];
    },
  });
  
  const handleViewHistory = () => {
    navigate('/notification-history');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-7xl px-4 ${!isMobile ? 'py-8' : 'pt-6'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BellDot className="mr-2 h-6 w-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-800">การตั้งค่าการแจ้งเตือน</h1>
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
            </TabsList>
            
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">การตั้งค่าการแจ้งเตือน</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">ตั้งค่าและกำหนดรูปแบบการแจ้งเตือนสำหรับอุปกรณ์ของคุณ</p>
                  
                  {settingsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : settingsError ? (
                    <div className="text-center py-8 text-red-600">
                      <p>เกิดข้อผิดพลาด: {(settingsError as Error).message}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.location.reload()}
                        className="mt-2"
                      >
                        ลองใหม่
                      </Button>
                    </div>
                  ) : notificationSettings && notificationSettings.length > 0 ? (
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
          </Tabs>
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default NotificationSettings;
