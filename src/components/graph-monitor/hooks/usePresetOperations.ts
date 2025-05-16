
import { useState } from "react";
import { SelectedGraph } from "@/components/graph-monitor/types";
import { PresetItem } from "./graphPreferenceTypes";
import { loadPresetsFromDB, deletePresetFromDB, saveGraphPreferencesToDB } from "./graphPreferenceService";
import { useToast } from "@/hooks/use-toast";

export const usePresetOperations = (userId: string | undefined, deviceCode: string) => {
  const [presets, setPresets] = useState<PresetItem[]>([{ id: 'default', name: 'Default' }]);
  const [activePreset, setActivePreset] = useState<string>("Default");
  const { toast } = useToast();

  const loadPresets = async () => {
    if (!userId) return;
    
    const loadedPresets = await loadPresetsFromDB(userId, deviceCode);
    setPresets(loadedPresets);
  };

  // Create a new preset
  const createPreset = async (presetName: string, graphs: SelectedGraph[]) => {
    if (!userId || !presetName.trim()) {
      return;
    }

    // Check if the preset name already exists
    if (presets.some(preset => preset.name === presetName.trim())) {
      toast({
        title: "ชื่อชุดการตั้งค่านี้มีอยู่แล้ว",
        description: "กรุณาใช้ชื่ออื่น",
        variant: "destructive",
      });
      return;
    }

    const success = await saveGraphPreferencesToDB(userId, deviceCode, graphs, presetName);
    
    if (success) {
      // Show success toast
      toast({
        title: "สร้างชุดการตั้งค่าแล้ว",
        description: `สร้างชุดการตั้งค่า "${presetName}" เรียบร้อยแล้ว`,
        variant: "update",
      });
      
      // Update presets and switch to the new preset
      await loadPresets();
      setActivePreset(presetName);
    }
  };

  // Delete a preset
  const deletePreset = async (presetName: string) => {
    if (!userId || presetName === "Default") {
      return false; // Don't allow deleting the default preset
    }

    const success = await deletePresetFromDB(userId, deviceCode, presetName);

    if (success) {
      // Show success toast
      toast({
        title: "ลบชุดการตั้งค่าแล้ว",
        description: `ลบชุดการตั้งค่า "${presetName}" เรียบร้อยแล้ว`,
        variant: "update",
      });
      
      // Update presets and switch to default preset
      setActivePreset("Default");
      await loadPresets();
      return true;
    }
    
    return false;
  };

  return {
    presets,
    activePreset,
    setActivePreset,
    loadPresets,
    createPreset,
    deletePreset
  };
};
