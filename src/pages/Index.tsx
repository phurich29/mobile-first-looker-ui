import { Header } from "@/components/Header";
import { AssetCard } from "@/components/AssetCard";
import { WatchlistItem } from "@/components/WatchlistItem";
import { SectionHeader } from "@/components/SectionHeader";
import { NewsCarousel } from "@/components/NewsCarousel";
import { NewsSlider } from "@/components/NewsSlider";
import { ScrollArea } from "@/components/ui/scroll-area";
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useCallback } from 'react';

const Index = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start', 
    loop: false, 
    dragFree: true,
    containScroll: 'trimSnaps' // ทำให้ไม่เลยขอบจอ
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setIsStart(emblaApi.scrollProgress() === 0);
      setIsEnd(emblaApi.scrollProgress() >= 0.99); // ปรับให้ตรวจจับการเลื่อนใกล้สุด
    };
    
    const onScroll = () => {
      const progress = emblaApi.scrollProgress();
      setScrollProgress(progress);
      setIsStart(progress === 0);
      setIsEnd(progress >= 0.99); // ปรับให้ตรวจจับการเลื่อนใกล้สุด
    };
    
    emblaApi.on('select', onSelect);
    emblaApi.on('scroll', onScroll);
    setScrollSnaps(emblaApi.scrollSnapList());
    
    // Sync initial states
    onSelect();
    onScroll();
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('scroll', onScroll);
    };
  }, [emblaApi]);
  
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
          {/* แสดงสไลด์ข่าวเกี่ยวกับวงการข้าวไทย */}
          <div className="mt-4 mx-4">
            <NewsSlider />
          </div>
          
          <div className="px-4 mb-3 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">ราคาข้าว จากสมาคมโรงสีข้าวไทย</h2>
            <button className="text-sm text-green-600 font-medium">ดูทั้งหมด</button>
          </div>
          <div className="mb-7 relative">
            {/* กรอบบังคับขอบการเลื่อน */}
            <div className="overflow-hidden px-4 pt-3 pb-8" ref={emblaRef}>
              <div className="flex">
                {riceUpdates.map((rice) => (
                  <div key={rice.symbol} className="min-w-[190px] mr-3 flex-shrink-0 pl-0.5 pr-0.5">
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
            {/* ปรับปรุง Scroll bar ให้สมมาตร และทำงานได้ถูกต้อง */}
            <div className="w-full px-8 mt-[-8px] mb-2">
              <div 
                className="relative h-2 bg-gray-200/50 rounded-full cursor-pointer"
                onClick={(e) => {
                  if (!emblaApi) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentPosition = x / rect.width;
                  emblaApi.scrollTo(Math.floor(percentPosition * scrollSnaps.length));
                }}
              >
                {/* แก้ไขการคำนวณความกว้างและตำแหน่งของ thumb */}
                {emblaApi && (() => {
                  // คำนวณความกว้างของ thumb ตามสัดส่วนของเนื้อหาที่มองเห็น
                  const visibleWidth = emblaApi.containerNode().clientWidth;
                  const totalWidth = emblaApi.slideNodes().reduce(
                    (acc, slide) => acc + slide.offsetWidth + 12, // +12 for margin-right of 3rem
                    0
                  );
                  
                  // ประกันความกว้างน้อยสุดของ thumb
                  const thumbWidthPercent = Math.max(15, (visibleWidth / totalWidth) * 100);
                  
                  // แก้ไขการคำนวณตำแหน่งสุดท้าย
                  const maxThumbPosition = 100 - thumbWidthPercent;
                  
                  // แก้ไขตำแหน่งของ thumb
                  let thumbPosition;
                  
                  if (isEnd) {
                    // เมื่ออยู่ขวาสุดให้ตำแหน่ง thumb อยู่ขวาสุดพอดี
                    thumbPosition = maxThumbPosition;
                  } else if (isStart) {
                    // เมื่ออยู่ซ้ายสุดให้ตำแหน่ง thumb อยู่ซ้ายสุดพอดี
                    thumbPosition = 0;
                  } else {
                    // คำนวณตำแหน่งกลาง
                    thumbPosition = scrollProgress * maxThumbPosition;
                  }
                  
                  return (
                    <div
                      className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full shadow-sm transition-transform duration-150"
                      style={{
                        width: `${thumbWidthPercent}%`,
                        transform: `translateX(${thumbPosition}%)`
                      }}
                    ></div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="px-4 mb-3 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">รายการที่ติดตาม</h2>
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
