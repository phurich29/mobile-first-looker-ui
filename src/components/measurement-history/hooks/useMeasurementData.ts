
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TimeFrame } from "../MeasurementHistory";
import { fetchMeasurementHistory, calculateAverage, formatBangkokTime } from "../api";

interface UseMeasurementDataProps {
  deviceCode: string;
  symbol: string;
}

// Define a proper interface for history data items
interface HistoryDataItem {
  [key: string]: any;
  created_at?: string;
  thai_datetime?: string;
}

export const useMeasurementData = ({ deviceCode, symbol }: UseMeasurementDataProps) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24h');
  
  const { 
    data: historyData, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['measurementHistory', deviceCode, symbol, timeFrame],
    queryFn: () => fetchMeasurementHistory(deviceCode, symbol, timeFrame),
  });

  const averageValue = historyData ? calculateAverage(historyData, symbol) : 0;
  
  // Type guard to ensure we're dealing with an array of actual data items
  const isValidHistoryData = Array.isArray(historyData);
  const latestEntry = isValidHistoryData && historyData.length > 0 ? historyData[0] as HistoryDataItem : null;
  const latestValue = latestEntry ? latestEntry[symbol] : 0;
  
  // Safely handle date formatting with proper type checking
  const dateTimeInfo = { thaiDate: "", thaiTime: "" };
  if (latestEntry && typeof latestEntry === 'object') {
    const dateString = 
      latestEntry.created_at && typeof latestEntry.created_at === 'string' 
        ? latestEntry.created_at 
        : latestEntry.thai_datetime && typeof latestEntry.thai_datetime === 'string'
          ? latestEntry.thai_datetime
          : undefined;
    
    if (dateString) {
      const formatted = formatBangkokTime(dateString);
      dateTimeInfo.thaiDate = formatted.thaiDate;
      dateTimeInfo.thaiTime = formatted.thaiTime;
    }
  }

  return {
    historyData: isValidHistoryData ? historyData : [],
    isLoading,
    isError,
    refetch,
    timeFrame,
    setTimeFrame,
    averageValue,
    latestValue,
    dateTimeInfo
  };
};

export default useMeasurementData;

