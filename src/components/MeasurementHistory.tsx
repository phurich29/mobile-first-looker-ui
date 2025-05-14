
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
  Legend
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

type MeasurementHistoryProps = {
  symbol: string;
  name: string;
  deviceCode: string;
  onClose: () => void;
};

type TimeFrame = '1h' | '24h' | '7d' | '30d';
type RowLimit = 10 | 50 | 100 | 1000;

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({
  symbol,
  name,
  deviceCode,
  onClose
}) => {
  // State สำหรับเลือกกรอบเวลา
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24h');
  // สร้างฟังก์ชันสำหรับรับค่ากรอบเวลาเป็นชั่วโมง
  const getTimeFrameHours = (frame: TimeFrame): number => {
    switch (frame) {
      case '1h': return 1;
      case '24h': return 24;
      case '7d': return 24 * 7;
      case '30d': return 24 * 30;
      default: return 24;
    }
  };

  // ดึงข้อมูลประวัติการวัดของค่านี้เฉพาะอุปกรณ์นี้ตามกรอบเวลาที่เลือก
  const fetchMeasurementHistory = async () => {
    if (!deviceCode || !symbol) throw new Error("Missing device code or measurement symbol");
    
    try {
      // สร้างคำสั่ง select แบบไดนามิก
      const selectQuery = `id, ${symbol}, created_at, thai_datetime`;
      
      // คำนวณเวลาย้อนหลังตามกรอบเวลาที่เลือก
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

  // ใช้ React Query สำหรับดึงข้อมูล
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['measurementHistory', deviceCode, symbol, timeFrame],
    queryFn: fetchMeasurementHistory,
    enabled: !!deviceCode && !!symbol,
  });
  
  // ฟังก์ชันสำหรับเลือกกรอบเวลา
  const handleTimeFrameChange = (frame: TimeFrame) => {
    setTimeFrame(frame);
  };
  
  // ฟังก์ชันสำหรับแสดงไอคอนตามประเภทข้อมูล
  const getIcon = () => {
    // สำหรับ "ส่วนผสม"
    if (symbol === 'whole_kernels' ||
        symbol === 'head_rice' ||
        symbol === 'total_brokens' ||
        symbol === 'small_brokens' ||
        symbol === 'small_brokens_c1') {
      return <Blend className="h-6 w-6 text-white" />;
    }
    
    // สำหรับ "สิ่งเจือปน"
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
    
    // สำหรับประเภทข้าว
    if (symbol.includes('class') || 
        symbol === 'short_grain' || 
        symbol === 'slender_kernel' ||
        symbol.includes('ข้าว')) {
      return <Wheat className="h-6 w-6 text-white" />;
    }
    
    return <Wheat className="h-6 w-6 text-white" />; // ค่าเริ่มต้นใช้ไอคอนข้าว
  };

  // Format the Bangkok time (+7)
  const formatBangkokTime = (dateString?: string): { thaiDate: string; thaiTime: string } => {
    if (!dateString) return { thaiDate: "ไม่มีข้อมูล", thaiTime: "ไม่มีข้อมูล" };
    
    const date = new Date(dateString);
    // เพิ่มเวลาอีก 7 ชั่วโมง
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() + 7);
    
    // แยกวันที่และเวลาเป็นคนละบรรทัด
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

  // คำนวณค่าเฉลี่ยจากข้อมูล
  const calculateAverage = () => {
    if (!historyData || historyData.length === 0) return 0;
    
    const values = historyData
      .map((item: any) => (item as any)[symbol])
      .filter((value: any) => value !== null && value !== undefined);
      
    if (values.length === 0) return 0;
    
    const sum = values.reduce((acc: number, val: number) => acc + val, 0);
    return sum / values.length;
  };

  // ข้อมูลสำหรับกราฟ
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

  // ค่าเฉลี่ย
  const average = useMemo(() => calculateAverage(), [historyData, symbol]);

  // กำหนดคอนฟิก
  const chartConfig = {
    value: {
      label: "ค่าที่วัดได้",
      theme: { light: "#9b87f5", dark: "#9b87f5" }
    },
    average: {
      label: "ค่าเฉลี่ย",
      theme: { light: "#F97316", dark: "#F97316" }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Main Header (Top menu) */}
      <Header />
      
      {/* Sub-header for history */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="mr-4 flex items-center text-gray-600 hover:bg-gray-100"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>กลับ</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-800">{name}</h1>
          <p className="text-xs text-red-500">{deviceCode}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">กรอบเวลา:</div>
          <Select value={timeFrame} onValueChange={(value) => handleTimeFrameChange(value as TimeFrame)}>
            <SelectTrigger className="w-[120px] h-8 text-xs border-gray-200 bg-white">
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
      
      <div className="p-4 flex flex-col h-full">
        {/* แสดงไอคอนข้าวและรายละเอียด */}
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-md relative overflow-hidden bg-emerald-600">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="absolute top-0 left-0 w-4 h-4 bg-white/30 rounded-full blur-sm"></div>
            {getIcon()}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">{name}</h2>
            <div className="flex items-center">
              <p className="text-xs text-gray-500 mr-3">รหัส: {symbol}</p>
              <p className="text-sm font-semibold text-emerald-600">
                {!isLoading && historyData && historyData.length > 0 ? 
                  `ค่าล่าสุด: ${(historyData[0] as any)[symbol]}%` : 
                  'ไม่พบข้อมูล'}
              </p>
            </div>
          </div>
        </div>

        {/* กราฟแสดงผล */}
        <div className="flex-1 flex flex-col h-full">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-gray-700">กราฟแสดงการวัดทั้งหมด</div>
            {!isLoading && historyData ? (
              <div className="text-xs text-gray-500">พบ {historyData.length} รายการ</div>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 mb-2 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
              <p className="mt-4">กำลังโหลดข้อมูลสำหรับกราฟ...</p>
            </div>
          ) : !chartData || chartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              ไม่พบข้อมูลการวัดสำหรับ {name} บนอุปกรณ์ {deviceCode}
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden shadow-md p-3 flex-1">
              {/* กราฟเส้นแบบใหม่ */}
              <div className="h-full">
                <ChartContainer 
                  config={chartConfig} 
                  className="h-[calc(100vh-250px)]"
                >
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      tickFormatter={(value) => `${value}%`}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
                              <p className="text-sm font-medium">{`เวลา: ${payload[0].payload.time} น.`}</p>
                              <p className="text-sm font-medium text-[#9b87f5]">{`ค่าที่วัดได้: ${payload[0].value}%`}</p>
                              <p className="text-xs text-gray-500">{payload[0].payload.date}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: 10 }}
                    />
                    <ReferenceLine 
                      y={average} 
                      stroke="#F97316" 
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      label={{
                        position: 'right',
                        value: `ค่าเฉลี่ย: ${average.toFixed(2)}%`,
                        fill: '#F97316',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#9b87f5" 
                      strokeWidth={3} 
                      name="ค่าที่วัดได้"
                      dot={{ stroke: '#9b87f5', strokeWidth: 2, r: 4, fill: '#fff' }}
                      activeDot={{ stroke: '#9b87f5', strokeWidth: 2, r: 6, fill: '#fff' }}
                      isAnimationActive={true}
                      animationDuration={1000}
                      fill="url(#colorValue)"
                      fillOpacity={0.2}
                    />
                  </LineChart>
                </ChartContainer>
              </div>

              {/* คำอธิบายเพิ่มเติม */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                แสดงข้อมูลการวัด {name} ย้อนหลัง {timeFrame === '1h' ? '1 ชั่วโมง' : timeFrame === '24h' ? '24 ชั่วโมง' : timeFrame === '7d' ? '7 วัน' : '30 วัน'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeasurementHistory;
