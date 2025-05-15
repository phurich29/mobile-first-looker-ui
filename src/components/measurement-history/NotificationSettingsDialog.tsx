
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { saveNotificationSettings, getNotificationSettings } from "./api";

type NotificationSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceCode: string;
  symbol: string;
  name: string;
};

const NotificationSettingsDialog: React.FC<NotificationSettingsDialogProps> = ({
  open,
  onOpenChange,
  deviceCode,
  symbol,
  name,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [minEnabled, setMinEnabled] = useState(true);
  const [maxEnabled, setMaxEnabled] = useState(true);
  const [minThreshold, setMinThreshold] = useState<string>("0");
  const [maxThreshold, setMaxThreshold] = useState<string>("0");

  useEffect(() => {
    if (open && deviceCode && symbol) {
      setIsLoading(true);
      getNotificationSettings(deviceCode, symbol)
        .then((settings) => {
          if (settings) {
            setEnabled(settings.enabled);
            setMinEnabled(settings.min_enabled);
            setMaxEnabled(settings.max_enabled);
            setMinThreshold(settings.min_threshold.toString());
            setMaxThreshold(settings.max_threshold.toString());
          }
        })
        .catch((error) => {
          console.error("Error fetching notification settings:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, deviceCode, symbol]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await saveNotificationSettings({
        deviceCode,
        symbol,
        name,
        enabled,
        minEnabled,
        maxEnabled,
        minThreshold: parseFloat(minThreshold),
        maxThreshold: parseFloat(maxThreshold),
      });
      
      toast({
        title: "บันทึกการตั้งค่าสำเร็จ",
        description: `การแจ้งเตือนสำหรับ ${name} ได้รับการอัพเดต`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าการแจ้งเตือนได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            ตั้งค่าการแจ้งเตือนสำหรับ {name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="pt-4 space-y-4">
          {/* Main notification toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="notification-enabled" className="font-medium">
              เปิดการแจ้งเตือน
            </Label>
            <Switch
              id="notification-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={isLoading}
            />
          </div>
          
          <hr className="border-gray-200" />
          
          {/* Min threshold settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="min-enabled" className="font-medium">
                แจ้งเตือนเมื่อต่ำกว่า
              </Label>
              <Switch
                id="min-enabled"
                checked={minEnabled && enabled}
                onCheckedChange={setMinEnabled}
                disabled={isLoading || !enabled}
              />
            </div>
            <Input
              id="min-threshold"
              type="number"
              value={minThreshold}
              onChange={(e) => setMinThreshold(e.target.value)}
              disabled={isLoading || !enabled || !minEnabled}
              className="w-full"
              placeholder="ค่าต่ำสุด"
              step="0.01"
            />
          </div>
          
          {/* Max threshold settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-enabled" className="font-medium">
                แจ้งเตือนเมื่อสูงกว่า
              </Label>
              <Switch
                id="max-enabled"
                checked={maxEnabled && enabled}
                onCheckedChange={setMaxEnabled}
                disabled={isLoading || !enabled}
              />
            </div>
            <Input
              id="max-threshold"
              type="number"
              value={maxThreshold}
              onChange={(e) => setMaxThreshold(e.target.value)}
              disabled={isLoading || !enabled || !maxEnabled}
              className="w-full"
              placeholder="ค่าสูงสุด"
              step="0.01"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettingsDialog;
