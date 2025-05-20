
import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMeasurementThaiName } from "@/utils/measurements";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { REQUIRED_DEVICE_CODES } from "@/features/equipment/services/deviceDataService";
import { formatBangkokTime } from "@/components/measurement-history/api";
import { ReactComponent as EquipmentIcon } from "@/assets/equipment-icon.svg";

interface DeviceData {
  deviceCode: string;
  deviceName: string;
  value: number | null;
  timestamp: string | null;
}

export default function MeasurementDetail() {
  const { measurementSymbol } = useParams<{ measurementSymbol: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  
  const measurementName = getMeasurementThaiName(measurementSymbol || "");

  // Fetch device data and latest measurement values
  useEffect(() => {
    const fetchDeviceData = async () => {
      setIsLoading(true);
      try {
        // Get custom display names from device_settings
        const { data: deviceSettings, error: settingsError } = await supabase
          .from('device_settings')
          .select('device_code, display_name')
          .in('device_code', REQUIRED_DEVICE_CODES);
          
        if (settingsError) {
          console.error("Error fetching device settings:", settingsError);
        }
        
        // Create a map of device_code to display_name
        const displayNameMap: Record<string, string> = {};
        if (deviceSettings) {
          deviceSettings.forEach(setting => {
            if (setting.display_name) {
              displayNameMap[setting.device_code] = setting.display_name;
            }
          });
        }
        
        // For each required device, fetch the latest measurement
        const devicePromises = REQUIRED_DEVICE_CODES.map(async (deviceCode) => {
          // Select dynamically based on the measurement symbol
          const selectQuery = `device_code, ${measurementSymbol}, created_at`;
          
          const { data, error } = await supabase
            .from('rice_quality_analysis')
            .select(selectQuery)
            .eq('device_code', deviceCode)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (error) {
            console.error(`Error fetching data for device ${deviceCode}:`, error);
          }
          
          // Create device name - either from settings or default format
          const deviceName = displayNameMap[deviceCode] || `อุปกรณ์วัด ${deviceCode}`;
          
          return {
            deviceCode,
            deviceName,
            value: data ? data[measurementSymbol as keyof typeof data] : null,
            timestamp: data ? data.created_at : null
          };
        });
        
        const devicesData = await Promise.all(devicePromises);
        setDevices(devicesData);
      } catch (error) {
        console.error("Error fetching device data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeviceData();
  }, [measurementSymbol]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 p-4 pb-32">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost" 
            size="icon"
            asChild
            className="mr-2 text-emerald-600"
          >
            <Link to="/new-quality-measurements">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-emerald-800">{measurementName || measurementSymbol}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">ค่า {measurementName} จากทุกอุปกรณ์</h2>
          
          {isLoading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // Devices list
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map((device) => (
                <Link 
                  key={device.deviceCode} 
                  to={`/measurement-history/${device.deviceCode}/${measurementSymbol}`}
                  className="block"
                >
                  <Card className="p-4 border hover:border-emerald-300 hover:shadow-md transition-all">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                        <EquipmentIcon className="h-6 w-6 text-emerald-600" />
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
                                {formatBangkokTime(device.timestamp).thaiTime}
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
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add space to prevent content from being hidden behind footer */}
      <div className="pb-32"></div>

      {/* Footer navigation */}
      <FooterNav />
    </div>
  );
}
