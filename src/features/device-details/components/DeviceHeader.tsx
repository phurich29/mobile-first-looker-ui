
import React from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Layout, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface DeviceHeaderProps {
  deviceCode: string;
  displayName?: string | null;
  onBack?: () => void; // Make this optional
}

export const DeviceHeader: React.FC<DeviceHeaderProps> = ({
  deviceCode,
  displayName,
  onBack,
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      {/* Header with back button and device info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              รายละเอียดอุปกรณ์
            </h1>
            {displayName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Name : {displayName}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              รหัสอุปกรณ์: {deviceCode}
            </p>
          </div>
        </div>
      </div>

      {/* Graph navigation buttons */}
      <div className="flex flex-wrap gap-3">
        <Link to={ROUTES.DEVICE_GRAPH_MONITOR(deviceCode)}>
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
          >
            <Monitor className="h-4 w-4 mr-2" />
            Graph Monitor
          </Button>
        </Link>
        
        <Link to={ROUTES.DEVICE_GRAPH_SUMMARY(deviceCode)}>
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
          >
            <Layout className="h-4 w-4 mr-2" />
            Graph Summary
          </Button>
        </Link>
      </div>
    </div>
  );
};
