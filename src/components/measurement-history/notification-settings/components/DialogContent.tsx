
import { DialogContent as ShadcnDialogContent } from "@/components/ui/dialog";
import DeviceInfoCard from "../DeviceInfoCard";
import NotificationToggle from "../NotificationToggle";
import ThresholdControl from "../ThresholdControl";
import WarningAlert from "../WarningAlert";
import ActiveNotificationsSummary from "./ActiveNotificationsSummary";
import DialogHeader from "./DialogHeader";
import DialogFooter from "./DialogFooter";
import UserInfoCard from "./UserInfoCard";
import { NotificationSettingsState } from "../types";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();
  const showWarning = settings.enabled && !settings.minEnabled && !settings.maxEnabled;

  return (
    <ShadcnDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader name={name} />

      <div className="space-y-6 py-4">
        <DeviceInfoCard deviceCode={deviceCode} />
        
        {/* Phase 4: User info for debugging */}
        <UserInfoCard />

        {/* Active notifications summary */}
        <ActiveNotificationsSummary settings={settings} />

        <NotificationToggle
          enabled={settings.enabled}
          onChange={setEnabled}
          disabled={loading}
        />

        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-4">{t('general', 'setThresholds')}</p>
          
          <div className="space-y-4">
            {/* Reordered - Max threshold is now above Min threshold */}
            <ThresholdControl
              id="max-enabled"
              label={t('general', 'notifyWhenHigherThan')}
              thresholdEnabled={settings.maxEnabled}
              onThresholdEnabledChange={setMaxEnabled}
              threshold={settings.maxThreshold}
              onThresholdChange={setMaxThreshold}
              disabled={!settings.enabled || loading}
              helpText={t('general', 'maximumAcceptableValue')}
            />
            
            <ThresholdControl
              id="min-enabled"
              label={t('general', 'notifyWhenLowerThan')}
              thresholdEnabled={settings.minEnabled}
              onThresholdEnabledChange={setMinEnabled}
              threshold={settings.minThreshold}
              onThresholdChange={setMinThreshold}
              disabled={!settings.enabled || loading}
              helpText={t('general', 'minimumAcceptableValue')}
            />
          </div>
        </div>

        <WarningAlert 
          visible={showWarning}
          message={t('general', 'warningNoThreshold')}
        />
      </div>

      <DialogFooter loading={loading} onSave={onSave} />
    </ShadcnDialogContent>
  );
};

export default NotificationDialogContent;
