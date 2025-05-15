
import { useState, useEffect } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HistoryChart from "./HistoryChart";
import HistoryHeader from "./HistoryHeader";
import TimeframeSelector from "./TimeframeSelector";
import HistoryFooter from "./HistoryFooter";
import { NotificationSettingsDialog } from "./notification-settings";
import { useMeasurementData } from "./hooks/useMeasurementData";
import { getNotificationSettings } from "./api";

export type TimeFrame = '1h' | '24h' | '7d' | '30d';

interface MeasurementHistoryProps {
  symbol: string;
  name: string;
  deviceCode: string;
  onClose: () => void;
}

const MeasurementHistory = ({ symbol, name, deviceCode, onClose }: MeasurementHistoryProps) => {
  const [openSettings, setOpenSettings] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean | null>(null);
  
  const {
    historyData,
    isLoading,
    timeFrame,
    setTimeFrame
  } = useMeasurementData({ deviceCode, symbol });

  // Check notification status when component loads
  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        const settings = await getNotificationSettings(deviceCode, symbol);
        if (settings) {
          // Notification is enabled if main toggle is on AND at least one threshold is active
          const isEnabled = settings.enabled && 
            ((settings.min_enabled && settings.min_threshold !== null) || 
             (settings.max_enabled && settings.max_threshold !== null));
          setNotificationEnabled(isEnabled);
        } else {
          setNotificationEnabled(false);
        }
      } catch (error) {
        console.error("Failed to check notification status:", error);
        setNotificationEnabled(null);
      }
    };
    
    checkNotificationStatus();
  }, [deviceCode, symbol, openSettings]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <div className="pt-4 px-4 pb-2 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium text-center flex-1">ข้อมูลย้อนหลัง</h2>
          <div className="w-8"></div> {/* Placeholder for balance */}
        </div>
        
        <HistoryHeader
          symbol={symbol}
          name={name}
          historyData={historyData}
          isLoading={isLoading}
        />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm"
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 flex items-center gap-1"
              onClick={() => setOpenSettings(true)}
            >
              <Bell className="h-4 w-4" />
              <span className="text-sm">ตั้งค่าแจ้งเตือน</span>
            </Button>
            
            {notificationEnabled !== null && (
              <Badge 
                className={`text-xs ${notificationEnabled 
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {notificationEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </Badge>
            )}
          </div>
          
          <TimeframeSelector
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
          />
        </div>
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
