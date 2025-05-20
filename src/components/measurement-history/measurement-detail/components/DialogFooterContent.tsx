
import React from "react";
import { Badge } from "@/components/ui/badge";
import { MeasurementDetail } from "../types";
import { Wheat } from "lucide-react";

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
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-3 rounded-md border border-emerald-200">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium flex items-center text-emerald-800">
              <Wheat className="h-4 w-4 mr-1.5 text-emerald-600" />
              {name}
            </span>
            <div className="text-lg font-bold text-emerald-600">
              {data[symbol] ? Number(data[symbol]).toFixed(2) : '-'}
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
            ค่าที่ติดตาม
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default DialogFooterContent;
