
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationSettingsDialogProps } from "./types";
import DeviceInfoCard from "./DeviceInfoCard";
import NotificationToggle from "./NotificationToggle";
import ThresholdControl from "./ThresholdControl";
import WarningAlert from "./WarningAlert";
import useNotificationSettings from "./hooks/useNotificationSettings";

export function NotificationSettingsDialog({
  open,
  onOpenChange,
  deviceCode,
  symbol,
  name,
}: NotificationSettingsDialogProps) {
  const {
    loading,
    settings,
    setEnabled,
    setMinEnabled,
    setMaxEnabled,
    setMinThreshold,
    setMaxThreshold,
    loadSettings,
    handleSaveSettings
  } = useNotificationSettings(deviceCode, symbol, name);

  // Load existing settings on open
  useEffect(() => {
    if (open && deviceCode && symbol) {
      loadSettings();
    }
  }, [open, deviceCode, symbol]);

  const handleSave = async () => {
    const success = await handleSaveSettings();
    if (success) {
      onOpenChange(false);
    }
  };

  const showWarning = settings.enabled && !settings.minEnabled && !settings.maxEnabled;

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
          <DeviceInfoCard deviceCode={deviceCode} />

          <NotificationToggle
            enabled={settings.enabled}
            onChange={setEnabled}
            disabled={loading}
          />

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-4">ตั้งค่าเกณฑ์การแจ้งเตือน</p>
            
            <div className="space-y-4">
              <ThresholdControl
                id="min-enabled"
                label="แจ้งเตือนเมื่อต่ำกว่าเกณฑ์"
                thresholdEnabled={settings.minEnabled}
                onThresholdEnabledChange={setMinEnabled}
                threshold={settings.minThreshold}
                onThresholdChange={setMinThreshold}
                disabled={!settings.enabled || loading}
                helpText="ค่าต่ำสุดที่ยอมรับได้"
              />
              
              <ThresholdControl
                id="max-enabled"
                label="แจ้งเตือนเมื่อสูงกว่าเกณฑ์"
                thresholdEnabled={settings.maxEnabled}
                onThresholdEnabledChange={setMaxEnabled}
                threshold={settings.maxThreshold}
                onThresholdChange={setMaxThreshold}
                disabled={!settings.enabled || loading}
                helpText="ค่าสูงสุดที่ยอมรับได้"
              />
            </div>
          </div>

          <WarningAlert 
            visible={showWarning}
            message="คุณได้เปิดใช้งานการแจ้งเตือน แต่ไม่ได้เปิดใช้งานเกณฑ์ใดๆ การแจ้งเตือนจะไม่ทำงานจนกว่าคุณจะเปิดใช้งานอย่างน้อยหนึ่งเกณฑ์"
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>ยกเลิก</Button>
          </DialogClose>
          <Button 
            onClick={handleSave} 
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
