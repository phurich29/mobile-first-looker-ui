
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";
import equipmentIcon from "@/assets/equipment-icon.svg";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Link } from "react-router-dom";
import { UserAccessDialog } from "./access/UserAccessDialog";
import { DeviceInfo } from "../types";

interface EquipmentCardProps {
  deviceCode: string;
  lastUpdated: string | null;
  isAdmin?: boolean;
}

export function EquipmentCard({ deviceCode, lastUpdated, isAdmin = false }: EquipmentCardProps) {
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  
  // Format the last updated time to show exact date and time with +7 hours
  const formattedTime = lastUpdated 
    ? (() => {
        const date = new Date(lastUpdated);
        // เพิ่มเวลาอีก 7 ชั่วโมง
        date.setHours(date.getHours() + 7);
        return format(date, "dd MMMM yyyy HH:mm:ss น.", { locale: th });
      })()
    : "ไม่มีข้อมูล";

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-1 p-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <img src={equipmentIcon} alt="อุปกรณ์" className="w-10 h-10" />
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
            <Button 
              variant="outline" 
              size="sm"
              className="w-full text-xs"
              asChild
            >
              <Link to={`/device/${deviceCode}`}>
                <BarChart className="h-3 w-3 mr-1" />
                ดูข้อมูล
              </Link>
            </Button>
            
            {isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => setIsUsersDialogOpen(true)}
              >
                จัดการสิทธิ์
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {isAdmin && (
        <UserAccessDialog
          deviceCode={deviceCode}
          isOpen={isUsersDialogOpen}
          onOpenChange={setIsUsersDialogOpen}
        />
      )}
    </>
  );
}
