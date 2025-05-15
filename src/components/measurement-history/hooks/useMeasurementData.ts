
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TimeFrame } from "../MeasurementHistory";
import { fetchMeasurementHistory, calculateAverage, formatBangkokTime } from "../api";

interface UseMeasurementDataProps {
  deviceCode: string;
  symbol: string;
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
  
  const latestEntry = historyData && historyData.length > 0 ? historyData[0] : null;
  const latestValue = latestEntry ? latestEntry[symbol] : 0;
  
  // Safely handle date formatting with proper type checking
  const dateTimeInfo = { thaiDate: "", thaiTime: "" };
  if (latestEntry) {
    const dateString = latestEntry?.created_at || latestEntry?.thai_datetime;
    if (dateString) {
      const formatted = formatBangkokTime(dateString);
      dateTimeInfo.thaiDate = formatted.thaiDate;
      dateTimeInfo.thaiTime = formatted.thaiTime;
    }
  }

  return {
    historyData,
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
