
import { GraphStyle } from "../../types";
import { StyleOptions } from "./types";
import { getClassicStyle } from "./classic-style";
import { getNeonStyle } from "./neon-style";
import { getPastelStyle } from "./pastel-style";
import { getMonochromeStyle } from "./monochrome-style";
import { getGradientStyle } from "./gradient-style";
import { getNaturalStyle } from "./natural-style";
import { getIconColor } from "./color-utils";

export * from "./types";
export * from "./color-utils";
export * from "./style-names";
export * from "./ui-classes";

// Get styling for each graph style
export const getGraphStyles = (graphStyle: GraphStyle, graphSymbol: string): StyleOptions => {
  switch (graphStyle) {
    case "classic":
      return getClassicStyle(graphSymbol);
    case "natural":
      return getNaturalStyle();
    case "neon":
      return getNeonStyle();
    case "pastel":
      return getPastelStyle();
    case "monochrome":
      return getMonochromeStyle();
    case "gradient":
      return getGradientStyle();
    default:
      return getClassicStyle(graphSymbol);
  }
};
