
import { DialogHeader as ShadcnDialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getColumnTranslatedName } from "@/lib/columnTranslations";

interface DialogHeaderProps {
  name: string; // This should be the field name like 'class1', 'class2', etc.
}

export const DialogHeader = ({ name }: DialogHeaderProps) => {
  const { t, language } = useTranslation();
  const translatedName = getColumnTranslatedName(name, language);
  return (
    <ShadcnDialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        <span>{t('general', 'notificationSettingsFor')} {translatedName}</span>
      </DialogTitle>
    </ShadcnDialogHeader>
  );
};

export default DialogHeader;
