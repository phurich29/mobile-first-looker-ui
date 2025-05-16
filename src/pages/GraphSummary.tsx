
import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { GraphSelector } from "@/components/graph-monitor/GraphSelector";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { 
  GraphHeader, 
  GraphContent,
  SelectedMetric, 
  useGraphData
} from "@/components/graph-summary";

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
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h");
  
  // Use the custom hook for graph data
  const { graphData, loading } = useGraphData(selectedMetrics, timeFrame);
  
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
  const handleAddGraph = (deviceCode: string, symbol: string, name: string) => {
    // Don't add if already exists
    if (selectedMetrics.some(m => m.deviceCode === deviceCode && m.symbol === symbol)) {
      return;
    }

    // Get device name from our graph selector component (will be passed to us)
    const deviceName = deviceCode; // This will be replaced with the actual name
    
    // Assign a color from our color palette
    const colorIndex = selectedMetrics.length % colors.length;
    
    setSelectedMetrics([
      ...selectedMetrics,
      {
        deviceCode,
        deviceName,
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
            onOpenSelector={() => setSelectorOpen(true)}
            onRemoveMetric={removeMetric}
          />
        </div>
      </main>
      
      <GraphSelector 
        open={selectorOpen} 
        onOpenChange={setSelectorOpen} 
        onSelectGraph={(device, symbol, name) => handleAddGraph(device, symbol, name)}
      />
      
      <FooterNav />
    </div>
  );
};

export default GraphSummary;
