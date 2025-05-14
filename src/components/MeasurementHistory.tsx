import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, Wheat, Circle, Blend, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
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
type RowLimit = 10 | 100 | 1000;

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({
  symbol,
  name,
  deviceCode,
  onClose
}) => {
  // State สำหรับเลือกกรอบเวลา
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24h');
  // State สำหรับจำกัดจำนวนแถวที่แสดง
  const [rowLimit, setRowLimit] = useState<RowLimit>(10);
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
        .order('created_at', { ascending: false })
        .limit(rowLimit);
      
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
    queryKey: ['measurementHistory', deviceCode, symbol, timeFrame, rowLimit],
    queryFn: fetchMeasurementHistory,
    enabled: !!deviceCode && !!symbol,
  });
  
  // ฟังก์ชันสำหรับเลือกกรอบเวลา
  const handleTimeFrameChange = (frame: TimeFrame) => {
    setTimeFrame(frame);
  };
  
  // ฟังก์ชันสำหรับเปลี่ยนจำนวนแถวที่แสดง
  const handleRowLimitChange = (limit: RowLimit) => {
    setRowLimit(limit);
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

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col h-full overflow-auto">
      {/* Main Header (Top menu) - fixed to stay in place */}
      <div className="sticky top-0 z-10 bg-white w-full">
        <Header />
      </div>
      
      {/* Sub-header for history - fixed to stay in place */}
      <div className="sticky top-14 z-10 flex items-center p-4 border-b border-gray-200 bg-gray-50">
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
      </div>
      
      {/* แสดงไอคอนข้าวและรายละเอียด */}
      <div className="px-4 py-5 border-b border-gray-200 bg-white flex items-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4 shadow-md relative overflow-hidden bg-emerald-600">
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="absolute top-0 left-0 w-4 h-4 bg-white/30 rounded-full blur-sm"></div>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">{name}</h2>
          <p className="text-xs text-gray-500">รหัส: {symbol}</p>
          <p className="text-sm mt-1 text-emerald-600 font-semibold">
            {!isLoading && historyData && historyData.length > 0 ? 
              `ค่าล่าสุด: ${(historyData[0] as any)[symbol]}%` : 
              'ไม่พบข้อมูล'}
          </p>
        </div>
      </div>
      
      {/* ส่วนเลือกกรอบเวลา */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <p className="text-xs text-gray-500 mb-2">กรอบเวลา</p>
        <div className="flex justify-between items-center space-x-2">
          <button 
            onClick={() => handleTimeFrameChange('1h')} 
            className={`flex-1 py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${timeFrame === '1h' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            1 ชม.
          </button>
          <button 
            onClick={() => handleTimeFrameChange('24h')} 
            className={`flex-1 py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${timeFrame === '24h' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            24 ชม.
          </button>
          <button 
            onClick={() => handleTimeFrameChange('7d')} 
            className={`flex-1 py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${timeFrame === '7d' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            7 วัน
          </button>
          <button 
            onClick={() => handleTimeFrameChange('30d')} 
            className={`flex-1 py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${timeFrame === '30d' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            30 วัน
          </button>
        </div>
        

      </div>

      {/* กราฟอย่างง่ายแสดงค่าที่วัดได้ */}
      {!isLoading && historyData && historyData.length > 0 && (
        <div className="px-[2%] pt-4 pb-2 bg-white border-b border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">กราฟแสดงแนวโน้มค่า {name}</div>
          <SimpleChart data={historyData} symbol={symbol} />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium text-gray-700">ประวัติการวัดทั้งหมด</div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">จำนวนแถว:</div>
            <Select value={rowLimit.toString()} onValueChange={(value) => handleRowLimitChange(parseInt(value) as RowLimit)}>
              <SelectTrigger className="w-[100px] h-8 text-xs border-gray-200">
                <SelectValue placeholder="เลือกจำนวนแถว" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 แถว</SelectItem>
                <SelectItem value="100">100 แถว</SelectItem>
                <SelectItem value="1000">1000 แถว</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end items-center mb-2">
          {!isLoading && historyData ? (
            <div className="text-xs text-gray-500">พบ {historyData.length} รายการ</div>
          ) : null}
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 mb-2 rounded"></div>
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
            <p className="mt-4">กำลังโหลดประวัติการวัด...</p>
          </div>
        ) : !historyData || historyData.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            ไม่พบประวัติการวัดสำหรับ {name} บนอุปกรณ์ {deviceCode}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
              <div className="grid grid-cols-3 p-3 border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-600">
                <div>วันที่</div>
                <div>เวลา</div>
                <div className="text-right">ค่าที่วัดได้</div>
              </div>
              {historyData.map((item: any, index) => {
                const timeFormat = formatBangkokTime(item.created_at || item.thai_datetime);
                return (
                  <div 
                    key={item.id || index} 
                    className={`grid grid-cols-3 p-3 ${index !== historyData.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="text-sm text-gray-700">{timeFormat.thaiDate}</div>
                    <div className="text-sm text-gray-500">{timeFormat.thaiTime} น.</div>
                    <div className="text-sm font-semibold text-right">
                      {/* ใช้ any type เพื่อเข้าถึงค่าโดยใช้ชื่อ property แบบไดนามิก */}
                      {(item as any)[symbol] !== null && (item as any)[symbol] !== undefined ? `${(item as any)[symbol]}%` : 'ไม่มีข้อมูล'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// คอมโพเนนต์กราฟแบบง่ายที่ใช้ HTML canvas เพื่อหลีกเลี่ยงปัญหาการ Scroll
type SimpleChartProps = {
  data: any[];
  symbol: string;
};

const SimpleChart: React.FC<SimpleChartProps> = ({ data, symbol }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // กำหนดขนาด canvas ให้เหมาะสม
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // เตรียมข้อมูลสำหรับวาด
    const chartData = [...data].reverse();
    const values = chartData.map(item => parseFloat((item as any)[symbol] || 0));
    
    // ค่าสูงสุดและต่ำสุดสำหรับการวาดกราฟ
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue;
    const adjustedMin = Math.max(0, minValue - (range * 0.1)); // ปรับให้มีพื้นที่ด้านล่าง 10%
    const adjustedMax = maxValue + (range * 0.1); // ปรับให้มีพื้นที่ด้านบน 10%
    const adjustedRange = adjustedMax - adjustedMin;
    
    // คำนวณค่าเฉลี่ย
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // เคลียร์ canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // วาดพื้นหลัง
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ค่าสำหรับ margin
    const marginLeft = 35;
    const marginRight = 10;
    const marginTop = 10;
    const marginBottom = 20;
    
    // พื้นที่วาดกราฟ
    const chartWidth = canvas.width - marginLeft - marginRight;
    const chartHeight = canvas.height - marginTop - marginBottom;
    
    // วาดกรอบ
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.strokeRect(marginLeft, marginTop, chartWidth, chartHeight);
    
    // วาดเส้นแกน y (แนวตั้ง)
    const yAxisSteps = 5;
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '10px Arial';
    ctx.fillStyle = '#888';
    
    for (let i = 0; i <= yAxisSteps; i++) {
      const y = marginTop + chartHeight - (i / yAxisSteps) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(marginLeft + chartWidth, y);
      ctx.stroke();
      
      // แสดงค่าที่แกน y
      const yValue = adjustedMin + (i / yAxisSteps) * adjustedRange;
      ctx.fillText(`${yValue.toFixed(1)}%`, marginLeft - 5, y);
    }
    
    // วาดเส้นค่าเฉลี่ย
    const averageY = marginTop + chartHeight - ((average - adjustedMin) / adjustedRange) * chartHeight;
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#aaa';
    ctx.moveTo(marginLeft, averageY);
    ctx.lineTo(marginLeft + chartWidth, averageY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText(`ค่าเฉลี่ย: ${average.toFixed(1)}%`, marginLeft + 5, averageY - 5);
    
    // วาดกราฟเส้น
    if (values.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#FFD700'; // สีเหลือง gold สำหรับเส้นกราฟ
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      
      // พื้นที่ใต้กราฟ
      ctx.beginPath();
      const pointSpacing = chartWidth / (values.length - 1);
      
      for (let i = 0; i < values.length; i++) {
        const x = marginLeft + i * pointSpacing;
        const y = marginTop + chartHeight - ((values[i] - adjustedMin) / adjustedRange) * chartHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      // สร้าง gradient สำหรับพื้นที่ใต้กราฟ
      const gradient = ctx.createLinearGradient(0, marginTop, 0, marginTop + chartHeight);
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)'); // สีเหลืองโปร่งใส
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0.05)');
      
      // วาดเส้นกราฟ
      ctx.stroke();
      
      // วาดพื้นที่ใต้กราฟ
      ctx.lineTo(marginLeft + (values.length - 1) * pointSpacing, marginTop + chartHeight);
      ctx.lineTo(marginLeft, marginTop + chartHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // วาดเส้นกราฟทับอีกครั้ง (เพื่อให้เส้นอยู่บนสุด)
      ctx.beginPath();
      for (let i = 0; i < values.length; i++) {
        const x = marginLeft + i * pointSpacing;
        const y = marginTop + chartHeight - ((values[i] - adjustedMin) / adjustedRange) * chartHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // วาดแกน X (เวลา) กับค่าสุดท้าย
    if (values.length > 0) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#888';
      
      // แสดงเฉพาะไม่กี่จุดเพื่อไม่ให้ข้อความเบียดกัน
      const maxXLabels = 5;
      const step = Math.ceil(values.length / maxXLabels);
      
      for (let i = 0; i < values.length; i += step) {
        const x = marginLeft + i * (chartWidth / (values.length - 1));
        const item = chartData[i];
        let timeLabel = "";
        
        if (item.created_at || item.thai_datetime) {
          const date = new Date(item.created_at || item.thai_datetime);
          // เพิ่มเวลาอีก 7 ชั่วโมงสำหรับไทย
          date.setHours(date.getHours() + 7);
          timeLabel = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        ctx.fillText(timeLabel, x, marginTop + chartHeight + 5);
      }
    }
  }, [data, symbol]);
  
  return (
    <div className="w-full h-32 bg-white">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
      />
      <div className="text-xs text-center text-gray-500 mt-1">
        ข้อมูล {data.length} รายการ
      </div>
    </div>
  );
};

export default MeasurementHistory;
