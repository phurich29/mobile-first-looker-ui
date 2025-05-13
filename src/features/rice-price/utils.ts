
// Get text color class based on price color
export const getPriceColorClass = (color: string = 'black') => {
  switch (color) {
    case 'green': return 'text-emerald-600';
    case 'red': return 'text-red-600';
    default: return 'text-gray-900';
  }
};

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
