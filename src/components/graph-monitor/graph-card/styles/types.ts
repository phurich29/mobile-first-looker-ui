
import { GraphStyle } from "../../types";

export interface StyleOptions {
  cardBg: string;
  headerBg: string;
  titleColor: string;
  subtitleColor: string;
  buttonHoverBg: string;
  buttonHoverText: string;
  iconBg: string;
  iconText: string;
  chartBackground: string;
  lineColor: string;
  gridColor: string;
  dotColor: string;
  dotSize: number;
  lineWidth: number;
  chartType: "line" | "area";
  strokeType: string;
  tooltip: string;
  gradientFrom?: string;
  gradientTo?: string;
}
