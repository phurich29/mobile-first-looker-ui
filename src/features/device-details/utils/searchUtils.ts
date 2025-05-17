
import { MeasurementItem } from "../types";

/**
 * Filter measurement items based on search term
 */
export const filterMeasurementsBySearchTerm = (
  items: MeasurementItem[],
  searchTerm: string
): MeasurementItem[] => {
  if (!searchTerm) return items;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return items.filter(item => 
    item.name.toLowerCase().includes(lowerSearchTerm) || 
    item.symbol.toLowerCase().includes(lowerSearchTerm)
  );
};
