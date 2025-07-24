
import { DialogClose, DialogFooter as ShadcnDialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface DialogFooterProps {
  loading: boolean;
  onSave: () => void;
}

export const DialogFooter = ({ loading, onSave }: DialogFooterProps) => {
  const { t } = useTranslation();
  return (
    <ShadcnDialogFooter>
      <DialogClose asChild>
        <Button variant="outline" disabled={loading}>{t('general', 'cancel')}</Button>
      </DialogClose>
      <Button 
        onClick={onSave} 
        disabled={loading}
      >
        {loading ? t('general', 'saving') : t('general', 'saveSettings')}
      </Button>
    </ShadcnDialogFooter>
  );
};

export default DialogFooter;
