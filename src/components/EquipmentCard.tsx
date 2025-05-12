
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Settings } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useAuth } from "@/components/AuthProvider";

interface EquipmentCardProps {
  deviceCode: string;
  lastUpdated: string | null;
}

export const EquipmentCard = ({ deviceCode, lastUpdated }: EquipmentCardProps) => {
  // Format the last updated time to show exact date and time
  const formattedTime = lastUpdated 
    ? format(new Date(lastUpdated), "dd MMMM yyyy HH:mm:ss น.", { locale: th })
    : "ไม่มีข้อมูล";
  
  // Get user roles to determine if they can manage equipment
  const { userRoles } = useAuth();
  const canManageEquipment = userRoles.includes('admin') || userRoles.includes('superadmin');

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-1 p-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
            <Settings className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
            อุปกรณ์
          </span>
        </div>
        <CardTitle className="text-base font-bold">{deviceCode}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xs text-gray-600">
          <p className="mb-0.5">อัพเดทล่าสุด:</p>
          <p className="font-medium">{formattedTime}</p>
        </div>
        
        {canManageEquipment && (
          <Button 
            variant="outline" 
            size="sm"
            className="w-full mt-3 text-xs"
            onClick={() => window.location.href = `/admin?device=${deviceCode}`}
          >
            <Settings className="h-3 w-3 mr-1" />
            จัดการอุปกรณ์
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
