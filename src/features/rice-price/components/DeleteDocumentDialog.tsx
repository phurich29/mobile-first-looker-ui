
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RicePriceDocument } from "@/features/user-management/types";
import { formatThaiDate } from "../utils";

interface DeleteDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: RicePriceDocument | null;
  onConfirm: () => void;
}

export function DeleteDocumentDialog({ 
  open, 
  onOpenChange, 
  document, 
  onConfirm 
}: DeleteDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบเอกสาร</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>คุณต้องการลบเอกสารราคาข้าววันที่ <span className="font-semibold">
            {document && formatThaiDate(document.document_date)}
          </span> ใช่หรือไม่?</p>
          <p className="text-sm text-gray-500 mt-2">การกระทำนี้ไม่สามารถยกเลิกได้</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">ยกเลิก</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>ลบเอกสาร</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
