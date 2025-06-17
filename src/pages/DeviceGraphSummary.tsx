
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { GraphSelector } from "@/components/graph-monitor/GraphSelector";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { SelectedMetric, GraphStyle } from "@/components/graph-summary/types";
import { GraphContent } from "@/components/graph-summary/GraphContent";
import { GraphHeader } from "@/components/graph-summary/GraphHeader";
import { useGraphData } from "@/components/graph-summary/useGraphData";
import { useGraphSummaryPreferences } from "@/components/graph-summary/hooks/useGraphSummaryPreferences";
import { supabase } from "@/integrations/supabase/client";

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

const DeviceGraphSummary = () => {
  const { deviceCode } = useParams<{ deviceCode: string }>();
  const isMobile = useIsMobile();
  const { goBack } = useAppNavigation();
  const { user } = useAuth();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [deviceNames, setDeviceNames] = useState<Record<string, string>>({});
  const [deviceDisplayName, setDeviceDisplayName] = useState<string | null>(null);
  
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

  // Fetch device display name
  useEffect(() => {
    const fetchDeviceDisplayName = async () => {
      if (!deviceCode) return;

      try {
        const { data, error } = await supabase
          .from('device_settings')
          .select('display_name')
          .eq('device_code', deviceCode)
          .maybeSingle();

        if (error) {
          console.error('Error fetching device display name:', error);
          setDeviceDisplayName(null);
        } else {
          setDeviceDisplayName(data?.display_name || null);
        }
      } catch (error) {
        console.error('Error fetching device display name:', error);
        setDeviceDisplayName(null);
      }
    };

    fetchDeviceDisplayName();
  }, [deviceCode]);
  
  // Apply preferences when they load
  useEffect(() => {
    if (!preferencesLoading) {
      // Filter metrics to only include this device
      const deviceMetrics = (preferences.selectedMetrics || []).filter(
        metric => metric.deviceCode === deviceCode
      );
      setSelectedMetrics(deviceMetrics);
      setTimeFrame(preferences.timeFrame || "24h");
      setGraphStyle(preferences.graphStyle || "line");
      setGlobalLineColor(preferences.globalLineColor || "#f97316");
    }
  }, [preferences, preferencesLoading, deviceCode]);
  
  // Function to add a new metric to the graph
  const handleAddGraph = (selectedDeviceCode: string, symbol: string, name: string, deviceName?: string) => {
    // Only allow adding graphs for the current device
    if (selectedDeviceCode !== deviceCode) {
      console.log("Ignoring graph for different device:", selectedDeviceCode);
      return;
    }

    // Don't add if already exists
    if (selectedMetrics.some(m => m.deviceCode === selectedDeviceCode && m.symbol === symbol)) {
      return;
    }

    // Store device name if provided
    if (deviceName) {
      setDeviceNames(prev => ({
        ...prev,
        [selectedDeviceCode]: deviceName
      }));
    }
    
    // Get device name from our stored mapping or use deviceCode as fallback
    const actualDeviceName = deviceName || deviceNames[selectedDeviceCode] || deviceDisplayName || `อุปกรณ์ ${selectedDeviceCode}`;
    
    // Assign a color from our color palette
    const colorIndex = selectedMetrics.length % colors.length;
    
    const newMetrics = [
      ...selectedMetrics,
      {
        deviceCode: selectedDeviceCode,
        deviceName: actualDeviceName,
        symbol,
        name,
        color: colors[colorIndex],
      },
    ];
    
    setSelectedMetrics(newMetrics);

    // Automatically save preferences when a new graph is added
    savePreferences({
      selectedMetrics: newMetrics, // Use the newMetrics directly
      timeFrame,
      graphStyle,
      globalLineColor
    });
    
    // Close selector after adding
    setSelectorOpen(false);
  };

  // Function to remove a metric from the graph
  const removeMetric = (deviceCodeParam: string, symbol: string) => {
    const newMetrics = selectedMetrics.filter(
      m => !(m.deviceCode === deviceCodeParam && m.symbol === symbol)
    );
    setSelectedMetrics(newMetrics);
  };
  
  // Function to update the color of a metric's line on the graph
  const updateMetricColor = (deviceCodeParam: string, symbol: string, color: string) => {
    const newMetrics = selectedMetrics.map(metric => {
      if (metric.deviceCode === deviceCodeParam && metric.symbol === symbol) {
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

  if (!deviceCode) {
    return <div>Device code not found</div>;
  }

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-20' : 'pb-8'}>
      <div className={`flex-1 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto">
          {/* Device-specific header */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                onClick={goBack}
                className="h-6 w-6 p-0 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Graph Summary
              </h1>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              เปรียบเทียบข้อมูลจากอุปกรณ์ <strong className="text-gray-900 dark:text-gray-100">{deviceDisplayName ? `${deviceDisplayName} (${deviceCode})` : deviceCode}</strong> ในกราฟเดียวกัน
            </p>
          </div>
          
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
        onSelectGraph={(selectedDeviceCode, symbol, name, deviceName) => {
          handleAddGraph(selectedDeviceCode, symbol, name, deviceName);
        }}
        deviceFilter={deviceCode} // Filter to only show this device
      />
    </AppLayout>
  );
};

export default DeviceGraphSummary;
