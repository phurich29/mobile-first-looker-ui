
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useMeasurementData } from "./useMeasurementData";
import { getNotificationSettings } from "../api";
import { convertUrlSymbolToMeasurementSymbol, getMeasurementName } from "../utils/symbolMapping";

interface UseMeasurementHistoryStateProps {
  deviceCode?: string;
  symbol?: string;
  name?: string;
}

export const useMeasurementHistoryState = ({ 
  deviceCode: propDeviceCode, 
  symbol: propSymbol, 
  name: propName 
}: UseMeasurementHistoryStateProps) => {
  const params = useParams<{ deviceCode: string; symbol: string }>();
  const { toast } = useToast();
  
  // Use props if available, otherwise use URL parameters and convert URL symbol
  const deviceCode = propDeviceCode || params.deviceCode;
  const urlSymbol = propSymbol || params.symbol;
  const symbol = urlSymbol ? convertUrlSymbolToMeasurementSymbol(urlSymbol) : null;
  const name = propName || (symbol ? getMeasurementName(symbol) : null);
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  
  // Make sure we have valid device code and symbol before using them
  const safeDeviceCode = deviceCode || '';
  const safeSymbol = symbol || '';
  
  const { 
    historyData,
    isLoading,
    isError,
    timeFrame,
    setTimeFrame,
    averageValue,
    dateTimeInfo
  } = useMeasurementData({ 
    deviceCode: safeDeviceCode, 
    symbol: safeSymbol 
  });

  // Calculate min and max values
  const measurementValues = historyData.map(d => d[safeSymbol]).filter(v => v !== null && v !== undefined);
  const minValue = measurementValues.length > 0 ? Math.min(...measurementValues) : 0;
  const maxValue = measurementValues.length > 0 ? Math.max(...measurementValues) : 0;

  // Show error toast if there's an error
  useEffect(() => {
    if (isError) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลประวัติได้",
        variant: "destructive",
      });
    }
  }, [isError, toast]);
  
  // Function to load notification settings
  const loadNotificationStatus = async () => {
    if (safeDeviceCode && safeSymbol) {
      try {
        const settings = await getNotificationSettings(safeDeviceCode, safeSymbol);
        setNotificationEnabled(settings?.enabled || false);
      } catch (error) {
        console.error("Failed to load notification status:", error);
      }
    }
  };
  
  // Load notification settings initially and when dialog closes
  useEffect(() => {
    loadNotificationStatus();
  }, [safeDeviceCode, safeSymbol]);
  
  // Reload notification settings when dialog closes
  const handleOpenChange = (open: boolean) => {
    setSettingsOpen(open);
    if (!open) {
      // Dialog was closed, reload notification settings
      loadNotificationStatus();
    }
  };

  return {
    deviceCode,
    symbol,
    name,
    settingsOpen,
    setSettingsOpen,
    notificationEnabled,
    historyData,
    isLoading,
    isError,
    timeFrame,
    setTimeFrame,
    averageValue,
    minValue,
    maxValue,
    dateTimeInfo,
    handleOpenChange,
    isValidData: !!(deviceCode && symbol)
  };
};
