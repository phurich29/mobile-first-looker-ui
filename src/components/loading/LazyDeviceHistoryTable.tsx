import React, { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { HistoryTableSkeleton } from './HistoryTableSkeleton';
import { DeviceHistoryTable } from '@/features/device-details/components/DeviceHistoryTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LazyDeviceHistoryTableProps {
  deviceIds: string[];
  title?: string;
}

export const LazyDeviceHistoryTable: React.FC<LazyDeviceHistoryTableProps> = ({
  deviceIds,
  title = "ประวัติอุปกรณ์"
}) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  return (
    <div ref={elementRef} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {!isIntersecting ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <HistoryTableSkeleton />
        </div>
      ) : (
        <ErrorBoundary 
          key={retryKey}
          onRetry={handleRetry}
          fallback={
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {title}
                  <Button
                    onClick={handleRetry}
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  ไม่สามารถโหลดประวัติอุปกรณ์ได้ กรุณาลองใหม่อีกครั้ง
                </div>
              </CardContent>
            </Card>
          }
        >
          <DeviceHistoryTable deviceIds={deviceIds} title={title} />
        </ErrorBoundary>
      )}
    </div>
  );
};