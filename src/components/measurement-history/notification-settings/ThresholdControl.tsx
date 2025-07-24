
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";

interface ThresholdControlProps {
  id: string;
  label: string;
  thresholdEnabled: boolean;
  onThresholdEnabledChange: (value: boolean) => void;
  threshold: number;
  onThresholdChange: (value: number) => void;
  disabled: boolean;
  helpText?: string;
}

export const ThresholdControl = ({
  id,
  label,
  thresholdEnabled,
  onThresholdEnabledChange,
  threshold,
  onThresholdChange,
  disabled,
  helpText,
}: ThresholdControlProps) => {
  const { t } = useTranslation();
  const defaultHelpText = helpText || t('general', 'acceptableValue');
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <Switch
          id={id}
          checked={thresholdEnabled}
          onCheckedChange={onThresholdEnabledChange}
          disabled={disabled}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          id={`${id}-threshold`}
          type="number"
          value={threshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          disabled={disabled || !thresholdEnabled}
          className="max-w-[120px]"
        />
        <span className="text-sm text-muted-foreground">{defaultHelpText}</span>
      </div>
    </div>
  );
};

export default ThresholdControl;
