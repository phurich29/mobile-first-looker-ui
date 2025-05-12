import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

// รายการข่าวเกี่ยวกับวงการข้าวไทย
const newsItems = [
  {
    id: 1,
    title: 'แนวโน้มราคาข้าวไทยปี 2568 เพิ่มขึ้น 15%',
    description: 'กรมการค้าต่างประเทศคาดการณ์ราคาข้าวไทยในตลาดโลกจะเพิ่มขึ้น 15% จากปัจจัยด้านความต้องการที่สูงขึ้น'
  },
  {
    id: 2,
    title: 'นาข้าวอินทรีย์ไทยได้รับการรับรองมาตรฐานสากล',
    description: 'กลุ่มเกษตรกรภาคอีสานได้รับการรับรองมาตรฐานนาข้าวอินทรีย์ระดับสากล เพิ่มโอกาสส่งออกตลาดพรีเมี่ยม'
  },
  {
    id: 3,
    title: 'เกษตรกรไทยนำเทคโนโลยีมาพัฒนาพันธุ์ข้าวใหม่',
    description: 'เกษตรกรรุ่นใหม่ร่วมมือกับนักวิจัยนำเทคโนโลยีมาพัฒนาพันธุ์ข้าวทนแล้งที่ให้ผลผลิตสูงขึ้น 20%'
  }
];

export const NewsSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    
    // Auto-scroll every 5 seconds
    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    
    return () => {
      clearInterval(autoplayInterval);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative mb-6">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {newsItems.map((news) => (
            <div key={news.id} className="relative min-w-full">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white">
                {/* องค์ประกอบตกแต่งเพื่อเพิ่มมิติ */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
                <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full bg-emerald-400/30"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col h-20">
                    <h3 className="text-base font-bold mb-1 drop-shadow-md leading-tight">{news.title}</h3>
                    <p className="text-xs font-medium opacity-90 line-clamp-2">{news.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* ลบปุ่มเลื่อนซ้าย-ขวาตามคำขอ */}
      
      {/* จุดแสดงตำแหน่งสไลด์ */}
      <div className="flex justify-center mt-3 gap-2">
        {scrollSnaps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === selectedIndex ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
