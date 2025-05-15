
import { useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { NotificationSettingsDialogProps } from "./types";
import useNotificationSettings from "./hooks/useNotificationSettings";
import DialogContent from "./components/DialogContent";

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
  }, [open, deviceCode, symbol, loadSettings]);

  const handleSave = async () => {
    const success = await handleSaveSettings();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        open={open}
        onOpenChange={onOpenChange}
        deviceCode={deviceCode}
        symbol={symbol}
        name={name}
        loading={loading}
        settings={settings}
        setEnabled={setEnabled}
        setMinEnabled={setMinEnabled}
        setMaxEnabled={setMaxEnabled}
        setMinThreshold={setMinThreshold}
        setMaxThreshold={setMaxThreshold}
        onSave={handleSave}
      />
    </Dialog>
  );
}

export default NotificationSettingsDialog;
