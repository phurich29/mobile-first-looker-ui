
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wheat } from "lucide-react";

import { MeasurementDetailDialogProps } from "./types";
import { groupFields } from "./utils";
import DialogHeader from "./components/DialogHeader";
import CardView from "./components/CardView";
import TableView from "./components/TableView";
import DialogFooterContent from "./components/DialogFooterContent";

export function MeasurementDetailDialog({
  open,
  onOpenChange,
  data,
  symbol,
  name,
}: MeasurementDetailDialogProps) {
  const groupedData = groupFields(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col border-emerald-200 bg-gradient-to-b from-white to-emerald-50 shadow-lg">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white p-3 rounded-full shadow-lg">
          <Wheat className="h-6 w-6" />
        </div>
        
        <DialogHeader data={data} />
        
        {!data ? (
          <div className="text-center py-8 text-muted-foreground">ไม่พบข้อมูล</div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              {/* Card View Section */}
              <CardView groupedData={groupedData} highlightKey={symbol} />
              
              {/* Separator between Card and Table views */}
              <Separator className="my-4 bg-emerald-200" />
              
              {/* Table View Section */}
              <TableView groupedData={groupedData} highlightKey={symbol} />
            </ScrollArea>
            
            <div className="mt-4">
              <DialogFooterContent data={data} name={name} symbol={symbol} />
            </div>
          </div>
        )}
        
        <DialogFooter className="sm:justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
          >
            ปิด
          </Button>
        </DialogFooter>

        {/* Rice Decoration Elements */}
        <div className="absolute -z-10 top-5 right-5 opacity-10">
          <Wheat className="h-20 w-20 text-emerald-800 transform rotate-45" />
        </div>
        <div className="absolute -z-10 bottom-5 left-5 opacity-10">
          <Wheat className="h-16 w-16 text-emerald-800 transform -rotate-15" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MeasurementDetailDialog;
