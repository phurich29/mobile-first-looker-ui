
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
  style?: GraphStyle;
  color?: string;
  chartType?: 'line' | 'area' | 'bar';
  showGrid?: boolean;
  showTooltip?: boolean;
}
