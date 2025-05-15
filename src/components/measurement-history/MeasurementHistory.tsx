
import React, { useState, useEffect } from "react";
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
  const [notificationEnabled, setNotificationEnabled] = useState(false);
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
  
  // Function to load notification settings
  const loadNotificationStatus = async () => {
    if (deviceCode && symbol) {
      try {
        const settings = await getNotificationSettings(deviceCode, symbol);
        setNotificationEnabled(settings?.enabled || false);
      } catch (error) {
        console.error("Failed to load notification status:", error);
      }
    }
  };
  
  // Load notification settings initially and when dialog closes
  useEffect(() => {
    loadNotificationStatus();
  }, [deviceCode, symbol]);
  
  // Reload notification settings when dialog closes
  const handleOpenChange = (open: boolean) => {
    setSettingsOpen(open);
    if (!open) {
      // Dialog was closed, reload notification settings
      loadNotificationStatus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      
      <main className="flex-1 p-4 pb-32">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <HistoryHeader 
            name={name}
            unit={unit}
            average={averageValue}
            onOpenSettings={() => setSettingsOpen(true)}
            notificationEnabled={notificationEnabled}
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
