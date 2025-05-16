
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
import { EmptyGraphState } from "@/components/graph-monitor/EmptyGraphState";
import { LoadingGraphState } from "@/components/graph-monitor/LoadingGraphState";
import { useGraphMonitor } from "@/components/graph-monitor/hooks/useGraphMonitor";
import { RiceIconDecoration } from "@/components/graph-monitor/RiceIconDecoration";
import { Heart } from "lucide-react";

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
  
  // Calculate sidebar width for layout
  const sidebarWidth = !isMobile ? (isCollapsed ? 'ml-20' : 'ml-64') : '';

  return (
    <div className="flex flex-col min-h-screen relative">
      <BackgroundImage />
      <Header />

      <main className={`flex-1 p-4 ${isMobile ? 'pb-24' : sidebarWidth} overflow-y-auto relative`}>
        {/* Large rice plant decorations */}
        <RiceIconDecoration position="top-right" />
        <RiceIconDecoration position="bottom-left" />
        
        {/* Small floating hearts */}
        <div className="fixed top-40 right-10 z-10 animate-bounce" style={{animationDuration: "3s"}}>
          <Heart size={16} className="text-pink-400/50" />
        </div>
        <div className="fixed bottom-40 left-16 z-10 animate-bounce" style={{animationDuration: "4s"}}>
          <Heart size={12} className="text-pink-300/40" />
        </div>
        
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
            <GraphDisplay 
              selectedGraphs={selectedGraphs} 
              onRemoveGraph={handleRemoveGraph} 
            />
          )}
        </div>
      </main>

      <GraphSelector 
        open={selectorOpen} 
        onOpenChange={setSelectorOpen} 
        onSelectGraph={handleAddGraph}
      />

      <FooterNav />
    </div>
  );
};

export default GraphMonitor;
