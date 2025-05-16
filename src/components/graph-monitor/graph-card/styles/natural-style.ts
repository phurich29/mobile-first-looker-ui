
import { StyleOptions } from "./types";

export const getNaturalStyle = (): StyleOptions => {
  return {
    cardBg: "bg-[#F8F7F2] border-[#E8E6DD] dark:bg-[#1F2A1D] dark:border-[#2A3626]",
    headerBg: "bg-[#F0EEE6] border-b border-[#E8E6DD] dark:bg-[#242F22] dark:border-[#2A3626]",
    titleColor: "text-[#2E582C] dark:text-[#81B37A]",
    subtitleColor: "text-[#6B8E67] dark:text-[#5B885B]",
    buttonHoverBg: "hover:bg-[#E5E3DC] dark:hover:bg-[#2A3626]",
    buttonHoverText: "hover:text-[#2E582C] dark:hover:text-[#81B37A]",
    iconBg: "bg-gradient-to-br from-[#8CBD5F] to-[#4D8A53]",
    iconText: "text-white",
    chartBackground: "#F8F7F2",
    lineColor: "#4D8A53",
    gridColor: "#E5E3DC",
    dotColor: "#2E582C",
    dotSize: 5,
    lineWidth: 2,
    chartType: "area",
    strokeType: "monotone",
    tooltip: "bg-[#F8F7F2] border border-[#E8E6DD] shadow-md rounded-md dark:bg-[#1F2A1D] dark:border-[#2A3626]",
    gradientFrom: "#8CBD5F",
    gradientTo: "rgba(140, 189, 95, 0.1)"
  };
};
