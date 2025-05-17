
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HistoryHeader from "./HistoryHeader";
import HistoryChart from "./HistoryChart";
import HistoryFooter from "./HistoryFooter";
import { NotificationSettingsDialog } from "./notification-settings";
import { useToast } from "@/hooks/use-toast";
import { useMeasurementData } from "./hooks/useMeasurementData";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { getNotificationSettings } from "./api";
import FilteredDatabaseTable from "./FilteredDatabaseTable";
import { useDeviceContext } from "@/contexts/DeviceContext";
import { Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type TimeFrame = '1h' | '24h' | '7d' | '30d';

interface MeasurementHistoryProps {
  deviceCode?: string;
  symbol?: string;
  name?: string;
  unit?: string;
  onClose?: () => void;
}

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({ 
  deviceCode: propDeviceCode, 
  symbol: propSymbol, 
  name: propName,
  unit,
  onClose
}) => {
  // Get parameters from URL if not provided as props
  const params = useParams<{ deviceCode: string; symbol: string }>();
  const navigate = useNavigate();
  const { selectedDevice } = useDeviceContext();
  
  // Use props if available, otherwise use URL parameters
  // If no deviceCode and we have a selected device, use that
  let deviceCode = propDeviceCode || params.deviceCode;
  if ((!deviceCode || deviceCode === 'default') && selectedDevice) {
    deviceCode = selectedDevice;
    
    // Redirect if we're on the URL route but have a selected device
    if (params.deviceCode === 'default') {
      navigate(`/history/${selectedDevice}/${params.symbol}`, { replace: true });
    }
  }
  
  const symbol = propSymbol || params.symbol;
  const name = propName || symbol; // If name is not provided, use symbol as fallback
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const { toast } = useToast();
  
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

  // If we don't have required parameters, show error message
  if (!deviceCode || !symbol) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64 overflow-x-hidden">
        <Header />
        <main className="flex-1 p-4 overflow-x-hidden">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <h3 className="text-lg font-medium text-red-600 mb-2">ข้อมูลไม่ครบถ้วน</h3>
            <p className="text-gray-600">ไม่พบข้อมูลอุปกรณ์หรือค่าที่ต้องการแสดง กรุณาลองใหม่อีกครั้ง</p>
          </div>
        </main>
        <FooterNav />
      </div>
    );
  }

  const isSelectedDevice = selectedDevice === deviceCode;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64 overflow-x-hidden">
      <Header />
      
      <main className="flex-1 p-4 pb-32 overflow-x-hidden">
        {isSelectedDevice && (
          <div className="mb-4">
            <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-200 bg-blue-50">
              <Pin className="h-3 w-3" />
              <span>อุปกรณ์ที่เลือก</span>
            </Badge>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <HistoryHeader 
            name={name}
            unit={unit}
            average={averageValue}
            onOpenSettings={() => setSettingsOpen(true)}
            notificationEnabled={notificationEnabled}
            deviceCode={deviceCode}
          />
          
          <HistoryFooter 
            timeFrame={timeFrame}
            onTimeFrameChange={setTimeFrame} 
          />
          
          <HistoryChart 
            historyData={historyData} 
            dataKey={symbol}
            isLoading={isLoading}
            error={isError ? "ไม่สามารถโหลดข้อมูลประวัติได้" : null}
            unit={unit}
          />

          <NotificationSettingsDialog
            open={settingsOpen}
            onOpenChange={handleOpenChange}
            deviceCode={deviceCode}
            symbol={symbol}
            name={name}
          />
        </div>
        
        {/* Back button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            ย้อนกลับ
          </button>
        )}
        
        {/* Filtered Database Table */}
        <FilteredDatabaseTable 
          deviceCode={deviceCode} 
          symbol={symbol} 
          name={name} 
        />
      </main>

      {/* Add space to prevent content from being hidden behind footer */}
      <div className="pb-32"></div>

      <FooterNav />
    </div>
  );
};

export default MeasurementHistory;
