export interface SelectedGraph {
  deviceCode: string;
  symbol: string;
  name: string;
  deviceName?: string;
  barColor?: string; // เพิ่มตัวแปรเก็บสีกราฟแท่งที่ผู้ใช้เลือก
  lineColor?: string; // เพิ่มตัวแปรเก็บสีเส้นค่าเฉลี่ยที่ผู้ใช้เลือก
}

export type GraphStyle = 
  | "classic" 
  | "natural" 
  | "neon" 
  | "pastel" 
  | "monochrome" 
  | "gradient";
