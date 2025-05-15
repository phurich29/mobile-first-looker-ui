
import React, { useState, useEffect } from "react";
import HistoryHeader from "./HistoryHeader";  // Fixed import
import HistoryChart from "./HistoryChart";    // Fixed import
import HistoryFooter from "./HistoryFooter";  // Fixed import
import { fetchMeasurementHistory, calculateAverage } from "./api";
import { NotificationSettingsDialog } from "./notification-settings";
import { useToast } from "@/hooks/use-toast";

export type TimeFrame = '1h' | '24h' | '7d' | '30d';

interface MeasurementHistoryProps {
  deviceCode: string;
  symbol: string;
  name: string;
  unit?: string;
  onClose?: () => void;  // Added onClose prop
}

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({ 
  deviceCode, 
  symbol, 
  name,
  unit,
  onClose
}) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24h');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [average, setAverage] = useState<number>(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadHistoryData = async () => {
      if (!deviceCode || !symbol) return;
      
      setLoading(true);
      try {
        const data = await fetchMeasurementHistory(deviceCode, symbol, timeFrame);
        setHistoryData(data);
        
        // Calculate average
        const avg = calculateAverage(data, symbol);
        setAverage(avg);
        
        setError(null);
      } catch (err) {
        console.error("Failed to load history data:", err);
        setError("ไม่สามารถโหลดข้อมูลประวัติได้");
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลประวัติได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadHistoryData();
  }, [deviceCode, symbol, timeFrame, toast]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <HistoryHeader 
        name={name}
        unit={unit}
        average={average}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      
      <HistoryChart 
        data={historyData} 
        dataKey={symbol}
        isLoading={loading}
        error={error}
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
