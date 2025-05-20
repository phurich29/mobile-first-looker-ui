import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { RiceIconDecoration } from "@/components/graph-monitor/RiceIconDecoration";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp, HelpCircle, BookOpen, BarChart2, BadgeInfo, Info } from "lucide-react";

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
  
  // Use props if available, otherwise use URL parameters
  const deviceCode = propDeviceCode || params.deviceCode;
  const symbol = propSymbol || params.symbol;
  const name = propName || symbol; // If name is not provided, use symbol as fallback
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64 overflow-x-hidden">
      <Header />
      
      <main className="flex-1 p-4 pb-32 overflow-x-hidden relative">
        {/* Decorative rice icons for aesthetic */}
        <RiceIconDecoration position="top-left" />
        <RiceIconDecoration position="bottom-right" />
        
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
        
        {/* Help Section - Added below the table for better UX/UI */}
        <div className="mt-8 mb-16">
          <Card className="border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BadgeInfo className="text-emerald-600 mr-2" />
                  <h3 className="text-lg font-medium text-emerald-800">ข้อมูลการใช้งานและคำแนะนำ</h3>
                </div>
                <button 
                  className="text-emerald-600 hover:text-emerald-800 transition-colors"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  {showHelp ? "ซ่อน" : "แสดง"}
                </button>
              </div>
              
              {showHelp && (
                <ScrollArea className="h-[240px] rounded-md border p-4 bg-white">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-emerald-700 flex items-center mb-1">
                        <Info size={16} className="mr-1" /> การดูรายละเอียดข้อมูล
                      </h4>
                      <p className="text-sm text-gray-600">
                        คลิกที่แถวในตารางเพื่อดูรายละเอียดทั้งหมดของการวัดในครั้งนั้น 
                        คุณจะเห็นข้อมูลที่แบ่งเป็นหมวดหมู่ในรูปแบบที่อ่านง่าย ทั้งแบบตารางและการ์ด
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-emerald-700 flex items-center mb-1">
                        <BarChart2 size={16} className="mr-1" /> การดูกราฟประวัติ
                      </h4>
                      <p className="text-sm text-gray-600">
                        คุณสามารถดูแนวโน้มของค่าที่วัดได้ในช่วงเวลาต่างๆ โดยเลือกช่วงเวลาที่ต้องการ
                        จากตัวเลือกด้านบนกราฟ (1 ชั่วโมง, 24 ชั่วโมง, 7 วัน, 30 วัน)
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-emerald-700 flex items-center mb-1">
                        <ArrowUp size={16} className="mr-1" /> การตั้งค่าการแจ้งเตือน
                      </h4>
                      <p className="text-sm text-gray-600">
                        กดปุ่มตั้งค่าการแจ้งเตือนที่มุมบนขวาเพื่อกำหนดค่าสูงสุดและต่ำสุดที่ต้องการ
                        ให้ระบบแจ้งเตือนเมื่อค่าที่วัดได้เกินกว่าค่าที่กำหนด
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-emerald-700 flex items-center mb-1">
                        <BookOpen size={16} className="mr-1" /> ความหมายของค่าที่วัด
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>ค่า {name} คือค่าที่แสดงถึง:</p>
                        <ul className="pl-4 list-disc">
                          {symbol.includes('whole') || symbol.includes('head') ? (
                            <>
                              <li>เป็นค่าในหมวดข้าวเต็มเมล็ด</li>
                              <li>แสดงสัดส่วนของเมล็ดข้าวสมบูรณ์</li>
                            </>
                          ) : symbol.includes('ing_') ? (
                            <>
                              <li>เป็นค่าในหมวดองค์ประกอบ</li>
                              <li>แสดงสัดส่วนของสารอาหารในข้าว</li>
                            </>
                          ) : symbol.includes('imp_') ? (
                            <>
                              <li>เป็นค่าในหมวดสิ่งเจือปน</li>
                              <li>แสดงระดับของสิ่งแปลกปลอมในข้าว</li>
                            </>
                          ) : (
                            <li>เป็นค่าทั่วไปที่ใช้วัดคุณภาพข้าว</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="success">ข้าวเต็มเมล็ด</Badge>
                        <Badge variant="secondary">องค์ประกอบ</Badge>
                        <Badge variant="destructive">สิ่งเจือปน</Badge>
                        <Badge variant="outline">ค่าทั่วไป</Badge>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              )}
              
              {/* Quick tips always visible */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border border-emerald-100 flex items-start">
                  <div className="bg-emerald-100 p-2 rounded-full mr-3">
                    <HelpCircle size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-emerald-700">คลิกที่แถว</h5>
                    <p className="text-xs text-gray-500">เพื่อดูรายละเอียดเพิ่มเติมของข้อมูลการวัด</p>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-emerald-100 flex items-start">
                  <div className="bg-emerald-100 p-2 rounded-full mr-3">
                    <BarChart2 size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-emerald-700">เลือกช่วงเวลา</h5>
                    <p className="text-xs text-gray-500">เพื่อดูแนวโน้มของข้อมูลในช่วงเวลาต่างๆ</p>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-emerald-100 flex items-start">
                  <div className="bg-emerald-100 p-2 rounded-full mr-3">
                    <BadgeInfo size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-emerald-700">ตั้งค่าการแจ้งเตือน</h5>
                    <p className="text-xs text-gray-500">เพื่อรับแจ้งเตือนเมื่อค่าเกินกว่าที่กำหนด</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add space to prevent content from being hidden behind footer */}
      <div className="pb-32"></div>

      <FooterNav />
    </div>
  );
};

export default MeasurementHistory;
