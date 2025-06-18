
import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { GraphStyle } from "./types";

interface GraphStyleControlsProps {
  timeFrame: TimeFrame;
  setTimeFrame: (value: TimeFrame) => void;
  graphStyle: GraphStyle;
  setGraphStyle: (value: GraphStyle) => void;
  globalLineColor: string;
  setGlobalLineColor: (value: string) => void;
}

// Helper functions for graph style (kept outside component as they don't depend on props/state)
const getStyleName = (style: GraphStyle): string => {
  const styleNames: Record<GraphStyle, string> = {
    line: "เส้น", // เส้น = Line
    area: "พื้นที่" // พื้นที่ = Area
  };
  return styleNames[style] || "เส้น";
};

const getStyleSelectButtonClass = (graphStyle: GraphStyle): string => {
  const styleClasses: Record<GraphStyle, string> = {
    line: "border-gray-300 dark:border-gray-600",
    area: "border-blue-300 dark:border-blue-700"
  };
  return styleClasses[graphStyle] || "border-gray-300 dark:border-gray-600";
};

const getStyleMenuClass = (graphStyle: GraphStyle): string => {
  // This function can be used to apply specific classes to the menu content based on style if needed
  const menuClasses: Record<GraphStyle, string> = {
    line: "",
    area: ""
  };
  return menuClasses[graphStyle] || "";
};

export const GraphStyleControls: React.FC<GraphStyleControlsProps> = ({
  timeFrame,
  setTimeFrame,
  graphStyle,
  setGraphStyle,
  // globalLineColor, // Not used in this component's UI directly after changes
  // setGlobalLineColor // Not used in this component's UI directly after changes
}) => {

  const getTimeFrameText = (frame: TimeFrame): string => {
    switch (frame) {
      case '1h': return '1 ชม.'; // 1 ชั่วโมง
      case '24h': return '24 ชม.'; // 24 ชั่วโมง
      case '7d': return '7 วัน'; // 7 วัน
      case '30d': return '30 วัน'; // 30 วัน
      default: return '24 ชม.';
    }
  };

  const timeFrames: TimeFrame[] = ['1h', '24h', '7d', '30d'];

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 sm:gap-y-0 mb-3">
      {/* Time Frame Buttons */}
      <div className="flex items-center space-x-1.5">
        {timeFrames.map(frame => (
          <button
            key={frame}
            type="button"
            className={`px-2.5 py-1 h-7 text-xs rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 dark:focus:ring-offset-slate-900 ${ 
              timeFrame === frame
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
            }`}
            onClick={() => setTimeFrame(frame)}
          >
            {getTimeFrameText(frame)}
          </button>
        ))}
      </div>

      {/* Graph Style Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`h-7 px-2 text-xs ${getStyleSelectButtonClass(graphStyle)} hover:bg-gray-50 dark:hover:bg-slate-700`}
          >
            สไตล์: {getStyleName(graphStyle)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={`min-w-[80px] ${getStyleMenuClass(graphStyle)}`}>
          <DropdownMenuItem 
            className={`text-xs ${graphStyle === 'line' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'dark:text-slate-300'}`}
            onClick={() => setGraphStyle('line')}
          >
            เส้น
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`text-xs ${graphStyle === 'area' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'dark:text-slate-300'}`}
            onClick={() => setGraphStyle('area')}
          >
            พื้นที่
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GraphStyleControls;
