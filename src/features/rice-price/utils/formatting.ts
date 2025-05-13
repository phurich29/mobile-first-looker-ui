// Format date for display in Thai format
export const formatThaiDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Get the latest update timestamp from rice price data
export const getLatestUpdateTimestamp = (ricePrices: any[]): string => {
  if (!ricePrices || ricePrices.length === 0) return '';
  
  return new Date(Math.max(...ricePrices.map(p => new Date(p.updated_at).getTime())))
    .toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
};

// Format price properly, now handling text values
export const formatPrice = (price: string | number | null): string => {
  if (price === null || price === undefined || price === '') {
    return 'รอการอัพเดท';
  }
  
  // If price is already a string (which could be a range like "3,500 - 4,500"), return it directly
  if (typeof price === 'string') {
    return price;
  }
  
  // If price is a number, format it with Thai locale and currency
  return new Intl.NumberFormat('th-TH').format(price);
};
