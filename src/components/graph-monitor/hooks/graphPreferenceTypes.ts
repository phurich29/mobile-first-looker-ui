
import { SelectedGraph } from "@/components/graph-monitor/types";
import { Json } from "@/integrations/supabase/types";

export interface PresetItem {
  id: string;
  name: string;
}

export interface UseGraphPreferencesProps {
  deviceCode?: string;
}

export interface UseGraphPreferencesReturn {
  savedGraphs: SelectedGraph[];
  loading: boolean;
  saving: boolean;
  saveGraphPreferences: (graphs: SelectedGraph[], presetName?: string) => Promise<void>;
  refreshPreferences: (presetName?: string) => Promise<void>;
  presets: PresetItem[];
  activePreset: string;
  setActivePreset: (preset: string) => void;
  createPreset: (name: string, graphs: SelectedGraph[]) => Promise<void>;
  deletePreset: (presetName: string) => Promise<boolean>;
}
