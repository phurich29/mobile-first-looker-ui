

import { DataCategory } from './types';

export const DATA_CATEGORIES: Record<string, DataCategory> = {
  general: {
    title: "ข้อมูลทั่วไป",
    icon: "📋",
    color: "bg-blue-50 border-blue-200",
    fields: ['device_code', 'thai_datetime']
  },
  wholeGrain: {
    title: "พื้นข้าวเต็มเมล็ด",
    icon: "🌾",
    color: "bg-green-50 border-green-200",
    fields: ['class1', 'class2', 'class3', 'short_grain', 'slender_kernel']
  },
  composition: {
    title: "ส่วนผสม",
    icon: "🔬",
    color: "bg-purple-50 border-purple-200", 
    fields: ['whole_kernels', 'head_rice', 'total_brokens', 'small_brokens', 'small_brokens_c1']
  },
  characteristics: {
    title: "สิ่งเจือปน",
    icon: "⚠️",
    color: "bg-orange-50 border-orange-200",
    fields: [
      'red_line_rate', 'parboiled_red_line', 'parboiled_white_rice', 'honey_rice',
      'yellow_rice_rate', 'black_kernel', 'partly_black_peck', 'partly_black',
      'imperfection_rate', 'sticky_rice_rate', 'impurity_num', 'paddy_rate',
      'whiteness', 'process_precision'
    ]
  }
};

