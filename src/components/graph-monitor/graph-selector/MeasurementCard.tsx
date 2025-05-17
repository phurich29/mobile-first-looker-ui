
import React from 'react';

export interface MeasurementCardProps {
  measurementSymbol: string;
  measurementName: string;
  onClick: () => void;
}

export const MeasurementCard: React.FC<MeasurementCardProps> = ({ 
  measurementSymbol, 
  measurementName, 
  onClick 
}) => {
  return (
    <div 
      className="p-3 border rounded-md mb-2 cursor-pointer hover:bg-gray-100"
      onClick={onClick}
    >
      <p className="font-medium">{measurementName}</p>
      <p className="text-sm text-gray-500">{measurementSymbol}</p>
    </div>
  );
};
