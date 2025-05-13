
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isProcessing: boolean;
  userEmail: string;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  onConfirm,
  isProcessing,
  userEmail
}: DeleteUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบผู้ใช้</DialogTitle>
          <DialogDescription>
            คุณต้องการลบผู้ใช้ {userEmail} ออกจากระบบใช่หรือไม่?
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button type="button" variant="outline" asChild>
            <DialogClose>ยกเลิก</DialogClose>
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isProcessing}
          >
            {isProcessing ? "กำลังลบ..." : "ลบผู้ใช้"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
