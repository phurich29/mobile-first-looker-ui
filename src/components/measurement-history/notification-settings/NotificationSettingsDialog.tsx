
import { useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { NotificationSettingsDialogProps } from "./types";
import useNotificationSettings from "./hooks/useNotificationSettings";
import NotificationDialogContent from "./components/DialogContent";

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
    handleSaveSettings,
    resetStates
  } = useNotificationSettings(deviceCode, symbol, name);

  // Reset and load settings when dialog opens
  useEffect(() => {
    if (open && deviceCode && symbol) {
      // Always reset state first to prevent cross-user contamination
      resetStates();
      // Force reload settings from API
      loadSettings();
    }
  }, [open, deviceCode, symbol, loadSettings, resetStates]);

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      resetStates();
    }
  }, [open, resetStates]);

  const handleSave = async () => {
    const success = await handleSaveSettings();
    if (success) {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset states immediately when closing
      resetStates();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <NotificationDialogContent
        open={open}
        onOpenChange={handleOpenChange}
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
