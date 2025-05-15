
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { MeasurementItem } from "@/components/MeasurementItem";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import MeasurementHistory from "@/components/MeasurementHistory";

// Import utility functions
import { 
  fetchWholeGrainData, 
  fetchIngredientsData, 
  fetchImpuritiesData,
  fetchAllData
} from "@/utils/deviceMeasurementUtils";
import {
  formatWholeGrainItems,
  formatIngredientsItems,
  formatImpuritiesItems,
  formatAllItems
} from "@/utils/measurementFormatters";
import TabsContainer from "@/components/device-management/TabsContainer";

export default function DeviceDetails() {
  const { deviceCode } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeasurement, setSelectedMeasurement] = useState<{
    symbol: string;
    name: string;
  } | null>(null);

  // ตรวจสอบว่า deviceCode เป็น 'default' หรือไม่ และเปลี่ยนเป็นค่าที่เหมาะสม
  useEffect(() => {
    // ถ้า deviceCode เป็น 'default' ให้ดึงข้อมูลอุปกรณ์ล่าสุดแทน
    if (deviceCode === 'default') {
      // ดึงข้อมูลอุปกรณ์ล่าสุดและนำทางไปยังหน้านั้นแทน
      const fetchLatestDevice = async () => {
        try {
          const response = await fetch('/api/latest-device');
          if (response.ok) {
            const data = await response.json();
            if (data.deviceCode) {
              navigate(`/device/${data.deviceCode}`, { replace: true });
            }
          } else {
            // ถ้าไม่มีข้อมูล ให้ใช้ค่าเริ่มต้น
            navigate(`/device/6400000401398`, { replace: true });
          }
        } catch (error) {
          console.error("Error fetching latest device:", error);
          // ถ้าเกิดข้อผิดพลาด ให้ใช้ค่าเริ่มต้น
          navigate(`/device/6400000401398`, { replace: true });
        }
      };
      
      fetchLatestDevice();
    }
  }, [deviceCode, navigate]);

  // Use React Query for data fetching
  const { data: wholeGrainData, isLoading: isLoadingWholeGrain } = useQuery({
    queryKey: ['wholeGrainData', deviceCode],
    queryFn: () => deviceCode && deviceCode !== 'default' ? fetchWholeGrainData(deviceCode) : Promise.resolve(null),
    enabled: !!deviceCode && deviceCode !== 'default',
  });

  const { data: ingredientsData, isLoading: isLoadingIngredients } = useQuery({
    queryKey: ['ingredientsData', deviceCode],
    queryFn: () => deviceCode && deviceCode !== 'default' ? fetchIngredientsData(deviceCode) : Promise.resolve(null),
    enabled: !!deviceCode && deviceCode !== 'default',
  });
  
  const { data: impuritiesData, isLoading: isLoadingImpurities } = useQuery({
    queryKey: ['impuritiesData', deviceCode],
    queryFn: () => deviceCode && deviceCode !== 'default' ? fetchImpuritiesData(deviceCode) : Promise.resolve(null),
    enabled: !!deviceCode && deviceCode !== 'default',
  });
  
  const { data: allData, isLoading: isLoadingAllData } = useQuery({
    queryKey: ['allData', deviceCode],
    queryFn: () => deviceCode && deviceCode !== 'default' ? fetchAllData(deviceCode) : Promise.resolve(null),
    enabled: !!deviceCode && deviceCode !== 'default',
  });

  // Handle measurement item click
  const handleMeasurementClick = (symbol: string, name: string) => {
    setSelectedMeasurement({ symbol, name });
  };

  // Close history view
  const handleCloseHistory = () => {
    setSelectedMeasurement(null);
  };

  // Filter data based on search term
  const filterData = (items: any[]) => {
    if (!searchTerm.trim()) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.price.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Display loading or no data message
  const renderNoData = (isLoading: boolean) => {
    return (
      <div className="p-6 text-center text-gray-500">
        {isLoading ? "กำลังโหลดข้อมูลการวัด..." : `ไม่พบข้อมูลการวัดสำหรับอุปกรณ์ ${deviceCode}`}
      </div>
    );
  };

  // Navigation handler
  const handleGoBack = () => {
    navigate("/equipment");
  };

  // ถ้า deviceCode เป็น 'default' ให้แสดงหน้าโหลดข้อมูล
  if (deviceCode === 'default') {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูลอุปกรณ์...</p>
          </div>
        </main>
        <FooterNav />
      </div>
    );
  }

  // Show measurement history if a measurement is selected
  if (selectedMeasurement && deviceCode && deviceCode !== 'default') {
    return (
      <MeasurementHistory
        symbol={selectedMeasurement.symbol}
        name={selectedMeasurement.name}
        deviceCode={deviceCode}
        onClose={handleCloseHistory}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 p-4 pb-32">
        {/* Back button */}
        <Button 
          variant="outline" 
          onClick={handleGoBack}
          className="mb-4 flex items-center text-gray-600 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>ย้อนกลับ</span>
        </Button>

        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
              อุปกรณ์: {deviceCode}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              รายละเอียดข้อมูลการวัด
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center justify-between p-4 mb-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Tabs for selecting measurement type */}
        <div className="mb-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsContainer />
            
            <TabsContent value="all" className="mt-4">
              {/* All measurements */}
              <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow">
                {isLoadingAllData ? renderNoData(true) : 
                 formatAllItems(allData).length > 0 ? (
                  filterData(formatAllItems(allData)).map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => handleMeasurementClick(item.symbol, item.name)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <MeasurementItem
                        symbol={item.symbol}
                        name={item.name}
                        price={item.price}
                        percentageChange={item.percentageChange}
                        iconColor={item.iconColor}
                        updatedAt={item.updatedAt}
                        deviceCode={deviceCode}
                      />
                    </div>
                  ))
                ) : renderNoData(false)}
              </div>
            </TabsContent>
            
            <TabsContent value="wholegrain" className="mt-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow">
                {isLoadingWholeGrain ? renderNoData(true) : 
                 formatWholeGrainItems(wholeGrainData).length > 0 ? (
                  filterData(formatWholeGrainItems(wholeGrainData)).map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => handleMeasurementClick(item.symbol, item.name)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <MeasurementItem
                        symbol={item.symbol}
                        name={item.name}
                        price={item.price}
                        percentageChange={item.percentageChange}
                        iconColor={item.iconColor}
                        updatedAt={item.updatedAt}
                        deviceCode={deviceCode}
                      />
                    </div>
                  ))
                ) : renderNoData(false)}
              </div>
            </TabsContent>
            
            <TabsContent value="ingredients" className="mt-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow">
                {isLoadingIngredients ? renderNoData(true) : 
                 formatIngredientsItems(ingredientsData).length > 0 ? (
                  filterData(formatIngredientsItems(ingredientsData)).map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => handleMeasurementClick(item.symbol, item.name)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <MeasurementItem
                        symbol={item.symbol}
                        name={item.name}
                        price={item.price}
                        percentageChange={item.percentageChange}
                        iconColor={item.iconColor}
                        updatedAt={item.updatedAt}
                        deviceCode={deviceCode}
                      />
                    </div>
                  ))
                ) : renderNoData(false)}
              </div>
            </TabsContent>
            
            <TabsContent value="impurities" className="mt-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow">
                {isLoadingImpurities ? renderNoData(true) : 
                 formatImpuritiesItems(impuritiesData).length > 0 ? (
                  filterData(formatImpuritiesItems(impuritiesData)).map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => handleMeasurementClick(item.symbol, item.name)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <MeasurementItem
                        symbol={item.symbol}
                        name={item.name}
                        price={item.price}
                        percentageChange={item.percentageChange}
                        iconColor={item.iconColor}
                        updatedAt={item.updatedAt}
                        deviceCode={deviceCode}
                      />
                    </div>
                  ))
                ) : renderNoData(false)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add space to prevent content from being hidden behind footer */}
      <div className="pb-32"></div>

      {/* Footer navigation */}
      <FooterNav />
    </div>
  );
}
