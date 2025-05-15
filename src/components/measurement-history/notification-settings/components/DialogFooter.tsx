
import { DialogClose, DialogFooter as ShadcnDialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DialogFooterProps {
  loading: boolean;
  onSave: () => void;
}

export const DialogFooter = ({ loading, onSave }: DialogFooterProps) => {
  return (
    <ShadcnDialogFooter>
      <DialogClose asChild>
        <Button variant="outline" disabled={loading}>ยกเลิก</Button>
      </DialogClose>
      <Button 
        onClick={onSave} 
        disabled={loading}
      >
        {loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </Button>
    </ShadcnDialogFooter>
  );
};

export default DialogFooter;
