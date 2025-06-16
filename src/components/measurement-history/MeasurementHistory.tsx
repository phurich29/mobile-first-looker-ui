
import React from "react";
import { MeasurementHistoryContainer } from "./components";

export type TimeFrame = '1h' | '24h' | '7d' | '30d';

interface MeasurementHistoryProps {
  deviceCode?: string;
  symbol?: string;
  name?: string;
  unit?: string;
  onClose?: () => void;
}

const MeasurementHistory: React.FC<MeasurementHistoryProps> = (props) => {
  return <MeasurementHistoryContainer {...props} />;
};

export default MeasurementHistory;
