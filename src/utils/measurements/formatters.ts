
// Helper function to calculate change between two values
export const calculateChange = (current: number | null, previous: number | null): number => {
  if (current === null || previous === null) return 0;
  return current - previous;
};
