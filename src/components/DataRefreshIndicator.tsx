import React, { useState, useEffect } from 'react';
import { useGlobalCountdown } from '@/contexts/CountdownContext';
import { useNotifications } from '@/hooks/useNotifications';
import { RefreshCw, Activity, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DataRefreshIndicatorProps {
  showDetailed?: boolean;
}

export const DataRefreshIndicator: React.FC<DataRefreshIndicatorProps> = ({ 
  showDetailed = false 
}) => {
  const { seconds, isActive, lastCompleteTime } = useGlobalCountdown();
  const { isFetching, lastRefreshTime } = useNotifications();
  const [lastUpdateText, setLastUpdateText] = useState<string>('');

  useEffect(() => {
    const updateLastUpdateText = () => {
      if (lastRefreshTime) {
        const now = Date.now();
        const diffMs = now - lastRefreshTime;
        const diffSeconds = Math.floor(diffMs / 1000);
        
        if (diffSeconds < 60) {
          setLastUpdateText(`${diffSeconds} วินาทีที่แล้ว`);
        } else {
          const diffMinutes = Math.floor(diffSeconds / 60);
          setLastUpdateText(`${diffMinutes} นาทีที่แล้ว`);
        }
      } else {
        setLastUpdateText('ไม่เคยอัพเดท');
      }
    };

    updateLastUpdateText();
    const interval = setInterval(updateLastUpdateText, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshTime]);

  const getStatusColor = () => {
    if (isFetching) return 'border-blue-500 bg-blue-50';
    if (seconds <= 10) return 'border-orange-500 bg-orange-50';
    return 'border-green-500 bg-green-50';
  };

  const getStatusText = () => {
    if (isFetching) return 'กำลังอัพเดท...';
    if (!isActive) return 'หยุดชั่วคราว';
    return `อัพเดทในอีก ${seconds} วิ`;
  };

  if (!showDetailed) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <RefreshCw 
            className={`h-3 w-3 ${isFetching ? 'animate-spin text-blue-600' : 'text-green-600'}`} 
          />
          <span className="text-xs text-gray-600">
            {getStatusText()}
          </span>
        </div>
        {isFetching && (
          <Badge variant="secondary" className="text-xs">
            <Activity className="h-2 w-2 mr-1" />
            กำลังโหลด
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <RefreshCw 
            className={`h-4 w-4 ${isFetching ? 'animate-spin text-blue-600' : 'text-green-600'}`} 
          />
          <span className="font-medium text-sm">สถานะการอัพเดทข้อมูล</span>
        </div>
        {isFetching && (
          <Badge variant="secondary">
            <Activity className="h-3 w-3 mr-1" />
            กำลังโหลด
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-gray-600">อัพเดทถัดไป:</div>
          <div className="font-medium">{getStatusText()}</div>
        </div>
        <div>
          <div className="text-gray-600">อัพเดทล่าสุด:</div>
          <div className="font-medium">{lastUpdateText}</div>
        </div>
      </div>
      
      {!isActive && (
        <div className="mt-2 text-xs text-orange-600 bg-orange-100 p-2 rounded">
          ⚠️ ระบบอัพเดทอัตโนมัติหยุดชั่วคราว
        </div>
      )}
    </div>
  );
};