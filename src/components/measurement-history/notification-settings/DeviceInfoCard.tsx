
import { Smartphone } from "lucide-react";

interface DeviceInfoCardProps {
  deviceCode: string;
}

export const DeviceInfoCard = ({ deviceCode }: DeviceInfoCardProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
      <Smartphone className="h-5 w-5 text-gray-500" />
      <div>
        <p className="text-sm font-medium">รหัสอุปกรณ์</p>
        <p className="text-sm text-gray-500">{deviceCode}</p>
      </div>
    </div>
  );
};

export default DeviceInfoCard;
