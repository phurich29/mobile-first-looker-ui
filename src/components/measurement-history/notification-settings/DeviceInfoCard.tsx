
import { Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

interface DeviceInfoCardProps {
  deviceCode: string;
}

export const DeviceInfoCard = ({ deviceCode }: DeviceInfoCardProps) => {
  const { t } = useTranslation();
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
    <div className="flex items-center gap-2">
      <Smartphone className="h-5 w-5 text-gray-500" />
      <div>
        {displayName && (
          <p className="text-sm font-medium">Name : {displayName}</p>
        )}
        <p className="text-sm font-medium">{t('general', 'deviceCode')}</p>
        <p className="text-sm text-gray-500">{deviceCode}</p>
      </div>
    </div>
  );
};

export default DeviceInfoCard;
