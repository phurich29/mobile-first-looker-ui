
import React, { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from 'lucide-react';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  return (
    <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen} className="w-full">
      <div className="flex items-center w-fit gap-2 px-1.5 pt-0 pb-0.5 bg-slate-100 dark:bg-slate-800/50 rounded-t-md border-b border-slate-200 dark:border-slate-700">
        <h4 className="text-xs font-semibold">
          การตั้งค่ากราฟ
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-7 h-7 p-0">
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} />
            <span className="sr-only">Toggle Settings</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="p-0 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-md">
        {/* Original content wrapper, now inside CollapsibleContent */}
        <div className="p-2 rounded-lg space-y-3"> {/* Added p-2 for some spacing inside the content area */}
        {/* Zone 1: Graph Style and Time Frame in same row (styling removed from this div) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-start space-y-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">สไตล์กราฟ:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`h-5 px-2 text-xs ${getStyleSelectButtonClass(graphStyle)}`}
                  >
                    {getStyleName(graphStyle)}
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
            </div>
            
            <div className="flex flex-col items-start space-y-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">กรอบเวลา:</span>
              <Select 
                value={timeFrame} 
                onValueChange={(value) => setTimeFrame(value as TimeFrame)}
              >
                <SelectTrigger className={`h-5 w-32 text-xs ${getTimeframeSelectClass(graphStyle)}`}>
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
          </div>
        </div>

        {/* Zone 2: Color Customization (styling removed from this div) */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col items-start space-y-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">กราฟ:</span>
              <ColorPicker 
                color={barColor || '#4863AD'} 
                onChange={setBarColor} 
                className={`h-5 px-1.5 text-xs ${getStyleSelectButtonClass(graphStyle)}`}
              />
            </div>
            <div className="flex flex-col items-start space-y-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">เส้นค่าเฉลี่ย:</span>
              <ColorPicker 
                color={lineColor || '#ff5722'} 
                onChange={setLineColor} 
                className={`h-5 px-1.5 text-xs ${getStyleSelectButtonClass(graphStyle)}`}
              />
            </div>
          </div>
        </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default GraphStyleControls;
