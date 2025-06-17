
import React from "react";
import { Link } from "react-router-dom";
import { Server } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DeviceData } from "../hooks/useMeasurementDeviceData";

interface DeviceCardProps {
  device: DeviceData;
  measurementSymbol: string | undefined;
}

// Helper function to convert measurement symbol to URL-friendly format
const convertMeasurementSymbolToUrl = (symbol: string): string => {
  return symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Format time from thai_datetime directly
const formatThaiTime = (dateString?: string): string => {
  if (!dateString) return 'ไม่มีข้อมูล';
  
  // ใช้ thai_datetime โดยตรง โดยบังคับให้แสดงเป็นเวลาไทย
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok'
  }).format(date);
};

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, measurementSymbol }) => {
  const urlSymbol = measurementSymbol ? convertMeasurementSymbolToUrl(measurementSymbol) : '';
  
  return (
    <Link 
      to={`/device/${device.deviceCode}/${urlSymbol}`}
      className="block"
    >
      <Card className="p-4 border hover:border-emerald-300 hover:shadow-md transition-all">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
            <div className="h-6 w-6 text-emerald-600">
              <Server className="h-6 w-6" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{device.deviceName}</h3>
            <p className="text-xs text-gray-500">{device.deviceCode}</p>
          </div>
          <div className="text-right">
            {device.value !== null ? (
              <>
                <div className="text-lg font-bold text-emerald-600">{device.value}%</div>
                {device.timestamp && (
                  <div className="text-xs text-gray-500">
                    {formatThaiTime(device.timestamp)}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">ไม่มีข้อมูล</div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
