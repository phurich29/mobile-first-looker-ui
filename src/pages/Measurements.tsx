
import { Header } from "@/components/Header";
import { MeasurementItem } from "@/components/MeasurementItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useState, useEffect } from "react";
import { Square, Wheat, Blend, Bug } from "lucide-react";

export default function Measurements() {
  // สร้าง state และ ref สำหรับฟังก์ชันการลาก (Drag)
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // ฟังก์ชันจัดการการลาก (Drag)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tabsContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - tabsContainerRef.current.offsetLeft);
    setScrollLeft(tabsContainerRef.current.scrollLeft);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!tabsContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - tabsContainerRef.current.offsetLeft);
    setScrollLeft(tabsContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !tabsContainerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // เพิ่มความเร็วในการเลื่อน
    tabsContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !tabsContainerRef.current) return;
    
    const x = e.touches[0].pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tabsContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // เพิ่ม event listeners เมื่อ component mount
  useEffect(() => {
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
    return () => {
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  // ข้อมูลทดสอบสำหรับรายการการวัด
  const measurements = [
    {
      symbol: "BTC/BUSD",
      name: "Bitcoin",
      price: "54,382.64",
      percentageChange: 15.3,
      iconColor: "#F7931A",
    },
    {
      symbol: "ETH/BUSD",
      name: "Ethereum",
      price: "4,145.61",
      percentageChange: -2.21,
      iconColor: "#627EEA",
    },
    {
      symbol: "BNB/BUSD",
      name: "Binance Coin",
      price: "610.5",
      percentageChange: 2.4,
      iconColor: "#F3BA2F",
    },
    {
      symbol: "XRP/BUSD",
      name: "Ripple",
      price: "1.0358",
      percentageChange: 3.1,
      iconColor: "#23292F",
    },
    {
      symbol: "LTC/BUSD",
      name: "Litecoin",
      price: "207.3",
      percentageChange: -1.1,
      iconColor: "#345D9D",
    },
    {
      symbol: "BTC/BUSD",
      name: "Bitcoin",
      price: "54,382.64",
      percentageChange: 15.3,
      iconColor: "#F7931A",
    },
    {
      symbol: "ETH/BUSD",
      name: "Ethereum",
      price: "4,145.61", 
      percentageChange: -2.21,
      iconColor: "#627EEA",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 pb-28">
        {/* แถบค้นหา */}
        <div className="flex items-center justify-between p-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ค้นหา..."
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

        {/* แท็บสำหรับเลือกประเภท */}
        <div className="px-4 mb-4">
          <Tabs defaultValue="all" className="w-full">
            <div className="relative w-full overflow-hidden">
              <div 
                ref={tabsContainerRef}
                className="w-full overflow-x-auto pb-3 no-scrollbar"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleDragEnd}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <TabsList 
                  className="flex min-w-max h-12 bg-white border border-gray-200 rounded-lg p-1 space-x-1 overflow-visible"
                  style={{ paddingLeft: '0.25rem', paddingRight: '0.25rem' }}
                >
                  <TabsTrigger 
                    value="all" 
                    className="whitespace-nowrap min-w-[100px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
                  >
                    <Square className="h-4 w-4 flex-shrink-0" />
                    <span>ทั้งหมด</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="wholegrain" 
                    className="whitespace-nowrap min-w-[160px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
                  >
                    <Wheat className="h-4 w-4 flex-shrink-0" />
                    <span>พื้นข้าวเต้มเมล็ด (%)</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ingredients" 
                    className="whitespace-nowrap min-w-[130px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
                  >
                    <Blend className="h-4 w-4 flex-shrink-0" />
                    <span>ส่วนผสม (%)</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="impurities" 
                    className="whitespace-nowrap min-w-[130px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
                  >
                    <Bug className="h-4 w-4 flex-shrink-0" />
                    <span>สิ่งเจือปน (%)</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none opacity-70"></div>
              <div className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-white to-transparent pointer-events-none opacity-70"></div>
            </div>
            
            <TabsContent value="all" className="mt-4">
              {/* รายการการวัดทั้งหมด */}
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 mb-8">
                {measurements.map((item, index) => (
                  <MeasurementItem
                    key={index}
                    symbol={item.symbol}
                    name={item.name}
                    price={item.price}
                    percentageChange={item.percentageChange}
                    iconColor={item.iconColor}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="wholegrain" className="mt-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 mb-8">
                {/* แสดงเฉพาะรายการพื้นข้าวเต้มเมล็ด */}
                {measurements.slice(0, 3).map((item, index) => (
                  <MeasurementItem
                    key={index}
                    symbol={item.symbol}
                    name={item.name}
                    price={item.price}
                    percentageChange={item.percentageChange}
                    iconColor={item.iconColor}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="ingredients" className="mt-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 mb-8">
                {/* แสดงเฉพาะรายการส่วนผสม */}
                {measurements.slice(2, 5).map((item, index) => (
                  <MeasurementItem
                    key={index}
                    symbol={item.symbol}
                    name={item.name}
                    price={item.price}
                    percentageChange={item.percentageChange}
                    iconColor={item.iconColor}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="impurities" className="mt-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 mb-8">
                {/* แสดงเฉพาะรายการสิ่งเจือปน */}
                {measurements.slice(4, 7).map((item, index) => (
                  <MeasurementItem
                    key={index}
                    symbol={item.symbol}
                    name={item.name}
                    price={item.price}
                    percentageChange={item.percentageChange}
                    iconColor={item.iconColor}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* แถบนำทางด้านล่าง */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around py-4 shadow-xl rounded-t-3xl backdrop-blur-sm bg-white/90" style={{ maxHeight: '80px' }}>
        <a href="/" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Home</span>
        </a>
        <a href="/market" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Market</span>
        </a>
        <a href="/measurements" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-emerald-600 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-emerald-600 font-medium">รายการวัด</span>
        </a>
        <a href="/profile" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Profile</span>
        </a>
      </nav>
    </div>
  );
}
