
import { Header } from "@/components/Header";
import { MeasurementItem } from "@/components/MeasurementItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Square, Wheat, Blend, Bug } from "lucide-react";

export default function Measurements() {
  // ข้อมูลตัวอย่างสำหรับรายการวัด
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
            <ScrollArea className="w-full">
              <TabsList className="flex w-full h-12 bg-white border border-gray-200 rounded-lg p-1 space-x-1">
                <TabsTrigger 
                  value="all" 
                  className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md"
                >
                  <Square className="h-4 w-4" />
                  <span>ทั้งหมด</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="wholegrain" 
                  className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md"
                >
                  <Wheat className="h-4 w-4" />
                  <span>พื้นข้าวเต้มเมล็ด (%)</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="ingredients" 
                  className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md"
                >
                  <Blend className="h-4 w-4" />
                  <span>ส่วนผสม (%)</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="impurities" 
                  className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md"
                >
                  <Bug className="h-4 w-4" />
                  <span>สิ่งเจือปน (%)</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
            
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
