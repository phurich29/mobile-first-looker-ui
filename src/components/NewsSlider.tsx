import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { PromotionBanner } from '@/components/PromotionBanner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ข้อมูลข่าวเกี่ยวกับวงการข้าวไทย 4 ข่าว
const riceNewsList = [
  {
    id: 1,
    title: "กรมการข้าวเตรียมเพิ่มปริมาณข้าวเหนียว",
    description: "กรมการข้าวประกาศนโยบายสนับสนุนเกษตรกรเพิ่มปริมาณการปลูกข้าวเหนียวเพื่อการส่งออก มุ่งเป้าเพิ่มรายได้เกษตรกร",
    imageUrl: ""
  },
  {
    id: 2,
    title: "ราคาข้าวหอมมะลิทะยานสูงสุดในรอบ 3 ปี",
    description: "ราคาข้าวหอมมะลิในตลาดปรับตัวสูงขึ้นกว่าร้อยละ 15 เนื่องจากผลผลิตลดลงจากภัยแล้ง นับเป็นราคาที่สูงที่สุดในรอบ 3 ปี",
    imageUrl: ""
  },
  {
    id: 3,
    title: "สมาคมโรงสีข้าวไทยประกาศมาตรฐานใหม่",
    description: "สมาคมโรงสีข้าวไทยร่วมกับกระทรวงเกษตรและสหกรณ์ประกาศใช้มาตรฐานใหม่เพื่อยกระดับคุณภาพข้าวไทยสู่สากล",
    imageUrl: ""
  },
  {
    id: 4,
    title: "ส่งออกข้าวไทยไตรมาสแรกทำสถิติใหม่",
    description: "การส่งออกข้าวไทยในไตรมาสแรกของปีนี้ทำสถิติใหม่ มูลค่าสูงถึง 86,000 ล้านบาท เพิ่มขึ้นร้อยละ 22 จากช่วงเดียวกันของปีก่อน",
    imageUrl: ""
  }
];

export const NewsSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    
    // Auto-play
    const autoplayTimer = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    return () => {
      clearInterval(autoplayTimer);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative px-1">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {riceNewsList.map((news) => (
            <div key={news.id} className="flex-shrink-0 min-w-full">
              <PromotionBanner
                title={news.title}
                description={news.description}
                imageUrl={news.imageUrl || undefined}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* ปุ่มเลื่อนซ้าย-ขวา */}
      <button 
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full shadow-md z-10 backdrop-blur-sm border border-emerald-100"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-5 w-5 text-emerald-600" />
      </button>
      
      <button 
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full shadow-md z-10 backdrop-blur-sm border border-emerald-100"
        onClick={scrollNext}
      >
        <ChevronRight className="h-5 w-5 text-emerald-600" />
      </button>
      
      {/* Dots indicator */}
      <div className="flex justify-center mt-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 mx-1 rounded-full transition-colors ${
              index === selectedIndex ? 'bg-emerald-600' : 'bg-emerald-200'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};
