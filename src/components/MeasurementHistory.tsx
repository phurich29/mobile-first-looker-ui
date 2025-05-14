
import React, { useState, useMemo } from "react";
import { ChevronLeft, Wheat, Circle, Blend, ChevronDown, Calendar, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { useToast } from "@/components/ui/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
  // State สำหรับเลือกกรอบเวลา
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24h');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

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
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถดึงข้อมูลได้: ${error.message}`,
          variant: "destructive",
        });
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

  // สร้างข้อมูลสำหรับตารางแสดงประวัติการวัด
  const tableData = useMemo(() => {
    if (!historyData) return [];
    
    return historyData
      .map((item: any) => ({
        id: item.id,
        value: (item as any)[symbol] !== null && (item as any)[symbol] !== undefined 
            ? (item as any)[symbol] 
            : null,
        date: formatBangkokTime(item.created_at || item.thai_datetime).thaiDate,
        time: formatBangkokTime(item.created_at || item.thai_datetime).thaiTime,
        dateObj: new Date(item.created_at || item.thai_datetime)
      }))
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.dateObj.getTime() - b.dateObj.getTime();
        }
        return b.dateObj.getTime() - a.dateObj.getTime();
      });
  }, [historyData, symbol, sortOrder]);

  // คำนวณค่าสถิติพื้นฐาน
  const stats = useMemo(() => {
    if (!historyData) return { avg: 0, min: 0, max: 0, current: 0 };
    
    const values = historyData
      .map((item: any) => (item as any)[symbol])
      .filter((value: any) => value !== null && value !== undefined);
    
    if (values.length === 0) return { avg: 0, min: 0, max: 0, current: 0 };
    
    const sum = values.reduce((acc: number, val: number) => acc + val, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = values[0] || 0;
    
    return { avg, min, max, current };
  }, [historyData, symbol]);

  // สร้างข้อมูลสำหรับกราฟ
  const chartData = useMemo(() => {
    if (!historyData) return [];
    
    return historyData
      .map((item: any) => ({
        time: formatBangkokTime(item.created_at || item.thai_datetime).thaiTime,
        value: (item as any)[symbol] !== null && (item as any)[symbol] !== undefined ? (item as any)[symbol] : null,
        date: formatBangkokTime(item.created_at || item.thai_datetime).thaiDate
      }))
      .sort((a, b) => {
        // คำนวณเวลา sort ตามกำหนด (เอาไว้ใช้กับ chart)
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        
        if (timeA[0] !== timeB[0]) {
          return sortOrder === 'asc' ? timeA[0] - timeB[0] : timeB[0] - timeA[0];
        }
        return sortOrder === 'asc' ? timeA[1] - timeB[1] : timeB[1] - timeA[1];
      });
  }, [historyData, symbol, sortOrder]);

  // ฟังก์ชันสำหรับเปลี่ยน sortOrder
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <Header />
      
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
          <p className="text-xs text-gray-500">{deviceCode}</p>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-hidden">
        <Tabs defaultValue="dashboard" className="h-full flex flex-col">
          <div className="border-b pb-2 mb-4 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="dashboard" className="text-sm">แดชบอร์ด</TabsTrigger>
              <TabsTrigger value="history" className="text-sm">ประวัติ</TabsTrigger>
              <TabsTrigger value="graph" className="text-sm">กราฟ</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">กรอบเวลา:</div>
              <Select value={timeFrame} onValueChange={(value) => handleTimeFrameChange(value as TimeFrame)}>
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
          
          {/* แดชบอร์ด */}
          <TabsContent value="dashboard" className="flex-1 overflow-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ส่วนสรุป */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-md relative overflow-hidden bg-emerald-600">
                      <div className="absolute inset-0 bg-white/10"></div>
                      {getIcon()}
                    </div>
                    <div>
                      <CardTitle>{name}</CardTitle>
                      <CardDescription>รหัส: {symbol}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">{stats.current.toFixed(2)}%</div>
                  <p className="text-sm text-gray-500 mt-1">
                    ค่าล่าสุด ({!isLoading && tableData.length > 0 ? `${tableData[0].time} น.` : 'ไม่มีข้อมูล'})
                  </p>
                </CardContent>
              </Card>
              
              {/* ค่าสถิติ */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">สถิติ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">ค่าเฉลี่ย</p>
                      <p className="text-lg font-semibold">{stats.avg.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ค่าต่ำสุด</p>
                      <p className="text-lg font-semibold text-blue-600">{stats.min.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ค่าสูงสุด</p>
                      <p className="text-lg font-semibold text-red-600">{stats.max.toFixed(2)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* มินิกราฟ */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">การวัดย้อนหลัง</CardTitle>
                <CardDescription>
                  {timeFrame === '1h' ? '1 ชั่วโมง' : timeFrame === '24h' ? '24 ชั่วโมง' : timeFrame === '7d' ? '7 วัน' : '30 วัน'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[150px] flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-[150px] flex items-center justify-center text-gray-500">
                    ไม่มีข้อมูลในช่วงเวลาที่เลือก
                  </div>
                ) : (
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis 
                          width={30}
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => `${value}%`}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value}%`, `ค่าที่วัดได้`]}
                          labelFormatter={(label) => `เวลา: ${label} น.`}
                        />
                        <ReferenceLine 
                          y={stats.avg} 
                          stroke="#f87171" 
                          strokeWidth={1} 
                          strokeDasharray="3 3"
                          label={{ 
                            value: `ค่าเฉลี่ย: ${stats.avg.toFixed(2)}%`,
                            position: 'insideTopRight',
                            fontSize: 10,
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ stroke: '#10b981', strokeWidth: 2, r: 3, fill: '#fff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* แสดงข้อมูลล่าสุด 5 รายการ */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">ข้อมูลล่าสุด</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 text-xs flex items-center gap-1" onClick={toggleSortOrder}>
                    <Calendar className="h-3.5 w-3.5" />
                    <ArrowDownUp className="h-3.5 w-3.5" />
                    <span>{sortOrder === 'desc' ? 'ล่าสุด → เก่าสุด' : 'เก่าสุด → ล่าสุด'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-20 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-32 bg-gray-200 mb-2 rounded"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ) : tableData.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">ไม่มีข้อมูลในช่วงเวลานี้</div>
                ) : (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">วันที่</TableHead>
                          <TableHead className="w-[100px]">เวลา</TableHead>
                          <TableHead className="text-right">ค่าที่วัดได้</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.slice(0, 5).map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.time} น.</TableCell>
                            <TableCell className="text-right font-medium">{row.value !== null ? `${row.value}%` : "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ประวัติข้อมูลทั้งหมด */}
          <TabsContent value="history" className="flex-1 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ประวัติการวัด</CardTitle>
                    <CardDescription>
                      พบข้อมูล {tableData.length} รายการ
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1" onClick={toggleSortOrder}>
                    <ArrowDownUp className="h-3.5 w-3.5" />
                    <span>{sortOrder === 'desc' ? 'ล่าสุดขึ้นก่อน' : 'เก่าสุดขึ้นก่อน'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
                  </div>
                ) : tableData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    ไม่มีข้อมูลในช่วงเวลาที่เลือก
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100%-1rem)] rounded-md border mx-4 mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">วันที่</TableHead>
                          <TableHead className="w-[100px]">เวลา</TableHead>
                          <TableHead className="text-right">ค่าที่วัดได้</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.time} น.</TableCell>
                            <TableCell className="text-right font-medium">{row.value !== null ? `${row.value}%` : "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* กราฟเต็มหน้าจอ */}
          <TabsContent value="graph" className="flex-1 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>กราฟแสดงการวัด</CardTitle>
                    <CardDescription>
                      แสดงข้อมูลย้อนหลัง {timeFrame === '1h' ? '1 ชั่วโมง' : timeFrame === '24h' ? '24 ชั่วโมง' : timeFrame === '7d' ? '7 วัน' : '30 วัน'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    ไม่มีข้อมูลในช่วงเวลาที่เลือก
                  </div>
                ) : (
                  <div className="px-4 pb-4 h-full">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 12 }} 
                          tickFormatter={(value) => `${value} น.`}
                          padding={{ right: 20 }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          tick={{ fontSize: 12 }} 
                          tickFormatter={(value) => `${value}%`}
                          width={40}
                          axisLine={false}
                          tickLine={false}
                          dx={-5}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value}%`, `ค่าที่วัดได้`]}
                          labelFormatter={(label) => `เวลา: ${label} น.`}
                          contentStyle={{ 
                            background: '#fff', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '0.375rem', 
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
                          }}
                        />
                        <ReferenceLine 
                          y={stats.avg} 
                          stroke="#f87171" 
                          strokeWidth={1} 
                          strokeDasharray="5 5"
                          isFront={true}
                          label={{
                            value: `ค่าเฉลี่ย: ${stats.avg.toFixed(2)}%`,
                            position: 'insideTopRight',
                            fill: '#f87171',
                            fontSize: 13,
                            fontWeight: 600
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          dot={{ r: 4, stroke: '#10b981', strokeWidth: 1, fill: 'white' }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                          isAnimationActive={true}
                          animationDuration={500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">ค่าเฉลี่ย</div>
                        <div className="text-lg font-semibold">{stats.avg.toFixed(2)}%</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-500">ค่าต่ำสุด</div>
                        <div className="text-lg font-semibold text-blue-600">{stats.min.toFixed(2)}%</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-sm text-gray-500">ค่าสูงสุด</div>
                        <div className="text-lg font-semibold text-red-600">{stats.max.toFixed(2)}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MeasurementHistory;
