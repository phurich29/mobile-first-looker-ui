
import { DialogHeader as ShadcnDialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface DialogHeaderProps {
  name: string;
}

export const DialogHeader = ({ name }: DialogHeaderProps) => {
  const { t } = useTranslation();
  return (
    <ShadcnDialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        <span>{t('general', 'notificationSettingsFor')} {name}</span>
      </DialogTitle>
    </ShadcnDialogHeader>
  );
};

export default DialogHeader;
