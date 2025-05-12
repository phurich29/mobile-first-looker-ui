
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { formatDistance } from "date-fns";

interface EquipmentCardProps {
  deviceCode: string;
  lastUpdated: string | null;
}

export const EquipmentCard = ({ deviceCode, lastUpdated }: EquipmentCardProps) => {
  // Format the last updated time to be relative to now (e.g., "2 hours ago")
  const formattedTime = lastUpdated 
    ? formatDistance(new Date(lastUpdated), new Date(), { addSuffix: true })
    : "ไม่มีข้อมูล";

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
            <Settings className="h-6 w-6 text-emerald-600" />
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
            อุปกรณ์
          </span>
        </div>
        <CardTitle className="text-lg font-bold">{deviceCode}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600">
          <p className="mb-1">อัพเดทล่าสุด:</p>
          <p className="font-medium">{formattedTime}</p>
        </div>
      </CardContent>
    </Card>
  );
};
