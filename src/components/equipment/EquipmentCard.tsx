
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { ChartBar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { ManageAccessDialog } from "./ManageAccessDialog";

interface EquipmentCardProps {
  deviceCode: string;
  lastUpdated: string | null;
  isAdmin?: boolean;
}

export const EquipmentCard = ({ deviceCode, lastUpdated, isAdmin = false }: EquipmentCardProps) => {
  // Format the last updated time to show exact date and time
  const formattedTime = lastUpdated 
    ? format(new Date(lastUpdated), "dd MMMM yyyy HH:mm:ss น.", { locale: th })
    : "ไม่มีข้อมูล";
  
  const { user } = useAuth();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-1 p-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
            <ChartBar className="h-5 w-5 text-emerald-600" />
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
        
        <div className="flex flex-col gap-2 mt-3">
          {isAdmin && user && (
            <ManageAccessDialog deviceCode={deviceCode} />
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-xs"
            asChild
          >
            <Link to={`/device/${deviceCode}`}>
              <ChartBar className="h-3 w-3 mr-1" />
              ดูข้อมูล
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
