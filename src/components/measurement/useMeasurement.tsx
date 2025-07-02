
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
        console.log("📊 Skipping measurement fetch - missing parameters:", {
          deviceCode: !!deviceCode,
          symbol: !!symbol,
          enabled,
          notificationType,
          threshold
        });
        return;
      }

      console.log(`📊 Fetching latest measurement for ${deviceCode}:${symbol}`);
      const result = await fetchLatestMeasurementValue(
        deviceCode,
        symbol,
        enabled,
        notificationType,
        threshold
      );
      
      if (result.value !== null) {
        console.log(`📊 Updated measurement ${symbol}:`, result.value, "at", result.timestamp);
        setLatestValue(result.value);
        setLatestTimestamp(result.timestamp);
        setIsAlertActive(result.isAlertActive);
        setLastUpdated(new Date());
      } else {
        console.log(`📊 No data found for measurement ${symbol}`);
      }
    };

    // Fetch latest value on initial load
    fetchLatestValue();
    
    // Set up fetch when countdown completes
    if (lastCompleteTime) {
      console.log(`📊 Countdown triggered measurement refresh for ${symbol} at:`, new Date(lastCompleteTime).toISOString());
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
