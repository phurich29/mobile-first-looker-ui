
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";

export const formatThaiDate = (date: string): string => {
  const parsedDate = new Date(date);
  return format(parsedDate, 'dd MMMM yyyy', { locale: th });
};

export const getLatestUpdateTimestamp = (ricePrices: RicePrice[] | undefined): string => {
  if (!ricePrices || ricePrices.length === 0) {
    return 'ไม่มีข้อมูล';
  }

  // Find the most recent updated_at timestamp
  const latestDate = ricePrices.reduce((prev, current) => {
    const prevDate = prev.updated_at ? new Date(prev.updated_at) : new Date(0);
    const currentDate = current.updated_at ? new Date(current.updated_at) : new Date(0);
    return (prevDate > currentDate) ? prev : current;
  }).updated_at;

  if (!latestDate) {
    return 'ไม่มีข้อมูล';
  }

  const parsedDate = new Date(latestDate);
  return format(parsedDate, 'dd MMMM yyyy, HH:mm', { locale: th });
};

export const getPriceColorClass = (priceColor?: string): string => {
  if (!priceColor || priceColor === 'black') return 'text-gray-900';
  if (priceColor === 'green') return 'text-green-600';
  if (priceColor === 'red') return 'text-red-600';
  // Default case
  return 'text-gray-900';
};

// Function to format price or show the price text as is
export const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined) {
    return "-";
  }
  
  // If price is already a string (text input), return it directly
  if (typeof price === 'string') {
    return price;
  }
  
  // If it's a number, format it
  return price.toLocaleString('th-TH');
};

// Adding sample data for rice prices to show when no data is available
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

// Adding sample data for rice price documents
export const SAMPLE_RICE_DOCUMENTS = [
  {
    id: 'doc-1',
    document_date: '2568-04-29',
    file_url: '/rice-prices/29-04-2568.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'doc-2',
    document_date: '2568-04-22',
    file_url: 'https://example.com/document2.pdf',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];
