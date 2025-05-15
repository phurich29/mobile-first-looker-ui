
import React from 'react';
import { TimeFrame } from './MeasurementHistory';

type HistoryFooterProps = {
  historyData: any[] | undefined;
  timeFrame: TimeFrame;
  isLoading: boolean;
  name: string;
};

const HistoryFooter: React.FC<HistoryFooterProps> = ({ 
  historyData, 
  timeFrame,
  isLoading,
  name
}) => {
  const getTimeFrameText = (frame: TimeFrame): string => {
    switch (frame) {
      case '1h': return '1 ชั่วโมง';
      case '24h': return '24 ชั่วโมง';
      case '7d': return '7 วัน';
      case '30d': return '30 วัน';
      default: return '24 ชั่วโมง';
    }
  };

  return (
    <div className="mt-2 text-xs text-gray-500 text-center">
      {!isLoading && historyData && historyData.length === 0 ? (
        <>ไม่พบข้อมูลในช่วง {getTimeFrameText(timeFrame)} ที่ผ่านมา</>
      ) : (
        <>แสดงข้อมูลการวัด {name} ย้อนหลัง {getTimeFrameText(timeFrame)}
          {historyData && ` (${historyData.length} รายการ)`}
        </>
      )}
    </div>
  );
};

export default HistoryFooter;
