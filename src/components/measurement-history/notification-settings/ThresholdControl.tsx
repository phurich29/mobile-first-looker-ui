
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input while typing
    if (value === '') {
      onThresholdChange(0);
      return;
    }
    
    // Convert to number and validate
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onThresholdChange(numValue);
    }
  };
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
          onChange={handleInputChange}
          disabled={disabled || !thresholdEnabled}
          className="max-w-[120px]"
          min={0}
          max={100}
          step={0.1}
          placeholder="0-100"
        />
        <span className="text-sm text-muted-foreground">{defaultHelpText}</span>
      </div>
    </div>
  );
};

export default ThresholdControl;
