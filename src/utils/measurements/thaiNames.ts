
/**
 * @deprecated This file is deprecated. Please use @/lib/columnTranslations instead.
 * This file exists only for backward compatibility.
 */

import { getColumnThaiName as getCentralColumnThaiName } from '@/lib/columnTranslations';

/**
 * @deprecated Use getColumnThaiName from @/lib/columnTranslations instead
 */
export const getMeasurementThaiName = (symbol: string): string | undefined => {
  console.warn('getMeasurementThaiName is deprecated. Use getColumnThaiName from @/lib/columnTranslations instead.');
  const result = getCentralColumnThaiName(symbol);
  return result === symbol ? undefined : result; // Return undefined if no translation found (original behavior)
};
