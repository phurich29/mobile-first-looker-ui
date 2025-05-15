
import { Button } from "@/components/ui/button";
import { NotificationSetting } from "../types";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { NotificationSettingsDialog } from "@/components/measurement-history/notification-settings";
import { saveNotificationSettings } from "@/components/measurement-history/api";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettingCardProps {
  setting: NotificationSetting;
  onEdit?: (deviceCode: string, riceTypeId: string, riceName: string) => void;
}

export const NotificationSettingCard = ({ 
  setting,
  onEdit 
}: NotificationSettingCardProps) => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(setting.max_enabled || setting.min_enabled);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleEdit = () => {
    setIsDialogOpen(true);
  };
  
  const handleToggle = async (checked: boolean) => {
    try {
      setIsSaving(true);
      setIsEnabled(checked);
      
      // บันทึกการเปลี่ยนแปลงไปยัง API
      await saveNotificationSettings({
        deviceCode: setting.device_code,
        symbol: setting.rice_type_id,
        name: setting.rice_type_name,
        enabled: checked, // เปลี่ยนสถานะการเปิด/ปิดการแจ้งเตือน
        minEnabled: setting.min_enabled,
        maxEnabled: setting.max_enabled,
        minThreshold: setting.min_threshold,
        maxThreshold: setting.max_threshold
      });
      
      // แสดงข้อความแจ้งเตือนว่าบันทึกสำเร็จ
      toast({
        title: checked ? "เปิดการแจ้งเตือนแล้ว" : "ปิดการแจ้งเตือนแล้ว",
        description: checked ? 
          "ระบบจะแจ้งเตือนเมื่อค่าเกินเกณฑ์ที่กำหนด" : 
          "ระบบจะไม่แจ้งเตือนสำหรับอุปกรณ์นี้",
      });
    } catch (error) {
      // กรณีเกิดข้อผิดพลาด
      console.error("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า:", error);
      setIsEnabled(!checked); // คืนค่าสถานะเดิม
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border-2 border-black p-4 flex justify-between w-full">
        {/* ส่วนด้านซ้าย */}
        <div className="flex-1 mr-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="overflow-hidden">
              <h3 className="font-medium text-black text-sm truncate">
                {setting.device_name || setting.device_code}
              </h3>
              <p className="text-sm text-black truncate mt-1">{setting.rice_type_name}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleEdit}
              className="text-emerald-600 hover:text-emerald-700 p-1 h-auto min-w-[40px] text-xs ml-1"
            >
              แก้ไข
            </Button>
          </div>
          
          <div className="border-t border-gray-100 pt-2 mt-2 text-sm space-y-2">
            {setting.max_enabled && (
              <p className="flex items-center gap-2">
                <span className="text-black font-medium">สูงกว่า:</span>
                <span className="font-bold text-red-600 text-base">{setting.max_threshold}</span>
              </p>
            )}
            {setting.min_enabled && (
              <p className="flex items-center gap-2">
                <span className="text-black font-medium">ต่ำกว่า:</span>
                <span className="font-bold text-amber-600 text-base">{setting.min_threshold}</span>
              </p>
            )}
            {!setting.max_enabled && !setting.min_enabled && (
              <p className="text-black italic text-sm">ไม่มีเกณฑ์การแจ้งเตือน</p>
            )}
          </div>
        </div>
        
        {/* ส่วนด้านขวา - สวิตช์แบบเกม */}
        <div className="flex flex-col items-center justify-center">
          <div 
            className={`w-16 h-9 rounded-full relative transition-all duration-300 flex items-center justify-center ${isEnabled ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gray-300'}`}
            onClick={() => handleToggle(!isEnabled)}
          >
            <div 
              className={`absolute top-0.5 left-0.5 w-8 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${isEnabled ? 'translate-x-7' : 'translate-x-0'}`}
            ></div>
            {isEnabled && (
              <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            )}
          </div>
          {/* เพิ่มข้อความ ON/OFF ด้านล่าง */}
          <span className={`mt-2 text-xs font-bold ${isEnabled ? 'text-emerald-600' : 'text-gray-900'}`}>
            {isEnabled ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

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
