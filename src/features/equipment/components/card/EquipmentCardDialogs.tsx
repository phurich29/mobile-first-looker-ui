
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserAccessDialog } from "../access/UserAccessDialog";
import { useTranslation } from "@/hooks/useTranslation";

interface EquipmentCardDialogsProps {
  deviceCode: string;
  isUsersDialogOpen: boolean;
  onUsersDialogChange: (open: boolean) => void;
  isEditDialogOpen: boolean;
  onEditDialogChange: (open: boolean) => void;
  newDisplayName: string;
  onDisplayNameChange: (name: string) => void;
  onSaveDisplayName: () => void;
}

export function EquipmentCardDialogs({
  deviceCode,
  isUsersDialogOpen,
  onUsersDialogChange,
  isEditDialogOpen,
  onEditDialogChange,
  newDisplayName,
  onDisplayNameChange,
  onSaveDisplayName
}: EquipmentCardDialogsProps) {
  const { t } = useTranslation();
  
  return (
    <>
      <UserAccessDialog
        deviceCode={deviceCode}
        isOpen={isUsersDialogOpen}
        onOpenChange={onUsersDialogChange}
      />
      
      <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('device', 'editDeviceName')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="device-code">{t('device', 'deviceCode')}</Label>
              <Input
                id="device-code"
                value={deviceCode}
                readOnly
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display-name">{t('device', 'deviceName')}</Label>
              <Input
                id="display-name"
                value={newDisplayName}
                onChange={(e) => onDisplayNameChange(e.target.value)}
                placeholder={t('device', 'deviceName')}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onEditDialogChange(false)}>
              {t('buttons', 'cancel')}
            </Button>
            <Button onClick={onSaveDisplayName}>{t('buttons', 'save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
