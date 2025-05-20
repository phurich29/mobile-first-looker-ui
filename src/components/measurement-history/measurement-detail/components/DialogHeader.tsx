
import React from "react";
import { DialogHeader as UIDialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "../utils";
import { MeasurementDetail } from "../types";

interface DialogHeaderProps {
  data: MeasurementDetail | null;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ data }) => {
  return (
    <UIDialogHeader>
      <DialogTitle className="flex items-center">
        <span className="text-lg font-medium">รายละเอียดการวัด</span>
        {data && (
          <Badge variant="outline" className="ml-2">
            {data.device_code}
          </Badge>
        )}
      </DialogTitle>
      <div className="text-sm text-muted-foreground pt-1">
        {data?.thai_datetime && formatDate(data.thai_datetime, 'thai_datetime')}
      </div>
    </UIDialogHeader>
  );
};

export default DialogHeader;
