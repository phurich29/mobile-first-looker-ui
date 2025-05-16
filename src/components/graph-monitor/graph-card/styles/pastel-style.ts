
import { StyleOptions } from "./types";

export const getPastelStyle = (): StyleOptions => {
  return {
    cardBg: "bg-pink-50 border-pink-200 hover:bg-gradient-to-br hover:from-pink-50 hover:to-yellow-50",
    headerBg: "bg-gradient-to-r from-pink-100 to-yellow-100 border-b border-pink-200",
    titleColor: "text-pink-700",
    subtitleColor: "text-pink-500",
    buttonHoverBg: "hover:bg-pink-200",
    buttonHoverText: "hover:text-pink-700",
    iconBg: "bg-gradient-to-br from-pink-400 to-yellow-300",
    iconText: "text-white",
    chartBackground: "#FFF9F9",
    lineColor: "#FFA69E",
    gridColor: "#F3E8FF",
    dotColor: "#FF7E6B",
    dotSize: 6,
    lineWidth: 3,
    chartType: "area",
    strokeType: "basis",
    tooltip: "bg-white border border-pink-100 shadow-sm rounded-lg",
  };
};
