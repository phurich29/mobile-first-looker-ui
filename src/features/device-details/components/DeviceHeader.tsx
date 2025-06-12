
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DeviceHeaderDisplay } from "./header";

interface DeviceHeaderProps {
  deviceCode: string | undefined;
}

export const DeviceHeader: React.FC<DeviceHeaderProps> = ({ deviceCode }) => {
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Fetch device display name from device_settings
  useEffect(() => {
    if (!deviceCode) return;

    const fetchDisplayName = async () => {
      const { data, error } = await supabase
        .from('device_settings')
        .select('display_name')
        .eq('device_code', deviceCode)
        .maybeSingle();

      if (!error && data) {
        setDisplayName(data.display_name);
      }
    };

    fetchDisplayName();
  }, [deviceCode]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <DeviceHeaderDisplay displayName={displayName} deviceCode={deviceCode} />
        <div className="flex-shrink-0">
          <img 
            src="/rice-background.jpg" 
            alt="Rice Plant" 
            className="w-20 h-20 object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
    </>
  );
};
