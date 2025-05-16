
import { StyleOptions } from "./types";

export const getPastelStyle = (): StyleOptions => {
  return {
    cardBg: "bg-pink-50 border-pink-200",
    headerBg: "bg-pink-100 border-b border-pink-200",
    titleColor: "text-pink-700",
    subtitleColor: "text-pink-500",
    buttonHoverBg: "hover:bg-pink-200",
    buttonHoverText: "hover:text-pink-700",
    iconBg: "bg-gradient-to-br from-pink-400 to-purple-300",
    iconText: "text-white",
    chartBackground: "#F8F7FF",
    lineColor: "#FFA69E",
    gridColor: "#E9E8FF",
    dotColor: "#FF7E6B",
    dotSize: 5,
    lineWidth: 2,
    chartType: "area",
    strokeType: "basis",
    tooltip: "bg-white border border-pink-100 shadow-sm rounded-lg",
  };
};
