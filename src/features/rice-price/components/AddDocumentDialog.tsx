
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DocumentFormValues } from "../types";

interface AddDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formValues: DocumentFormValues;
  onValueChange: (field: keyof DocumentFormValues, value: string) => void;
  onSubmit: () => void;
}

export function AddDocumentDialog({ 
  open, 
  onOpenChange, 
  formValues, 
  onValueChange, 
  onSubmit 
}: AddDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มเอกสารราคาข้าว</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="document_date">วันที่ของเอกสาร</Label>
            <Input
              id="document_date"
              type="date"
              value={formValues.document_date}
              onChange={(e) => onValueChange('document_date', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file_url">URL ไฟล์เอกสาร</Label>
            <Input
              id="file_url"
              value={formValues.file_url}
              onChange={(e) => onValueChange('file_url', e.target.value)}
              placeholder="https://example.com/rice-prices/document.pdf"
            />
            <p className="text-xs text-gray-500 mt-1">ระบุ URL ของไฟล์เอกสาร เช่น PDF หรือรูปภาพ</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">ยกเลิก</Button>
          </DialogClose>
          <Button onClick={onSubmit}>บันทึก</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
