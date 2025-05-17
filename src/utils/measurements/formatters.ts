
// Helper function to calculate change between two values
export const calculateChange = (current: number | null, previous: number | null): number => {
  if (current === null || previous === null) return 0;
  return current - previous;
};

// Helper function to check if a value is within normal range or should trigger an alert
export const checkValueAlert = (
  value: number | null, 
  minThreshold?: number | null, 
  maxThreshold?: number | null,
  average?: number | null
): boolean => {
  if (value === null) return false;
  
  // If we have explicit thresholds, use those
  if (minThreshold !== undefined && minThreshold !== null && value < minThreshold) {
    return true;
  }
  
  if (maxThreshold !== undefined && maxThreshold !== null && value > maxThreshold) {
    return true;
  }
  
  // If we have an average value but no thresholds, use 10% deviation from average as alert condition
  if (average !== undefined && average !== null) {
    return value < average * 0.9 || value > average * 1.1;
  }
  
  return false;
};
