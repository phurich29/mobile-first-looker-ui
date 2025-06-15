import { DeviceHeader } from "@/features/device-details/components/DeviceHeader";
import { Wheat } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HistoryHeader from "./HistoryHeader";
import HistoryChart from "./HistoryChart";
import HistoryFooter from "./HistoryFooter";
import { NotificationSettingsDialog } from "./notification-settings";
import { useToast } from "@/hooks/use-toast";
import { useMeasurementData } from "./hooks/useMeasurementData";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNotificationSettings } from "./api";
import FilteredDatabaseTable from "./FilteredDatabaseTable";

export type TimeFrame = '1h' | '24h' | '7d' | '30d';

interface MeasurementHistoryProps {
  deviceCode?: string;
  symbol?: string;
  name?: string;
  unit?: string;
  onClose?: () => void;
}

// Helper function to convert URL symbol back to measurement symbol
const convertUrlSymbolToMeasurementSymbol = (urlSymbol: string): string => {
  const symbolMap: Record<string, string> = {
    '70mm': 'class1',
    'class1': 'class1',
    'class2': 'class2', 
    'class3': 'class3',
    'shortgrain': 'short_grain',
    'slenderkernel': 'slender_kernel',
    'wholekernels': 'whole_kernels',
    'headrice': 'head_rice',
    'totalbrokens': 'total_brokens',
    'smallbrokens': 'small_brokens',
    'smallbrokenc1': 'small_brokens_c1',
    'redlinerate': 'red_line_rate',
    'parboiledredline': 'parboiled_red_line',
    'parboiledwhiterice': 'parboiled_white_rice',
    'honeyrice': 'honey_rice',
    'yellowricerate': 'yellow_rice_rate',
    'blackkernel': 'black_kernel',
    'partlyblackpeck': 'partly_black_peck',
    'partlyblack': 'partly_black',
    'imperfectionrate': 'imperfection_rate',
    'stickyricerate': 'sticky_rice_rate',
    'impuritynum': 'impurity_num',
    'paddyrate': 'paddy_rate',
    'whiteness': 'whiteness',
    'processprecision': 'process_precision'
  };
  
  return symbolMap[urlSymbol.toLowerCase()] || urlSymbol;
};

// Helper function to get measurement name
const getMeasurementName = (symbol: string): string => {
  const nameMap: Record<string, string> = {
    'class1': 'ชั้น 1 (>7.0 mm)',
    'class2': 'ชั้น 2 (5.5-7.0 mm)',
    'class3': 'ชั้น 3 (<5.5 mm)',
    'short_grain': 'เมล็ดสั้น',
    'slender_kernel': 'เมล็ดยาว',
    'whole_kernels': 'เมล็ดเต็ม',
    'head_rice': 'ข้าวหัว',
    'total_brokens': 'ข้าวหักรวม',
    'small_brokens': 'ข้าวหักเล็ก',
    'small_brokens_c1': 'ข้าวหักเล็ก C1',
    'red_line_rate': 'อัตราเส้นแดง',
    'parboiled_red_line': 'ข้าวสุกเส้นแดง',
    'parboiled_white_rice': 'ข้าวสุกขาว',
    'honey_rice': 'ข้าวน้ำผึ้ง',
    'yellow_rice_rate': 'อัตราข้าวเหลือง',
    'black_kernel': 'เมล็ดดำ',
    'partly_black_peck': 'จุดดำบางส่วน',
    'partly_black': 'ดำบางส่วน',
    'imperfection_rate': 'อัตราข้าวด้วย',
    'sticky_rice_rate': 'อัตราข้าวเหนียว',
    'impurity_num': 'จำนวนสิ่งปนเปื้อน',
    'paddy_rate': 'อัตราข้าวเปลือก',
    'whiteness': 'ความขาว',
    'process_precision': 'ความแม่นยำกระบวนการ'
  };
  
  return nameMap[symbol] || symbol;
};

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({ 
  deviceCode: propDeviceCode, 
  symbol: propSymbol, 
  name: propName,
  unit,
  onClose
}) => {
  const isMobile = useIsMobile();
  // Get parameters from URL if not provided as props
  const params = useParams<{ deviceCode: string; symbol: string }>();
  
  // Use props if available, otherwise use URL parameters and convert URL symbol
  const deviceCode = propDeviceCode || params.deviceCode;
  const urlSymbol = propSymbol || params.symbol;
  const symbol = urlSymbol ? convertUrlSymbolToMeasurementSymbol(urlSymbol) : null;
  const name = propName || (symbol ? getMeasurementName(symbol) : null);
  
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
      <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-8'}>
        <div className="flex flex-col flex-1 min-h-full bg-gradient-to-b from-emerald-50 to-gray-50 overflow-x-hidden">
          <main className="flex-1 overflow-x-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
              <h3 className="text-lg font-medium text-red-600 mb-2">ข้อมูลไม่ครบถ้วน</h3>
              <p className="text-gray-600">ไม่พบข้อมูลอุปกรณ์หรือค่าที่ต้องการแสดง กรุณาลองใหม่อีกครั้ง</p>
            </div>
          </main>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-8'}>
      <div className="flex flex-col flex-1 min-h-full bg-gradient-to-b from-emerald-50 to-gray-50 overflow-x-hidden">
        <main className="flex-1 overflow-x-hidden">
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
              name={name || ''}
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
              name={name || ''}
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
            name={name || ''} 
          />
        </main>
      </div>
    </AppLayout>
  );
};

export default MeasurementHistory;
