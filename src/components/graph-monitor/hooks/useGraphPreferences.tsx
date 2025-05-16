
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SelectedGraph } from "@/components/graph-monitor/types";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface UseGraphPreferencesProps {
  deviceCode?: string;
}

export const useGraphPreferences = ({ deviceCode = "all" }: UseGraphPreferencesProps = {}) => {
  const [savedGraphs, setSavedGraphs] = useState<SelectedGraph[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load saved graph preferences when component mounts
  useEffect(() => {
    if (user) {
      loadSavedGraphs();
    } else {
      setLoading(false);
    }
  }, [user, deviceCode]);

  // Function to load saved graph preferences from Supabase
  const loadSavedGraphs = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get the user's saved graph preferences for this device (or 'all')
      const { data, error } = await supabase
        .from("user_chart_preferences")
        .select("*")
        .eq("user_id", user.id)
        .eq("device_code", deviceCode)
        .single();

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
        const graphsData = data.selected_metrics as SelectedGraph[];
        setSavedGraphs(graphsData);
      }
    } catch (err) {
      console.error("Unexpected error loading graph preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to save graph preferences to Supabase
  const saveGraphPreferences = async (graphs: SelectedGraph[]) => {
    if (!user) {
      return;
    }
    
    try {
      // Check if a record already exists for this user and device
      const { data, error: checkError } = await supabase
        .from("user_chart_preferences")
        .select("id")
        .eq("user_id", user.id)
        .eq("device_code", deviceCode)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') { // Not found is expected
        console.error("Error checking for existing preferences:", checkError);
        return;
      }

      if (data) {
        // Update existing record
        const { error } = await supabase
          .from("user_chart_preferences")
          .update({ selected_metrics: graphs })
          .eq("id", data.id);

        if (error) {
          console.error("Error updating graph preferences:", error);
          return;
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from("user_chart_preferences")
          .insert({
            user_id: user.id,
            device_code: deviceCode,
            selected_metrics: graphs
          });

        if (error) {
          console.error("Error creating graph preferences:", error);
          return;
        }
      }

      // Update local state
      setSavedGraphs(graphs);
    } catch (err) {
      console.error("Unexpected error saving graph preferences:", err);
    }
  };

  return {
    savedGraphs,
    loading,
    saveGraphPreferences,
    refreshPreferences: loadSavedGraphs
  };
};
