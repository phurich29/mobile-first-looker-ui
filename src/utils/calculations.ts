// This file is for custom calculation functions.

interface MeasurementData {
  [key: string]: number;
}

/**
 * Calculates the percentage of head rice ("% ข้าวต้น").
 * Formula: ((whole_kernels + head_rice) * 660) / 100
 * @param data - An object containing measurement values, e.g., { whole_kernels: 10, head_rice: 50 }
 * @returns The calculated percentage of head rice.
 */
export function calculateHeadRicePercentage(data: MeasurementData): number {
  const wholeKernels = data.whole_kernels || 0;
  const headRice = data.head_rice || 0;

  if (wholeKernels === 0 && headRice === 0) {
    return 0;
  }

  const result = ((wholeKernels + headRice) * 660) / 100;
  return result;
}

