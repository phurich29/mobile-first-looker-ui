
import React from 'react';
import { DeviceHeader } from "@/features/device-details/components/DeviceHeader";
import { Wheat } from "lucide-react";
import HistoryHeader from "../HistoryHeader";
import HistoryChart from "../HistoryChart";
import HistoryFooter from "../HistoryFooter";
import { NotificationSettingsDialog } from "../notification-settings";
import FilteredDatabaseTable from "../FilteredDatabaseTable";
import { TimeFrame } from "../MeasurementHistory";

interface MeasurementHistoryContentProps {
  deviceCode: string;
  symbol: string;
  name: string;
  unit?: string;
  onClose?: () => void;
  historyData: any[];
  isLoading: boolean;
  isError: boolean;
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
  averageValue: number;
  settingsOpen: boolean;
  handleOpenChange: (open: boolean) => void;
  notificationEnabled: boolean;
}

const MeasurementHistoryContent: React.FC<MeasurementHistoryContentProps> = ({
  deviceCode,
  symbol,
  name,
  unit,
  onClose,
  historyData,
  isLoading,
  isError,
  timeFrame,
  setTimeFrame,
  averageValue,
  settingsOpen,
  handleOpenChange,
  notificationEnabled
}) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <DeviceHeader deviceCode={deviceCode} />
        <div className="flex items-center relative">
          {/* Wheat icon group with varied sizes and positions */}
          <Wheat className="text-amber-400 absolute -top-3 -left-8" size={16} strokeWidth={2.5} />
          <Wheat className="text-amber-500 mr-1" size={20} strokeWidth={2.5} />
          <Wheat className="text-amber-600" size={18} strokeWidth={2.5} />
          <Wheat className="text-amber-700 ml-1" size={14} strokeWidth={2.5} />
          <Wheat className="text-yellow-600 absolute -bottom-2 -right-3" size={12} strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-4">
        <HistoryHeader 
          name={name}
          unit={unit}
          average={averageValue}
          onOpenSettings={() => handleOpenChange(true)}
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
    </>
  );
};

export default MeasurementHistoryContent;
