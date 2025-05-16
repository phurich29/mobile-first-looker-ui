
import { StyleOptions } from "./types";

export const getPastelStyle = (): StyleOptions => {
  return {
    cardBg: "bg-pink-50/80 border-pink-200/80 hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50", // More subtle pink
    headerBg: "bg-gradient-to-r from-pink-100/90 to-rose-100/80 border-b border-pink-200/80",
    titleColor: "text-rose-700",
    subtitleColor: "text-rose-500",
    buttonHoverBg: "hover:bg-rose-200/70",
    buttonHoverText: "hover:text-rose-700",
    iconBg: "bg-gradient-to-br from-rose-300 to-pink-200",
    iconText: "text-white",
    chartBackground: "#FEF6F7", // Softer background
    lineColor: "#F17C8A", // Softer line color
    gridColor: "#F9E8EF", // Softer grid color
    dotColor: "#F17C8A", // Matching dot color
    dotSize: 6,
    lineWidth: 3,
    chartType: "area",
    strokeType: "basis",
    tooltip: "bg-white border border-pink-100/80 shadow-sm rounded-lg",
  };
};
