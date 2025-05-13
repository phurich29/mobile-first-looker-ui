
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PriceFormValues } from "../types";

interface EditPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formValues: PriceFormValues;
  onValueChange: (field: keyof PriceFormValues, value: string) => void;
  onSubmit: () => void;
}

export function EditPriceDialog({ 
  open, 
  onOpenChange, 
  formValues, 
  onValueChange, 
  onSubmit 
}: EditPriceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขราคาข้าว</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">ชื่อข้าว</Label>
            <Input
              id="edit-name"
              value={formValues.name}
              onChange={(e) => onValueChange('name', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-price">ราคา (บาท/100กก.)</Label>
            <Input
              id="edit-price"
              value={formValues.price}
              onChange={(e) => onValueChange('price', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-document-date">วันที่</Label>
            <Input
              id="edit-document-date"
              type="date" 
              value={formValues.document_date}
              onChange={(e) => onValueChange('document_date', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>สีของราคา</Label>
            <RadioGroup 
              value={formValues.priceColor} 
              onValueChange={(value) => onValueChange('priceColor', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="black" id="edit-color-black" />
                <Label htmlFor="edit-color-black" className="font-normal">สีดำ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="green" id="edit-color-green" />
                <Label htmlFor="edit-color-green" className="font-normal text-emerald-600">สีเขียว</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="red" id="edit-color-red" />
                <Label htmlFor="edit-color-red" className="font-normal text-red-600">สีแดง</Label>
              </div>
            </RadioGroup>
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
