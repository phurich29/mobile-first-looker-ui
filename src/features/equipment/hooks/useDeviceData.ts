// ⚠️ DEPRECATED: This hook is replaced by useDevicesQuery for better React Query integration
// Use src/features/equipment/hooks/useDevicesQuery.ts instead

import { useDevicesQuery } from "./useDevicesQuery";

/**
 * @deprecated Use useDevicesQuery instead for better React Query integration
 * This hook is kept for backward compatibility but should not be used in new code
 */
export function useDeviceData() {
  console.warn("⚠️ useDeviceData is deprecated. Use useDevicesQuery instead.");
  
  const queryResult = useDevicesQuery();
  
  // Add backward compatibility for handleRefresh
  return {
    ...queryResult,
    handleRefresh: async () => {
      await queryResult.refetch();
    }
  };
}