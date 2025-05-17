
import { useState, useEffect } from "react";
import { SelectedMetric, GraphStyle } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { Json } from "@/integrations/supabase/types";

interface GraphSummaryPreferences {
  selectedMetrics: SelectedMetric[];
  timeFrame: TimeFrame;
  graphStyle: GraphStyle;
  globalLineColor: string;
}

export const useGraphSummaryPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<GraphSummaryPreferences>({
    selectedMetrics: [],
    timeFrame: "24h",
    graphStyle: "line",
    globalLineColor: "#f97316"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load preferences when user changes
  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Function to load preferences from Supabase
  const loadPreferences = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch user's graph summary preferences
      const { data, error } = await supabase
        .from("user_chart_preferences")
        .select("*")
        .eq("user_id", user.id)
        .eq("device_code", "graph-summary") // Special device code for graph summary
        .eq("preset_name", "Default")
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // Not found is expected for new users
        console.error("Error loading graph summary preferences:", error);
        setLoading(false);
        return;
      }

      if (data && data.selected_metrics) {
        // Parse stored preferences
        const storedPrefs = data.selected_metrics as any;
        
        // Update state with loaded preferences
        setPreferences({
          selectedMetrics: storedPrefs.selectedMetrics || [],
          timeFrame: storedPrefs.timeFrame || "24h",
          graphStyle: storedPrefs.graphStyle || "line",
          globalLineColor: storedPrefs.globalLineColor || "#f97316"
        });
      }
    } catch (err) {
      console.error("Unexpected error loading graph preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to save preferences to Supabase
  const savePreferences = async (newPreferences: GraphSummaryPreferences) => {
    if (!user) return;

    setSaving(true);
    try {
      // Convert SelectedMetric objects to plain objects that are JSON-compatible
      const plainSelectedMetrics = newPreferences.selectedMetrics.map(metric => ({
        deviceCode: metric.deviceCode,
        deviceName: metric.deviceName,
        symbol: metric.symbol,
        name: metric.name,
        color: metric.color,
        minThreshold: metric.minThreshold,
        maxThreshold: metric.maxThreshold
      }));

      // Create a JSON-compatible object to store
      const preferencesToSave = {
        selectedMetrics: plainSelectedMetrics,
        timeFrame: newPreferences.timeFrame,
        graphStyle: newPreferences.graphStyle,
        globalLineColor: newPreferences.globalLineColor
      };

      // Check if a record already exists
      const { data: existingData, error: checkError } = await supabase
        .from("user_chart_preferences")
        .select("id")
        .eq("user_id", user.id)
        .eq("device_code", "graph-summary")
        .eq("preset_name", "Default")
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') { // Not found is expected
        console.error("Error checking existing preferences:", checkError);
        setSaving(false);
        return;
      }

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from("user_chart_preferences")
          .update({
            selected_metrics: preferencesToSave
          })
          .eq("id", existingData.id);

        if (error) {
          console.error("Error updating preferences:", error);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถบันทึกการตั้งค่าได้",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from("user_chart_preferences")
          .insert({
            user_id: user.id,
            device_code: "graph-summary",
            preset_name: "Default",
            selected_metrics: preferencesToSave
          });

        if (error) {
          console.error("Error creating preferences:", error);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถบันทึกการตั้งค่าได้",
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "บันทึกแล้ว",
        description: "บันทึกการตั้งค่าการแสดงผลกราฟเรียบร้อยแล้ว",
        variant: "update"
      });
      
      // Update local state
      setPreferences(newPreferences);
    } catch (err) {
      console.error("Unexpected error saving preferences:", err);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "พบข้อผิดพลาดขณะบันทึกการตั้งค่า",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    savePreferences,
    refreshPreferences: loadPreferences
  };
};
