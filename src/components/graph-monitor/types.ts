
export interface SelectedGraph {
  deviceCode: string;
  deviceName: string;
  symbol: string;
  name: string;
}

export type GraphStyle = 
  | "classic" 
  | "neon" 
  | "pastel" 
  | "monochrome" 
  | "gradient";
