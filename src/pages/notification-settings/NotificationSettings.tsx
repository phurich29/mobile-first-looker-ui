
import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellDot, History, Settings, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { NotificationSettingsList } from "./components/NotificationSettingsList";
import { useNotificationSettings } from "./hooks/useNotificationSettings";

const NotificationSettings = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");
  
  const { 
    settings, 
    loading, 
    error, 
    fetchSettings 
  } = useNotificationSettings();
  
  const handleViewHistory = () => {
    navigate('/notification-history');
  };
  
  const handleRefresh = useCallback(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  const handleEditSetting = (deviceCode: string, riceTypeId: string, name: string) => {
    navigate(`/measurement-history/${deviceCode}/${riceTypeId}?name=${encodeURIComponent(name)}`);
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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                รีเฟรช
              </Button>
              <Button 
                variant="outline" 
                onClick={handleViewHistory} 
                className="flex items-center"
              >
                <History className="mr-2 h-4 w-4" />
                ดูประวัติการแจ้งเตือน
              </Button>
            </div>
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
                  
                  <NotificationSettingsList 
                    settings={settings} 
                    loading={loading} 
                    error={error} 
                    onEditSetting={handleEditSetting}
                  />
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
