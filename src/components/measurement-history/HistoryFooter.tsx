
import React from 'react';
import { TimeFrame } from './MeasurementHistory';
import { useTranslation } from '@/hooks/useTranslation';

interface HistoryFooterProps {
  timeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
}

const HistoryFooter: React.FC<HistoryFooterProps> = ({ 
  timeFrame,
  onTimeFrameChange
}) => {
  const { t } = useTranslation();
  const getTimeFrameText = (frame: TimeFrame): string => {
    switch (frame) {
      case '1h': return t('general', 'oneHour');
      case '24h': return t('general', 'twentyFourHours');
      case '7d': return t('general', 'sevenDays');
      case '30d': return t('general', 'thirtyDays');
      default: return t('general', 'twentyFourHours');
    }
  };

  const timeFrames: TimeFrame[] = ['1h', '24h', '7d', '30d'];

  return (
    <div className="flex items-center justify-center p-2 bg-gray-50 border-t border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex space-x-2">
        {timeFrames.map(frame => (
          <button
            key={frame}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              timeFrame === frame
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
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
