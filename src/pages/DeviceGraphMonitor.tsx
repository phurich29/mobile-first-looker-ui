
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
import { ArrowLeft, Plus, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuestMode } from "@/hooks/useGuestMode";

const DeviceGraphMonitor = () => {
  const { deviceCode } = useParams<{ deviceCode: string }>();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isGuest } = useGuestMode();
  const { goBack } = useAppNavigation();
  const [deviceDisplayName, setDeviceDisplayName] = useState<string | null>(null);
  const [localGraphs, setLocalGraphs] = useState<SelectedGraph[]>([]);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Use device-specific preferences for authenticated users, local state for guests
  const {
    selectedGraphs,
    selectorOpen,
    setSelectorOpen,
    showSaveIndicator: authShowSaveIndicator,
    preferencesLoading,
    saving: authSaving,
    presets,
    activePreset,
    handleAddGraph,
    handleRemoveGraph,
    handleSaveGraphs,
    handleCreatePreset,
    handleChangePreset,
    handleResetGraphs,
  } = useGraphMonitor();

  // Use different graph state based on user type
  const currentGraphs = isGuest ? localGraphs : selectedGraphs;
  const currentShowSaveIndicator = isGuest ? showSaveIndicator : authShowSaveIndicator;
  const currentSaving = isGuest ? saving : authSaving;

  // Check for pending graph from sessionStorage and add it automatically
  useEffect(() => {
    const pendingGraphStr = sessionStorage.getItem('pendingGraph');
    if (pendingGraphStr) {
      try {
        const pendingGraph = JSON.parse(pendingGraphStr);
        if (pendingGraph.deviceCode === deviceCode) {
          const graph: SelectedGraph = {
            deviceCode: pendingGraph.deviceCode,
            symbol: pendingGraph.symbol,
            name: pendingGraph.name,
            deviceName: pendingGraph.deviceName || deviceDisplayName || `อุปกรณ์วัด ${pendingGraph.deviceCode}`
          };
          
          if (isGuest) {
            setLocalGraphs([...localGraphs, graph]);
          } else {
            handleAddGraph(graph);
          }
        }
      } catch (error) {
        console.error('Error parsing pending graph:', error);
      } finally {
        // Clear the pending graph from sessionStorage
        sessionStorage.removeItem('pendingGraph');
      }
    }
  }, [deviceCode, deviceDisplayName, isGuest, localGraphs, handleAddGraph]);

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
  const deviceSpecificGraphs = currentGraphs.filter(graph => graph.deviceCode === deviceCode);

  // Modified handler for guest mode
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
    
    if (isGuest) {
      setLocalGraphs([...localGraphs, graph]);
      setShowSaveIndicator(true);
    } else {
      handleAddGraph(graph);
    }
  };

  // Handle graph removal for guests
  const handleRemoveGraphForGuest = (index: number) => {
    if (isGuest) {
      const newGraphs = localGraphs.filter((_, i) => i !== index);
      setLocalGraphs(newGraphs);
      setShowSaveIndicator(newGraphs.length > 0);
    } else {
      handleRemoveGraph(index);
    }
  };

  // Handle save for guests (save to localStorage)
  const handleSaveForGuest = () => {
    if (isGuest) {
      setSaving(true);
      setTimeout(() => {
        localStorage.setItem(`graphs_${deviceCode}`, JSON.stringify(localGraphs));
        setShowSaveIndicator(false);
        setSaving(false);
      }, 1000);
    } else {
      handleSaveGraphs();
    }
  };

  // Load saved graphs from localStorage for guests
  useEffect(() => {
    if (isGuest && deviceCode) {
      const savedGraphs = localStorage.getItem(`graphs_${deviceCode}`);
      if (savedGraphs) {
        try {
          const parsedGraphs = JSON.parse(savedGraphs);
          setLocalGraphs(parsedGraphs);
        } catch (error) {
          console.error('Error parsing saved graphs:', error);
        }
      }
    }
  }, [isGuest, deviceCode]);

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
          {/* Device-specific header with controls */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="h-6 w-6 p-0 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Graph Monitor
              </h1>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              แสดงผลกราฟจากอุปกรณ์ <strong className="text-gray-900 dark:text-gray-100">{deviceDisplayName ? `${deviceDisplayName} (${deviceCode})` : deviceCode}</strong> ในรูปแบบ dashboard
            </p>
          </div>

          {/* Controls for guests and authenticated users */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              {(currentShowSaveIndicator || currentSaving) && (
                <div className="flex items-center text-sm text-purple-600 mr-2 dark:text-purple-400">
                  {currentSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <span>มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleSaveForGuest} 
                variant="outline"
                size="sm"
                disabled={currentSaving || (!currentShowSaveIndicator)}
                className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
              >
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </Button>

              <Button 
                onClick={() => setSelectorOpen(true)} 
                className="bg-blue-600 hover:bg-blue-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white dark:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มกราฟ
              </Button>
            </div>
          </div>

          {/* Show presets only for authenticated users, not guests */}
          {user && !isGuest && (
            <GraphPresets 
              presets={presets}
              activePreset={activePreset}
              onChangePreset={handleChangePreset}
              onCreatePreset={handleCreatePreset}
              onDeletePreset={handleResetGraphs}
              onResetGraphs={handleResetGraphs}
              saving={currentSaving}
            />
          )}

          {preferencesLoading && !isGuest ? (
            <LoadingGraphState />
          ) : deviceSpecificGraphs.length === 0 ? (
            <EmptyGraphState onAddGraph={() => setSelectorOpen(true)} />
          ) : (
            <div className="h-[calc(100vh-240px)]">
              <GraphDisplay 
                selectedGraphs={deviceSpecificGraphs} 
                onRemoveGraph={handleRemoveGraphForGuest} 
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
