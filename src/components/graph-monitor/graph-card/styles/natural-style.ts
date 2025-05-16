
import { StyleOptions } from "./types";

export const getNaturalStyle = (): StyleOptions => {
  return {
    cardBg: "bg-[#F5F5F2] border-[#E8E6DD] dark:bg-[#1F2A1D] dark:border-[#2A3626] hover:bg-gradient-to-br hover:from-[#F5F5F2] hover:to-[#F0F0ED]", // Even less yellow
    headerBg: "bg-gradient-to-r from-[#F0F0ED] to-[#E8E6DD] border-b border-[#E8E6DD] dark:bg-[#242F22] dark:border-[#2A3626]", // Even less yellow
    titleColor: "text-[#2E582C] dark:text-[#81B37A]",
    subtitleColor: "text-[#6B8E67] dark:text-[#5B885B]",
    buttonHoverBg: "hover:bg-[#E5E3DC] dark:hover:bg-[#2A3626]",
    buttonHoverText: "hover:text-[#2E582C] dark:hover:text-[#81B37A]",
    iconBg: "bg-gradient-to-br from-[#81B37A] to-[#4D8A53]",
    iconText: "text-white",
    chartBackground: "#F5F5F2", // Less yellow
    lineColor: "#4D8A53",
    gridColor: "#E5E3DC",
    dotColor: "#6B8E67",
    dotSize: 6,
    lineWidth: 3,
    chartType: "area",
    strokeType: "monotone",
    tooltip: "bg-[#F5F5F2] border border-[#E8E6DD] shadow-md rounded-md dark:bg-[#1F2A1D] dark:border-[#2A3626]", // Less yellow
    gradientFrom: "#8CBD5F",
    gradientTo: "rgba(139, 189, 95, 0.1)"
  };
};
