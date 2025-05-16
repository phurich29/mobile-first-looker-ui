
import React from "react";
import { GraphStyle } from "../types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  className?: string;
  graphStyle?: GraphStyle;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  className,
  graphStyle = "classic"
}) => {
  if (active && payload && payload.length) {
    // Default tooltip style if no className is provided
    let defaultClass = "bg-white p-2 border border-purple-100 shadow-md rounded-md";
    
    // Style-specific tooltip if no className is provided
    if (!className) {
      switch (graphStyle) {
        case "neon":
          defaultClass = "bg-gray-900 p-2 border border-cyan-500 text-cyan-300 shadow-lg rounded-md";
          break;
        case "pastel":
          defaultClass = "bg-pink-50 p-2 border border-pink-200 text-pink-700 shadow-sm rounded-lg";
          break;
        case "monochrome":
          defaultClass = "bg-gray-800 p-2 border border-gray-600 text-gray-200 shadow-md rounded-md";
          break;
        case "gradient":
          defaultClass = "bg-indigo-900/90 p-2 border border-emerald-400 text-white shadow-md backdrop-blur-sm rounded-md";
          break;
        default:
          defaultClass = "bg-white p-2 border border-purple-100 shadow-md rounded-md";
      }
    }
    
    return (
      <div className={className || defaultClass}>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-inherit opacity-80">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
