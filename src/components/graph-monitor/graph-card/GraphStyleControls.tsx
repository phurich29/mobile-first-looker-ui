
import React from "react";
import { ColorPicker } from "./ColorPicker";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { GraphStyle } from "../types";
import { 
  getStyleSelectButtonClass, 
  getStyleMenuClass,
  getTimeframeSelectClass
} from "./styles";
import { getStyleName } from "./styles/color-utils";

interface GraphStyleControlsProps {
  timeFrame: TimeFrame;
  setTimeFrame: (value: TimeFrame) => void;
  graphStyle: GraphStyle;
  setGraphStyle: (value: GraphStyle) => void;
  barColor?: string;
  setBarColor: (value: string) => void;
  lineColor?: string;
  setLineColor: (value: string) => void;
}

export const GraphStyleControls: React.FC<GraphStyleControlsProps> = ({
  timeFrame,
  setTimeFrame,
  graphStyle,
  setGraphStyle,
  barColor,
  setBarColor,
  lineColor,
  setLineColor
}) => {
  // สีกราฟแท่งที่ใช้ได้
  const barColorOptions = [
    { value: '#4863AD', label: 'สีน้ำเงิน' },
    { value: '#48AD57', label: 'สีเขียว' },
    { value: '#E63946', label: 'สีแดง' },
    { value: '#FF9500', label: 'สีส้ม' },
    { value: '#9B5DE5', label: 'สีม่วง' },
    { value: '#14213D', label: 'สีน้ำเงินเข้ม' }
  ];
  
  return (
    <div className="flex flex-wrap items-center justify-end space-x-2 space-y-2 sm:space-y-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`h-7 px-2 text-xs ${getStyleSelectButtonClass(graphStyle)}`}
          >
            สไตล์: {getStyleName(graphStyle)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={`min-w-32 ${getStyleMenuClass(graphStyle)}`}>
          <DropdownMenuItem 
            className={`text-sm ${graphStyle === 'classic' ? 'bg-purple-50 dark:bg-purple-900/30' : ''}`} 
            onClick={() => setGraphStyle('classic')}
          >
            คลาสสิก
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`text-sm ${graphStyle === 'natural' ? 'bg-green-50 dark:bg-green-900/30' : ''}`} 
            onClick={() => setGraphStyle('natural')}
          >
            ธรรมชาติ
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`text-sm ${graphStyle === 'neon' ? 'bg-cyan-900' : ''}`} 
            onClick={() => setGraphStyle('neon')}
          >
            นีออน
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`text-sm ${graphStyle === 'pastel' ? 'bg-pink-100 dark:bg-pink-900/30' : ''}`} 
            onClick={() => setGraphStyle('pastel')}
          >
            พาสเทล
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`text-sm ${graphStyle === 'monochrome' ? 'bg-gray-800' : ''}`} 
            onClick={() => setGraphStyle('monochrome')}
          >
            โมโนโครม
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`text-sm ${graphStyle === 'gradient' ? 'bg-indigo-800' : ''}`} 
            onClick={() => setGraphStyle('gradient')}
          >
            ไล่สี
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Select 
        value={timeFrame} 
        onValueChange={(value) => setTimeFrame(value as TimeFrame)}
      >
        <SelectTrigger className={`h-7 w-36 text-xs ${getTimeframeSelectClass(graphStyle)}`}>
          <SelectValue placeholder="กรอบเวลา" />
        </SelectTrigger>
        <SelectContent className={getStyleMenuClass(graphStyle)}>
          <SelectItem value="1h">1 ชั่วโมง</SelectItem>
          <SelectItem value="24h">24 ชั่วโมง</SelectItem>
          <SelectItem value="7d">7 วัน</SelectItem>
          <SelectItem value="30d">30 วัน</SelectItem>
        </SelectContent>
      </Select>

      {/* ตัวเลือกสีกราฟแบบอิสระ */}
      <div className="flex space-x-2">
        {/* ตัวเลือกสีกราฟ */}
        <ColorPicker 
          color={barColor || '#4863AD'} 
          onChange={setBarColor} 
          className={getStyleSelectButtonClass(graphStyle)}
        />

        {/* ตัวเลือกสีเส้นค่าเฉลี่ย */}
        <ColorPicker 
          color={lineColor || '#ff5722'} 
          onChange={setLineColor} 
          className={getStyleSelectButtonClass(graphStyle)}
        />
      </div>
    </div>
  );
};

export default GraphStyleControls;
