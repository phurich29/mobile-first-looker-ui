
import React from "react";
import { MeasurementItem } from "@/components/MeasurementItem";
import { CountdownTimer } from "@/components/CountdownTimer";

interface LoadingStateProps {
  isLoading: boolean;
  deviceCode: string | undefined;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isLoading, deviceCode }) => {
  return (
    <div className="p-6 text-center text-gray-500">
      {isLoading ? (
        <div className="flex flex-col items-center">
          <span>กำลังโหลดข้อมูลการวัด...</span>
          <CountdownTimer className="mt-2" useGlobal={true} />
        </div>
      ) : (
        `ไม่พบข้อมูลการวัดสำหรับอุปกรณ์ ${deviceCode}`
      )}
    </div>
  );
};

interface MeasurementListProps {
  items: any[];
  isLoading: boolean;
  deviceCode: string | undefined;
  onMeasurementClick: (symbol: string, name: string) => void;
}

export const MeasurementList: React.FC<MeasurementListProps> = ({
  items,
  isLoading,
  deviceCode,
  onMeasurementClick
}) => {
  if (isLoading) {
    return <LoadingState isLoading={true} deviceCode={deviceCode} />;
  }

  if (!items || items.length === 0) {
    return <LoadingState isLoading={false} deviceCode={deviceCode} />;
  }

  return (
    <>
      {items.map((item, index) => (
        <div 
          key={index}
          onClick={() => onMeasurementClick(item.symbol, item.name)}
          className="cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <MeasurementItem
            symbol={item.symbol}
            name={item.name}
            price={item.price}
            percentageChange={item.percentageChange}
            iconColor={item.iconColor}
            updatedAt={item.updatedAt}
            deviceCode={deviceCode}
            deviceName={item.deviceName}
            notificationType={item.notificationType}
            threshold={item.threshold}
            enabled={item.enabled}
          />
        </div>
      ))}
    </>
  );
};
