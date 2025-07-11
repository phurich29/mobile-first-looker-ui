import { getNotificationSetting } from '../types';

export const formatWholeGrainItems = (
  wholeGrainData: any[] | null, 
  deviceCode: string | undefined, 
  getNotificationSetting: getNotificationSetting
) => {
  if (!wholeGrainData || wholeGrainData.length === 0) return [];

  const latestData = wholeGrainData[0];
  const items = [
    { 
      symbol: 'class1', 
      name: 'ชั้น 1 (>7.0mm)', 
      price: latestData.class1?.toFixed(1), 
      iconColor: '#9b87f5', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'class2', 
      name: 'ชั้น 2 (>6.6-7.0mm)', 
      price: latestData.class2?.toFixed(1), 
      iconColor: '#7E69AB', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'class3', 
      name: 'ชั้น 3 (>6.2-6.6mm)', 
      price: latestData.class3?.toFixed(1), 
      iconColor: '#6E59A5', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'short_grain', 
      name: 'เมล็ดสั้น', 
      price: latestData.short_grain?.toFixed(1), 
      iconColor: '#333333', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'slender_kernel', 
      name: 'ข้าวลีบ', 
      price: latestData.slender_kernel?.toFixed(1), 
      iconColor: '#D6BCFA', 
      updatedAt: new Date(latestData.created_at) 
    }
  ];
  
  // Add notification setting data to items
  return items.map(item => {
    const setting = getNotificationSetting(item.symbol);
    return {
      ...item,
      deviceName: deviceCode || '',
      notificationType: setting?.type,
      threshold: setting?.threshold,
      enabled: setting?.enabled
    };
  });
};

export const formatIngredientItems = (
  ingredientsData: any[] | null, 
  deviceCode: string | undefined,
  getNotificationSetting: getNotificationSetting
) => {
  if (!ingredientsData || ingredientsData.length === 0) return [];

  const latestData = ingredientsData[0];
  const items = [
    { 
      symbol: 'whole_kernels', 
      name: 'เต็มเมล็ด', 
      price: latestData.whole_kernels?.toFixed(1), 
      iconColor: '#4CAF50', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'head_rice', 
      name: 'ต้นข้าว', 
      price: latestData.head_rice?.toFixed(1), 
      iconColor: '#9b87f5', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'total_brokens', 
      name: 'ข้าวหักรวม', 
      price: latestData.total_brokens?.toFixed(1), 
      iconColor: '#7E69AB', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'small_brokens', 
      name: 'ปลายข้าว', 
      price: latestData.small_brokens?.toFixed(1), 
      iconColor: '#6E59A5', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'small_brokens_c1', 
      name: 'ปลายข้าว C1', 
      price: latestData.small_brokens_c1?.toFixed(1), 
      iconColor: '#D6BCFA', 
      updatedAt: new Date(latestData.created_at) 
    }
  ];
  
  // Add notification setting data to items
  return items.map(item => {
    const setting = getNotificationSetting(item.symbol);
    return {
      ...item,
      deviceName: deviceCode || '',
      notificationType: setting?.type,
      threshold: setting?.threshold,
      enabled: setting?.enabled
    };
  });
};

export const formatImpuritiesItems = (
  impuritiesData: any[] | null,
  deviceCode: string | undefined,
  getNotificationSetting: getNotificationSetting
) => {
  if (!impuritiesData || impuritiesData.length === 0) return [];

  const latestData = impuritiesData[0];
  const items = [
    { 
      symbol: 'whiteness', 
      name: 'ความขาว', 
      price: latestData.whiteness?.toFixed(1), 
      iconColor: '#90CAF9', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'red_line_rate', 
      name: 'สีต่ำกว่ามาตรฐาน', 
      price: latestData.red_line_rate?.toFixed(1), 
      iconColor: '#9b87f5', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'parboiled_red_line', 
      name: 'เมล็ดแดง', 
      price: latestData.parboiled_red_line?.toFixed(1), 
      iconColor: '#7E69AB', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'parboiled_white_rice', 
      name: 'ข้าวดิบ', 
      price: latestData.parboiled_white_rice?.toFixed(1), 
      iconColor: '#EEEEEE', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'honey_rice', 
      name: 'เมล็ดม่วง', 
      price: latestData.honey_rice?.toFixed(1), 
      iconColor: '#6E59A5', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'yellow_rice_rate', 
      name: 'เมล็ดเหลือง', 
      price: latestData.yellow_rice_rate?.toFixed(1), 
      iconColor: '#D6BCFA', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'black_kernel', 
      name: 'เมล็ดดำ', 
      price: latestData.black_kernel?.toFixed(1), 
      iconColor: '#212121', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'partly_black_peck', 
      name: 'ดำบางส่วน & จุดดำ', 
      price: latestData.partly_black_peck?.toFixed(1), 
      iconColor: '#616161', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'partly_black', 
      name: 'ดำบางส่วน', 
      price: latestData.partly_black?.toFixed(1), 
      iconColor: '#4E4E4E', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'imperfection_rate', 
      name: 'เมล็ดเสีย', 
      price: latestData.imperfection_rate?.toFixed(1), 
      iconColor: '#9E9E9E', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'sticky_rice_rate', 
      name: 'ข้าวเหนียว', 
      price: latestData.sticky_rice_rate?.toFixed(1), 
      iconColor: '#907AD6', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'impurity_num', 
      name: 'เมล็ดอื่นๆ', 
      price: latestData.impurity_num?.toFixed(1), 
      iconColor: '#7986CB', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'paddy_rate', 
      name: 'ข้าวเปลือก(เมล็ด/กก.)', 
      price: latestData.paddy_rate?.toFixed(1), 
      iconColor: '#81C784', 
      updatedAt: new Date(latestData.created_at) 
    },
    { 
      symbol: 'process_precision', 
      name: 'ระดับขัดสี', 
      price: latestData.process_precision?.toFixed(1), 
      iconColor: '#80DEEA', 
      updatedAt: new Date(latestData.created_at) 
    }
  ];
  
  // Add notification setting data to items
  return items.map(item => {
    const setting = getNotificationSetting(item.symbol);
    return {
      ...item,
      deviceName: deviceCode || '',
      notificationType: setting?.type,
      threshold: setting?.threshold,
      enabled: setting?.enabled
    };
  });
};
