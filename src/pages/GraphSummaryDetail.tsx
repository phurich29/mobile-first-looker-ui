
import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  LineChart, 
  Area,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, PlusCircle, BarChart2, ChevronLeft } from "lucide-react";
import { useGraphSelector } from "@/components/graph-monitor/graph-selector/useGraphSelector";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getTimeFrameHours } from "@/components/measurement-history/api";

interface SelectedMetric {
  deviceCode: string;
  deviceName: string;
  symbol: string;
  name: string;
  color: string;
}

const colors = [
  "#9b87f5", // Primary purple
  "#F97316", // Bright orange 
  "#0EA5E9", // Ocean blue
  "#D946EF", // Magenta pink
  "#22C55E", // Green
  "#EF4444", // Red
  "#F59E0B", // Yellow
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#0284C7", // Blue
];

const GraphSummaryDetail = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h");
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>([]);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Use the graph selector hook for devices and measurements
  const {
    loading: loadingSelector,
    devices,
    measurements,
    selectedDevice,
    setSelectedDevice,
    fetchDevices,
    getSelectedDeviceName,
  } = useGraphSelector();

  // When the page loads, fetch devices
  useEffect(() => {
    fetchDevices();
  }, []);

  // Get sidebar collapsed state from localStorage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState) {
      setIsCollapsed(savedCollapsedState === 'true');
    }
    
    // Listen for changes in localStorage
    const handleStorageChange = () => {
      const currentState = localStorage.getItem('sidebarCollapsed');
      setIsCollapsed(currentState === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Use requestAnimationFrame for smoother checks
    let rafId: number;
    const checkState = () => {
      const currentState = localStorage.getItem('sidebarCollapsed');
      if (currentState === 'true' !== isCollapsed) {
        setIsCollapsed(currentState === 'true');
      }
      rafId = requestAnimationFrame(checkState);
    };
    
    rafId = requestAnimationFrame(checkState);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      cancelAnimationFrame(rafId);
    };
  }, [isCollapsed]);

  // When selectedMetrics changes, fetch the data for all metrics
  useEffect(() => {
    if (selectedMetrics.length > 0) {
      fetchGraphData();
    } else {
      setGraphData([]);
    }
  }, [selectedMetrics, timeFrame]);

  // Function to add a new metric to the graph
  const addMetric = (symbol: string, name: string) => {
    // Don't add if already exists
    if (selectedMetrics.some(m => m.deviceCode === selectedDevice && m.symbol === symbol)) {
      return;
    }

    // Assign a color from our color palette
    const colorIndex = selectedMetrics.length % colors.length;
    
    setSelectedMetrics([
      ...selectedMetrics,
      {
        deviceCode: selectedDevice || '',
        deviceName: getSelectedDeviceName(),
        symbol,
        name,
        color: colors[colorIndex],
      },
    ]);
  };

  // Function to remove a metric from the graph
  const removeMetric = (deviceCode: string, symbol: string) => {
    setSelectedMetrics(selectedMetrics.filter(
      m => !(m.deviceCode === deviceCode && m.symbol === symbol)
    ));
  };

  // Function to fetch data for all selected metrics
  const fetchGraphData = async () => {
    setLoading(true);

    try {
      // Calculate cutoff date based on timeframe
      const hours = getTimeFrameHours(timeFrame);
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hours);

      // Fetch data for each device
      const deviceDataPromises = selectedMetrics.map(async (metric) => {
        const { data, error } = await supabase
          .from("rice_quality_analysis")
          .select("*")
          .eq("device_code", metric.deviceCode)
          .gt("created_at", cutoffDate.toISOString())
          .order("created_at", { ascending: true });

        if (error) {
          console.error(`Error fetching data for ${metric.deviceName}:`, error);
          return [];
        }

        return data || [];
      });

      const allDeviceData = await Promise.all(deviceDataPromises);

      // Combine and structure the data for the graph
      const combinedData: Record<string, any> = {};

      // Process data from each device
      allDeviceData.forEach((deviceData, deviceIndex) => {
        const metric = selectedMetrics[deviceIndex];
        
        deviceData.forEach(item => {
          const date = new Date(item.created_at);
          const timeKey = date.toISOString(); // Use ISO string as key for exact matching
          
          if (!combinedData[timeKey]) {
            combinedData[timeKey] = {
              time: `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`,
              timestamp: date.getTime(),
            };
          }
          
          // Add this metric's value to the data point
          // Use deviceCode_symbol as key to ensure uniqueness
          const dataKey = `${metric.deviceCode}_${metric.symbol}`;
          combinedData[timeKey][dataKey] = Number(item[metric.symbol]);
        });
      });

      // Convert to array and sort by timestamp
      const dataArray = Object.values(combinedData)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      setGraphData(dataArray);
    } catch (err) {
      console.error("Error fetching graph data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate sidebar width for layout
  const sidebarWidth = !isMobile ? (isCollapsed ? 'ml-20' : 'ml-64') : '';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-20' : `pb-8 ${sidebarWidth}`} p-4`}>
        <div className="max-w-7xl mx-auto">
          {/* Header with back button */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-2">
                <Link to="/graph-summary" className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  <span>ย้อนกลับ</span>
                </Link>
              </Button>
              <h1 className="text-2xl font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <BarChart2 className="h-6 w-6" />
                Graph Comparison
              </h1>
            </div>
            
            {/* Time frame selector */}
            <div className="flex mt-4 md:mt-0 self-end">
              <Select
                value={timeFrame}
                onValueChange={(value) => setTimeFrame(value as TimeFrame)}
              >
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
                  <SelectValue placeholder="เลือกช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 ชั่วโมง</SelectItem>
                  <SelectItem value="3h">3 ชั่วโมง</SelectItem>
                  <SelectItem value="6h">6 ชั่วโมง</SelectItem>
                  <SelectItem value="12h">12 ชั่วโมง</SelectItem>
                  <SelectItem value="24h">24 ชั่วโมง</SelectItem>
                  <SelectItem value="7d">7 วัน</SelectItem>
                  <SelectItem value="30d">30 วัน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Graph and controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controls sidebar */}
            <Card className="lg:col-span-3 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                  เลือกอุปกรณ์
                </h2>
                <Select
                  value={selectedDevice || ""}
                  onValueChange={setSelectedDevice}
                  disabled={loadingSelector}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกอุปกรณ์" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((device) => (
                      <SelectItem key={device.device_code} value={device.device_code}>
                        {device.device_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedDevice && (
                <div className="mb-4">
                  <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                    เลือกค่าที่ต้องการดู
                  </h2>
                  {loadingSelector ? (
                    <div className="text-center py-4">
                      <div className="animate-spin h-5 w-5 border-2 border-emerald-600 rounded-full border-t-transparent mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                      {measurements.map((measurement) => (
                        <Button
                          key={measurement.symbol}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => addMetric(measurement.symbol, measurement.name)}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          {measurement.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Selected metrics */}
              <div>
                <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                  ค่าที่เลือกไว้
                </h2>
                {selectedMetrics.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                    <p className="text-sm text-gray-500">เลือกอุปกรณ์และค่าที่ต้องการแสดงบนกราฟ</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedMetrics.map((metric, index) => (
                      <div 
                        key={`${metric.deviceCode}_${metric.symbol}`}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: metric.color }}
                          ></div>
                          <div className="text-sm">
                            <div className="font-medium">{metric.name}</div>
                            <div className="text-xs text-gray-500">{metric.deviceName}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMetric(metric.deviceCode, metric.symbol)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
            
            {/* Graph */}
            <Card className="lg:col-span-9 flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-emerald-600 rounded-full border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
                  </div>
                </div>
              ) : selectedMetrics.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-300">ไม่มีข้อมูลที่เลือก</h3>
                    <p className="text-gray-500 mb-4">
                      เลือกอุปกรณ์และค่าที่ต้องการแสดงบนกราฟจากเมนูด้านซ้าย
                    </p>
                  </div>
                </div>
              ) : graphData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-300">ไม่พบข้อมูล</h3>
                    <p className="text-gray-500">ไม่พบข้อมูลสำหรับค่าที่เลือกในช่วงเวลานี้</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                      เปรียบเทียบค่าจากหลายอุปกรณ์
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedMetrics.map((metric) => (
                        <Badge 
                          key={`${metric.deviceCode}_${metric.symbol}`}
                          variant="outline" 
                          className="flex items-center gap-2"
                          style={{ borderColor: metric.color, color: metric.color }}
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: metric.color }}
                          ></div>
                          {metric.name} ({metric.deviceName})
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={graphData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                  <p className="text-sm font-medium mb-2">{`เวลา: ${label}`}</p>
                                  <div className="space-y-1">
                                    {payload.map((entry, index) => {
                                      // Find original metric for this entry
                                      const metricKey = entry.dataKey as string;
                                      const [deviceCode, symbol] = metricKey.split('_');
                                      const metric = selectedMetrics.find(
                                        m => m.deviceCode === deviceCode && m.symbol === symbol
                                      );
                                      
                                      if (!metric) return null;
                                      
                                      return (
                                        <div 
                                          key={index} 
                                          className="flex items-center justify-between"
                                        >
                                          <div className="flex items-center">
                                            <div 
                                              className="w-3 h-3 rounded-full mr-2"
                                              style={{ backgroundColor: metric.color }}
                                            ></div>
                                            <span className="text-xs font-medium">
                                              {metric.name} ({metric.deviceName})
                                            </span>
                                          </div>
                                          <span className="text-xs font-mono ml-4">
                                            {Number(entry.value).toFixed(2)}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend 
                          content={({ payload }) => (
                            <div className="flex flex-wrap justify-center mt-2 gap-4">
                              {(payload || []).map((entry, index) => {
                                // Extract the original metric info from the dataKey
                                const metricKey = entry.dataKey as string;
                                const [deviceCode, symbol] = metricKey.split('_');
                                const metric = selectedMetrics.find(
                                  m => m.deviceCode === deviceCode && m.symbol === symbol
                                );
                                
                                if (!metric) return null;
                                
                                return (
                                  <div key={index} className="flex items-center">
                                    <div 
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: metric.color }}
                                    ></div>
                                    <span className="text-xs">
                                      {metric.name} ({metric.deviceName})
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        />
                        {selectedMetrics.map((metric, index) => (
                          <Line
                            key={`${metric.deviceCode}_${metric.symbol}`}
                            type="monotone"
                            dataKey={`${metric.deviceCode}_${metric.symbol}`}
                            name={`${metric.name} (${metric.deviceName})`}
                            stroke={metric.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, stroke: metric.color, strokeWidth: 1, fill: 'white' }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
      
      <FooterNav />
    </div>
  );
};

export default GraphSummaryDetail;
