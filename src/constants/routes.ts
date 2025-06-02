
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  WAITING: '/waiting',
  PROFILE: '/profile',
  
  // Public pages
  NEWS: '/news',
  RICE_PRICES: '/rice-prices',
  
  // Equipment & Measurements
  EQUIPMENT: '/equipment',
  MEASUREMENTS: '/measurements',
  NEW_QUALITY_MEASUREMENTS: '/new-quality-measurements',
  DEVICE_DETAILS: (deviceCode: string) => `/device/${deviceCode}`,
  DEVICE_MEASUREMENT_HISTORY: (deviceCode: string, symbol: string) => `/device/${deviceCode}/${symbol.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
  MEASUREMENT_DETAIL: (measurementSymbol: string) => `/measurement-detail/${measurementSymbol}`,
  MEASUREMENT_HISTORY: (deviceCode: string, symbol: string) => `/measurement-history/${deviceCode}/${symbol}`,
  
  // Graphs
  GRAPH_MONITOR: '/graph-monitor',
  GRAPH_SUMMARY: '/graph-summary',
  GRAPH_SUMMARY_DETAIL: '/graph-summary-detail',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_HISTORY: '/notification-history',
  
  // Admin routes
  ADMIN: '/admin',
  USER_MANAGEMENT: '/user-management',
  DEVICE_MANAGEMENT: '/device-management',
  RICE_PRICE_MANAGEMENT: '/rice-price-management',
  NEWS_MANAGEMENT: '/news-management',
  
  // Error pages
  NOT_FOUND: '/404',
} as const;

export type RouteKey = keyof typeof ROUTES;
