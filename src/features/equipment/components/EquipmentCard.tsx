import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Settings, Clock, Users } from "lucide-react";
import equipmentIcon from "@/assets/equipment-icon.svg";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
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
        return format(date, "dd MMM yy HH:mm น.", { locale: th });
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
      const thirtyMinutesInMs = 30 * 60 * 1000; // เปลี่ยนจาก 24 ชั่วโมงเป็น 30 นาที
      const diffMs = now.getTime() - lastUpdateDate.getTime();
      return diffMs >= 0 && diffMs < thirtyMinutesInMs;
    } catch (error) {
      console.error("Error processing lastUpdated date:", lastUpdated, error);
      return false;
    }
  })();

  const timeClasses = isRecentUpdate
    ? "font-bold text-yellow-800 bg-yellow-200 dark:text-yellow-300 dark:bg-yellow-600/40 px-1.5 py-0.5 rounded-md"
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
      <div className="relative">
        {/* ON indicator - outside of card to avoid being clipped */}
        {isRecentUpdate && (
          <div className="absolute -top-2 -right-2 z-50">
            <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl border-2 border-white animate-pulse flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              ON
            </div>
          </div>
        )}
        
        <Card className="duration-300 border border-gray-200 dark:border-gray-700 bg-emerald-100 dark:bg-emerald-800 bg-[linear-gradient(rgba(255,255,255,0.98),rgba(255,255,255,0.98)),url('/lovable-uploads/6b12828f-a844-4f45-be72-ca664963430d.png')] bg-repeat shadow-none overflow-visible">
          <CardHeader className="pb-1 p-2 sm:p-4">
            <div className="flex flex-row items-start gap-2 sm:gap-3">
              {/* Column 1: Icon */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                <img src={equipmentIcon} alt="อุปกรณ์" className="w-full h-full" />
              </div>

              {/* Column 2: Text details and Badge */}
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold text-gray-900 dark:text-white truncate pr-1">
                    {displayName || deviceCode}
                  </CardTitle>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 ml-1 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => setIsUsersDialogOpen(true)}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0 sm:mt-0.5 truncate">
                  รหัส: {deviceCode}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-1 sm:p-4 sm:pt-0">
            <div className="text-xs text-gray-600 dark:text-slate-400">
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className={timeClasses}>{formattedTime}</span>
                {isRecentUpdate && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-1">
                    (ใน 30 นาที)
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-row gap-2 mt-2 sm:mt-3">
              <Button 
                variant="outline" 
                className="flex-1 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 h-8 px-2 rounded-md sm:h-9 sm:px-3"
                asChild
              >
                <Link to={`/device/${deviceCode}`} onClick={() => { localStorage.setItem('lastViewedDeviceCode', deviceCode); }}>
                  <BarChart className="h-3 w-3 mr-1" />
                  ดูข้อมูล
                </Link>
              </Button>
              
              {isAdmin && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 p-0 flex items-center justify-center rounded-md sm:h-9 sm:w-9 flex-shrink-0 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
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
