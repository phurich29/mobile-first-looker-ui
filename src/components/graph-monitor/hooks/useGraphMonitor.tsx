
import { useState, useEffect } from "react";
import { SelectedGraph } from "@/components/graph-monitor/types";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useGraphPreferences } from "@/components/graph-monitor/hooks/useGraphPreferences";

export const useGraphMonitor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGraphs, setSelectedGraphs] = useState<SelectedGraph[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  
  const { 
    savedGraphs, 
    loading: preferencesLoading, 
    saving,
    saveGraphPreferences,
    presets,
    activePreset,
    setActivePreset,
    createPreset,
    deletePreset
  } = useGraphPreferences();
  
  // Load saved preferences when component mounts
  useEffect(() => {
    if (!preferencesLoading && savedGraphs.length > 0) {
      setSelectedGraphs(savedGraphs);
    }
  }, [savedGraphs, preferencesLoading]);

  // Auto-save when graphs change (delayed to prevent too many saves)
  useEffect(() => {
    if (user && selectedGraphs.length > 0) {
      const timer = setTimeout(() => {
        // Only save if there are changes and at least one graph
        if (JSON.stringify(selectedGraphs) !== JSON.stringify(savedGraphs)) {
          // Always save to the current active preset, including Default
          saveGraphPreferences(selectedGraphs, activePreset);
        }
      }, 2000); // 2-second delay before saving
      
      return () => clearTimeout(timer);
    }
  }, [selectedGraphs, activePreset]);

  // Show indicator that changes are pending save
  useEffect(() => {
    if (user && selectedGraphs.length > 0 && 
        JSON.stringify(selectedGraphs) !== JSON.stringify(savedGraphs)) {
      setShowSaveIndicator(true);
    } else {
      setShowSaveIndicator(false);
    }
  }, [selectedGraphs, savedGraphs, user]);

  const handleAddGraph = (graph: SelectedGraph) => {
    const newGraphs = [...selectedGraphs, graph];
    setSelectedGraphs(newGraphs);
    setSelectorOpen(false);
  };

  const handleRemoveGraph = (index: number) => {
    const newGraphs = selectedGraphs.filter((_, i) => i !== index);
    setSelectedGraphs(newGraphs);
    
    // If we're removing the last graph, explicitly save an empty array to remove the record
    if (newGraphs.length === 0 && user) {
      saveGraphPreferences([], activePreset);
    }
  };

  const handleSaveGraphs = () => {
    if (user) {
      // Explicitly save to the current active preset, including Default
      saveGraphPreferences(selectedGraphs, activePreset);
    } else {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    }
  };

  const handleCreatePreset = (name: string) => {
    createPreset(name, selectedGraphs);
  };

  const handleChangePreset = (preset: string) => {
    setActivePreset(preset);
  };

  const handleResetGraphs = () => {
    // First save the empty array to remove the preference from database
    if (user) {
      saveGraphPreferences([], activePreset);
    }
    
    // Then clear the local state
    setSelectedGraphs([]);
    
    toast({
      title: "รีเซ็ตการตั้งค่าแล้ว",
      description: "ลบกราฟทั้งหมดออกจากการแสดงผลแล้ว",
      variant: "update",
    });
  };

  return {
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
  };
};
