import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: number;
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

// ฟังก์ชันสำหรับดึงข้อมูลการแจ้งเตือนจากฐานข้อมูล
export async function fetchNotifications(): Promise<Notification[]> {
  try {
    // ดึงข้อมูลจากตาราง notification_settings
    const { data, error } = await supabase
      .from("notification_settings")
      .select(`
        id,
        symbol,
        min_threshold,
        max_threshold,
        enabled,
        device_id,
        devices (name, code),
        measurement_types (name, icon_color)
      `)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching notification settings:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // แปลงข้อมูลที่ได้รับมาให้อยู่ในรูปแบบที่ต้องการ
    return data.map(item => {
      // กำหนดประเภทการแจ้งเตือน
      const notificationType = item.min_threshold !== null
        ? (item.max_threshold !== null ? "both" as const : "min" as const)
        : "max" as const;
        
      // กำหนดค่า threshold สำหรับแสดงผล
      let threshold = "";
      if (notificationType === "both") {
        threshold = `${item.min_threshold} - ${item.max_threshold}`;
      } else if (notificationType === "min") {
        threshold = String(item.min_threshold);
      } else {
        threshold = String(item.max_threshold);
      }
      
      // สร้าง object สำหรับแสดงผล
      return {
        id: item.id,
        symbol: item.symbol,
        name: item.measurement_types?.name || item.symbol,
        deviceCode: item.devices?.code || "UNKNOWN",
        deviceName: item.devices?.name || "Unknown Device",
        threshold: threshold,
        type: notificationType,
        notificationType: notificationType,
        enabled: item.enabled,
        iconColor: item.measurement_types?.icon_color || "#7c3aed",
        updatedAt: new Date(),
        currentValue: "0" // ตั้งค่าเริ่มต้น ในกรณีที่ยังไม่มีข้อมูลล่าสุด
      };
    });
  } catch (error) {
    console.error("Error in fetchNotifications:", error);
    return [];
  }
}
