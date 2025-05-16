
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SelectedGraph } from "@/components/graph-monitor/types";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface UseGraphPreferencesProps {
  deviceCode?: string;
}

export const useGraphPreferences = ({ deviceCode = "all" }: UseGraphPreferencesProps = {}) => {
  const [savedGraphs, setSavedGraphs] = useState<SelectedGraph[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [presets, setPresets] = useState<{id: string, name: string}[]>([]);
  const [activePreset, setActivePreset] = useState<string>("Default");
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load available presets
  useEffect(() => {
    if (user) {
      loadPresets();
    }
  }, [user, deviceCode]);

  // Load saved graph preferences when component mounts or preset changes
  useEffect(() => {
    if (user) {
      loadSavedGraphs(activePreset);
    } else {
      setLoading(false);
    }
  }, [user, deviceCode, activePreset]);

  // Function to load available presets
  const loadPresets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("user_chart_preferences")
        .select("id, preset_name")
        .eq("user_id", user.id)
        .eq("device_code", deviceCode);

      if (error) {
        console.error("Error loading presets:", error);
        return;
      }

      if (data && data.length > 0) {
        setPresets(data.map(item => ({
          id: item.id,
          name: item.preset_name
        })));
      }
    } catch (err) {
      console.error("Unexpected error loading presets:", err);
    }
  };

  // Function to load saved graph preferences from Supabase
  const loadSavedGraphs = async (presetName = "Default") => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get the user's saved graph preferences for this device and preset
      const { data, error } = await supabase
        .from("user_chart_preferences")
        .select("*")
        .eq("user_id", user.id)
        .eq("device_code", deviceCode)
        .eq("preset_name", presetName)
        .maybeSingle();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found is expected for new users
          console.error("Error loading graph preferences:", error);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถโหลดการตั้งค่าการแสดงผลกราฟได้",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      if (data && data.selected_metrics) {
        // Convert the stored JSON data to SelectedGraph array
        // Use type assertion to tell TypeScript we know what we're doing
        const graphsData = data.selected_metrics as unknown as SelectedGraph[];
        setSavedGraphs(graphsData);
      } else {
        setSavedGraphs([]);
      }
    } catch (err) {
      console.error("Unexpected error loading graph preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to save graph preferences to Supabase
  const saveGraphPreferences = async (graphs: SelectedGraph[], presetName = activePreset) => {
    if (!user) {
      return;
    }
    
    setSaving(true);
    try {
      // Check if a record already exists for this user, device and preset
      const { data, error: checkError } = await supabase
        .from("user_chart_preferences")
        .select("id")
        .eq("user_id", user.id)
        .eq("device_code", deviceCode)
        .eq("preset_name", presetName)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') { // Not found is expected
        console.error("Error checking for existing preferences:", checkError);
        setSaving(false);
        return;
      }

      // Convert graphs to JSON-compatible format using type assertion
      const graphsJson = graphs as unknown as Json;

      if (data) {
        // Update existing record
        const { error } = await supabase
          .from("user_chart_preferences")
          .update({ selected_metrics: graphsJson })
          .eq("id", data.id);

        if (error) {
          console.error("Error updating graph preferences:", error);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถบันทึกการตั้งค่าการแสดงผลกราฟได้",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from("user_chart_preferences")
          .insert({
            user_id: user.id,
            device_code: deviceCode,
            preset_name: presetName,
            selected_metrics: graphsJson
          });

        if (error) {
          console.error("Error creating graph preferences:", error);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถบันทึกการตั้งค่าการแสดงผลกราฟได้",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      // Update local state
      setSavedGraphs(graphs);
      
      // Show success toast
      toast({
        title: "บันทึกแล้ว",
        description: "บันทึกการตั้งค่าการแสดงผลกราฟเรียบร้อยแล้ว",
        variant: "update",
      });
      
      // Refresh presets list if a new preset was created
      if (!presets.some(p => p.name === presetName)) {
        loadPresets();
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

  // Create a new preset
  const createPreset = async (presetName: string, graphs: SelectedGraph[]) => {
    if (!user || !presetName.trim()) {
      return;
    }

    setSaving(true);
    try {
      // Create new preset record
      const { error } = await supabase
        .from("user_chart_preferences")
        .insert({
          user_id: user.id,
          device_code: deviceCode,
          preset_name: presetName,
          selected_metrics: graphs as unknown as Json
        });

      if (error) {
        console.error("Error creating preset:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถสร้างชุดการตั้งค่าใหม่ได้",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Show success toast
      toast({
        title: "สร้างชุดการตั้งค่าแล้ว",
        description: `สร้างชุดการตั้งค่า "${presetName}" เรียบร้อยแล้ว`,
        variant: "update",
      });
      
      // Update presets and switch to the new preset
      loadPresets();
      setActivePreset(presetName);
    } catch (err) {
      console.error("Unexpected error creating preset:", err);
    } finally {
      setSaving(false);
    }
  };

  // Delete a preset
  const deletePreset = async (presetName: string) => {
    if (!user || presetName === "Default") {
      return false; // Don't allow deleting the default preset
    }

    try {
      const { error } = await supabase
        .from("user_chart_preferences")
        .delete()
        .eq("user_id", user.id)
        .eq("device_code", deviceCode)
        .eq("preset_name", presetName);

      if (error) {
        console.error("Error deleting preset:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบชุดการตั้งค่าได้",
          variant: "destructive",
        });
        return false;
      }

      // Show success toast
      toast({
        title: "ลบชุดการตั้งค่าแล้ว",
        description: `ลบชุดการตั้งค่า "${presetName}" เรียบร้อยแล้ว`,
        variant: "update",
      });
      
      // Update presets and switch to default preset
      loadPresets();
      setActivePreset("Default");
      return true;
    } catch (err) {
      console.error("Unexpected error deleting preset:", err);
      return false;
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
