
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
import { DeviceList } from "@/components/device-list/DeviceList";
// Header and FooterNav are handled by AppLayout
import { Search } from "lucide-react";
import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";

export default function Measurements() {
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    <AppLayout showFooterNav={true} contentPaddingBottom="pb-20">
      {/* Main content container with original padding. Dynamic margins and specific footer padding are handled by AppLayout. */}
      <div className="flex-1 p-4"> {/* Removed pb-20 as it's handled by AppLayout prop */}
        {/* Back Button */}
        <BackButton to="/" />
        
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">อุปกรณ์ที่มีการอัพเดทล่าสุด</h1>
          <p className="text-sm text-gray-500">แตะที่อุปกรณ์เพื่อดูข้อมูลค่าวัดคุณภาพโดยละเอียด</p>
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
      </div>
    </AppLayout>
  );
}
