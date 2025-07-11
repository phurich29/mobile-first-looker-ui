interface DeviceData {
  whole_kernels?: number;
  head_rice?: number;
  [key: string]: any;
}

export const calculateYieldInHaab = (deviceData: DeviceData): number => {
  const wholeKernels = deviceData.whole_kernels ?? 0;
  const headRice = deviceData.head_rice ?? 0;

  // 1. Calculate Yield in kg
  const yieldKg = ((wholeKernels + headRice) * 660) / 100;

  // 2. Calculate contamination (10% of yield in kg)
  const contamination = yieldKg * 0.1;

  // 3. Subtract contamination from yield
  const netYieldKg = yieldKg - contamination;

  // 4. Convert to Haab (1 Haab = 60 kg)
  const yieldHaab = netYieldKg / 60;

  return yieldHaab;
};



