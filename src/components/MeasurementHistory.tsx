
import React, { useState, useMemo } from "react";
import { ChevronLeft, Calendar, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the data structure expected from Supabase
interface MeasurementData {
  id: number;
  created_at?: string;
  thai_datetime?: string;
  device_code?: string;
  [key: string]: any; // For dynamic measurement values
}

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
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24h');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeView, setActiveView] = useState<'summary' | 'table' | 'chart'>('summary');
  const { toast } = useToast();

  // Function to convert timeframe to hours
  const getTimeFrameHours = (frame: TimeFrame): number => {
    switch (frame) {
      case '1h': return 1;
      case '24h': return 24;
      case '7d': return 24 * 7;
      case '30d': return 24 * 30;
    }
  };

  // Fetch measurement history data
  const fetchMeasurementHistory = async (): Promise<MeasurementData[]> => {
    if (!deviceCode || !symbol) throw new Error("Missing device code or measurement symbol");
    
    try {
      const selectQuery = `id, ${symbol}, created_at, thai_datetime`;
      
      const hours = getTimeFrameHours(timeFrame);
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hours);
      
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select(selectQuery)
        .eq('device_code', deviceCode)
        .gt('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: sortOrder === 'asc' });
      
      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถดึงข้อมูลได้: ${error.message}`,
        });
        throw error;
      }
      
      // Ensure we return an empty array if data is null
      return data || [];
    } catch (err) {
      console.error('Error in fetchMeasurementHistory:', err);
      return [];
    }
  };

  // Use React Query for data fetching
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['measurementHistory', deviceCode, symbol, timeFrame, sortOrder],
    queryFn: fetchMeasurementHistory,
    enabled: !!deviceCode && !!symbol,
  });

  // Format date and time for Bangkok (+7)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return { date: "ไม่มีข้อมูล", time: "ไม่มีข้อมูล" };
    
    const date = new Date(dateStr);
    const adjustedDate = new Date(date.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours for Bangkok time
    
    const thaiDate = adjustedDate.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const thaiTime = adjustedDate.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return { date: thaiDate, time: thaiTime };
  };

  // Prepare data for table
  const tableData = useMemo(() => {
    if (!historyData || !Array.isArray(historyData)) return [];
    
    return historyData.map(item => ({
      id: item.id,
      value: item[symbol] !== null && item[symbol] !== undefined ? item[symbol] : null,
      formattedDate: formatDate(item.created_at || item.thai_datetime).date,
      formattedTime: formatDate(item.created_at || item.thai_datetime).time,
      timestamp: new Date(item.created_at || item.thai_datetime || Date.now()).getTime()
    }));
  }, [historyData, symbol]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!tableData || tableData.length === 0) return { avg: 0, min: 0, max: 0, current: 0 };
    
    const values = tableData
      .map(item => item.value)
      .filter(value => value !== null && value !== undefined) as number[];
    
    if (values.length === 0) return { avg: 0, min: 0, max: 0, current: 0 };
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = values[0] || 0;
    
    return { avg, min, max, current };
  }, [tableData]);

  // Prepare data for chart
  const chartData = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    
    return [...tableData]
      .sort((a, b) => sortOrder === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp)
      .map(item => ({
        time: item.formattedTime,
        value: item.value,
        date: item.formattedDate
      }));
  }, [tableData, sortOrder]);
  
  // Get icon based on measurement type
  const getMeasurementIcon = () => {
    // You can add more icon logic here based on the symbol
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
        <span className="text-white text-lg font-bold">{symbol.charAt(0).toUpperCase()}</span>
      </div>
    );
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      <Header />
      
      {/* Top navigation bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon"
              onClick={onClose}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div>
              <h2 className="font-medium text-lg">{name}</h2>
              <p className="text-xs text-gray-500">รหัสอุปกรณ์: {deviceCode}</p>
            </div>
          </div>
          
          <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="ช่วงเวลา" />
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
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="summary" className="h-full flex flex-col" onValueChange={(v) => setActiveView(v as any)}>
          <div className="bg-white border-b border-gray-200">
            <TabsList className="w-full grid grid-cols-3 rounded-none bg-transparent h-12">
              <TabsTrigger value="summary" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:shadow-none">
                สรุป
              </TabsTrigger>
              <TabsTrigger value="table" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:shadow-none">
                ตาราง
              </TabsTrigger>
              <TabsTrigger value="chart" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:shadow-none">
                กราฟ
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            {/* Summary View */}
            <TabsContent value="summary" className="mt-0 h-full space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    {getMeasurementIcon()}
                    <div className="ml-3">
                      <CardTitle>{name}</CardTitle>
                      <CardDescription>ค่าล่าสุด</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600 mb-1">{tableData[0]?.value?.toFixed(2) || "0.00"}%</div>
                  <p className="text-sm text-gray-500">
                    {tableData[0] ? `บันทึกเมื่อ ${tableData[0].formattedTime} น.` : "ไม่มีข้อมูล"}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">สถิติ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">ค่าเฉลี่ย</p>
                      <p className="text-lg font-semibold">{stats.avg.toFixed(2)}%</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-500">ค่าต่ำสุด</p>
                      <p className="text-lg font-semibold text-blue-600">{stats.min.toFixed(2)}%</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-500">ค่าสูงสุด</p>
                      <p className="text-lg font-semibold text-red-600">{stats.max.toFixed(2)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">กราฟแนวโน้ม</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="h-[180px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
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
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      ไม่มีข้อมูลในช่วงเวลาที่เลือก
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">ข้อมูลล่าสุด</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs flex items-center gap-1"
                      onClick={toggleSortOrder}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <ArrowDownUp className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="-mt-2">
                  {tableData.length > 0 ? (
                    <div className="space-y-3">
                      {tableData.slice(0, 5).map((row) => (
                        <div key={row.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                          <div className="flex flex-col">
                            <span className="text-sm">{row.formattedDate}</span>
                            <span className="text-xs text-gray-500">{row.formattedTime} น.</span>
                          </div>
                          <div className="font-medium">
                            {row.value !== null ? `${row.value.toFixed(2)}%` : "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-gray-400">
                      ไม่มีข้อมูลในช่วงเวลาที่เลือก
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Table View */}
            <TabsContent value="table" className="mt-0 h-full">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>ประวัติการวัด</CardTitle>
                      <CardDescription>พบข้อมูล {tableData.length} รายการ</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs flex items-center gap-1"
                      onClick={toggleSortOrder}
                    >
                      <span>{sortOrder === 'desc' ? 'ล่าสุดก่อน' : 'เก่าสุดก่อน'}</span>
                      <ArrowDownUp className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  {tableData.length > 0 ? (
                    <div className="h-full overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white z-10">
                          <TableRow>
                            <TableHead>วันที่</TableHead>
                            <TableHead>เวลา</TableHead>
                            <TableHead className="text-right">ค่าที่วัดได้</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell>{row.formattedDate}</TableCell>
                              <TableCell>{row.formattedTime} น.</TableCell>
                              <TableCell className="text-right font-medium">
                                {row.value !== null ? `${row.value.toFixed(2)}%` : "N/A"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      ไม่มีข้อมูลในช่วงเวลาที่เลือก
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Chart View */}
            <TabsContent value="chart" className="mt-0 h-full">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>แนวโน้มการเปลี่ยนแปลง</CardTitle>
                      <CardDescription>
                        {timeFrame === '1h' ? '1 ชั่วโมง' : 
                         timeFrame === '24h' ? '24 ชั่วโมง' : 
                         timeFrame === '7d' ? '7 วัน' : '30 วัน'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs flex items-center gap-1"
                        onClick={toggleSortOrder}
                      >
                        <ArrowDownUp className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden pb-4">
                  {chartData.length > 0 ? (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 min-h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 12 }} 
                              tickFormatter={(value) => `${value}`}
                              tickLine={false}
                              axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <YAxis 
                              domain={['auto', 'auto']} 
                              tick={{ fontSize: 12 }} 
                              tickFormatter={(value) => `${value}%`}
                              width={40}
                              axisLine={false}
                              tickLine={false}
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
                              strokeWidth={1.5} 
                              strokeDasharray="5 5"
                              label={{
                                value: `ค่าเฉลี่ย: ${stats.avg.toFixed(2)}%`,
                                position: 'right',
                                fill: '#f87171',
                                fontSize: 12,
                                offset: 10
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#10b981" 
                              strokeWidth={2.5} 
                              dot={{ r: 4, stroke: '#10b981', strokeWidth: 1, fill: 'white' }}
                              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">ค่าเฉลี่ย</p>
                          <p className="text-lg font-semibold">{stats.avg.toFixed(2)}%</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-500">ค่าต่ำสุด</p>
                          <p className="text-lg font-semibold text-blue-600">{stats.min.toFixed(2)}%</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-500">ค่าสูงสุด</p>
                          <p className="text-lg font-semibold text-red-600">{stats.max.toFixed(2)}%</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      ไม่มีข้อมูลในช่วงเวลาที่เลือก
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default MeasurementHistory;
