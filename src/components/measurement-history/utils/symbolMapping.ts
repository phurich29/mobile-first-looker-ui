
// Helper function to convert URL symbol back to measurement symbol
export const convertUrlSymbolToMeasurementSymbol = (urlSymbol: string): string => {
  const symbolMap: Record<string, string> = {
    '70mm': 'class1',
    'class1': 'class1',
    'class2': 'class2', 
    'class3': 'class3',
    'shortgrain': 'short_grain',
    'slenderkernel': 'slender_kernel',
    'wholekernels': 'whole_kernels',
    'headrice': 'head_rice',
    'totalbrokens': 'total_brokens',
    'smallbrokens': 'small_brokens',
    'smallbrokensc1': 'small_brokens_c1',
    'smallbrokenc1': 'small_brokens_c1',
    'redlinerate': 'red_line_rate',
    'parboiledredline': 'parboiled_red_line',
    'parboiledwhiterice': 'parboiled_white_rice',
    'honeyrice': 'honey_rice',
    'yellowricerate': 'yellow_rice_rate',
    'blackkernel': 'black_kernel',
    'partlyblackpeck': 'partly_black_peck',
    'partlyblack': 'partly_black',
    'imperfectionrate': 'imperfection_rate',
    'stickyricerate': 'sticky_rice_rate',
    'impuritynum': 'impurity_num',
    'paddyrate': 'paddy_rate',
    'whiteness': 'whiteness',
    'processprecision': 'process_precision'
  };
  
  return symbolMap[urlSymbol.toLowerCase()] || urlSymbol;
};

// Helper function to get measurement name
export const getMeasurementName = (symbol: string): string => {
  const nameMap: Record<string, string> = {
    'class1': 'ชั้น 1 (>7.0 mm)',
    'class2': 'ชั้น 2 (5.5-7.0 mm)',
    'class3': 'ชั้น 3 (<5.5 mm)',
    'short_grain': 'เมล็ดสั้น',
    'slender_kernel': 'เมล็ดยาว',
    'whole_kernels': 'เมล็ดเต็ม',
    'head_rice': 'ต้นข้าว',
    'total_brokens': 'ข้าวหักรวม',
    'small_brokens': 'ปลายข้าว',
    'small_brokens_c1': 'ปลายข้าว C1',
    'red_line_rate': 'อัตราเส้นแดง',
    'parboiled_red_line': 'ข้าวสุกเส้นแดง',
    'parboiled_white_rice': 'ข้าวสุกขาว',
    'honey_rice': 'ข้าวน้ำผึ้ง',
    'yellow_rice_rate': 'อัตราข้าวเหลือง',
    'black_kernel': 'เมล็ดดำ',
    'partly_black_peck': 'จุดดำบางส่วน',
    'partly_black': 'ดำบางส่วน',
    'imperfection_rate': 'อัตราข้าวด้วย',
    'sticky_rice_rate': 'อัตราข้าวเหนียว',
    'impurity_num': 'จำนวนสิ่งปนเปื้อน',
    'paddy_rate': 'อัตราข้าวเปลือก',
    'whiteness': 'ความขาว',
    'process_precision': 'ความแม่นยำกระบวนการ'
  };
  
  return nameMap[symbol] || symbol;
};
