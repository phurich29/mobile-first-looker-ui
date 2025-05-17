
import React from 'react';
import { MeasurementData } from '../types';
import { MeasurementCard } from './MeasurementCard';

export interface MeasurementCardProps {
  measurementSymbol: string;
  measurementName: string;
  onClick: () => void;
}

export interface MeasurementsListProps {
  measurements: MeasurementData[];
  loading?: boolean;
  isLoading?: boolean; // Add this to support both prop names
  onMeasurementSelect: (symbol: string, name: string) => void;
  searchQuery: string;
}

export const MeasurementsList: React.FC<MeasurementsListProps> = ({
  measurements,
  loading = false,
  isLoading = false, // Support both prop names
  onMeasurementSelect,
  searchQuery,
}) => {
  // Use either loading or isLoading
  const isLoadingState = loading || isLoading;
  
  const filteredMeasurements = measurements.filter(measurement =>
    measurement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    measurement.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingState) {
    return <div>Loading measurements...</div>;
  }

  return (
    <div>
      {filteredMeasurements.length === 0 ? (
        <div>No measurements found.</div>
      ) : (
        filteredMeasurements.map(measurement => (
          <MeasurementCard
            key={measurement.symbol}
            measurementSymbol={measurement.symbol}
            measurementName={measurement.name}
            onClick={() => onMeasurementSelect(measurement.symbol, measurement.name)}
          />
        ))
      )}
    </div>
  );
};
