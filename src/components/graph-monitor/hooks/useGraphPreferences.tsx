
import { useState, useEffect } from "react";
import { SelectedGraph } from "@/components/graph-monitor/types";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { usePresetOperations } from "./usePresetOperations";
import { loadSavedGraphsFromDB, saveGraphPreferencesToDB } from "./graphPreferenceService";
import { UseGraphPreferencesProps, UseGraphPreferencesReturn } from "./graphPreferenceTypes";

export const useGraphPreferences = ({ deviceCode = "all" }: UseGraphPreferencesProps = {}): UseGraphPreferencesReturn => {
  const [savedGraphs, setSavedGraphs] = useState<SelectedGraph[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get preset operations
  const {
    presets,
    activePreset,
    setActivePreset,
    loadPresets,
    createPreset,
    deletePreset
  } = usePresetOperations(user?.id, deviceCode);
  
  // Load saved graph preferences when component mounts, 
  // preset changes, or user changes
  useEffect(() => {
    if (user) {
      loadSavedGraphs(activePreset);
    } else {
      setLoading(false);
      setSavedGraphs([]);
    }
  }, [user, deviceCode, activePreset]);

  // Function to load saved graph preferences from Supabase
  const loadSavedGraphs = async (presetName = "Default") => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const graphs = await loadSavedGraphsFromDB(user.id, deviceCode, presetName);
      setSavedGraphs(graphs);
    } catch (err) {
      console.error("Error in loadSavedGraphs:", err);
      setSavedGraphs([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to save graph preferences to Supabase
  const saveGraphPreferences = async (graphs: SelectedGraph[], presetName = activePreset) => {
    if (!user) {
      return;
    }
    
    // Skip saving if the graphs are exactly the same as what's already saved
    if (JSON.stringify(graphs) === JSON.stringify(savedGraphs) && graphs.length > 0) {
      return;
    }
    
    setSaving(true);
    try {
      const success = await saveGraphPreferencesToDB(user.id, deviceCode, graphs, presetName);

      if (success) {
        // Update local state only if the active preset matches the one being saved
        if (presetName === activePreset) {
          setSavedGraphs(graphs);
        }
        
        // Show success toast only for manual saves (when graphs are different from savedGraphs)
        if (JSON.stringify(graphs) !== JSON.stringify(savedGraphs)) {
          toast({
            title: "บันทึกแล้ว",
            description: "บันทึกการตั้งค่าการแสดงผลกราฟเรียบร้อยแล้ว",
            variant: "update",
          });
        }
        
        // Refresh presets list if a new preset was created
        if (!presets.some(p => p.name === presetName)) {
          loadPresets();
        }
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถบันทึกการตั้งค่าการแสดงผลกราฟได้",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Unexpected error saving graph preferences:", err);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "พบข้อผิดพลาดไม่คาดคิดขณะบันทึกการตั้งค่า",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    savedGraphs,
    loading,
    saving,
    saveGraphPreferences,
    refreshPreferences: loadSavedGraphs,
    presets,
    activePreset,
    setActivePreset,
    createPreset,
    deletePreset
  };
};
