
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserAccessList } from "./UserAccessList";

interface ManageAccessDialogProps {
  deviceCode: string;
}

export const ManageAccessDialog = ({ deviceCode }: ManageAccessDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full text-xs"
        >
          <Users className="h-3 w-3 mr-1" />
          จัดการสิทธิ์
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>จัดการสิทธิ์การเข้าถึงอุปกรณ์ {deviceCode}</DialogTitle>
        </DialogHeader>
        
        <UserAccessList deviceCode={deviceCode} />
      </DialogContent>
    </Dialog>
  );
};
