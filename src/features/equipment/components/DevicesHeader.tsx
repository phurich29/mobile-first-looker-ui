
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DevicesHeaderProps {
  isRefreshing: boolean;
  handleRefresh: () => Promise<void>;
  totalUniqueDevices: number;
  isSuperAdmin: boolean;
}

export function DevicesHeader({
  isRefreshing,
  handleRefresh,
  totalUniqueDevices,
  isSuperAdmin
}: DevicesHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 dark:text-white`}>อุปกรณ์</h1>
        {isSuperAdmin && totalUniqueDevices > 0 && (
          <p className="text-gray-500 dark:text-gray-300 mt-1">จำนวนอุปกรณ์ทั้งหมดในระบบ: {totalUniqueDevices} เครื่อง</p>
        )}
        {!isSuperAdmin && (
          <p className="text-gray-500 dark:text-gray-300 mt-1">แสดงเฉพาะอุปกรณ์ที่คุณได้รับสิทธิ์การเข้าถึง</p>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        onClick={handleRefresh} 
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="text-xs">รีเฟรช</span>
      </Button>
    </div>
  );
}
