import React, { useState, useMemo } from "react";
import { ChevronLeft, Wheat, Circle, Blend } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MeasurementHistoryProps = {
  symbol: string;
  name: string;
  deviceCode: string;
  onClose: () => void;
};

type TimeFrame = '1h' | '24h' | '7d' | '30d';

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({
  symbol,
  name,
  deviceCode,
  onClose
}) => {
  // State for timeframe selection
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1h');
  
  // Function to get hours based on timeframe
  const getTimeFrameHours = (frame: TimeFrame): number => {
    switch (frame) {
      case '1h': return 1;
      case '24h': return 24;
      case '7d': return 24 * 7;
      case '30d': return 24 * 30;
      default: return 24;
    }
  };

  // Fetch measurement history data
  const fetchMeasurementHistory = async () => {
    if (!deviceCode || !symbol) throw new Error("Missing device code or measurement symbol");
    
    try {
      // Dynamic select query
      const selectQuery = `id, ${symbol}, created_at, thai_datetime`;
      
      // Calculate cutoff date based on timeframe
      const hours = getTimeFrameHours(timeFrame);
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hours);
      
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select(selectQuery)
        .eq('device_code', deviceCode)
        .gt('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Error fetching history for ${symbol} on device ${deviceCode}:`, error);
        throw new Error(error.message);
      }
      
      return data;
    } catch (err) {
      console.error('Error in fetchMeasurementHistory:', err);
      return [];
    }
  };

  // Use React Query to fetch data
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['measurementHistory', deviceCode, symbol, timeFrame],
    queryFn: fetchMeasurementHistory,
    enabled: !!deviceCode && !!symbol,
  });
  
  // Get appropriate icon based on data type
  const getIcon = () => {
    // For "ส่วนผสม"
    if (symbol === 'whole_kernels' ||
        symbol === 'head_rice' ||
        symbol === 'total_brokens' ||
        symbol === 'small_brokens' ||
        symbol === 'small_brokens_c1') {
      return <Blend className="h-6 w-6 text-white" />;
    }
    
    // For "สิ่งเจือปน"
    if (symbol === 'red_line_rate' ||
        symbol === 'parboiled_red_line' ||
        symbol === 'parboiled_white_rice' ||
        symbol === 'honey_rice' ||
        symbol === 'yellow_rice_rate' ||
        symbol === 'black_kernel' ||
        symbol === 'partly_black_peck' ||
        symbol === 'partly_black' ||
        symbol === 'imperfection_rate' ||
        symbol === 'sticky_rice_rate' ||
        symbol === 'impurity_num' ||
        symbol === 'paddy_rate' ||
        symbol === 'whiteness' ||
        symbol === 'process_precision') {
      return <Circle className="h-6 w-6 text-white" />;
    }
    
    // For rice types
    if (symbol.includes('class') || 
        symbol === 'short_grain' || 
        symbol === 'slender_kernel' ||
        symbol.includes('ข้าว')) {
      return <Wheat className="h-6 w-6 text-white" />;
    }
    
    return <Wheat className="h-6 w-6 text-white" />; // Default icon
  };

  // Format Bangkok time (+7)
  const formatBangkokTime = (dateString?: string): { thaiDate: string; thaiTime: string } => {
    if (!dateString) return { thaiDate: "ไม่มีข้อมูล", thaiTime: "ไม่มีข้อมูล" };
    
    const date = new Date(dateString);
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() + 7);
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    const thaiDate = new Intl.DateTimeFormat('th-TH', dateOptions).format(adjustedDate);
    const thaiTime = new Intl.DateTimeFormat('th-TH', timeOptions).format(adjustedDate);
    
    return { thaiDate, thaiTime };
  };

  // Calculate average value
  const calculateAverage = () => {
    if (!historyData || historyData.length === 0) return 0;
    
    const values = historyData
      .map((item: any) => (item as any)[symbol])
      .filter((value: any) => value !== null && value !== undefined);
      
    if (values.length === 0) return 0;
    
    const sum = values.reduce((acc: number, val: number) => acc + val, 0);
    return sum / values.length;
  };

  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    
    return historyData
      .map((item: any) => ({
        time: formatBangkokTime(item.created_at || item.thai_datetime).thaiTime,
        value: (item as any)[symbol] !== null && (item as any)[symbol] !== undefined 
               ? (item as any)[symbol] : null,
        date: formatBangkokTime(item.created_at || item.thai_datetime).thaiDate
      }))
      .reverse();
  }, [historyData, symbol]);

  // Calculate average
  const average = useMemo(() => calculateAverage(), [historyData, symbol]);

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
          <h1 className="text-base font-bold text-gray-800">{name}</h1>
          <p className="text-xs text-red-500">{deviceCode}</p>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col h-[calc(100vh-140px)] p-3">
        {/* Measurement info - Row 1 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-sm bg-emerald-600">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">{name}</h2>
              <div className="flex items-center">
                <p className="text-xs text-gray-500 mr-2">รหัส: {symbol}</p>
                <p className="text-sm font-semibold text-emerald-600">
                  {!isLoading && historyData && historyData.length > 0 ? 
                    `ค่าล่าสุด: ${(historyData[0] as any)[symbol]}%` : 
                    'ไม่พบข้อมูล'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Time frame selection - Row 2 */}
        <div className="flex justify-end mb-3">
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">กรอบเวลา:</div>
            <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
              <SelectTrigger className="w-[100px] h-8 text-xs border-gray-200 bg-white">
                <SelectValue placeholder="เลือกกรอบเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 ชั่วโมง</SelectItem>
                <SelectItem value="24h">24 ชั่วโมง</SelectItem>
                <SelectItem value="7d">7 วัน</SelectItem>
                <SelectItem value="30d">30 วัน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart area */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-emerald-600 rounded-full border-t-transparent"></div>
          </div>
        ) : !chartData || chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            ไม่พบข้อมูลการวัดสำหรับ {name} บนอุปกรณ์ {deviceCode}
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover:shadow-xl transition-shadow duration-300">
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e0e0e0" strokeWidth={1} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    tickFormatter={(value) => `${value}%`}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border border-gray-200 rounded-md shadow-lg">
                            <p className="text-xs font-medium">{`เวลา: ${payload[0].payload.time} น.`}</p>
                            <p className="text-xs font-medium text-[#9b87f5]">{`ค่า: ${payload[0].value}%`}</p>
                            <p className="text-xs text-gray-500">{payload[0].payload.date}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine 
                    y={average} 
                    stroke="#F97316" 
                    strokeDasharray="3 3"
                    label={{
                      position: 'top',
                      value: `ค่าเฉลี่ย: ${average.toFixed(2)}% (ช่วง ${(average * 0.95).toFixed(2)} - ${(average * 1.05).toFixed(2)}%)`,
                      fill: '#F97316',
                      fontSize: 12,
                      offset: 0,
                      dy: -10,
                      dx: 150,
                      textAnchor: 'end'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#9b87f5" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                    animationDuration={500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Footer info */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          แสดงข้อมูลการวัด {name} ย้อนหลัง {timeFrame === '1h' ? '1 ชั่วโมง' : timeFrame === '24h' ? '24 ชั่วโมง' : timeFrame === '7d' ? '7 วัน' : '30 วัน'}
          {historyData && ` (${historyData.length} รายการ)`}
        </div>
      </div>
    </div>
  );
};

export default MeasurementHistory;
