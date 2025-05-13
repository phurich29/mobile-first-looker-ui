
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
