
import React from 'react';
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryHeaderProps {
  name: string;
  unit?: string;
  average: number;
  onOpenSettings: () => void;
}

const HistoryHeader: React.FC<HistoryHeaderProps> = ({ 
  name, 
  unit, 
  average, 
  onOpenSettings 
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <div>
        <h3 className="text-lg font-medium text-gray-800">{name}</h3>
        <p className="text-sm text-gray-500">
          ค่าเฉลี่ย: <span className="font-medium text-emerald-600">{average.toFixed(2)}{unit}</span>
        </p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onOpenSettings}
      >
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">ตั้งค่าการแจ้งเตือน</span>
      </Button>
    </div>
  );
};

export default HistoryHeader;
