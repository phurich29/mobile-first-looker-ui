
export type GraphStyle = 'line' | 'area' | 'classic' | 'natural' | 'gradient' | 'pastel' | 'neon' | 'monochrome';

export interface SelectedMetric {
  deviceCode: string;
  deviceName: string;
  symbol: string;
  name: string;
  color: string;
  minThreshold?: number | null;
  maxThreshold?: number | null;
}
