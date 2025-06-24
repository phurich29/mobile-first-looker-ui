
import { Bell, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DeviceInfoCardProps {
  deviceCode: string;
}

export const DeviceInfoCard = ({ deviceCode }: DeviceInfoCardProps) => {
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Fetch device display name from device_settings
  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!deviceCode) return;

      try {
        const { data, error } = await supabase
          .from('device_settings')
          .select('display_name')
          .eq('device_code', deviceCode)
          .maybeSingle();

        if (error) {
          console.error('Error fetching device display name:', error);
          setDisplayName(null);
        } else {
          setDisplayName(data?.display_name || null);
        }
      } catch (error) {
        console.error('Error fetching device display name:', error);
        setDisplayName(null);
      }
    };

    fetchDisplayName();
  }, [deviceCode]);

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md dark:bg-gray-700 dark:text-gray-300">
      <div className="flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-gray-500" />
        <div>
          {displayName && (
            <p className="text-sm font-medium">Name : {displayName}</p>
          )}
          <p className="text-sm font-medium">รหัสอุปกรณ์</p>
          <p className="text-sm text-gray-500">{deviceCode}</p>
        </div>
      </div>
      
      <Link 
        to="/notifications" 
        className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
      >
        <Bell className="h-3 w-3" />
        <span>ดูการแจ้งเตือน</span>
      </Link>
    </div>
  );
};

export default DeviceInfoCard;
