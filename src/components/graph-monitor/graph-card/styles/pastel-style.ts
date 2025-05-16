
import { StyleOptions } from "./types";

export const getPastelStyle = (): StyleOptions => {
  return {
    cardBg: "bg-blue-50/80 border-blue-200/80 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50", // Changed from pink to blue
    headerBg: "bg-gradient-to-r from-blue-100/90 to-indigo-100/80 border-b border-blue-200/80", // Changed from pink/rose to blue/indigo
    titleColor: "text-indigo-700", // Changed from rose to indigo
    subtitleColor: "text-indigo-500", // Changed from rose to indigo
    buttonHoverBg: "hover:bg-indigo-200/70", // Changed from rose to indigo
    buttonHoverText: "hover:text-indigo-700", // Changed from rose to indigo
    iconBg: "bg-gradient-to-br from-indigo-300 to-blue-200", // Changed from rose/pink to indigo/blue
    iconText: "text-white",
    chartBackground: "#F6F8FE", // Changed from pink to blue hue
    lineColor: "#8C9EF5", // Changed from pink to blue/indigo
    gridColor: "#E8F0F9", // Changed from pink to blue/indigo
    dotColor: "#8C9EF5", // Changed to match line color
    dotSize: 6,
    lineWidth: 3,
    chartType: "area",
    strokeType: "basis",
    tooltip: "bg-white border border-blue-100/80 shadow-sm rounded-lg", // Changed from pink to blue
  };
};
