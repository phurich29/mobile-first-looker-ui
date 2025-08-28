import { Card, CardContent } from "@/components/ui/card";
import { Edit, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationSetting } from "../types";
import { useState, useEffect } from "react";
import { NotificationSettingsDialog } from "@/components/measurement-history/notification-settings";
import { saveNotificationSettings } from "@/components/measurement-history/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { translations } from "@/lib/translations";

interface NotificationSettingCardProps {
  setting: NotificationSetting;
  onEdit?: (deviceCode: string, riceTypeId: string, riceName: string) => void;
}

export const NotificationSettingCard = ({ 
  setting,
  onEdit 
}: NotificationSettingCardProps) => {
  const { toast } = useToast();
  const { t, language } = useTranslation();
  // แก้ไข: ใช้ setting.enabled เป็นหลัก หรือไม่ก็ดูจาก min/max enabled
  const [isEnabled, setIsEnabled] = useState(setting.enabled ?? (setting.max_enabled || setting.min_enabled));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Update state when settings prop changes (e.g., from real-time updates)
  useEffect(() => {
    setIsEnabled(setting.enabled ?? (setting.max_enabled || setting.min_enabled));
  }, [setting.enabled, setting.max_enabled, setting.min_enabled]);
  
  const translateRiceType = (riceTypeName: string): string => {
    if (language === 'th') return riceTypeName;
    
    // Check if rice type has translation
    const riceTranslations = translations.riceTypes as any;
    if (riceTranslations[riceTypeName]) {
      return riceTranslations[riceTypeName].en;
    }
    
    // Fallback to original name if no translation
    return riceTypeName;
  };

  const handleEdit = () => {
    setIsDialogOpen(true);
  };
  
  const handleToggle = async (checked: boolean) => {
    try {
      setIsSaving(true);
      setIsEnabled(checked);
      
      // บันทึกการเปลี่ยนแปลงไปยัง API
      // แก้ไข: เมื่อ toggle จะเปลี่ยนทั้ง minEnabled และ maxEnabled พร้อมกัน
      await saveNotificationSettings({
        deviceCode: setting.device_code,
        symbol: setting.rice_type_id,
        name: setting.rice_type_name,
        enabled: checked, // เปลี่ยนสถานะการเปิด/ปิดการแจ้งเตือนทั้งหมด
        minEnabled: checked ? setting.min_enabled : false, // ถ้า toggle off จะปิดทั้งหมด
        maxEnabled: checked ? setting.max_enabled : false, // ถ้า toggle off จะปิดทั้งหมด
        minThreshold: setting.min_threshold,
        maxThreshold: setting.max_threshold
      });
      
      // แสดงข้อความแจ้งเตือนว่าบันทึกสำเร็จ
      toast({
        title: checked ? "เปิดการแจ้งเตือนแล้ว" : "ปิดการแจ้งเตือนแล้ว",
        description: checked ? 
          "ระบบจะแจ้งเตือนเมื่อค่าเกินเกณฑ์" : 
          "ระบบจะไม่แจ้งเตือนอีกต่อไป",
      });
    } catch (error) {
      // กรณีเกิดข้อผิดพลาด
      console.error("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า:", error);
      setIsEnabled(!checked); // คืนค่าสถานะเดิม
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.01] border-l-4 border-l-primary/20">
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-4">
            {/* ส่วนข้อมูลด้านซ้าย */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted/50'}`}>
                  {isEnabled ? (
                    <Bell className="w-5 h-5 text-primary" />
                  ) : (
                    <BellOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground text-base truncate">
                      {setting.device_name || setting.device_code}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleEdit}
                      className="text-primary hover:text-primary/80 p-1 h-auto min-w-[32px]"
                      title="แก้ไขการตั้งค่า"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {translateRiceType(setting.rice_type_name)}
                  </p>
                  
                  {/* แสดงเกณฑ์การแจ้งเตือน */}
                  <div className="space-y-2">
                    {setting.max_enabled && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-muted-foreground">เกินกว่า</span>
                        <span className="font-semibold text-red-600">{setting.max_threshold}</span>
                      </div>
                    )}
                    {setting.min_enabled && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-muted-foreground">ต่ำกว่า</span>
                        <span className="font-semibold text-amber-600">{setting.min_threshold}</span>
                      </div>
                    )}
                    {!setting.max_enabled && !setting.min_enabled && (
                      <p className="text-muted-foreground italic text-sm">
                        ยังไม่ได้ตั้งเกณฑ์การแจ้งเตือน
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* สวิตช์เปิด/ปิด */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggle(!isEnabled)}
                disabled={isSaving}
                className={`
                  relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${isEnabled 
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg' 
                    : 'bg-muted-foreground/30'
                  }
                  ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                `}
              >
                <div 
                  className={`
                    absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center
                    ${isEnabled ? 'translate-x-6' : 'translate-x-0'}
                  `}
                >
                  {isSaving && (
                    <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                
                {/* จุดเขียวแสดงสถานะ active */}
                {isEnabled && !isSaving && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                )}
              </button>
              
              <span className={`text-xs font-semibold ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                {isEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog สำหรับการแก้ไขการแจ้งเตือน */}
      <NotificationSettingsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        deviceCode={setting.device_code}
        symbol={setting.rice_type_id}
        name={setting.rice_type_name}
      />
    </>
  );
};