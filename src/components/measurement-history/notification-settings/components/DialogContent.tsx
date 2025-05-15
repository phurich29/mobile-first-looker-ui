
import { DialogContent as ShadcnDialogContent } from "@/components/ui/dialog";
import DeviceInfoCard from "../DeviceInfoCard";
import NotificationToggle from "../NotificationToggle";
import ThresholdControl from "../ThresholdControl";
import WarningAlert from "../WarningAlert";
import ActiveNotificationsSummary from "./ActiveNotificationsSummary";
import DialogHeader from "./DialogHeader";
import DialogFooter from "./DialogFooter";
import { NotificationSettingsState } from "../types";

interface NotificationDialogContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceCode: string;
  symbol: string;
  name: string;
  loading: boolean;
  settings: NotificationSettingsState;
  setEnabled: (enabled: boolean) => void;
  setMinEnabled: (enabled: boolean) => void;
  setMaxEnabled: (enabled: boolean) => void;
  setMinThreshold: (value: number) => void;
  setMaxThreshold: (value: number) => void;
  onSave: () => void;
}

export const NotificationDialogContent = ({
  open,
  onOpenChange,
  deviceCode,
  name,
  loading,
  settings,
  setEnabled,
  setMinEnabled,
  setMaxEnabled,
  setMinThreshold,
  setMaxThreshold,
  onSave
}: NotificationDialogContentProps) => {
  const showWarning = settings.enabled && !settings.minEnabled && !settings.maxEnabled;

  return (
    <ShadcnDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader name={name} />

      <div className="space-y-6 py-4">
        <DeviceInfoCard deviceCode={deviceCode} />

        {/* Active notifications summary */}
        <ActiveNotificationsSummary settings={settings} />

        <NotificationToggle
          enabled={settings.enabled}
          onChange={setEnabled}
          disabled={loading}
        />

        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-4">ตั้งค่าเกณฑ์การแจ้งเตือน</p>
          
          <div className="space-y-4">
            {/* Reordered - Max threshold is now above Min threshold */}
            <ThresholdControl
              id="max-enabled"
              label="แจ้งเตือน เมื่อสูงกว่า"
              thresholdEnabled={settings.maxEnabled}
              onThresholdEnabledChange={setMaxEnabled}
              threshold={settings.maxThreshold}
              onThresholdChange={setMaxThreshold}
              disabled={!settings.enabled || loading}
              helpText="ค่าสูงสุดที่ยอมรับได้"
            />
            
            <ThresholdControl
              id="min-enabled"
              label="แจ้งเตือน เมื่อต่ำกว่า"
              thresholdEnabled={settings.minEnabled}
              onThresholdEnabledChange={setMinEnabled}
              threshold={settings.minThreshold}
              onThresholdChange={setMinThreshold}
              disabled={!settings.enabled || loading}
              helpText="ค่าต่ำสุดที่ยอมรับได้"
            />
          </div>
        </div>

        <WarningAlert 
          visible={showWarning}
          message="คุณได้เปิดใช้งานการแจ้งเตือน แต่ไม่ได้เปิดใช้งานเกณฑ์ใดๆ การแจ้งเตือนจะไม่ทำงานจนกว่าคุณจะเปิดใช้งานอย่างน้อยหนึ่งเกณฑ์"
        />
      </div>

      <DialogFooter loading={loading} onSave={onSave} />
    </ShadcnDialogContent>
  );
};

export default NotificationDialogContent;
