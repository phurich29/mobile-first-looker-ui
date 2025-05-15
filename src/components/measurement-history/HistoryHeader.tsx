
import React from 'react';
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

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
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1);
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
      
      <div className="flex items-center justify-between">
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
    </div>
  );
};

export default HistoryHeader;
