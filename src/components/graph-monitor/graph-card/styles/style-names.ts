
import { GraphStyle } from "../../types";

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
