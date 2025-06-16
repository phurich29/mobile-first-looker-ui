
import { RiceQualityData } from './types';

export const formatValue = (value: number | null): string => {
  if (value === null || value === undefined) return '-';
  return value.toFixed(2);
};

export const getColumnKeys = (data: RiceQualityData[]): string[] => {
  if (!data || data.length === 0) return [];
  
  const firstItem = data[0];
  
  // Get filtered columns - exclude specific columns
  const filteredColumns = Object.keys(firstItem).filter(key => 
    !key.startsWith('_') && 
    key !== 'sample_index' && 
    key !== 'output' &&
    key !== 'id' &&
    key !== 'created_at'
  );
  
  // Create a prioritized array with thai_datetime first, then device_code
  let orderedColumns = [];
  
  // Add thai_datetime first if it exists
  if (filteredColumns.includes('thai_datetime')) {
    orderedColumns.push('thai_datetime');
    filteredColumns.splice(filteredColumns.indexOf('thai_datetime'), 1);
  }
  
  // Add device_code next if it exists
  if (filteredColumns.includes('device_code')) {
    orderedColumns.push('device_code');
    filteredColumns.splice(filteredColumns.indexOf('device_code'), 1);
  }
  
  // Add the rest
  return [...orderedColumns, ...filteredColumns];
};

export const formatCellValue = (key: string, value: any): string => {
  if (key === 'thai_datetime') {
    return value ? 
      new Date(value).toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : '-';
  }
  
  if (key === 'device_code') {
    return value?.toString() || '-';
  }
  
  return formatValue(value);
};
