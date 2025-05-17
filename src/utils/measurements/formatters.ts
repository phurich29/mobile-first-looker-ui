
// Helper function to calculate change between two values
export const calculateChange = (current: number | null, previous: number | null): number => {
  if (current === null || previous === null) return 0;
  return current - previous;
};

// Helper function to determine if a change should be shown as positive (green)
// Always returns true for making everything green as requested
export const isPositiveChange = (): boolean => {
  return true; // Always return true to make everything green
};
