
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
import { useGuestMode } from "@/hooks/useGuestMode";

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
  const { isGuest } = useGuestMode();
  // const [isCollapsed, setIsCollapsed] = useState(false); // Removed, AppLayout handles this
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [deviceNames, setDeviceNames] = useState<Record<string, string>>({});
  
  // Use different preferences handling for guests vs authenticated users
  const { 
    preferences, 
    loading: preferencesLoading, 
    saving, 
    savePreferences 
  } = useGraphSummaryPreferences();
  
  // Local state for guest mode
  const [guestSelectedMetrics, setGuestSelectedMetrics] = useState<SelectedMetric[]>([]);
  const [guestTimeFrame, setGuestTimeFrame] = useState<TimeFrame>("24h");
  const [guestGraphStyle, setGuestGraphStyle] = useState<GraphStyle>("line");
  const [guestGlobalLineColor, setGuestGlobalLineColor] = useState<string>("#f97316");
  const [guestSaving, setGuestSaving] = useState(false);
  
  // Use appropriate state based on user type
  const selectedMetrics = isGuest ? guestSelectedMetrics : (preferences.selectedMetrics || []);
  const timeFrame = isGuest ? guestTimeFrame : (preferences.timeFrame || "24h");
  const graphStyle = isGuest ? guestGraphStyle : (preferences.graphStyle || "line");
  const globalLineColor = isGuest ? guestGlobalLineColor : (preferences.globalLineColor || "#f97316");
  const currentSaving = isGuest ? guestSaving : saving;
  
  // Load data using our custom hook
  const { graphData, loading: dataLoading } = useGraphData(selectedMetrics, timeFrame);
  
  // Load guest preferences from localStorage
  useEffect(() => {
    if (isGuest) {
      const savedPreferences = localStorage.getItem('graphSummaryPreferences');
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences);
          setGuestSelectedMetrics(parsed.selectedMetrics || []);
          setGuestTimeFrame(parsed.timeFrame || "24h");
          setGuestGraphStyle(parsed.graphStyle || "line");
          setGuestGlobalLineColor(parsed.globalLineColor || "#f97316");
        } catch (error) {
          console.error('Error loading guest preferences:', error);
        }
      }
    }
  }, [isGuest]);

  // Apply preferences when they load for authenticated users
  useEffect(() => {
    if (!isGuest && !preferencesLoading) {
      // Preferences are already loaded through the hook
    }
  }, [preferences, preferencesLoading, isGuest]);

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
    
    const newMetric: SelectedMetric = {
      deviceCode,
      deviceName: actualDeviceName,
      symbol,
      name,
      color: colors[colorIndex],
    };
    
    const newMetrics = [...selectedMetrics, newMetric];
    
    if (isGuest) {
      setGuestSelectedMetrics(newMetrics);
    } else {
      // For authenticated users, we need to trigger a save
      savePreferences({
        selectedMetrics: newMetrics,
        timeFrame,
        graphStyle,
        globalLineColor
      });
    }
    
    // Close selector after adding
    setSelectorOpen(false);
  };

  // Function to remove a metric from the graph
  const removeMetric = (deviceCode: string, symbol: string) => {
    const newMetrics = selectedMetrics.filter(
      m => !(m.deviceCode === deviceCode && m.symbol === symbol)
    );
    
    if (isGuest) {
      setGuestSelectedMetrics(newMetrics);
    } else {
      savePreferences({
        selectedMetrics: newMetrics,
        timeFrame,
        graphStyle,
        globalLineColor
      });
    }
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
    
    if (isGuest) {
      setGuestSelectedMetrics(newMetrics);
    } else {
      savePreferences({
        selectedMetrics: newMetrics,
        timeFrame,
        graphStyle,
        globalLineColor
      });
    }
  };
  
  // Function to handle time frame changes
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    if (isGuest) {
      setGuestTimeFrame(newTimeFrame);
    } else {
      savePreferences({
        selectedMetrics,
        timeFrame: newTimeFrame,
        graphStyle,
        globalLineColor
      });
    }
  };

  // Function to handle graph style changes
  const handleGraphStyleChange = (newGraphStyle: GraphStyle) => {
    if (isGuest) {
      setGuestGraphStyle(newGraphStyle);
    } else {
      savePreferences({
        selectedMetrics,
        timeFrame,
        graphStyle: newGraphStyle,
        globalLineColor
      });
    }
  };

  // Function to handle global line color changes
  const handleGlobalLineColorChange = (newColor: string) => {
    if (isGuest) {
      setGuestGlobalLineColor(newColor);
    } else {
      savePreferences({
        selectedMetrics,
        timeFrame,
        graphStyle,
        globalLineColor: newColor
      });
    }
  };
  
  // Function to save all preferences for guests
  const handleSavePreferences = () => {
    if (isGuest) {
      setGuestSaving(true);
      const preferencesToSave = {
        selectedMetrics: guestSelectedMetrics,
        timeFrame: guestTimeFrame,
        graphStyle: guestGraphStyle,
        globalLineColor: guestGlobalLineColor
      };
      localStorage.setItem('graphSummaryPreferences', JSON.stringify(preferencesToSave));
      setTimeout(() => {
        setGuestSaving(false);
      }, 1000);
    } else {
      savePreferences({
        selectedMetrics,
        timeFrame,
        graphStyle,
        globalLineColor
      });
    }
  };

  // const sidebarWidth = !isMobile ? (isCollapsed ? 'ml-20' : 'ml-64') : ''; // Removed, AppLayout handles this

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-20' : 'pb-8'}>
      {/* Main content container with original padding. Dynamic margins are handled by AppLayout. */}
      <div className={`flex-1 transition-all duration-300`}> {/* Removed dynamic pb and sidebarWidth classes */}
        <div className="max-w-7xl mx-auto">
          <GraphHeader 
            onOpenSelector={() => setSelectorOpen(true)}
            timeFrame={timeFrame}
            onTimeFrameChange={handleTimeFrameChange}
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
            onTimeFrameChange={handleTimeFrameChange}
            onGraphStyleChange={handleGraphStyleChange}
            onGlobalLineColorChange={handleGlobalLineColorChange}
            onSavePreferences={handleSavePreferences}
            saving={currentSaving}
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
