
export interface MeasurementData {
  symbol: string;
  name: string;
  value?: number;
  unit?: string;
  timestamp?: string;
}

export type GraphStyle = 'classic' | 'gradient' | 'neon' | 'pastel' | 'monochrome' | 'natural';

export interface SelectedGraph {
  deviceCode: string;
  measurementSymbol: string;
  measurementName: string;
  symbol: string;       // Added missing property
  name: string;         // Added missing property
  deviceName?: string;  // Added missing property
  style?: GraphStyle;
  color?: string;
  chartType?: 'line' | 'area' | 'bar';
  showGrid?: boolean;
  showTooltip?: boolean;
  barColor?: string;    // Added missing property
  lineColor?: string;   // Added missing property
}
