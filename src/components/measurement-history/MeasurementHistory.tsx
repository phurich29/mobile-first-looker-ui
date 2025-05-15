
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import HistoryChart from "./HistoryChart";
import { fetchMeasurementHistory, calculateAverage, formatBangkokTime } from "./api";
import TimeframeSelector from "./TimeframeSelector";
import HistoryHeader from "./HistoryHeader";
import HistoryFooter from "./HistoryFooter";
import NotificationSettingsDialog from "./NotificationSettingsDialog";

export type TimeFrame = '1h' | '24h' | '7d' | '30d';

interface MeasurementHistoryProps {
  symbol: string;
  name: string;
  deviceCode: string;
  onClose: () => void;
}

const MeasurementHistory = ({ symbol, name, deviceCode, onClose }: MeasurementHistoryProps) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24h');
  const [openSettings, setOpenSettings] = useState(false);
  
  const { data: historyData, isLoading, isError, refetch } = useQuery({
    queryKey: ['measurementHistory', deviceCode, symbol, timeFrame],
    queryFn: () => fetchMeasurementHistory(deviceCode, symbol, timeFrame),
  });

  const averageValue = historyData ? calculateAverage(historyData, symbol) : 0;
  const latestEntry = historyData && historyData.length > 0 ? historyData[0] : null;
  const latestValue = latestEntry ? latestEntry[symbol] : 0;
  const { thaiDate, thaiTime } = formatBangkokTime(latestEntry?.created_at);

  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <div className="pt-4 px-4 pb-2 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium text-center flex-1">ข้อมูลย้อนหลัง</h2>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-emerald-600"
            onClick={() => setOpenSettings(true)}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
        
        <HistoryHeader
          name={name}
          latestValue={latestValue}
          averageValue={averageValue}
          thaiDate={thaiDate}
          thaiTime={thaiTime}
        />
        
        <TimeframeSelector
          timeFrame={timeFrame}
          onChange={handleTimeFrameChange}
        />
      </div>

      <div className="flex-1 px-4 py-4">
        <HistoryChart 
          data={historyData || []} 
          symbol={symbol}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <HistoryFooter />
      
      <NotificationSettingsDialog 
        open={openSettings} 
        onOpenChange={setOpenSettings}
        deviceCode={deviceCode}
        symbol={symbol}
        name={name}
      />
    </div>
  );
};

export default MeasurementHistory;
