// This file is for custom calculation functions.

interface MeasurementData {
  [key: string]: number;
}

/**
 * Calculates the yield in Haab ("หาบ").
 * 1 Haab = 60 kg.
 * The formula first calculates the weight in kg: ((whole_kernels + head_rice) * 660) / 100
 * Then it converts kg to Haab: result_in_kg / 60
 * @param data - An object containing measurement values, e.g., { whole_kernels: 10, head_rice: 50 }
 * @returns The calculated yield in Haab.
 */
export function calculateYieldInHaab(data: MeasurementData): number {
  const wholeKernels = data.whole_kernels || 0;
  const headRice = data.head_rice || 0;

  if (wholeKernels === 0 && headRice === 0) {
    return 0;
  }

  const resultInKg = ((wholeKernels + headRice) * 660) / 100;
  const resultInHaab = resultInKg / 60;
  return resultInHaab;
}

