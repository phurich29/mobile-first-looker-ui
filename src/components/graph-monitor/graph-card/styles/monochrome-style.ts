
import { StyleOptions } from "./types";

export const getMonochromeStyle = (): StyleOptions => {
  return {
    cardBg: "bg-gray-900 border-gray-700",
    headerBg: "bg-gray-800 border-b border-gray-700",
    titleColor: "text-gray-100",
    subtitleColor: "text-gray-400",
    buttonHoverBg: "hover:bg-gray-700",
    buttonHoverText: "hover:text-white",
    iconBg: "bg-gradient-to-br from-gray-600 to-gray-500",
    iconText: "text-white",
    chartBackground: "#111827",
    lineColor: "#FFFFFF",
    gridColor: "rgba(255, 255, 255, 0.1)",
    dotColor: "#FFFFFF",
    dotSize: 4,
    lineWidth: 1,
    chartType: "line",
    strokeType: "stepAfter",
    tooltip: "bg-gray-800 border border-gray-600 text-white shadow-sm rounded-md",
  };
};
