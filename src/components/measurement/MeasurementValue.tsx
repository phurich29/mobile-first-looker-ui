
import React from "react";

interface MeasurementValueProps {
  value: string;
  isAlertActive: boolean;
}

export const MeasurementValue: React.FC<MeasurementValueProps> = ({
  value,
  isAlertActive
}) => {
  return (
    <p className={`font-bold text-base ${isAlertActive ? 'text-red-600 value-blink' : 'text-green-600'}`}>
      {value}%
    </p>
  );
};
