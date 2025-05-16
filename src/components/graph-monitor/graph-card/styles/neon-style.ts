
import { StyleOptions } from "./types";

export const getNeonStyle = (): StyleOptions => {
  return {
    cardBg: "bg-gray-900 border-cyan-600",
    headerBg: "bg-gray-950 border-b border-cyan-700",
    titleColor: "text-cyan-300",
    subtitleColor: "text-cyan-500",
    buttonHoverBg: "hover:bg-cyan-900",
    buttonHoverText: "hover:text-cyan-300",
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    iconText: "text-white",
    chartBackground: "rgb(8, 8, 32)",
    lineColor: "#00FFFF",
    gridColor: "rgba(0, 255, 255, 0.2)",
    dotColor: "#FFFFFF",
    dotSize: 8,
    lineWidth: 3,
    chartType: "line",
    strokeType: "monotone", 
    tooltip: "bg-gray-900 border border-cyan-500 text-white shadow-lg rounded-md",
  };
};
