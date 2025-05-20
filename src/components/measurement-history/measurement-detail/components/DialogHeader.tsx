
import React from "react";
import { DialogHeader as UIDialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Server, Wheat } from "lucide-react";
import { formatDate } from "../utils";
import { MeasurementDetail } from "../types";

interface DialogHeaderProps {
  data: MeasurementDetail | null;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ data }) => {
  return (
    <UIDialogHeader>
      <div className="flex items-center space-x-2">
        <div className="bg-emerald-100 p-2 rounded-full">
          <Server className="h-5 w-5 text-emerald-600" />
        </div>
        <DialogTitle className="flex items-center">
          <span className="text-lg font-medium text-emerald-800">รายละเอียดการวัด</span>
          {data && (
            <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">
              {data.device_code}
            </Badge>
          )}
        </DialogTitle>
      </div>
      <div className="flex items-center text-sm text-muted-foreground pt-1 ml-10">
        {data?.thai_datetime && (
          <>
            <span className="text-emerald-600 mr-1">
              <Wheat className="inline h-3.5 w-3.5" />
            </span>
            <span>{formatDate(data.thai_datetime, 'thai_datetime')}</span>
          </>
        )}
      </div>
    </UIDialogHeader>
  );
};

export default DialogHeader;
