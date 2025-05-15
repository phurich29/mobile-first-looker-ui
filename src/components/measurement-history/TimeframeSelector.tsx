
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeFrame } from './MeasurementHistory';

type TimeframeSelectorProps = {
  timeFrame: TimeFrame;
  setTimeFrame: (value: TimeFrame) => void;
};

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ 
  timeFrame, 
  setTimeFrame 
}) => {
  return (
    <div className="flex justify-end mb-3">
      <div className="flex flex-col items-end">
        <div className="text-xs text-gray-500 mb-1">กรอบเวลา</div>
        <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
          <SelectTrigger className="w-[100px] h-8 text-xs border-gray-200 bg-white">
            <SelectValue placeholder="เลือกกรอบเวลา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">1 ชั่วโมง</SelectItem>
            <SelectItem value="24h">24 ชั่วโมง</SelectItem>
            <SelectItem value="7d">7 วัน</SelectItem>
            <SelectItem value="30d">30 วัน</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TimeframeSelector;
