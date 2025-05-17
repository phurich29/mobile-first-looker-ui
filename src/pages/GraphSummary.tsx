
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
import { useGraphData } from "@/components/graph-summary/useGraphData";
import { useGraphSummaryPreferences } from "@/components/graph-summary/hooks/useGraphSummaryPreferences";

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
  
  // Load preferences using our custom hook
  const { 
    preferences, 
    loading: preferencesLoading, 
    saving, 
    savePreferences 
  } = useGraphSummaryPreferences();
  
  // Use preferences from the hook
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h");
  const [graphStyle, setGraphStyle] = useState<GraphStyle>("line");
  const [globalLineColor, setGlobalLineColor] = useState<string>("#f97316");
  
  // Load data using our custom hook
  const { graphData, loading: dataLoading } = useGraphData(selectedMetrics, timeFrame);
  
  // Apply preferences when they load
  useEffect(() => {
    if (!preferencesLoading) {
      setSelectedMetrics(preferences.selectedMetrics || []);
      setTimeFrame(preferences.timeFrame || "24h");
      setGraphStyle(preferences.graphStyle || "line");
      setGlobalLineColor(preferences.globalLineColor || "#f97316");
    }
  }, [preferences, preferencesLoading]);

  useEffect(() => {
    // Get sidebar collapsed state from localStorage and listen for custom events
    const updateSidebarState = (event?: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent?.detail) {
        setIsCollapsed(customEvent.detail.isCollapsed);
      } else {
        const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
        setIsCollapsed(savedCollapsedState === 'true');
      }
    };
    
    // Initial state
    updateSidebarState();
    
    // Listen for changes in localStorage
    window.addEventListener('storage', () => updateSidebarState());
    
    // Listen for custom event from Header component
    window.addEventListener('sidebarStateChanged', updateSidebarState);
    
    return () => {
      window.removeEventListener('storage', () => updateSidebarState());
      window.removeEventListener('sidebarStateChanged', updateSidebarState);
    };
  }, []);
  
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
    
    const newMetrics = [
      ...selectedMetrics,
      {
        deviceCode,
        deviceName: actualDeviceName,
        symbol,
        name,
        color: colors[colorIndex],
      },
    ];
    
    setSelectedMetrics(newMetrics);
    
    // Close selector after adding
    setSelectorOpen(false);
  };

  // Function to remove a metric from the graph
  const removeMetric = (deviceCode: string, symbol: string) => {
    const newMetrics = selectedMetrics.filter(
      m => !(m.deviceCode === deviceCode && m.symbol === symbol)
    );
    setSelectedMetrics(newMetrics);
  };
  
  // Function to update the color of a metric's line on the graph
  const updateMetricColor = (deviceCode: string, symbol: string, color: string) => {
    const newMetrics = selectedMetrics.map(metric => {
      if (metric.deviceCode === deviceCode && metric.symbol === symbol) {
        return {
          ...metric,
          color: color
        };
      }
      return metric;
    });
    setSelectedMetrics(newMetrics);
  };
  
  // Function to save all preferences
  const handleSavePreferences = () => {
    savePreferences({
      selectedMetrics,
      timeFrame,
      graphStyle,
      globalLineColor
    });
  };

  // Calculate sidebar width for layout
  const sidebarWidth = !isMobile ? (isCollapsed ? 'ml-20' : 'ml-64') : '';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-20' : `pb-8 ${sidebarWidth}`} p-4 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto">
          <GraphHeader 
            onOpenSelector={() => setSelectorOpen(true)}
            timeFrame={timeFrame}
            onTimeFrameChange={(value) => setTimeFrame(value as TimeFrame)}
          />
          
          <GraphContent
            loading={preferencesLoading || dataLoading}
            selectedMetrics={selectedMetrics}
            graphData={graphData}
            graphStyle={graphStyle}
            globalLineColor={globalLineColor}
            timeFrame={timeFrame}
            onOpenSelector={() => setSelectorOpen(true)}
            onRemoveMetric={removeMetric}
            onUpdateMetricColor={updateMetricColor}
            onTimeFrameChange={setTimeFrame}
            onGraphStyleChange={setGraphStyle}
            onGlobalLineColorChange={setGlobalLineColor}
            onSavePreferences={handleSavePreferences}
            saving={saving}
          />
        </div>
      </main>
      
      <GraphSelector 
        open={selectorOpen} 
        onOpenChange={setSelectorOpen} 
        onSelectGraph={(deviceCode, symbol, name, deviceName) => {
          handleAddGraph(deviceCode, symbol, name, deviceName);
        }}
      />
      
      <FooterNav />
    </div>
  );
};

export default GraphSummary;
