
import { Button } from "@/components/ui/button";
import { NotificationSetting } from "../types";

interface NotificationSettingCardProps {
  setting: NotificationSetting;
  onEdit?: (deviceCode: string, riceTypeId: string, riceName: string) => void;
}

export const NotificationSettingCard = ({ 
  setting,
  onEdit 
}: NotificationSettingCardProps) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(setting.device_code, setting.rice_type_id, setting.rice_type_name);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-emerald-800">
            {setting.device_name || setting.device_code}
          </h3>
          <p className="text-sm text-gray-500">{setting.rice_type_name}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleEdit}
          className="text-emerald-600 hover:text-emerald-700"
        >
          แก้ไข
        </Button>
      </div>
      
      <div className="text-sm space-y-1">
        {setting.max_enabled && (
          <p className="flex justify-between">
            <span className="text-gray-600">แจ้งเตือน เมื่อสูงกว่า:</span>
            <span className="font-medium text-red-600">{setting.max_threshold}</span>
          </p>
        )}
        {setting.min_enabled && (
          <p className="flex justify-between">
            <span className="text-gray-600">แจ้งเตือน เมื่อต่ำกว่า:</span>
            <span className="font-medium text-amber-600">{setting.min_threshold}</span>
          </p>
        )}
        {!setting.max_enabled && !setting.min_enabled && (
          <p className="text-gray-500 italic text-center">ไม่มีเกณฑ์การแจ้งเตือน</p>
        )}
      </div>
    </div>
  );
};
