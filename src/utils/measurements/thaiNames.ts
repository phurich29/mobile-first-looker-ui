
// Function to get Thai name for measurement symbols
export const getMeasurementThaiName = (symbol: string): string | undefined => {
  const measurementNames: Record<string, string> = {
    // Whole grain metrics
    "class1": "ชั้น 1 (>7.0mm)",
    "class2": "ชั้น 2 (>6.6-7.0mm)",
    "class3": "ชั้น 3 (>6.2-6.6mm)",
    "short_grain": "เมล็ดสั้น",
    "slender_kernel": "ข้าวลีบ",
    
    // Ingredients metrics
    "whole_kernels": "เต็มเมล็ด",
    "head_rice": "ต้นข้าว",
    "total_brokens": "ข้าวหักรวม",
    "small_brokens": "ปลายข้าว",
    "small_brokens_c1": "ปลายข้าวC1",
    
    // Impurities metrics
    "red_line_rate": "สีต่ำกว่ามาตรฐาน",
    "parboiled_red_line": "เมล็ดแดง",
    "parboiled_white_rice": "ข้าวดิบ",
    "honey_rice": "เมล็ดม่วง",
    "yellow_rice_rate": "เมล็ดเหลือง",
    "black_kernel": "เมล็ดดำ",
    "partly_black_peck": "ดำบางส่วน & จุดดำ",
    "partly_black": "ดำบางส่วน",
    "imperfection_rate": "เมล็ดเสีย",
    "sticky_rice_rate": "ข้าวเหนียว",
    "impurity_num": "เมล็ดอื่นๆ",
    "paddy_rate": "ข้าวเปลือก(เมล็ด/กก.)",
    "whiteness": "ความขาว",
    "process_precision": "ระดับขัดสี"
  };
  
  return measurementNames[symbol];
};
