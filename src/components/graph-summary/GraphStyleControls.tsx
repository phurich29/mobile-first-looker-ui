import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { GraphStyle } from "./types";
import { HexColorPicker } from "react-colorful";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";

interface GraphStyleControlsProps {
  timeFrame: TimeFrame;
  setTimeFrame: (value: TimeFrame) => void;
  graphStyle: GraphStyle;
  setGraphStyle: (value: GraphStyle) => void;
  globalLineColor: string;
  setGlobalLineColor: (value: string) => void;
}

const getStyleName = (style: GraphStyle): string => {
  const styleNames: Record<GraphStyle, string> = {
    line: "เส้น",
    area: "พื้นที่",
    classic: "คลาสสิก",
    natural: "ธรรมชาติ",
    neon: "นีออน",
    pastel: "พาสเทล", 
    monochrome: "โมโนโครม",
    gradient: "ไล่สี"
  };
  return styleNames[style] || "เส้น";
};

const getStyleSelectButtonClass = (graphStyle: GraphStyle): string => {
  const styleClasses: Record<GraphStyle, string> = {
    line: "border-gray-300",
    area: "border-blue-300",
    classic: "border-purple-400 text-purple-700 dark:text-purple-300",
    natural: "border-green-400 text-green-700 dark:text-green-300",
    neon: "border-cyan-500 text-cyan-900 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950",
    pastel: "border-pink-300 text-pink-700 dark:text-pink-300",
    monochrome: "border-gray-400 text-gray-700 dark:text-gray-300",
    gradient: "border-indigo-400 text-indigo-700 dark:text-indigo-300"
  };
  return styleClasses[graphStyle] || "border-gray-300";
};

const getStyleMenuClass = (graphStyle: GraphStyle): string => {
  const menuClasses: Record<GraphStyle, string> = {
    line: "",
    area: "",
    classic: "bg-purple-50 dark:bg-purple-950 border-purple-100 dark:border-purple-800",
    natural: "bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-800",
    neon: "bg-cyan-50 dark:bg-cyan-950 border-cyan-100 dark:border-cyan-800",
    pastel: "bg-pink-50 dark:bg-pink-950 border-pink-100 dark:border-pink-800",
    monochrome: "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800",
    gradient: "bg-indigo-50 dark:bg-indigo-950 border-indigo-100 dark:border-indigo-800"
  };
  return menuClasses[graphStyle] || "";
};

export const GraphStyleControls: React.FC<GraphStyleControlsProps> = ({
  timeFrame,
  setTimeFrame,
  graphStyle,
  setGraphStyle,
  globalLineColor,
  setGlobalLineColor
}) => {
  return (
    <div className="flex flex-wrap items-center justify-end space-x-2 space-y-2 sm:space-y-0 mb-2">
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
            className={`text-sm ${graphStyle === 'line' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`} 
            onClick={() => setGraphStyle('line')}
          >
            เส้น
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`text-sm ${graphStyle === 'area' ? 'bg-green-50 dark:bg-green-900/30' : ''}`} 
            onClick={() => setGraphStyle('area')}
          >
            พื้นที่
          </DropdownMenuItem>
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

      {/* ตัวเลือกสีเส้นค่าเฉลี่ยสำหรับทุกกราฟ */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline"
            size="sm" 
            className={`h-7 px-2 text-xs relative border-2 ${getStyleSelectButtonClass(graphStyle)}`}
            style={{ borderColor: globalLineColor }}
          >
            <span className="mr-2">สีเส้นเฉลี่ย</span>
            <div 
              className="w-4 h-4 rounded-full inline-block" 
              style={{ backgroundColor: globalLineColor }} 
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">เลือกสีเส้นเฉลี่ย</p>
            <HexColorPicker color={globalLineColor} onChange={setGlobalLineColor} />
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs font-mono">{globalLineColor}</div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* เพิ่มที่ว่างเล็กน้อย */}
      <div className="w-2"></div>
    </div>
  );
};

export default GraphStyleControls;
