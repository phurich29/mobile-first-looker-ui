
import { Link } from "react-router-dom";
import { NotificationSetting } from "../types";

interface NotificationSettingCardProps {
  setting: NotificationSetting;
}

export const NotificationSettingCard = ({ setting }: NotificationSettingCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-emerald-800">
            {setting.device_name || setting.device_code}
          </h3>
          <p className="text-sm text-gray-500">{setting.rice_type_name}</p>
        </div>
        <Link 
          to={`/device/${setting.device_code}`}
          className="text-xs px-2 py-1 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
        >
          ดูรายละเอียด
        </Link>
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
      </div>
    </div>
  );
};
