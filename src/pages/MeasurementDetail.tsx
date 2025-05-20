
import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMeasurementThaiName } from "@/utils/measurements";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for development - will be replaced with real API call
const mockDevices = [
  { deviceCode: "DEVICE001", deviceName: "อุปกรณ์ 1", value: 42.5, timestamp: "2023-06-15T08:30:00" },
  { deviceCode: "DEVICE002", deviceName: "อุปกรณ์ 2", value: 38.2, timestamp: "2023-06-15T08:15:00" },
  { deviceCode: "DEVICE003", deviceName: "อุปกรณ์ 3", value: 45.1, timestamp: "2023-06-15T07:45:00" },
  { deviceCode: "DEVICE004", deviceName: "อุปกรณ์ 4", value: 40.8, timestamp: "2023-06-15T08:05:00" },
];

export default function MeasurementDetail() {
  const { measurementSymbol } = useParams<{ measurementSymbol: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);
  
  const measurementName = getMeasurementThaiName(measurementSymbol || "");

  // Simulate API call to fetch device data
  useEffect(() => {
    const fetchData = async () => {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setDevices(mockDevices);
      setIsLoading(false);
    };
    
    fetchData();
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
              {[1, 2, 3, 4].map((i) => (
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
                      <div className="h-12 w-12 flex items-center justify-center mr-3 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" className="h-10 w-10 fill-emerald-600">
                          <g>
                            <rect x="0" y="700" width="800" height="100" />
                            <rect x="100" y="600" width="80" height="100" />
                            <rect x="620" y="600" width="80" height="100" />
                            <rect x="13" y="13" width="774" height="587" />
                            <rect x="93" y="93" width="521" height="427" />
                            <polygon points="213,180 520,180 400,300 307,300" />
                            <rect x="260" y="300" width="120" height="60" />
                            <rect x="573" y="66" width="160" height="107" />
                            <circle cx="573" cy="234" r="30" />
                            <circle cx="640" cy="234" r="30" />
                            <circle cx="707" cy="234" r="30" />
                            <circle cx="774" cy="234" r="30" />
                            <rect x="600" y="334" width="60" height="60" />
                            <rect x="700" y="334" width="60" height="60" />
                            <circle cx="133" cy="520" r="33" />
                            <circle cx="216" cy="520" r="33" />
                            <circle cx="299" cy="520" r="33" />
                            <circle cx="382" cy="520" r="33" />
                            <circle cx="465" cy="520" r="33" />
                            <circle cx="548" cy="520" r="33" />
                            <circle cx="631" cy="520" r="33" />
                          </g>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{device.deviceName}</h3>
                        <p className="text-xs text-gray-500">{device.deviceCode}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">{device.value}%</div>
                        <div className="text-xs text-gray-500">
                          {new Date(device.timestamp).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
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
