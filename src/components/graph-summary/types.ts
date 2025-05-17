
export interface SelectedMetric {
  deviceCode: string;
  deviceName: string;
  symbol: string;
  name: string;
  color: string;
  graphStyle?: string;
  lineColor?: string;
}

export type GraphStyle = 
  | "line" 
  | "area" 
  | "classic" 
  | "natural" 
  | "neon" 
  | "pastel" 
  | "monochrome" 
  | "gradient";

export interface GraphStyleOptions {
  graphStyle?: string;
  lineColor?: string;
}
