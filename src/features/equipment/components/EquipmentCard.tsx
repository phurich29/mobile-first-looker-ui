
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Link } from "react-router-dom";
import { EquipmentCardHeader } from "./card/EquipmentCardHeader";
import { EquipmentCardDialogs } from "./card/EquipmentCardDialogs";
import { useEquipmentCard } from "./card/hooks/useEquipmentCard";

interface EquipmentCardProps {
  deviceCode: string;
  displayName?: string;
  lastUpdated: string | null;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  onDeviceUpdated?: () => void;
}

export const EquipmentCard = ({ 
  deviceCode, 
  displayName,
  lastUpdated, 
  isAdmin = false,
  isSuperAdmin = false,
  onDeviceUpdated
}: EquipmentCardProps) => {
  const {
    isUsersDialogOpen,
    setIsUsersDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    newDisplayName,
    setNewDisplayName,
    handleSaveDisplayName
  } = useEquipmentCard(deviceCode, displayName, onDeviceUpdated);
  
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
        <EquipmentCardHeader
          deviceCode={deviceCode}
          displayName={displayName}
          isSuperAdmin={isSuperAdmin}
          onUsersClick={() => setIsUsersDialogOpen(true)}
        />
        
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
          </div>
        </CardContent>
      </Card>
      
      <EquipmentCardDialogs
        deviceCode={deviceCode}
        isUsersDialogOpen={isUsersDialogOpen}
        onUsersDialogChange={setIsUsersDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        onEditDialogChange={setIsEditDialogOpen}
        newDisplayName={newDisplayName}
        onDisplayNameChange={setNewDisplayName}
        onSaveDisplayName={handleSaveDisplayName}
      />
    </>
  );
}
