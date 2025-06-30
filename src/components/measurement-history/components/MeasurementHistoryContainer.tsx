
import React from 'react';
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMeasurementHistoryState } from "../hooks/useMeasurementHistoryState";
import ErrorMessage from "./ErrorMessage";
import MeasurementHistoryContent from "./MeasurementHistoryContent";

interface MeasurementHistoryContainerProps {
  deviceCode?: string;
  symbol?: string;
  name?: string;
  unit?: string;
  onClose?: () => void;
}

const MeasurementHistoryContainer: React.FC<MeasurementHistoryContainerProps> = (props) => {
  const isMobile = useIsMobile();
  const state = useMeasurementHistoryState(props);

  // If we don't have required parameters, show error message
  if (!state.isValidData) {
    return (
      <ErrorMessage
        title="ข้อมูลไม่ครบถ้วน"
        description="ไม่พบข้อมูลอุปกรณ์หรือค่าที่ต้องการแสดง กรุณาลองใหม่อีกครั้ง"
      />
    );
  }

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-8'}>
            <div className="flex flex-col flex-1 min-h-full bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
        <main className="flex-1 overflow-x-hidden">
          <MeasurementHistoryContent
            deviceCode={state.deviceCode!}
            symbol={state.symbol!}
            name={state.name!}
            unit={props.unit}
            onClose={props.onClose}
            historyData={state.historyData}
            isLoading={state.isLoading}
            isError={state.isError}
            timeFrame={state.timeFrame}
            setTimeFrame={state.setTimeFrame}
            averageValue={state.averageValue}
            settingsOpen={state.settingsOpen}
            handleOpenChange={state.handleOpenChange}
            notificationEnabled={state.notificationEnabled}
          />
        </main>
      </div>
    </AppLayout>
  );
};

export default MeasurementHistoryContainer;
