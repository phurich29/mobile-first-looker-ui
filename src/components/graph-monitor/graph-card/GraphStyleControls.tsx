
import React from "react";
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
  getStyleName, 
  getStyleSelectButtonClass, 
  getStyleMenuClass,
  getTimeframeSelectClass
} from "./styles";

interface GraphStyleControlsProps {
  timeFrame: TimeFrame;
  setTimeFrame: (value: TimeFrame) => void;
  graphStyle: GraphStyle;
  setGraphStyle: (value: GraphStyle) => void;
}

export const GraphStyleControls: React.FC<GraphStyleControlsProps> = ({
  timeFrame,
  setTimeFrame,
  graphStyle,
  setGraphStyle
}) => {
  return (
    <div className="flex items-center justify-end space-x-2">
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
            className={`text-sm ${graphStyle === 'classic' ? 'bg-purple-50' : ''}`} 
            onClick={() => setGraphStyle('classic')}
          >
            คลาสสิก
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`text-sm ${graphStyle === 'neon' ? 'bg-cyan-900' : ''}`} 
            onClick={() => setGraphStyle('neon')}
          >
            นีออน
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`text-sm ${graphStyle === 'pastel' ? 'bg-pink-100' : ''}`} 
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
    </div>
  );
};

export default GraphStyleControls;
