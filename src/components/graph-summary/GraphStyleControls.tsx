
import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { GraphStyle } from "./types";

interface GraphStyleControlsProps {
  graphStyle: GraphStyle;
  globalLineColor: string;
  onGraphStyleChange: (value: GraphStyle) => void;
  onGlobalLineColorChange: (color: string) => void;
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
  graphStyle,
  globalLineColor,
  onGraphStyleChange,
  onGlobalLineColorChange
}) => {
  return <div className="flex flex-wrap items-center justify-end space-x-2 space-y-2 sm:space-y-0 mb-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`h-7 px-2 text-xs ${getStyleSelectButtonClass(graphStyle)}`}>
            สไตล์: {getStyleName(graphStyle)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={`min-w-32 ${getStyleMenuClass(graphStyle)}`}>
          <DropdownMenuItem className={`text-sm ${graphStyle === 'line' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`} onClick={() => onGraphStyleChange('line')}>
            เส้น
          </DropdownMenuItem>
          <DropdownMenuItem className={`text-sm ${graphStyle === 'area' ? 'bg-green-50 dark:bg-green-900/30' : ''}`} onClick={() => onGraphStyleChange('area')}>
            พื้นที่
          </DropdownMenuItem>
          <DropdownMenuItem className={`text-sm ${graphStyle === 'classic' ? 'bg-purple-50 dark:bg-purple-900/30' : ''}`} onClick={() => onGraphStyleChange('classic')}>
            คลาสสิก
          </DropdownMenuItem>
          <DropdownMenuItem className={`text-sm ${graphStyle === 'natural' ? 'bg-green-50 dark:bg-green-900/30' : ''}`} onClick={() => onGraphStyleChange('natural')}>
            ธรรมชาติ
          </DropdownMenuItem>
          <DropdownMenuItem className={`text-sm ${graphStyle === 'neon' ? 'bg-cyan-900' : ''}`} onClick={() => onGraphStyleChange('neon')}>
            นีออน
          </DropdownMenuItem>
          <DropdownMenuItem className={`text-sm ${graphStyle === 'pastel' ? 'bg-pink-100 dark:bg-pink-900/30' : ''}`} onClick={() => onGraphStyleChange('pastel')}>
            พาสเทล
          </DropdownMenuItem>
          <DropdownMenuItem className={`text-sm ${graphStyle === 'monochrome' ? 'bg-gray-800' : ''}`} onClick={() => onGraphStyleChange('monochrome')}>
            โมโนโครม
          </DropdownMenuItem>
          <DropdownMenuItem className={`text-sm ${graphStyle === 'gradient' ? 'bg-indigo-800' : ''}`} onClick={() => onGraphStyleChange('gradient')}>
            ไล่สี
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* เพิ่มที่ว่างเล็กน้อย */}
      <div className="w-2"></div>
    </div>;
};

export default GraphStyleControls;
