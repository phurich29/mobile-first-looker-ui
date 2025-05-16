export interface GraphStyleOptions {
  graphStyle?: string;
  barColor?: string;
  lineColor?: string;
}

export interface HistoryItem {
  [key: string]: any;
  created_at?: string;
  thai_datetime?: string;
}

export type TimeFrame = '1h' | '24h' | '7d' | '30d';
