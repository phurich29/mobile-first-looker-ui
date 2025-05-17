import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { GraphSelector } from "@/components/graph-monitor/GraphSelector";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { SelectedMetric, GraphStyle } from "@/components/graph-summary/types";
import { GraphContent } from "@/components/graph-summary/GraphContent";
import { GraphHeader } from "@/components/graph-summary/GraphHeader";
// Mock API - ใช้ในตัวอย่างเท่านั้น
const getGraphDataByTimeFrame = (metrics: SelectedMetric[], timeFrame: TimeFrame) => {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      // สร้างข้อมูลจำลองสำหรับกราฟ
      const now = new Date();
      const data = [];
      const points = timeFrame === '1h' ? 60 : 
                   timeFrame === '3h' ? 180 : 
                   timeFrame === '6h' ? 360 : 
                   timeFrame === '12h' ? 720 : 
                   timeFrame === '24h' ? 1440 : 
                   timeFrame === '7d' ? 168 : 720;
      
      const interval = timeFrame === '1h' ? 60 : 
                      timeFrame === '3h' ? 60 : 
                      timeFrame === '6h' ? 60 : 
                      timeFrame === '12h' ? 60 : 
                      timeFrame === '24h' ? 60 : 
                      timeFrame === '7d' ? 3600 : 3600;
      
      for (let i = 0; i < points; i += 10) {
        const timestamp = new Date(now.getTime() - (i * interval * 1000));
        const point: any = { timestamp: timestamp.getTime() };
        
        metrics.forEach(metric => {
          // สร้างข้อมูลสุ่มสำหรับแต่ละตัวชี้วัด
          const key = `${metric.deviceCode}-${metric.symbol}`;
          const baseValue = Math.random() * 100;
          const noise = Math.sin(i / 10) * 10;
          point[key] = parseFloat((baseValue + noise).toFixed(2));
        });
        
        data.push(point);
      }
      
      resolve(data.reverse());
    }, 500);
  });
};

// Define colors for the chart lines
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

const GraphSummary = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [deviceNames, setDeviceNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<any[]>([]);
  
  // จะเก็บ metrics ที่เลือกไว้ใน localStorage
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>(
    []
  );
  
  // เก็บช่วงเวลาใน localStorage
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(
    "24h"
  );
  
  // เก็บค่าสไตล์กราฟใน localStorage
  const [graphStyle, setGraphStyle] = useState<GraphStyle>(
    "line"
  );
  
  // เก็บค่าสีเส้นเฉลี่ยใน localStorage
  const [globalLineColor, setGlobalLineColor] = useState<string>(
    "#f97316"
  );
  // โหลดข้อมูลกราฟเมื่อเปลี่ยน metrics หรือ timeFrame
  useEffect(() => {
    const fetchData = async () => {
      if (selectedMetrics.length === 0) {
        setGraphData([]);
        return;
      }
      
      setLoading(true);
      try {
        const data = await getGraphDataByTimeFrame(selectedMetrics, timeFrame);
        
        // คำนวณค่าเฉลี่ยรวมสำหรับแต่ละจุดเวลา
        const dataWithAverage = data.map(point => {
          // คำนวณค่าเฉลี่ยจากทุก metric ในจุดเวลานี้
          const values = selectedMetrics.map(metric => {
            const key = `${metric.deviceCode}-${metric.symbol}`;
            return point[key] || 0;
          });
          
          // คำนวณค่าเฉลี่ย
          const validValues = values.filter(v => v !== null && v !== undefined);
          const average = validValues.length > 0 
            ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length 
            : 0;
          
          return {
            ...point,
            average
          };
        });
        
        setGraphData(dataWithAverage);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedMetrics, timeFrame]);
  
  useEffect(() => {
    // Get sidebar collapsed state from localStorage
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
  
  // Function to add a new metric to the graph
  const handleAddGraph = (deviceCode: string, symbol: string, name: string, deviceName?: string) => {
    // Don't add if already exists
    if (selectedMetrics.some(m => m.deviceCode === deviceCode && m.symbol === symbol)) {
      return;
    }

    // Store device name if provided
    if (deviceName) {
      setDeviceNames(prev => ({
        ...prev,
        [deviceCode]: deviceName
      }));
    }
    
    // Get device name from our stored mapping or use deviceCode as fallback
    const actualDeviceName = deviceName || deviceNames[deviceCode] || `อุปกรณ์ ${deviceCode}`;
    
    // Assign a color from our color palette
    const colorIndex = selectedMetrics.length % colors.length;
    
    setSelectedMetrics([
      ...selectedMetrics,
      {
        deviceCode,
        deviceName: actualDeviceName,
        symbol,
        name,
        color: colors[colorIndex],
      },
    ]);
    
    // Close selector after adding
    setSelectorOpen(false);
  };

  // Function to remove a metric from the graph
  const removeMetric = (deviceCode: string, symbol: string) => {
    setSelectedMetrics(selectedMetrics.filter(
      m => !(m.deviceCode === deviceCode && m.symbol === symbol)
    ));
  };
  
  // Function to update the color of a metric's line on the graph
  const updateMetricColor = (deviceCode: string, symbol: string, color: string) => {
    setSelectedMetrics(selectedMetrics.map(metric => {
      if (metric.deviceCode === deviceCode && metric.symbol === symbol) {
        return {
          ...metric,
          color: color
        };
      }
      return metric;
    }));
  };
  
  // Function to update the graph style
  const updateGraphStyle = (style: GraphStyle) => {
    setGraphStyle(style);
  };
  
  // Function to update the global line color
  const updateGlobalLineColor = (color: string) => {
    setGlobalLineColor(color);
  };

  // Calculate sidebar width for layout
  const sidebarWidth = !isMobile ? (isCollapsed ? 'ml-20' : 'ml-64') : '';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-20' : `pb-8 ${sidebarWidth}`} p-4`}>
        <div className="max-w-7xl mx-auto">
          <GraphHeader 
            onOpenSelector={() => setSelectorOpen(true)}
            timeFrame={timeFrame}
            onTimeFrameChange={(value) => setTimeFrame(value as TimeFrame)}
          />
          
          <GraphContent
            loading={loading}
            selectedMetrics={selectedMetrics}
            graphData={graphData}
            graphStyle={graphStyle}
            globalLineColor={globalLineColor}
            timeFrame={timeFrame}
            onOpenSelector={() => setSelectorOpen(true)}
            onRemoveMetric={removeMetric}
            onUpdateMetricColor={updateMetricColor}
            onTimeFrameChange={setTimeFrame}
            onGraphStyleChange={updateGraphStyle}
            onGlobalLineColorChange={updateGlobalLineColor}
          />
        </div>
      </main>
      
      <GraphSelector 
        open={selectorOpen} 
        onOpenChange={setSelectorOpen} 
        onSelectGraph={(deviceCode, symbol, name) => {
          // Extract deviceName from useGraphSelector's getSelectedDeviceName function if possible
          // This is a workaround since we don't have direct access to that function here
          handleAddGraph(deviceCode, symbol, name);
        }}
      />
      
      <FooterNav />
    </div>
  );
};

export default GraphSummary;
