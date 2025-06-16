import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { GraphSelector } from "@/components/graph-monitor/GraphSelector";
import { GraphDisplay } from "@/components/graph-monitor/GraphDisplay";
import { useAuth } from "@/components/AuthProvider";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { GraphPresets } from "@/components/graph-monitor/GraphPresets";
import { GraphHeader } from "@/components/graph-monitor/GraphHeader";
import "@/components/graph-monitor/graph-card/graph-custom.css";
import { EmptyGraphState } from "@/components/graph-monitor/EmptyGraphState";
import { LoadingGraphState } from "@/components/graph-monitor/LoadingGraphState";
import { useGraphMonitor } from "@/components/graph-monitor/hooks/useGraphMonitor";
import { SelectedGraph } from "@/components/graph-monitor/types";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const DeviceGraphMonitor = () => {
  const { deviceCode } = useParams<{ deviceCode: string }>();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { goBack } = useAppNavigation();
  const [deviceDisplayName, setDeviceDisplayName] = useState<string | null>(null);
  
  // Use device-specific preferences
  const {
    selectedGraphs,
    selectorOpen,
    setSelectorOpen,
    showSaveIndicator,
    preferencesLoading,
    saving,
    presets,
    activePreset,
    handleAddGraph,
    handleRemoveGraph,
    handleSaveGraphs,
    handleCreatePreset,
    handleChangePreset,
    handleResetGraphs,
  } = useGraphMonitor();

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

  // Filter graphs to only show ones for this device
  const deviceSpecificGraphs = selectedGraphs.filter(graph => graph.deviceCode === deviceCode);

  // Modified handler to ensure only this device's graphs are added
  const handleAddGraphWithDeviceName = (selectedDeviceCode: string, symbol: string, name: string, deviceName?: string) => {
    // Only allow adding graphs for the current device
    if (selectedDeviceCode !== deviceCode) {
      console.log("Ignoring graph for different device:", selectedDeviceCode);
      return;
    }

    console.log("Adding graph with device name:", deviceName);
    
    const graph: SelectedGraph = {
      deviceCode: selectedDeviceCode,
      symbol: symbol,
      name: name,
      deviceName: deviceName || deviceDisplayName || `อุปกรณ์วัด ${selectedDeviceCode}`
    };
    
    handleAddGraph(graph);
  };

  if (!deviceCode) {
    return <div>Device code not found</div>;
  }

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-24' : 'pb-10'}>
      <BackgroundImage />

      <div className={cn(
        "flex-1 relative",
        "transition-all duration-300"
      )}>
        <div className="max-w-7xl mx-auto">
          {/* Device-specific header with back button */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="p-1.5 h-8 w-8 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                กราฟมอนิเตอร์
              </h1>
              <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {deviceDisplayName ? `Name : ${deviceDisplayName}` : `Device: ${deviceCode}`}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              แสดงผลกราฟจากอุปกรณ์ {deviceCode} ในรูปแบบ dashboard
            </p>
          </div>

          {user && (
            <GraphPresets 
              presets={presets}
              activePreset={activePreset}
              onChangePreset={handleChangePreset}
              onCreatePreset={handleCreatePreset}
              onDeletePreset={handleResetGraphs}
              onResetGraphs={handleResetGraphs}
              saving={saving}
            />
          )}

          {preferencesLoading ? (
            <LoadingGraphState />
          ) : deviceSpecificGraphs.length === 0 ? (
            <EmptyGraphState onAddGraph={() => setSelectorOpen(true)} />
          ) : (
            <div className="h-[calc(100vh-240px)]">
              <GraphDisplay 
                selectedGraphs={deviceSpecificGraphs} 
                onRemoveGraph={handleRemoveGraph} 
              />
            </div>
          )}
        </div>
      </div>

      <GraphSelector 
        open={selectorOpen} 
        onOpenChange={setSelectorOpen} 
        onSelectGraph={handleAddGraphWithDeviceName}
        deviceFilter={deviceCode} // Filter to only show this device
      />
    </AppLayout>
  );
};

export default DeviceGraphMonitor;
