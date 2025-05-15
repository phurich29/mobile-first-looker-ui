
import React, { useState } from "react";
import HistoryHeader from "./HistoryHeader";
import HistoryChart from "./HistoryChart";
import HistoryFooter from "./HistoryFooter";
import { NotificationSettingsDialog } from "./notification-settings";
import { useToast } from "@/hooks/use-toast";
import { useMeasurementData } from "./hooks/useMeasurementData";

export type TimeFrame = '1h' | '24h' | '7d' | '30d';

interface MeasurementHistoryProps {
  deviceCode: string;
  symbol: string;
  name: string;
  unit?: string;
  onClose?: () => void;
}

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({ 
  deviceCode, 
  symbol, 
  name,
  unit,
  onClose
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();
  
  const { 
    historyData,
    isLoading,
    isError,
    timeFrame,
    setTimeFrame,
    averageValue,
    dateTimeInfo
  } = useMeasurementData({ deviceCode, symbol });

  // Show error toast if there's an error
  React.useEffect(() => {
    if (isError) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลประวัติได้",
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <HistoryHeader 
        name={name}
        unit={unit}
        average={averageValue}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      
      <HistoryChart 
        historyData={historyData} 
        dataKey={symbol}
        isLoading={isLoading}
        error={isError ? "ไม่สามารถโหลดข้อมูลประวัติได้" : null}
        unit={unit}
      />
      
      <HistoryFooter 
        timeFrame={timeFrame}
        onTimeFrameChange={setTimeFrame} 
      />

      <NotificationSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        deviceCode={deviceCode}
        symbol={symbol}
        name={name}
      />
    </div>
  );
};

export default MeasurementHistory;

