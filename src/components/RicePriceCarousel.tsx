
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RicePrice } from "@/features/user-management/types";
import { formatPrice, formatThaiDate, getPriceColorClass } from "@/features/rice-price/utils";

interface RicePriceCarouselProps {
  ricePrices: RicePrice[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const RicePriceCarousel = ({
  ricePrices,
  isLoading,
  error
}: RicePriceCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    const onScroll = () => {
      const progress = emblaApi.scrollProgress();
      setScrollProgress(progress);
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
    <div className="w-full">
      <div className="px-[5%] mb-3 flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">ราคาข้าว จากสมาคมโรงสีข้าวไทย</h2>
        <Link to="/rice-prices" className="text-sm text-green-600 font-medium">ดูทั้งหมด</Link>
      </div>

      {error && (
        <div className="px-[5%] py-4 text-center">
          <p className="text-red-500">ไม่สามารถโหลดข้อมูลราคาข้าวได้</p>
        </div>
      )}

      {isLoading && (
        <div className="px-[5%] overflow-hidden">
          <div className="flex gap-4 pb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-[0_0_280px] min-w-0">
                <Card className="h-[170px]">
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-2/3 mb-4" />
                    <Skeleton className="h-8 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5 mt-2" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && ricePrices && ricePrices.length > 0 && (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex ml-[5%]">
            {ricePrices.map((price) => (
              <div key={price.id} className="flex-[0_0_280px] min-w-0 mr-4">
                <Card className="h-[170px] shadow-md hover:shadow-lg transition-shadow border-emerald-100">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-700 mb-1 line-clamp-2 h-12">{price.name}</h3>
                    <div className={`text-2xl font-bold mt-2 mb-3 ${getPriceColorClass(price.priceColor)}`}>
                      {formatPrice(price.price)} <span className="text-sm font-normal text-gray-500">บาท/กก.</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      วันที่: {price.document_date ? formatThaiDate(price.document_date) : 'ไม่ระบุ'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && (!ricePrices || ricePrices.length === 0) && (
        <div className="px-[5%] py-8 text-center">
          <p className="text-gray-500">ไม่พบข้อมูลราคาข้าว</p>
        </div>
      )}

      {/* Pagination indicators */}
      {!isLoading && !error && ricePrices && ricePrices.length > 0 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`rounded-full w-2 h-2 transition-colors ${
                index === selectedIndex ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
