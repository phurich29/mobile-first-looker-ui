
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { DeviceList } from "@/components/device-list/DeviceList";
import { Search, Pin } from "lucide-react";
import { useState } from "react";
import { useDeviceContext } from "@/contexts/DeviceContext";
import { Button } from "@/components/ui/button";

export default function Measurements() {
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedDevice, setSelectedDevice, isDeviceSelected } = useDeviceContext();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 p-4 pb-20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 mb-1">อุปกรณ์ที่มีการอัพเดทล่าสุด</h1>
            <p className="text-sm text-gray-500">แตะที่อุปกรณ์เพื่อดูข้อมูลค่าวัดคุณภาพโดยละเอียด</p>
          </div>
          
          {isDeviceSelected && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-blue-600 border-blue-200"
              onClick={() => setSelectedDevice(null)}
            >
              <Pin className="h-3.5 w-3.5" />
              <span>ยกเลิกการเลือก</span>
            </Button>
          )}
        </div>
        
        <div className="relative w-full mb-6">
          <input
            type="text"
            placeholder="ค้นหาอุปกรณ์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            width="16"
            height="16"
          />
        </div>
        
        <DeviceList />
      </main>

      <FooterNav />
    </div>
  );
}
