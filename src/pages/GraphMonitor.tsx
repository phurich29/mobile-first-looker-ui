
import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <BackgroundImage />
      <Header />

      <main className={cn(
        "flex-1 relative",
        isMobile ? "pb-24" : "pb-10",
        // สำหรับหน้าจอ desktop ให้มี margin-left ที่เปลี่ยนตาม sidebar
        !isMobile && "ml-0 md:ml-[5rem]", // สำหรับ default ให้ margin เท่ากับความกว้างของ sidebar ที่หดตัว (w-20 = 5rem)
        !isMobile && !isCollapsed && "md:ml-64", // เมื่อ sidebar ขยาย ให้เพิ่ม margin เป็น 64 (เท่ากับความกว้างของ sidebar ที่ขยาย w-64)
        "transition-all duration-300"
      )}>
        <div className="max-w-7xl mx-auto p-4">
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
      </main>

      <GraphSelector 
        open={selectorOpen} 
        onOpenChange={setSelectorOpen} 
        onSelectGraph={handleAddGraphWithDeviceName}
      />

      <FooterNav />
    </div>
  );
};

export default GraphMonitor;
