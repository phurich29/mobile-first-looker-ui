
import { supabase } from "@/integrations/supabase/client";
import { SelectedGraph } from "@/components/graph-monitor/types";
import { Json } from "@/integrations/supabase/types";
import { PresetItem } from "./graphPreferenceTypes";

/**
 * Loads available presets for a user from the database
 */
export const loadPresetsFromDB = async (userId: string, deviceCode: string): Promise<PresetItem[]> => {
  try {
    const { data, error } = await supabase
      .from("user_chart_preferences")
      .select("id, preset_name")
      .eq("user_id", userId)
      .eq("device_code", deviceCode);

    if (error) {
      console.error("Error loading presets:", error);
      return [{ id: 'default', name: 'Default' }];
    }

    // Always ensure Default exists
    const allPresets = [{ id: 'default', name: 'Default' }];
    
    if (data && data.length > 0) {
      // Add unique presets from the database
      data.forEach(item => {
        if (!allPresets.some(p => p.name === item.preset_name)) {
          allPresets.push({
            id: item.id,
            name: item.preset_name
          });
        }
      });
    }
    
    return allPresets;
  } catch (err) {
    console.error("Unexpected error loading presets:", err);
    return [{ id: 'default', name: 'Default' }];
  }
};

/**
 * Loads saved graph preferences for a specific preset
 */
export const loadSavedGraphsFromDB = async (
  userId: string, 
  deviceCode: string, 
  presetName = "Default"
): Promise<SelectedGraph[]> => {
  try {
    // Get the user's saved graph preferences for this device and preset
    const { data, error } = await supabase
      .from("user_chart_preferences")
      .select("*")
      .eq("user_id", userId)
      .eq("device_code", deviceCode)
      .eq("preset_name", presetName)
      .maybeSingle();

    if (error) {
      if (error.code !== 'PGRST116') { // Not found is expected for new users
        console.error("Error loading graph preferences:", error);
      }
      return [];
    }

    if (data && data.selected_metrics) {
      // Convert the stored JSON data to SelectedGraph array
      return data.selected_metrics as unknown as SelectedGraph[];
    }
    
    return [];
  } catch (err) {
    console.error("Unexpected error loading graph preferences:", err);
    return [];
  }
};

/**
 * Saves graph preferences to the database
 */
export const saveGraphPreferencesToDB = async (
  userId: string,
  deviceCode: string,
  graphs: SelectedGraph[],
  presetName: string
): Promise<boolean> => {
  try {
    // Check if a record already exists for this user, device and preset
    const { data, error: checkError } = await supabase
      .from("user_chart_preferences")
      .select("id")
      .eq("user_id", userId)
      .eq("device_code", deviceCode)
      .eq("preset_name", presetName)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') { // Not found is expected
      console.error("Error checking for existing preferences:", checkError);
      return false;
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
        return false;
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from("user_chart_preferences")
        .insert({
          user_id: userId,
          device_code: deviceCode,
          preset_name: presetName,
          selected_metrics: graphsJson
        });

      if (error) {
        console.error("Error creating graph preferences:", error);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error("Unexpected error saving graph preferences:", err);
    return false;
  }
};

/**
 * Deletes a preset from the database
 */
export const deletePresetFromDB = async (
  userId: string,
  deviceCode: string,
  presetName: string
): Promise<boolean> => {
  if (presetName === "Default") {
    return false; // Don't allow deleting the default preset
  }

  try {
    const { error } = await supabase
      .from("user_chart_preferences")
      .delete()
      .eq("user_id", userId)
      .eq("device_code", deviceCode)
      .eq("preset_name", presetName);

    if (error) {
      console.error("Error deleting preset:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error deleting preset:", err);
    return false;
  }
};
