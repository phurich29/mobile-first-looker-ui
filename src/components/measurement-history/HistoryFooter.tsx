
import React from 'react';
import { TimeFrame } from './MeasurementHistory';

interface HistoryFooterProps {
  timeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
}

const HistoryFooter: React.FC<HistoryFooterProps> = ({ 
  timeFrame,
  onTimeFrameChange
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

  const timeFrames: TimeFrame[] = ['1h', '24h', '7d', '30d'];

  return (
    <div className="flex items-center justify-center p-2 bg-gray-50 border-t border-gray-100">
      <div className="flex space-x-2">
        {timeFrames.map(frame => (
          <button
            key={frame}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              timeFrame === frame
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onTimeFrameChange(frame)}
          >
            {getTimeFrameText(frame)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryFooter;
