
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RicePrice } from "@/features/user-management/types";

interface DeletePriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  price: RicePrice | null;
  onConfirm: () => void;
}

export function DeletePriceDialog({ 
  open, 
  onOpenChange, 
  price, 
  onConfirm 
}: DeletePriceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>คุณต้องการลบข้อมูลราคาข้าว <span className="font-semibold">{price?.name}</span> ใช่หรือไม่?</p>
          <p className="text-sm text-gray-500 mt-2">การกระทำนี้ไม่สามารถยกเลิกได้</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">ยกเลิก</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>ลบข้อมูล</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
