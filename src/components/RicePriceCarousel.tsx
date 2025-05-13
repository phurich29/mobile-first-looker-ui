
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { AssetCard } from "@/components/AssetCard";
import { RicePrice } from "@/features/user-management/types";
import { formatPrice } from "@/features/rice-price/utils";
import { useToast } from "@/components/ui/use-toast";

interface RicePriceCarouselProps {
  ricePrices: RicePrice[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const RicePriceCarousel = ({ ricePrices, isLoading, error }: RicePriceCarouselProps) => {
  const { toast } = useToast();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start', 
    loop: false, 
    dragFree: true,
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [hasData, setHasData] = useState(false);

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
    // Log component render state for debugging
    console.log("RicePriceCarousel rendered with:", {
      hasRicePrices: ricePrices && ricePrices.length > 0,
      ricePricesCount: ricePrices?.length,
      isLoading,
      error
    });

    // Check if we have data to display
    setHasData(ricePrices && ricePrices.length > 0);

    // Display a toast for error, only once per error
    if (error) {
      toast({
        title: "ไม่สามารถโหลดข้อมูลราคาข้าวได้",
        description: "กรุณาลองใหม่อีกครั้งในภายหลัง",
        variant: "destructive"
      });
    }
  }, [ricePrices, isLoading, error, toast]);

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
    <>
      <div className="px-[5%] mb-3 flex justify-between items-center" style={{ width: '100%', boxSizing: 'border-box' }}>
        <h2 className="font-semibold text-gray-700">ราคาข้าว จากสมาคมโรงสีข้าวไทย</h2>
        <Link to="/rice-prices" className="text-sm text-green-600 font-medium">ดูทั้งหมด</Link>
      </div>
      <div className="mb-3 relative" style={{ width: '100%' }}>
        {/* กรอบบังคับขอบการเลื่อน */}
        <div className="overflow-hidden px-[5%] pt-3 pb-3" ref={emblaRef} style={{ width: '100%', boxSizing: 'border-box' }}>
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
                    value={rice.price !== null ? formatPrice(rice.price) : "-"}
                    amount="บาท/ก.ก."
                    percentageChange={0}
                    iconColor={'#10b981'}
                    date={rice.document_date ? formatThaiDate(rice.document_date) : undefined}
                    priceColor={rice.priceColor}
                  />
                </div>
              ))
            ) : (
              <div className="min-w-[190px] mr-3 p-4 bg-amber-50 rounded-xl text-center">
                <p className="text-sm text-amber-700">กำลังตรวจสอบข้อมูลราคาข้าว...</p>
                <button 
                  className="mt-2 text-xs bg-emerald-500 text-white px-3 py-1 rounded-md hover:bg-emerald-600"
                  onClick={() => window.location.reload()}
                >
                  รีเฟรช
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress indicator - optional scrollbar for UI feedback */}
        <div className="px-[5%] mt-3">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-200"
              style={{ width: `${scrollProgress * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

