import { Header } from "@/components/Header";
import { AssetCard } from "@/components/AssetCard";
import { WatchlistItem } from "@/components/WatchlistItem";
import { SectionHeader } from "@/components/SectionHeader";
import { NewsCarousel } from "@/components/NewsCarousel";
import { NewsSlider } from "@/components/NewsSlider";
import { ScrollArea } from "@/components/ui/scroll-area";
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FooterNav } from "@/components/FooterNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice } from "@/features/user-management/types";

const Index = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start', 
    loop: false, 
    dragFree: true,
    containScroll: 'trimSnaps' // ทำให้ไ��่เลยขอบจอ
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // Format date for display in Thai format
  const formatThaiDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Function to fetch rice prices for the homepage
  const fetchRicePrices = async () => {
    const { data, error } = await supabase
      .from('rice_prices')
      .select('*')
      .limit(8); // Limit to a reasonable number for display
    
    if (error) {
      throw error;
    }
    
    // Cast the data to match our RicePrice interface
    return data as unknown as RicePrice[];
  };

  // Use React Query to fetch rice prices
  const { data: ricePrices, isLoading, error } = useQuery({
    queryKey: ['homeRicePrices'],
    queryFn: fetchRicePrices
  });

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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      
      <main className="flex-1 pb-32">
        <div className="mt-4">
          {/* แสดงสไลด์ข่าวเกี่ยวกับวงการข้าวไทย */}
          <div className="mt-4 mx-4">
            <NewsSlider />
          </div>
          
          <div className="px-4 mb-3 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">ราคาข้าว จากสมาคมโรงสีข้าวไทย</h2>
            <Link to="/rice-prices" className="text-sm text-green-600 font-medium">ดูทั้งหมด</Link>
          </div>
          <div className="mb-7 relative">
            {/* กรอบบังคับขอบการเลื่อน */}
            <div className="overflow-hidden px-4 pt-3 pb-8" ref={emblaRef}>
              <div className="flex">
                {isLoading ? (
                  <div className="flex items-center justify-center min-w-[190px] mr-3 h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  </div>
                ) : error ? (
                  <div className="min-w-[190px] mr-3 p-4 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-500">ไม่สามารถโหลดข้อมูลได้</p>
                  </div>
                ) : ricePrices && ricePrices.length > 0 ? (
                  ricePrices.map((rice) => (
                    <div key={rice.id} className="min-w-[190px] mr-3 flex-shrink-0 pl-0.5 pr-0.5">
                      <AssetCard
                        symbol={rice.name}
                        name={rice.name.substring(0, 1)} // Use first character of name instead of category
                        value={rice.price.toString()} // Convert number to string
                        amount="บาท/100กก."
                        percentageChange={0}
                        iconColor={'#10b981'} // Default green color for all rice types
                        date={rice.document_date ? formatThaiDate(rice.document_date) : undefined}
                        priceColor={rice.priceColor}
                      />
                    </div>
                  ))
                ) : (
                  <div className="min-w-[190px] mr-3 p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-sm text-gray-500">ไม่มีข้อมูลราคาข้าว</p>
                  </div>
                )}
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
                  // คำนวณความกว้างของ thumb ตามส��ดส่วนของเนื้อหาที่มองเห็น
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

      <FooterNav />
    </div>
  );
};

export default Index;
