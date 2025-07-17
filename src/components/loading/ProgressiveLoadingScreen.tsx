import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/features/device-details/components/LoadingScreen';
import { Skeleton } from '@/components/ui/skeleton';

interface ProgressiveLoadingScreenProps {
  stage: 'auth' | 'devices' | 'complete';
  progress?: number;
  message?: string;
  showSkipOption?: boolean;
  onSkip?: () => void;
}

export function ProgressiveLoadingScreen({ 
  stage, 
  progress = 0, 
  message,
  showSkipOption = false,
  onSkip 
}: ProgressiveLoadingScreenProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Show more details after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getStageMessage = () => {
    switch (stage) {
      case 'auth':
        return 'กำลังตรวจสอบการเข้าสู่ระบบ...';
      case 'devices':
        return 'กำลังโหลดข้อมูลอุปกรณ์...';
      case 'complete':
        return 'เสร็จสิ้น';
      default:
        return 'กำลังโหลด...';
    }
  };

  if (!showDetails) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Main loading area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              กำลังเตรียมระบบ
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {message || getStageMessage()}
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>การตรวจสอบ</span>
              <span>ข้อมูลอุปกรณ์</span>
              <span>เสร็จสิ้น</span>
            </div>
          </div>

          {/* Stage indicators */}
          <div className="flex justify-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${
              stage === 'auth' ? 'bg-primary animate-pulse' : 
              progress > 33 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
            <div className={`w-3 h-3 rounded-full ${
              stage === 'devices' ? 'bg-primary animate-pulse' : 
              progress > 66 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
            <div className={`w-3 h-3 rounded-full ${
              stage === 'complete' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
          </div>

          {/* Skip option */}
          {showSkipOption && onSkip && (
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onSkip}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                ข้ามการรอและไปยังหน้าอุปกรณ์
              </button>
            </div>
          )}
        </div>

        {/* Preview skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            ตัวอย่างหน้าที่กำลังเตรียม
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}