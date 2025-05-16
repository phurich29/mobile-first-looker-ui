import { GraphStyle } from "../types";

// Get icon color based on measurement type
export const getIconColor = (symbol: string) => {
  // For class measurement types
  if (symbol === "class1") return "#9b87f5"; // primary purple 
  if (symbol === "class2") return "#7E69AB"; // secondary purple
  if (symbol === "class3") return "#6E59A5"; // tertiary purple
  if (symbol === "short_grain") return "#333333"; // dark gray
  if (symbol === "slender_kernel") return "#D6BCFA"; // light purple
  
  // Colors for ingredients
  if (symbol === "whole_kernels") return "#4CAF50"; // green
  if (symbol === "head_rice") return "#9b87f5"; // primary purple
  if (symbol === "total_brokens") return "#7E69AB"; // secondary purple
  if (symbol === "small_brokens") return "#6E59A5"; // tertiary purple
  if (symbol === "small_brokens_c1") return "#D6BCFA"; // light purple
  
  // Colors for impurities
  if (symbol.includes("red")) return "#9b87f5"; // primary purple
  if (symbol.includes("white")) return "#EEEEEE"; // light gray
  if (symbol.includes("yellow")) return "#D6BCFA"; // light purple
  if (symbol.includes("black")) return "#212121"; // almost black
  
  // Default to a generated color based on the symbol
  return getColorFromSymbol(symbol);
};

// Generate a color based on the graph name to keep it consistent
export const getColorFromSymbol = (symbol: string) => {
  const hash = symbol.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colors = [
    "#9b87f5", // primary purple
    "#7E69AB", // secondary purple
    "#6E59A5", // tertiary purple
    "#D6BCFA", // light purple
    "#4C51BF", // indigo
    "#38B2AC", // teal
    "#ED64A6", // pink
    "#ED8936", // orange
    "#48BB78"  // green
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Get style names for display
export const getStyleName = (style: GraphStyle): string => {
  switch (style) {
    case "classic": return "คลาสสิก";
    case "neon": return "นีออน";
    case "pastel": return "พาสเทล";
    case "monochrome": return "โมโนโครม";
    case "gradient": return "ไล่สี";
    default: return "คลาสสิก";
  }
};

// Get styling for each graph style
export const getGraphStyles = (graphStyle: GraphStyle, graphSymbol: string) => {
  const iconColor = getIconColor(graphSymbol);
  
  switch (graphStyle) {
    case "classic":
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
    case "neon":
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
    case "pastel":
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
    case "monochrome":
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
    case "gradient":
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
    default:
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
  }
};

export const getStyleSelectButtonClass = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'classic': 
      return 'border-gray-200 bg-white/90 hover:bg-white';
    case 'neon': 
      return 'border-cyan-600 bg-gray-800 text-cyan-300 hover:bg-gray-700';
    case 'pastel': 
      return 'border-pink-200 bg-pink-100/80 text-pink-700 hover:bg-pink-100';
    case 'monochrome': 
      return 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700';
    case 'gradient':
      return 'border-indigo-600 bg-indigo-800/80 text-white hover:bg-indigo-700';
    default:
      return 'border-gray-200 bg-white/90 hover:bg-white';
  }
};

export const getStyleMenuClass = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'neon': 
      return 'bg-gray-900 border-cyan-600 text-cyan-300';
    case 'pastel': 
      return 'bg-pink-50 border-pink-200';
    case 'monochrome': 
      return 'bg-gray-900 border-gray-700 text-gray-200';
    case 'gradient': 
      return 'bg-indigo-900 border-indigo-700 text-white';
    default:
      return '';
  }
};

export const getTimeframeSelectClass = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'classic': 
      return 'border-gray-200 bg-white';
    case 'neon': 
      return 'border-cyan-600 bg-gray-800 text-cyan-300';
    case 'pastel': 
      return 'border-pink-200 bg-pink-100/80 text-pink-700';
    case 'monochrome': 
      return 'border-gray-700 bg-gray-800 text-gray-200';
    case 'gradient':
      return 'border-indigo-600 bg-indigo-800/80 text-white';
    default:
      return 'border-gray-200 bg-white';
  }
};

export const getSkeletonClass = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'classic': 
      return 'bg-purple-50';
    case 'neon': 
      return 'bg-gray-800';
    case 'pastel': 
      return 'bg-pink-100';
    case 'monochrome': 
      return 'bg-gray-800';
    case 'gradient':
      return 'bg-indigo-800';
    default:
      return 'bg-purple-50';
  }
};

export const getErrorTextClass = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'classic': 
      return 'text-gray-500';
    case 'neon': 
      return 'text-cyan-400';
    case 'pastel': 
      return 'text-pink-500';
    case 'monochrome': 
      return 'text-gray-400';
    case 'gradient':
      return 'text-indigo-200';
    default:
      return 'text-gray-500';
  }
};

export const getChartTextColor = (graphStyle: GraphStyle) => {
  switch (graphStyle) {
    case 'classic': 
      return '';
    case 'neon': 
      return 'text-cyan-300';
    case 'pastel': 
      return 'text-pink-700';
    case 'monochrome': 
      return 'text-gray-200';
    case 'gradient':
      return 'text-white';
    default:
      return '';
  }
};
