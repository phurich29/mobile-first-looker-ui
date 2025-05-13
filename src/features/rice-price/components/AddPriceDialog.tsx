
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PriceFormValues } from "../types";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

interface AddPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formValues: PriceFormValues;
  onValueChange: (field: keyof PriceFormValues, value: string) => void;
  onSubmit: () => void;
}

export function AddPriceDialog({ 
  open, 
  onOpenChange, 
  formValues, 
  onValueChange, 
  onSubmit 
}: AddPriceDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with values:", formValues);
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มราคาข้าวใหม่</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ชื่อข้าว <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formValues.name}
                onChange={(e) => onValueChange('name', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">ราคา (บาท/100กก.)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formValues.price}
                onChange={(e) => onValueChange('price', e.target.value)}
                placeholder="เว้นว่างไว้หากยังไม่มีข้อมูลราคา"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="document_date">วันที่ <span className="text-red-500">*</span></Label>
              <Input
                id="document_date"
                type="date"
                value={formValues.document_date}
                onChange={(e) => onValueChange('document_date', e.target.value)}
                required
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
                  <RadioGroupItem value="black" id="color-black" />
                  <Label htmlFor="color-black" className="font-normal">สีดำ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="green" id="color-green" />
                  <Label htmlFor="color-green" className="font-normal text-emerald-600">สีเขียว</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="red" id="color-red" />
                  <Label htmlFor="color-red" className="font-normal text-red-600">สีแดง</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">ยกเลิก</Button>
            </DialogClose>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
