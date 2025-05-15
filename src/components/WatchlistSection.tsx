
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";

export const WatchlistSection = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Use React Query for data fetching
  const { 
    data: notificationSettings = [], 
    isLoading: settingsLoading 
  } = useQuery({
    queryKey: ['notification_settings_enabled'],
    queryFn: async () => {
      try {
        const { data: settings, error } = await supabase
          .from('notification_settings')
          .select('*, device_settings(display_name)')
          .eq('enabled', true);
          
        if (error) {
          throw error;
        }
        
        console.log("Fetched notification settings:", settings);
        return settings || [];
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดการตั้งค่าแจ้งเตือนได้",
          variant: "destructive"
        });
        return [];
      }
    },
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  });

  return (
    <div className="mt-8">
      <div className="px-[5%] mb-3 flex justify-between items-center md:px-0" style={{
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h2 className="font-semibold text-gray-700">การตั้งค่าแจ้งเตือนที่กำหนดไว้</h2>
        <Link to="/notification-settings" className="text-sm text-green-600 font-medium">
          จัดการการแจ้งเตือน
        </Link>
      </div>

      {settingsLoading ? (
        <div className="text-center py-4 text-gray-500 bg-white rounded-xl shadow-sm">กำลังโหลดข้อมูล...</div>
      ) : notificationSettings.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm">ยังไม่มีการตั้งค่าแจ้งเตือน</div>
      ) : (
        <div className="space-y-4">
          {notificationSettings.map(setting => (
            <div key={setting.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-emerald-800">
                    {setting.device_settings?.display_name || setting.device_code}
                  </h3>
                  <p className="text-sm text-gray-500">{setting.rice_type_name}</p>
                </div>
                <Link to={`/device/${setting.device_code}`} className="text-xs px-2 py-1 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors">
                  ดูรายละเอียด
                </Link>
              </div>
              
              <div className="text-sm space-y-1">
                {setting.max_enabled && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">แจ้งเตือน เมื่อสูงกว่า:</span>
                    <span className="font-medium text-red-600">{setting.max_threshold}</span>
                  </p>
                )}
                {setting.min_enabled && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">แจ้งเตือน เมื่อต่ำกว่า:</span>
                    <span className="font-medium text-amber-600">{setting.min_threshold}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
