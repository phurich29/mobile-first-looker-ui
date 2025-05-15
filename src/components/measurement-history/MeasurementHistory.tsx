
import React, { useState } from "react";
import { ChevronLeft, BellDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { fetchMeasurementHistory } from "./api";
import HistoryHeader from "./HistoryHeader";
import TimeframeSelector from "./TimeframeSelector";
import HistoryChart from "./HistoryChart";
import HistoryFooter from "./HistoryFooter";
import NotificationSettingsDialog from "./NotificationSettingsDialog";

export type TimeFrame = '1h' | '24h' | '7d' | '30d';

type MeasurementHistoryProps = {
  symbol: string;
  name: string;
  deviceCode: string;
  onClose: () => void;
};

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({
  symbol,
  name,
  deviceCode,
  onClose
}) => {
  // State for timeframe selection
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1h');
  
  // State for notification settings dialog
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  
  // Use React Query to fetch data
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['measurementHistory', deviceCode, symbol, timeFrame],
    queryFn: () => fetchMeasurementHistory(deviceCode, symbol, timeFrame),
    enabled: !!deviceCode && !!symbol,
  });
  
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Sub-header */}
      <div className="flex items-center p-3 border-b border-gray-200 bg-gray-50">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="mr-3 flex items-center text-gray-600 hover:bg-gray-100"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>กลับ</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-800">Data History</h1>
          <p className="text-xs text-red-500">{deviceCode}</p>
        </div>
        
        {/* Notification settings button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setNotificationDialogOpen(true)}
          className="ml-2 text-gray-600 hover:bg-gray-100"
        >
          <BellDot className="h-4 w-4 mr-1" />
          <span className="text-xs">ตั้งค่าแจ้งเตือน</span>
        </Button>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col h-[calc(100vh-140px)] p-3">
        {/* Header row with measurement info and timeframe selection */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            {/* Measurement info header */}
            <HistoryHeader 
              symbol={symbol} 
              name={name} 
              historyData={historyData} 
              isLoading={isLoading} 
            />
          </div>
          
          {/* Time frame selection */}
          <div>
            <TimeframeSelector 
              timeFrame={timeFrame} 
              setTimeFrame={setTimeFrame} 
            />
          </div>
        </div>

        {/* Chart area */}
        <HistoryChart
          historyData={historyData}
          isLoading={isLoading}
          symbol={symbol}
          timeFrame={timeFrame}
        />
        
        {/* Footer info */}
        <HistoryFooter 
          historyData={historyData} 
          timeFrame={timeFrame} 
          isLoading={isLoading}
          name={name}
        />
      </div>
      
      {/* Notification Settings Dialog */}
      <NotificationSettingsDialog
        open={notificationDialogOpen}
        onOpenChange={setNotificationDialogOpen}
        deviceCode={deviceCode}
        symbol={symbol}
        name={name}
      />
    </div>
  );
};

export default MeasurementHistory;
