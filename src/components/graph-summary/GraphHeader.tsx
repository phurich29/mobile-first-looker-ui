
import React from "react";
import { BarChart2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";

interface GraphHeaderProps {
  onOpenSelector: () => void;
  timeFrame: TimeFrame;
  onTimeFrameChange: (value: TimeFrame) => void;
}

export const GraphHeader: React.FC<GraphHeaderProps> = ({
  onOpenSelector,
  timeFrame,
  onTimeFrameChange
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
        <BarChart2 className="h-6 w-6" />
        Graph Summary
      </h1>
      
      <div className="flex mt-4 md:mt-0 gap-2">
        {/* Add Graph Button */}
        <Button 
          onClick={onOpenSelector}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Graph
        </Button>
        
        {/* Time frame selector */}
        <Select
          value={timeFrame}
          onValueChange={(value) => onTimeFrameChange(value as TimeFrame)}
        >
          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
            <SelectValue placeholder="เลือกช่วงเวลา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">1 ชั่วโมง</SelectItem>
            <SelectItem value="3h">3 ชั่วโมง</SelectItem>
            <SelectItem value="6h">6 ชั่วโมง</SelectItem>
            <SelectItem value="12h">12 ชั่วโมง</SelectItem>
            <SelectItem value="24h">24 ชั่วโมง</SelectItem>
            <SelectItem value="7d">7 วัน</SelectItem>
            <SelectItem value="30d">30 วัน</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
