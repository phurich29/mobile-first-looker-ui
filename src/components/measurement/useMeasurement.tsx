
import { useState, useEffect } from "react";
import { useGlobalCountdown } from "@/contexts/CountdownContext";
import { fetchLatestMeasurementValue } from "./alertUtils";

interface UseMeasurementProps {
  symbol: string;
  initialValue: string | undefined;
  deviceCode?: string;
  notificationType?: 'min' | 'max' | 'both';
  threshold?: string;
  enabled?: boolean;
}

export const useMeasurement = ({
  symbol,
  initialValue,
  deviceCode,
  notificationType,
  threshold,
  enabled = true
}: UseMeasurementProps) => {
  const valueToShow = initialValue || "0";
  
  // States for measurement data
  const [latestValue, setLatestValue] = useState<number | null>(parseFloat(valueToShow) || null);
  const [latestTimestamp, setLatestTimestamp] = useState<string | null>(null);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Access the global countdown context
  const { lastCompleteTime } = useGlobalCountdown();
  
  // Effect to fetch latest measurement data
  useEffect(() => {
    const fetchLatestValue = async () => {
      if (!deviceCode || !symbol || !enabled || !notificationType || !threshold) {
        return;
      }

      const result = await fetchLatestMeasurementValue(
        deviceCode,
        symbol,
        enabled,
        notificationType,
        threshold
      );
      
      if (result.value !== null) {
        setLatestValue(result.value);
        setLatestTimestamp(result.timestamp);
        setIsAlertActive(result.isAlertActive);
        setLastUpdated(new Date());
      }
    };

    // Fetch latest value on initial load
    fetchLatestValue();
    
    // Set up fetch when countdown completes
    if (lastCompleteTime) {
      fetchLatestValue();
    }
  }, [deviceCode, symbol, enabled, notificationType, threshold, lastCompleteTime]);

  return {
    valueToShow,
    latestValue,
    latestTimestamp,
    isAlertActive,
    lastUpdated
  };
};
