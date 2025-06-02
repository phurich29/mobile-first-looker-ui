
import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
import { useIsMobile } from "@/hooks/use-mobile";
// Header and FooterNav are handled by AppLayout
import { GraphSelector } from "@/components/graph-monitor/GraphSelector";
import { GraphDisplay } from "@/components/graph-monitor/GraphDisplay";
import { useAuth } from "@/components/AuthProvider";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { GraphPresets } from "@/components/graph-monitor/GraphPresets";
import { GraphHeader } from "@/components/graph-monitor/GraphHeader";
// นำเข้าไฟล์ CSS สำหรับปรับแต่งกราฟให้ชัดเจนขึ้น
import "@/components/graph-monitor/graph-card/graph-custom.css";
import { EmptyGraphState } from "@/components/graph-monitor/EmptyGraphState";
import { LoadingGraphState } from "@/components/graph-monitor/LoadingGraphState";
import { useGraphMonitor } from "@/components/graph-monitor/hooks/useGraphMonitor";
import { SelectedGraph } from "@/components/graph-monitor/types";
import { cn } from "@/lib/utils";

const GraphMonitor = () => {
  const isMobile = useIsMobile(); // Retain for other logic if needed
  const { user } = useAuth();
  // const [isCollapsed, setIsCollapsed] = useState(false); // Removed, AppLayout handles this
  
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
  
  // Removed useEffect for isCollapsed as AppLayout handles sidebar state
  
  // สำหรับ desktop เท่านั้น mobile จะไม่มีการปรับ margin

  // Add logging to debug device name issues
  console.log("Selected Graphs:", selectedGraphs);
  
  // Modified handler to properly use the SelectedGraph object
  const handleAddGraphWithDeviceName = (deviceCode: string, symbol: string, name: string, deviceName?: string) => {
    console.log("Adding graph with device name:", deviceName);
    
    // Create a SelectedGraph object with the correct device name
    const graph: SelectedGraph = {
      deviceCode: deviceCode,
      symbol: symbol,
      name: name,
      deviceName: deviceName || `อุปกรณ์วัด ${deviceCode}`
    };
    
    // Pass the SelectedGraph object to handleAddGraph
    handleAddGraph(graph);
  };

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-24' : 'pb-10'}>
      <BackgroundImage />
      {/* Header is handled by AppLayout */}

      {/* Main content container with original padding. Dynamic margins and padding are handled by AppLayout. */}
      <div className={cn(
        "flex-1 relative",
        // Padding bottom is handled by AppLayout's contentPaddingBottom prop
        // Margin left based on sidebar state is handled by AppLayout
        "transition-all duration-300"
      )}>
        <div className="max-w-7xl mx-auto">
          <GraphHeader
            showSaveIndicator={showSaveIndicator}
            saving={saving}
            onSaveGraphs={handleSaveGraphs}
            onAddGraph={() => setSelectorOpen(true)}
          />

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
          ) : selectedGraphs.length === 0 ? (
            <EmptyGraphState onAddGraph={() => setSelectorOpen(true)} />
          ) : (
            <div className="h-[calc(100vh-240px)]">
              <GraphDisplay 
                selectedGraphs={selectedGraphs} 
                onRemoveGraph={handleRemoveGraph} 
              />
            </div>
          )}
        </div>
      </div> {/* End of main content div */}

      <GraphSelector 
        open={selectorOpen} 
        onOpenChange={setSelectorOpen} 
        onSelectGraph={handleAddGraphWithDeviceName}
      />

      {/* FooterNav is handled by AppLayout */}
    </AppLayout>
  );
};

export default GraphMonitor;
