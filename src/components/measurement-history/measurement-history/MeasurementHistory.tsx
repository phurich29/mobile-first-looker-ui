
import { useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import HistoryChart from "../HistoryChart";
import HistoryHeader from "../HistoryHeader";
import TimeframeSelector from "../TimeframeSelector";
import HistoryFooter from "../HistoryFooter";
import { NotificationSettingsDialog } from "../notification-settings";
import { useMeasurementData } from "../hooks/useMeasurementData";

export type TimeFrame = '1h' | '24h' | '7d' | '30d';

interface MeasurementHistoryProps {
  symbol: string;
  name: string;
  deviceCode: string;
  onClose: () => void;
}

const MeasurementHistory = ({ symbol, name, deviceCode, onClose }: MeasurementHistoryProps) => {
  const [openSettings, setOpenSettings] = useState(false);
  
  const {
    historyData,
    isLoading,
    timeFrame,
    setTimeFrame
  } = useMeasurementData({ deviceCode, symbol });

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
          symbol={symbol}
          name={name}
          historyData={historyData}
          isLoading={isLoading}
        />
        
        <TimeframeSelector
          timeFrame={timeFrame}
          setTimeFrame={setTimeFrame}
        />
      </div>

      <div className="flex-1 px-4 py-4">
        <HistoryChart 
          historyData={historyData} 
          symbol={symbol}
          isLoading={isLoading}
          timeFrame={timeFrame}
        />
      </div>

      <HistoryFooter 
        historyData={historyData}
        timeFrame={timeFrame}
        isLoading={isLoading}
        name={name}
      />
      
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
