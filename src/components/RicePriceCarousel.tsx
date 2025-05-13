
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { AssetCard } from "@/components/AssetCard";
import { RicePrice } from "@/features/user-management/types";
import { formatPrice } from "@/features/rice-price/utils";

interface RicePriceCarouselProps {
  ricePrices: RicePrice[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const RicePriceCarousel = ({ ricePrices, isLoading, error }: RicePriceCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start', 
    loop: false, 
    dragFree: true,
    containScroll: 'trimSnaps'
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

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setIsStart(emblaApi.scrollProgress() === 0);
      setIsEnd(emblaApi.scrollProgress() >= 0.99);
    };
    
    const onScroll = () => {
      const progress = emblaApi.scrollProgress();
      setScrollProgress(progress);
      setIsStart(progress === 0);
      setIsEnd(progress >= 0.99);
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

  return (
    <>
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
                    name={rice.name.substring(0, 1)}
                    value={rice.price !== null ? rice.price.toString() : "-"}
                    amount="บาท/100กก."
                    percentageChange={0}
                    iconColor={'#10b981'}
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
        
        {/* Scrollbar */}
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
            {emblaApi && (() => {
              // Calculate thumb width based on visible content ratio
              const visibleWidth = emblaApi.containerNode().clientWidth;
              const totalWidth = emblaApi.slideNodes().reduce(
                (acc, slide) => acc + slide.offsetWidth + 12,
                0
              );
              
              // Set minimum thumb width
              const thumbWidthPercent = Math.max(15, (visibleWidth / totalWidth) * 100);
              
              // Calculate maximum thumb position
              const maxThumbPosition = 100 - thumbWidthPercent;
              
              // Calculate thumb position
              let thumbPosition;
              
              if (isEnd) {
                thumbPosition = maxThumbPosition;
              } else if (isStart) {
                thumbPosition = 0;
              } else {
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
    </>
  );
};
