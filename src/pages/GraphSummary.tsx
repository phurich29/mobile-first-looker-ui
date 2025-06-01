
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
import { useIsMobile } from "@/hooks/use-mobile";
// Header and FooterNav are handled by AppLayout
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
  const isMobile = useIsMobile(); // Retain for other logic if needed, AppLayout handles sidebar collapse
  const { user } = useAuth();
  // const [isCollapsed, setIsCollapsed] = useState(false); // Removed, AppLayout handles this
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

  // Removed useEffect for isCollapsed as AppLayout handles sidebar state
  
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

  // const sidebarWidth = !isMobile ? (isCollapsed ? 'ml-20' : 'ml-64') : ''; // Removed, AppLayout handles this

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-20' : 'pb-8'}>
      {/* Main content container with original padding. Dynamic margins are handled by AppLayout. */}
      <div className={`flex-1 p-4 transition-all duration-300`}> {/* Removed dynamic pb and sidebarWidth classes */}
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
      </div>
      
      <GraphSelector 
        open={selectorOpen} 
        onOpenChange={setSelectorOpen} 
        onSelectGraph={(deviceCode, symbol, name, deviceName) => {
          handleAddGraph(deviceCode, symbol, name, deviceName);
        }}
      />
      {/* FooterNav is handled by AppLayout */}
    </AppLayout>
  );
};

export default GraphSummary;
