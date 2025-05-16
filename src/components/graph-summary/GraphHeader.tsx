
import React, { useState } from "react";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
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
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
      <div className="flex items-start gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ข้อมูลกราฟ</h1>
          <p className="text-gray-600 text-sm dark:text-gray-400">
            แสดงข้อมูลกราฟจากอุปกรณ์หลายตัวในกราฟเดียวกัน
          </p>
        </div>
        
        <Popover open={helpOpen} onOpenChange={setHelpOpen}>
          <PopoverTrigger>
            <button 
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="คำแนะนำการใช้งาน"
            >
              <Info className="h-4 w-4 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">เทคนิคการใช้งานกราฟ</h3>
              
              <div className="text-xs space-y-1.5">
                <p className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <strong>เปลี่ยนสีเส้นกราฟ:</strong> คลิกที่จุดสีในแต่ละป้ายชื่อเพื่อปรับสีได้ตามต้องการ
                </p>
                
                <p className="flex items-center gap-1">
                  <span className="text-xs">✕</span>
                  <strong>ลบเส้นกราฟ:</strong> คลิกที่เครื่องหมาย ✕ เพื่อลบเส้นกราฟที่ไม่ต้องการ
                </p>
                
                <p className="flex items-center gap-1">
                  <span className="text-xs">⏱️</span>
                  <strong>เปลี่ยนช่วงเวลา:</strong> เลือกช่วงเวลาที่ต้องการแสดงผลจากเมนูด้านบนขวา
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs mt-2">
                <p className="font-medium">คำแนะนำ:</p>
                <p>การใช้สีที่แตกต่างกันอย่างชัดเจนจะช่วยให้แยกแยะข้อมูลได้ง่ายขึ้น</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
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
