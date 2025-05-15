
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string; // Changed from number to string to match UUID from database
  symbol: string;
  name: string;
  deviceCode: string;
  deviceName: string;
  currentValue?: string;
  threshold: string;
  enabled: boolean;
  type: "min" | "max" | "both";
  notificationType: "min" | "max" | "both";
  iconColor: string;
  updatedAt: Date;
  percentageChange?: number;
  price?: string;
}

// Function to fetch notification data from the database
export async function fetchNotifications(): Promise<Notification[]> {
  try {
    // Fetch data from notification_settings table
    const { data, error } = await supabase
      .from("notification_settings")
      .select(`
        id,
        rice_type_id,
        rice_type_name,
        min_threshold,
        max_threshold,
        enabled,
        device_code,
        min_enabled,
        max_enabled
      `)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching notification settings:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform fetched data to required format
    return data.map(item => {
      // Determine notification type based on enabled thresholds
      const notificationType = item.min_enabled && item.max_enabled 
        ? "both" as const 
        : item.min_enabled 
          ? "min" as const 
          : "max" as const;
      
      // Format the threshold display string
      let threshold = "";
      if (notificationType === "both") {
        threshold = `${item.min_threshold} - ${item.max_threshold}`;
      } else if (notificationType === "min") {
        threshold = String(item.min_threshold);
      } else {
        threshold = String(item.max_threshold);
      }
      
      // Define icon color based on notification type
      const iconColor = notificationType === "both" 
        ? "#7c3aed" // Purple for both
        : notificationType === "min" 
          ? "#3b82f6" // Blue for min
          : "#f97316"; // Orange for max
      
      // Create the notification object
      return {
        id: item.id,
        symbol: item.rice_type_id,
        name: item.rice_type_name || item.rice_type_id,
        deviceCode: item.device_code,
        deviceName: item.device_code, // Using device_code as name since no device name available
        threshold: threshold,
        type: notificationType,
        notificationType: notificationType,
        enabled: item.enabled,
        iconColor: iconColor,
        updatedAt: new Date(),
        currentValue: "0" // Default value when no current data is available
      };
    });
  } catch (error) {
    console.error("Error in fetchNotifications:", error);
    return [];
  }
}
