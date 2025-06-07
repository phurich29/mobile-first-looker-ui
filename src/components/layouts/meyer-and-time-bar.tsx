
import React from "react";
import { ClockDisplay } from "./top-header/ClockDisplay";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useIsMobile } from "@/hooks/use-mobile";

interface MeyerAndTimeBarProps {
  /**
   * ระยะห่างด้านล่างของ component
   */
  marginBottom?: string;
}

/**
 * แถบด้านบนที่แสดง logo Meyer และแถบเวลา
 * สามารถใช้ได้ทุกหน้าเพื่อความสม่ำเสมอของ UI
 */
export const MeyerAndTimeBar: React.FC<MeyerAndTimeBarProps> = ({ 
  marginBottom = "mb-8"
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${marginBottom} ${!isMobile ? 'mb-8' : 'mb-6'}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col items-start gap-0">
          <span className="text-xs text-black font-semibold">Analyzed by</span>
          <img 
            src="/lovable-uploads/69c73af7-03be-4238-b73c-f296246cd364.png" 
            alt="Meyer Logo" 
            className="h-6 object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
          <ClockDisplay />
          <CountdownTimer useGlobal={true} initialSeconds={60} />
        </div>
      </div>
    </div>
  );
};
