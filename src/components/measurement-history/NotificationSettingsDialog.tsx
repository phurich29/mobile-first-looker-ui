
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Bell, Smartphone } from "lucide-react";
import { saveNotificationSettings, getNotificationSettings } from "./api";

interface NotificationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceCode: string;
  symbol: string;
  name: string;
}

export function NotificationSettingsDialog({
  open,
  onOpenChange,
  deviceCode,
  symbol,
  name,
}: NotificationSettingsDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [minEnabled, setMinEnabled] = useState(true);
  const [maxEnabled, setMaxEnabled] = useState(true);
  const [minThreshold, setMinThreshold] = useState(0);
  const [maxThreshold, setMaxThreshold] = useState(100);

  // Load existing settings on open
  useEffect(() => {
    if (open && deviceCode && symbol) {
      loadSettings();
    }
  }, [open, deviceCode, symbol]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await getNotificationSettings(deviceCode, symbol);
      
      if (settings) {
        setEnabled(settings.enabled ?? true);
        setMinEnabled(settings.min_enabled ?? true);
        setMaxEnabled(settings.max_enabled ?? true);
        setMinThreshold(settings.min_threshold ?? 0);
        setMaxThreshold(settings.max_threshold ?? 100);
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
      toast({
        title: "ไม่สามารถโหลดการตั้งค่าได้",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      await saveNotificationSettings({
        deviceCode,
        symbol,
        name,
        enabled,
        minEnabled,
        maxEnabled,
        minThreshold,
        maxThreshold
      });
      
      toast({
        title: "บันทึกการตั้งค่าเรียบร้อย",
        description: "การแจ้งเตือนจะทำงานตามที่คุณตั้งค่าไว้",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "ไม่สามารถบันทึกการตั้งค่าได้",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>ตั้งค่าการแจ้งเตือน {name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Device Code Information */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
            <Smartphone className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">รหัสอุปกรณ์</p>
              <p className="text-sm text-gray-500">{deviceCode}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notification-enabled">เปิดใช้งานการแจ้งเตือน</Label>
              <p className="text-sm text-muted-foreground">
                เปิดใช้งานการแจ้งเตือนสำหรับค่าวัดนี้
              </p>
            </div>
            <Switch
              id="notification-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={loading}
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-4">ตั้งค่าเกณฑ์การแจ้งเตือน</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="min-enabled">แจ้งเตือนเมื่อต่ำกว่าเกณฑ์</Label>
                  <Switch
                    id="min-enabled"
                    checked={minEnabled}
                    onCheckedChange={setMinEnabled}
                    disabled={!enabled || loading}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    id="min-threshold"
                    type="number"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    disabled={!enabled || !minEnabled || loading}
                    className="max-w-[120px]"
                  />
                  <span className="text-sm text-muted-foreground">ค่าต่ำสุดที่ยอมรับได้</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-enabled">แจ้งเตือนเมื่อสูงกว่าเกณฑ์</Label>
                  <Switch
                    id="max-enabled"
                    checked={maxEnabled}
                    onCheckedChange={setMaxEnabled}
                    disabled={!enabled || loading}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    id="max-threshold"
                    type="number"
                    value={maxThreshold}
                    onChange={(e) => setMaxThreshold(Number(e.target.value))}
                    disabled={!enabled || !maxEnabled || loading}
                    className="max-w-[120px]"
                  />
                  <span className="text-sm text-muted-foreground">ค่าสูงสุดที่ยอมรับได้</span>
                </div>
              </div>
            </div>
          </div>

          {enabled && !minEnabled && !maxEnabled && (
            <div className="bg-yellow-50 p-3 rounded-md flex gap-2 items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                คุณได้เปิดใช้งานการแจ้งเตือน แต่ไม่ได้เปิดใช้งานเกณฑ์ใดๆ 
                การแจ้งเตือนจะไม่ทำงานจนกว่าคุณจะเปิดใช้งานอย่างน้อยหนึ่งเกณฑ์
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>ยกเลิก</Button>
          </DialogClose>
          <Button 
            onClick={handleSaveSettings} 
            disabled={loading}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NotificationSettingsDialog;
