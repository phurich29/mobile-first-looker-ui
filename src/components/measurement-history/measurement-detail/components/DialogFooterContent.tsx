
import React from "react";
import { Badge } from "@/components/ui/badge";
import { MeasurementDetail } from "../types";

interface DialogFooterContentProps {
  data: MeasurementDetail;
  name: string;
  symbol: string;
}

export const DialogFooterContent: React.FC<DialogFooterContentProps> = ({
  data,
  name,
  symbol,
}) => {
  return (
    <div className="px-1">
      <div className="bg-muted-foreground/10 p-3 rounded-md">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium">{name}</span>
            <div className="text-lg font-bold text-emerald-600">
              {data[symbol] ? Number(data[symbol]).toFixed(2) : '-'}
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
            ค่าที่ติดตาม
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default DialogFooterContent;
