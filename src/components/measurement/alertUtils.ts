
import { getLatestMeasurement } from "@/components/measurement-history/api";

// Function to check if an alert should be active based on notification settings and current value
export const checkAlertCondition = (
  value: number | null,
  notificationType?: 'min' | 'max' | 'both',
  threshold?: string,
  enabled: boolean = false
): boolean => {
  if (!enabled || !notificationType || !threshold || value === null) {
    return false;
  }

  const thresholdValue = parseFloat(threshold);
  
  if (notificationType === 'min') {
    // Alert when value is less than threshold
    return value < thresholdValue;
  } else if (notificationType === 'max') {
    // Alert when value is greater than threshold
    return value > thresholdValue;
  } else if (notificationType === 'both') {
    // Alert when value is outside the specified range (format: "min-max")
    const [minThreshold, maxThreshold] = threshold.split('-').map(parseFloat);
    return value < minThreshold || value > maxThreshold;
  }
  
  return false;
};

// Function to fetch latest measurement value
export const fetchLatestMeasurementValue = async (
  deviceCode: string | undefined,
  symbol: string,
  enabled: boolean = true,
  notificationType?: 'min' | 'max' | 'both',
  threshold?: string
): Promise<{
  value: number | null;
  timestamp: string | null;
  isAlertActive: boolean;
}> => {
  if (!deviceCode || !symbol || !enabled || !notificationType || !threshold) {
    return { value: null, timestamp: null, isAlertActive: false };
  }

  try {
    const result = await getLatestMeasurement(deviceCode, symbol);
    
    if (result.value !== null) {
      const isAlertActive = checkAlertCondition(
        result.value,
        notificationType,
        threshold,
        enabled
      );
      
      return {
        value: result.value,
        timestamp: result.timestamp,
        isAlertActive
      };
    }
  } catch (error) {
    console.error("Error fetching latest measurement:", error);
  }
  
  return { value: null, timestamp: null, isAlertActive: false };
};
