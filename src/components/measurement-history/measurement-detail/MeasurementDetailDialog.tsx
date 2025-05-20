
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader data={data} />
        
        {!data ? (
          <div className="text-center py-8 text-muted-foreground">ไม่พบข้อมูล</div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              {/* Card View Section */}
              <CardView groupedData={groupedData} highlightKey={symbol} />
              
              {/* Separator between Card and Table views */}
              <Separator className="my-4" />
              
              {/* Table View Section */}
              <TableView groupedData={groupedData} highlightKey={symbol} />
            </ScrollArea>
            
            <div className="mt-4">
              <DialogFooterContent data={data} name={name} symbol={symbol} />
            </div>
          </div>
        )}
        
        <DialogFooter className="sm:justify-between mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MeasurementDetailDialog;
