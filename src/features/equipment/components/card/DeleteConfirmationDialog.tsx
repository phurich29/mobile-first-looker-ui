import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/hooks/useTranslation";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  deviceName: string;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  deviceName,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('buttons', 'confirm')} {t('buttons', 'delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            คุณต้องการลบ{t('device', 'equipment')} รหัส{' '}
            <span className="font-bold text-red-500">{deviceName}</span>{' '}
            ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('buttons', 'cancel')}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? t('general', 'loading') : t('buttons', 'confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
