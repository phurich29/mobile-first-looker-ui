
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { RicePrice } from "@/features/user-management/types";

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
