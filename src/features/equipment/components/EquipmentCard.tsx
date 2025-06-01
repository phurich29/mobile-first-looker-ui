
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Edit2 } from "lucide-react";
import equipmentIcon from "@/assets/equipment-icon.svg";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Link } from "react-router-dom";
import { UserAccessDialog } from "./access/UserAccessDialog";
import { DeviceInfo } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EquipmentCardProps {
  deviceCode: string;
  lastUpdated: string | null;
  isAdmin?: boolean;
  displayName?: string;
  onDeviceUpdated?: () => void;
}

export function EquipmentCard({ 
  deviceCode, 
  lastUpdated, 
  isAdmin = false, 
  displayName,
  onDeviceUpdated
}: EquipmentCardProps) {
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(displayName || deviceCode);
  const { toast } = useToast();
  
  // Format the last updated time to show exact date and time with +7 hours
  const formattedTime = lastUpdated 
    ? (() => {
        const date = new Date(lastUpdated);
        // เพิ่มเวลาอีก 7 ชั่วโมง
        date.setHours(date.getHours() + 7);
        return format(date, "dd MMMM yyyy HH:mm:ss น.", { locale: th });
      })()
    : "ไม่มีข้อมูล";

  const isRecentUpdate = (() => {
    if (!lastUpdated) return false;
    try {
      const lastUpdateDate = new Date(lastUpdated);
      if (isNaN(lastUpdateDate.getTime())) {
        console.warn("Invalid lastUpdated date string:", lastUpdated);
        return false;
      }
      const now = new Date();
      const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
      const diffMs = now.getTime() - lastUpdateDate.getTime();
      return diffMs >= 0 && diffMs < twentyFourHoursInMs;
    } catch (error) {
      console.error("Error processing lastUpdated date:", lastUpdated, error);
      return false;
    }
  })();

  const timeClasses = isRecentUpdate
    ? "font-bold text-green-700 bg-yellow-200 dark:text-green-300 dark:bg-yellow-600/40 px-1.5 py-0.5 rounded-md"
    : "font-medium text-gray-800 dark:text-teal-200";

  const handleSaveDisplayName = async () => {
    try {
      // Check if there is already a record for this device
      const { data: existingSettings } = await supabase
        .from('device_settings')
        .select('*')
        .eq('device_code', deviceCode)
        .maybeSingle();
      
      if (existingSettings) {
        // Update existing record
        const { error } = await supabase
          .from('device_settings')
          .update({ display_name: newDisplayName })
          .eq('device_code', deviceCode);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('device_settings')
          .insert({ 
            device_code: deviceCode, 
            display_name: newDisplayName 
          });
        
        if (error) throw error;
      }
      
      toast({
        title: "บันทึกสำเร็จ",
        description: "ชื่ออุปกรณ์ถูกอัพเดทเรียบร้อยแล้ว"
      });
      
      setIsEditDialogOpen(false);
      
      // Trigger refresh if callback is provided
      if (onDeviceUpdated) {
        onDeviceUpdated();
      }
    } catch (error) {
      console.error("Error updating device name:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทชื่ออุปกรณ์ได้",
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-1 p-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <img src={equipmentIcon} alt="อุปกรณ์" className="w-10 h-10" />
            </div>
            <span className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
              อุปกรณ์
            </span>
          </div>
          <div className="flex justify-between items-start">
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">{displayName || deviceCode}</CardTitle>
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0 ml-2"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            รหัส: {deviceCode}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xs text-gray-600 dark:text-slate-400">
            <p className="mb-0.5">อัพเดทล่าสุด:</p>
            <p className={timeClasses}>{formattedTime}</p>
            {isRecentUpdate && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                อัปเดตล่าสุดใน 24 ชม.
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                className="w-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => setIsUsersDialogOpen(true)}
              >
                จัดการสิทธิ์
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {isAdmin && (
        <>
          <UserAccessDialog
            deviceCode={deviceCode}
            isOpen={isUsersDialogOpen}
            onOpenChange={setIsUsersDialogOpen}
          />
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>แก้ไขชื่ออุปกรณ์</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="device-code">รหัสอุปกรณ์</Label>
                  <Input 
                    id="device-code" 
                    value={deviceCode} 
                    readOnly
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="display-name">ชื่อที่แสดง</Label>
                  <Input 
                    id="display-name" 
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="ระบุชื่อที่ต้องการแสดง"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button onClick={handleSaveDisplayName}>บันทึก</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
