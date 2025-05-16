
// Get color from symbol for consistent color generation
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

// Convert GraphStyle to a user-friendly name
export const getStyleName = (style: string): string => {
  switch (style) {
    case 'classic':
      return 'คลาสสิก';
    case 'neon':
      return 'นีออน';
    case 'pastel':
      return 'พาสเทล';
    case 'monochrome':
      return 'โมโนโครม';
    case 'gradient':
      return 'ไล่สี';
    case 'natural':
      return 'ธรรมชาติ';
    default:
      return style;
  }
};
