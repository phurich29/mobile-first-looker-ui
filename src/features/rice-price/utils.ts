// Get text color class based on price color
export const getPriceColorClass = (color: string = 'black') => {
  switch (color) {
    case 'green': return 'text-emerald-600';
    case 'red': return 'text-red-600';
    default: return 'text-gray-900';
  }
};

// These functions are moved to formatting.ts
// Keeping the exports here to maintain backward compatibility
export { formatThaiDate, getLatestUpdateTimestamp } from './utils/formatting';
