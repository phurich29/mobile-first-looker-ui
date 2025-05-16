
import { StyleOptions } from "./types";

export const getGradientStyle = (): StyleOptions => {
  return {
    cardBg: "bg-gradient-to-br from-violet-900 to-indigo-900 border-indigo-700",
    headerBg: "bg-gradient-to-r from-violet-800 to-indigo-800 border-b border-indigo-700",
    titleColor: "text-white",
    subtitleColor: "text-indigo-200",
    buttonHoverBg: "hover:bg-white/10",
    buttonHoverText: "hover:text-white",
    iconBg: "bg-gradient-to-br from-emerald-400 to-green-500",
    iconText: "text-white",
    chartBackground: "linear-gradient(180deg, #2E1065 0%, #1E1B4B 100%)",
    lineColor: "#10B981",
    gradientFrom: "#10B981",
    gradientTo: "rgba(16, 185, 129, 0.1)",
    gridColor: "rgba(255, 255, 255, 0.1)",
    dotColor: "#34D399",
    dotSize: 6,
    lineWidth: 2,
    chartType: "area",
    strokeType: "monotone",
    tooltip: "bg-emerald-900 border border-emerald-700 text-white backdrop-blur-sm shadow-md rounded-md",
  };
};
