
import { Header } from "@/components/Header";
import { AssetCard } from "@/components/AssetCard";
import { WatchlistItem } from "@/components/WatchlistItem";
import { SectionHeader } from "@/components/SectionHeader";
import { NewsSlider } from "@/components/NewsSlider";
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useCallback } from 'react';

const Index = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: false, dragFree: true });
  // Sample data for rice prices
  const riceUpdates = [
    {
      symbol: "ข้าวหอมมะลิ 100% ชั้น 2(66/67)",
      name: "",
      value: "3,700 - 3,850",
      amount: "บาท/100ก.ก.",
      percentageChange: 0,
      iconColor: "#8A33AE",
    },
    {
      symbol: "ข้าวหอมมะลิ 100% ชั้น 2(67/68)",
      name: "",
      value: "3,000 - 3,166",
      amount: "บาท/100ก.ก.",
      percentageChange: 0,
      iconColor: "#F7931A",
    },
    {
      symbol: "ปลายข้าวหอมมะลิ (67/68)",
      name: "",
      value: "1,300 - 1,320",
      amount: "บาท/100ก.ก.",
      percentageChange: 0,
      iconColor: "#627EEA",
    },
    {
      symbol: "ข้าวหอมมะลิจังหวัด(66/67)",
      name: "",
      value: "3,650 - 3,700",
      amount: "บาท/100ก.ก.",
      percentageChange: 0,
      iconColor: "#8A33AE",
    },
  ];

  // Sample data for watchlist
  const watchlist = [
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
      symbol: "ADA/BUSD",
      name: "Cardano",
      price: "1.21",
      percentageChange: 1.8,
      iconColor: "#8A33AE",
    },
  ];

  const handleSeeAll = () => {
    console.log("See all rice prices clicked");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className="flex-1 pb-28">
        <div className="mt-4">
          {/* แสดงข่าวเกี่ยวกับวงการข้าวไทยแบบเลื่อนได้ 4 ข่าว */}
          <div className="mb-6 mt-4">
            <NewsSlider />
          </div>
          
          <div className="px-4 mb-3 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">ราคาข้าว จากสมาคมโรงสีข้าวไทย</h2>
            <button className="text-sm text-green-600 font-medium">ดูทั้งหมด</button>
          </div>
          <div className="mb-7 overflow-visible px-4">
            <div className="overflow-visible pt-3 pb-3" ref={emblaRef}>
              <div className="flex">
                {riceUpdates.map((rice) => (
                  <div key={rice.symbol} className="min-w-[190px] mr-3 flex-shrink-0">
                    <AssetCard
                      symbol={rice.symbol}
                      name={rice.name}
                      value={rice.value}
                      amount={rice.amount}
                      percentageChange={rice.percentageChange}
                      iconColor={rice.iconColor}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 mb-3 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">Watchlist</h2>
          </div>
          <div className="bg-white rounded-xl mx-4 overflow-hidden shadow-md border border-gray-100 mb-8">
            {watchlist.map((item) => (
              <WatchlistItem
                key={item.symbol}
                symbol={item.symbol}
                name={item.name}
                price={item.price}
                percentageChange={item.percentageChange}
                iconColor={item.iconColor}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Navigation bar at bottom with shadow and rounded corners */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around py-4 shadow-xl rounded-t-3xl backdrop-blur-sm bg-white/90" style={{ maxHeight: '80px' }}>
        <button className="flex flex-col items-center">
          <div className="w-6 h-1 bg-emerald-600 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-emerald-600 font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Market</span>
        </button>
        <button className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Index;
