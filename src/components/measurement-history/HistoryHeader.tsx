
import React, { useState, useEffect } from 'react';
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { getColumnTranslatedName } from "@/lib/columnTranslations";

interface HistoryHeaderProps {
  name: string;
  unit?: string;
  average: number;
  min: number;
  max: number;
  onOpenSettings: () => void;
  notificationEnabled?: boolean;
  deviceCode?: string;
}

const HistoryHeader: React.FC<HistoryHeaderProps> = ({ 
  name, 
  unit, 
  average, 
  min,
  max,
  onOpenSettings,
  notificationEnabled = false,
  deviceCode
}) => {
  const { t, language } = useTranslation();
  const translatedName = getColumnTranslatedName(name, language);
  const navigate = useNavigate();
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
  
  const handleGoBack = () => {
    // Navigate to the device details page instead of equipment page
    if (deviceCode) {
      navigate(`/device/${deviceCode}`);
    } else {
      // Fallback to equipment page if no device code available
      navigate("/equipment");
    }
  };
  
  return (
    <div className="flex flex-col p-4 border-b border-gray-100">

      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1">
            <h3 className="text-lg font-medium text-gray-800">{translatedName}</h3>
          </div>
          <p className="text-sm text-gray-500">
            {t('general', 'historyStatsAverage')} <span className="font-medium text-emerald-600">{average.toFixed(2)}{unit}</span>
            {' '}
            ({t('general', 'historyStatsMinimum')} <span className="font-medium text-blue-600">{min.toFixed(2)}{unit}</span>, 
            {t('general', 'historyStatsMaximum')} <span className="font-medium text-red-600">{max.toFixed(2)}{unit}</span>)
          </p>
        </div>
        
        <Button 
          variant={notificationEnabled ? "outline" : "ghost"} 
          size="sm" 
          className={`flex items-center gap-1 ${notificationEnabled ? "border-orange-400 text-orange-600 hover:bg-orange-50" : "text-gray-500 border-gray-200"}`}
          onClick={onOpenSettings}
        >
          <Settings className={`h-4 w-4 ${notificationEnabled ? "text-orange-500" : "text-gray-500"}`} />
          <span className="hidden sm:inline">{t('general', 'notificationSettings')}</span>
          <span className={`ml-1 h-2 w-2 rounded-full ${notificationEnabled ? "bg-orange-500" : "bg-gray-400"}`}></span>
        </Button>
      </div>
    </div>
  );
};

export default HistoryHeader;
