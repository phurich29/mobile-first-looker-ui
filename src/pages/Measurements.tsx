import { Header } from "@/components/Header";
import { MeasurementItem } from "@/components/MeasurementItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useState, useEffect } from "react";
import { Square, Wheat, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  // ดึงข้อมูลพื้นข้าวเต็มเมล็ดจาก Supabase
  const fetchWholeGrainData = async () => {
    const { data, error } = await supabase
      .from('rice_quality_analysis')
      .select('id, class1, class2, class3, short_grain, slender_kernel, created_at, thai_datetime')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching whole grain data:', error);
      throw new Error(error.message);
    }
    
    return data;
  };

  // ดึงข้อมูลส่วนผสมข้าวจาก Supabase
  const fetchIngredientsData = async () => {
    const { data, error } = await supabase
      .from('rice_quality_analysis')
      .select('id, whole_kernels, head_rice, total_brokens, small_brokens, small_brokens_c1, created_at, thai_datetime')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching ingredients data:', error);
      throw new Error(error.message);
    }
    
    return data;
  };

  // ใช้ React Query สำหรับ���ึงข้อมูล
  const { data: wholeGrainData, isLoading: isLoadingWholeGrain } = useQuery({
    queryKey: ['wholeGrainData'],
    queryFn: fetchWholeGrainData,
  });

  const { data: ingredientsData, isLoading: isLoadingIngredients } = useQuery({
    queryKey: ['ingredientsData'],
    queryFn: fetchIngredientsData,
  });

  // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้กับ MeasurementItem และคำนวณการเปลี่ยนแปลง
  const formatWholeGrainItems = () => {
    if (!wholeGrainData || wholeGrainData.length === 0) return [];
    
    // คำนวณการเปลี่ยนแปลงโดยเปรียบเทียบค่าล่าสุดกับค่าก่อนหน้า
    const calculateChange = (current: number | null, previous: number | null) => {
      if (current === null || previous === null) return 0;
      return current - previous;
    };
    
    // ข้อมูลล่าสุดและข้อมูลก่อนหน้า
    const latestData = wholeGrainData[0];
    const previousData = wholeGrainData.length > 1 ? wholeGrainData[1] : null;
    
    // แปลงข้อมูลเป็นรูปแบบของ MeasurementItem
    const metrics = [
      {
        symbol: "class1",
        name: "ชั้น 1",
        price: latestData.class1?.toString() || "0",
        percentageChange: calculateChange(latestData.class1, previousData?.class1),
        iconColor: "#F7931A",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "class2",
        name: "ชั้น 2",
        price: latestData.class2?.toString() || "0",
        percentageChange: calculateChange(latestData.class2, previousData?.class2),
        iconColor: "#627EEA",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "class3",
        name: "ชั้น 3",
        price: latestData.class3?.toString() || "0",
        percentageChange: calculateChange(latestData.class3, previousData?.class3),
        iconColor: "#F3BA2F",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "short_grain",
        name: "เมล็ดสั้น",
        price: latestData.short_grain?.toString() || "0",
        percentageChange: calculateChange(latestData.short_grain, previousData?.short_grain),
        iconColor: "#23292F",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "slender_kernel",
        name: "ข้าวลีบ",
        price: latestData.slender_kernel?.toString() || "0",
        percentageChange: calculateChange(latestData.slender_kernel, previousData?.slender_kernel),
        iconColor: "#345D9D",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
    ];

    return metrics;
  };

  // แปลงข้อ���ูลส่วนผสมให้อยู่ในรูปแบบที่ใช้กับ MeasurementItem และคำนวณการเปลี่ยนแปลง
  const formatIngredientsItems = () => {
    if (!ingredientsData || ingredientsData.length === 0) return [];
    
    // คำนวณการเปลี่ยนแปลงโดยเปรียบเทียบค่าล่าสุดกับค่าก่อนหน้า
    const calculateChange = (current: number | null, previous: number | null) => {
      if (current === null || previous === null) return 0;
      return current - previous;
    };
    
    // ข้อมูลล่าสุดและข้อมูลก่อนหน้า
    const latestData = ingredientsData[0];
    const previousData = ingredientsData.length > 1 ? ingredientsData[1] : null;
    
    // แปลงข้อมูลเป็นรูปแบบของ MeasurementItem
    const metrics = [
      {
        symbol: "whole_kernels",
        name: "เต็มเมล็ด",
        price: latestData.whole_kernels?.toString() || "0",
        percentageChange: calculateChange(latestData.whole_kernels, previousData?.whole_kernels),
        iconColor: "#4CAF50",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "head_rice",
        name: "ต้นข้าว",
        price: latestData.head_rice?.toString() || "0",
        percentageChange: calculateChange(latestData.head_rice, previousData?.head_rice),
        iconColor: "#2196F3",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "total_brokens",
        name: "ข้าวหักรวม",
        price: latestData.total_brokens?.toString() || "0",
        percentageChange: calculateChange(latestData.total_brokens, previousData?.total_brokens),
        iconColor: "#FF9800",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "small_brokens",
        name: "ปลายข้าว",
        price: latestData.small_brokens?.toString() || "0",
        percentageChange: calculateChange(latestData.small_brokens, previousData?.small_brokens),
        iconColor: "#9C27B0",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "small_brokens_c1",
        name: "ปลายข้าวC1",
        price: latestData.small_brokens_c1?.toString() || "0",
        percentageChange: calculateChange(latestData.small_brokens_c1, previousData?.small_brokens_c1),
        iconColor: "#795548",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
    ];

    return metrics;
  };

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
        <div className="mb-4">
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
                  className="flex min-w-max h-12 bg-white border-y border-gray-200 p-1 space-x-1 overflow-visible"
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
                    <span>พื้นข้าวเต็มเมล็ด (%)</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ingredients" 
                    className="whitespace-nowrap min-w-[130px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
                  >
                    <Wheat className="h-4 w-4 flex-shrink-0" />
                    <span>ส่วนผสม (%)</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="impurities" 
                    className="whitespace-nowrap min-w-[130px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
                  >
                    <Circle className="h-4 w-4 flex-shrink-0" />
                    <span>สิ่งเจือปน (%)</span>
                  </TabsTrigger>
                </TabsList>
              </div>
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
                {isLoadingWholeGrain ? (
                  <div className="flex justify-center items-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : formatWholeGrainItems().length > 0 ? (
                  formatWholeGrainItems().map((item, index) => (
                    <MeasurementItem
                      key={index}
                      symbol={item.symbol}
                      name={item.name}
                      price={item.price}
                      percentageChange={item.percentageChange}
                      iconColor={item.iconColor}
                      updatedAt={item.updatedAt}
                    />
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    ไม่พบข้อมูลพื้นข้าวเต็มเมล็ด
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="ingredients" className="mt-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 mb-8">
                {isLoadingIngredients ? (
                  <div className="flex justify-center items-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : formatIngredientsItems().length > 0 ? (
                  formatIngredientsItems().map((item, index) => (
                    <MeasurementItem
                      key={index}
                      symbol={item.symbol}
                      name={item.name}
                      price={item.price}
                      percentageChange={item.percentageChange}
                      iconColor={item.iconColor}
                      updatedAt={item.updatedAt}
                    />
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    ไม่พบข้อมูลส่วนผสม
                  </div>
                )}
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
