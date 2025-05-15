
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface DeviceHeaderProps {
  deviceCode: string | undefined;
}

export const DeviceHeader: React.FC<DeviceHeaderProps> = ({ deviceCode }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleGoBack = () => {
    navigate("/equipment");
  };

  return (
    <>
      {/* Back button */}
      <Button 
        variant="outline" 
        onClick={handleGoBack}
        className="mb-4 flex items-center text-gray-600 hover:bg-gray-100"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span>ย้อนกลับ</span>
      </Button>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
            อุปกรณ์: {deviceCode}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            รายละเอียดข้อมูลการวัด
          </p>
        </div>
      </div>
    </>
  );
};
