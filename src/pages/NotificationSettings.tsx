
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface NotificationSetting {
  id: string;
  device_code: string;
  rice_type_name: string;
  rice_type_id: string;
  enabled: boolean;
  min_enabled: boolean;
  max_enabled: boolean;
  min_threshold: number;
  max_threshold: number;
  device_name?: string;
}

const NotificationSettings = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setLoading(true);
        
        // Fetch notification settings that are enabled
        const { data: notificationSettings, error: settingsError } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('enabled', true);
          
        if (settingsError) throw settingsError;

        // Get unique device codes to fetch device names
        const deviceCodes = [...new Set(notificationSettings.map(setting => setting.device_code))];
        
        // Fetch device names if there are any settings
        if (deviceCodes.length > 0) {
          const { data: deviceSettings, error: deviceError } = await supabase
            .from('device_settings')
            .select('device_code, display_name')
            .in('device_code', deviceCodes);
            
          if (deviceError) throw deviceError;
          
          // Map device names to notification settings
          const enrichedSettings = notificationSettings.map(setting => {
            const device = deviceSettings.find(d => d.device_code === setting.device_code);
            return {
              ...setting,
              device_name: device?.display_name || setting.device_code
            };
          });
          
          setSettings(enrichedSettings);
        } else {
          setSettings(notificationSettings);
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        setError('ไม่สามารถโหลดการตั้งค่าแจ้งเตือนได้');
        toast({
          variant: "destructive",
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดการตั้งค่าแจ้งเตือนได้"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSettings();
  }, [toast]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-60">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
          <p className="text-emerald-700">กำลังโหลดข้อมูล...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-60 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
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

    if (settings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-60 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <p className="text-gray-700 font-medium text-lg mb-2">ไม่พบการแจ้งเตือน</p>
          <p className="text-gray-600 mb-4">คุณยังไม่มีการตั้งค่าแจ้งเตือนที่เปิดใช้งาน</p>
          <Button asChild>
            <Link to="/device/default">ไปหน้าตั้งค่าแจ้งเตือน</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {settings.map((setting) => (
          <div 
            key={setting.id} 
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-emerald-800">
                  {setting.device_name || setting.device_code}
                </h3>
                <p className="text-sm text-gray-500">{setting.rice_type_name}</p>
              </div>
              <Link 
                to={`/device/${setting.device_code}`}
                className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
              >
                ดูรายละเอียด
              </Link>
            </div>
            
            <div className="text-sm space-y-1">
              {setting.min_enabled && (
                <p className="flex justify-between">
                  <span className="text-gray-600">ขีดจำกัดต่ำสุด:</span>
                  <span className="font-medium text-amber-600">{setting.min_threshold}</span>
                </p>
              )}
              {setting.max_enabled && (
                <p className="flex justify-between">
                  <span className="text-gray-600">ขีดจำกัดสูงสุด:</span>
                  <span className="font-medium text-red-600">{setting.max_threshold}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-2xl px-4 ${!isMobile ? 'py-8' : 'pt-4 pb-6'}`}>
          <h1 className="text-2xl font-semibold text-emerald-800 mb-6">การแจ้งเตือนที่กำหนดไว้</h1>
          {renderContent()}
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default NotificationSettings;
