
import { StyleOptions } from "./types";
import { getIconColor } from "./color-utils";

export const getClassicStyle = (graphSymbol: string): StyleOptions => {
  const iconColor = getIconColor(graphSymbol);
  
  return {
    cardBg: "bg-white border-purple-100",
    headerBg: "bg-gray-50 border-b border-purple-100",
    titleColor: "text-gray-800",
    subtitleColor: "text-gray-500",
    buttonHoverBg: "hover:bg-purple-100",
    buttonHoverText: "hover:text-purple-700",
    iconBg: `bg-gradient-to-br from-${iconColor} to-${iconColor}cc`,
    iconText: "text-white",
    chartBackground: "transparent",
    lineColor: iconColor,
    gridColor: "#f0f0f0",
    dotColor: iconColor,
    dotSize: 6,
    lineWidth: 2,
    chartType: "line",
    strokeType: "monotone",
    tooltip: "bg-white border border-purple-100 shadow-md rounded-md",
  };
};
