
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { DeviceList } from "@/components/device-list/DeviceList";
import { Search, Laptop } from "lucide-react";
import { useState } from "react";
import { useDeviceContext } from "@/contexts/DeviceContext";
import { Button } from "@/components/ui/button";

export default function Measurements() {
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedDeviceCode, selectedDeviceName, clearSelectedDevice } = useDeviceContext();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 p-4 pb-20">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">อุปกรณ์ที่มีการอัพเดทล่าสุด</h1>
          <p className="text-sm text-gray-500">แตะที่อุปกรณ์เพื่อดูข้อมูลค่าวัดคุณภาพโดยละเอียด</p>
          
          {selectedDeviceCode && (
            <div className="mt-2 flex items-center">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                <Laptop className="h-4 w-4" />
                <span>
                  อุปกรณ์เริ่มต้น: <span className="font-semibold">{selectedDeviceName || selectedDeviceCode}</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 ml-1 hover:bg-emerald-100"
                  onClick={() => clearSelectedDevice()}
                >
                  เปลี่ยน
                </Button>
              </div>
            </div>
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
