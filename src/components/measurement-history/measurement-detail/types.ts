
export interface MeasurementDetail {
  id: number;
  device_code: string;
  created_at: string;
  thai_datetime: string;
  [key: string]: any;
}

export interface MeasurementDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MeasurementDetail | null;
  symbol: string;
  name: string;
}

export type GroupedData = Record<string, { key: string; value: any }[]>;
