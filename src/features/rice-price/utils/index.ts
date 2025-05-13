
export * from './formatting';

// Get price color class based on price color value
export const getPriceColorClass = (priceColor: string | null | undefined): string => {
  if (!priceColor) return 'text-gray-700';
  
  switch (priceColor.toLowerCase()) {
    case 'green':
      return 'text-emerald-600';
    case 'red':
      return 'text-red-600';
    case 'blue':
      return 'text-blue-600';
    default:
      return 'text-gray-700';
  }
};

// Format price properly, handling text values
export const formatPrice = (price: string | number | null): string => {
  if (price === null || price === undefined || price === '') {
    return 'รอการอัพเดท';
  }
  
  // If price is already a string (could be a range like "3,500 - 4,500"), return it directly
  if (typeof price === 'string') {
    return price;
  }
  
  // If price is a number, format it with Thai locale
  return new Intl.NumberFormat('th-TH').format(price);
};

// Sample rice price data to display when no real data is available
export const SAMPLE_RICE_PRICES = [
  {
    id: 'sample-1',
    name: 'ข้าวหอมมะลิ 100% ชั้น 2 (66/67)',
    price: '3,700 - 3,850',
    document_date: '2568-04-29',
    priceColor: 'black',
    category: 'white-rice',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    name: 'ข้าวหอมมะลิ 100% (67/68)',
    price: '3,000 - 3,166',
    document_date: '2568-04-29',
    priceColor: 'green',
    category: 'white-rice',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    name: 'ข้าวหอมปทุมธานี',
    price: '2,500 - 2,650',
    document_date: '2568-04-29',
    priceColor: 'red',
    category: 'white-rice',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    name: 'ข้าวเหนียว กข.6',
    price: '3,200 - 3,300',
    document_date: '2568-04-29',
    priceColor: 'black',
    category: 'sticky-rice',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Sample rice price document data
export const SAMPLE_RICE_DOCUMENTS = [
  {
    id: 'doc-1',
    document_date: '2568-04-29',
    file_url: '/rice-prices/29-04-2568.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];
