
import React, { useState, useEffect } from 'react';
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HistoryHeaderProps {
  name: string;
  unit?: string;
  average: number;
  onOpenSettings: () => void;
  notificationEnabled?: boolean;
  deviceCode?: string;
}

const HistoryHeader: React.FC<HistoryHeaderProps> = ({ 
  name, 
  unit, 
  average, 
  onOpenSettings,
  notificationEnabled = false,
  deviceCode
}) => {
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
      <Button 
        variant="outline" 
        onClick={handleGoBack}
        className="mb-4 flex items-center text-gray-600 hover:bg-gray-100 w-fit"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span>ย้อนกลับ</span>
      </Button>
      
      {/* Device information with more prominent display */}
      {deviceCode && displayName && (
        <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <div className="flex items-center">
            <Smartphone className="h-5 w-5 text-emerald-600 mr-2" />
            <div>
              <h2 className="text-lg font-semibold text-emerald-800">{displayName}</h2>
              <p className="text-xs text-emerald-600">รหัสอุปกรณ์: {deviceCode}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1">
            <h3 className="text-lg font-medium text-gray-800">{name}</h3>
          </div>
          <p className="text-sm text-gray-500">
            ค่าเฉลี่ย: <span className="font-medium text-emerald-600">{average.toFixed(2)}{unit}</span>
          </p>
        </div>
        
        <Button 
          variant={notificationEnabled ? "outline" : "ghost"} 
          size="sm" 
          className={`flex items-center gap-1 ${notificationEnabled ? "border-orange-400 text-orange-600 hover:bg-orange-50" : "text-gray-500 border-gray-200"}`}
          onClick={onOpenSettings}
        >
          <Settings className={`h-4 w-4 ${notificationEnabled ? "text-orange-500" : "text-gray-500"}`} />
          <span className="hidden sm:inline">ตั้งค่าแจ้งเตือน</span>
          <span className={`ml-1 h-2 w-2 rounded-full ${notificationEnabled ? "bg-orange-500" : "bg-gray-400"}`}></span>
        </Button>
      </div>
    </div>
  );
};

export default HistoryHeader;
