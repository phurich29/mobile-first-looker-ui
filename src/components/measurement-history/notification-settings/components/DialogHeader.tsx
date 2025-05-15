
import { DialogHeader as ShadcnDialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell } from "lucide-react";

interface DialogHeaderProps {
  name: string;
}

export const DialogHeader = ({ name }: DialogHeaderProps) => {
  return (
    <ShadcnDialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        <span>ตั้งค่าการแจ้งเตือน {name}</span>
      </DialogTitle>
    </ShadcnDialogHeader>
  );
};

export default DialogHeader;
