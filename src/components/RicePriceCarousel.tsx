
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

// Sample rice price data to display when no real data is available
const SAMPLE_RICE_PRICES = [
  {
    id: 'sample-1',
    name: 'ข้าวหอมมะลิ 100% ชั้น 2 (66/67)',
    price: '3,700 - 3,850',
    document_date: '2568-04-29',
    priceColor: 'black',
    category: 'white-rice',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    name: 'ข้าวหอมมะลิ 100% (67/68)',
    price: '3,000 - 3,166',
    document_date: '2568-04-29',
    priceColor: 'green',
    category: 'white-rice',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    name: 'ข้าวหอมปทุมธานี',
    price: '2,500 - 2,650',
    document_date: '2568-04-29',
    priceColor: 'red',
    category: 'white-rice',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    name: 'ข้าวเหนียว กข.6',
    price: '3,200 - 3,300',
    document_date: '2568-04-29',
    priceColor: 'black',
    category: 'sticky-rice',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

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
  const [displayData, setDisplayData] = useState<RicePrice[]>([]);

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

    // Check if we have data to display, if not use sample data
    if (ricePrices && ricePrices.length > 0) {
      setHasData(true);
      setDisplayData(ricePrices);
    } else {
      // Use sample data when real data isn't available
      setDisplayData(SAMPLE_RICE_PRICES as unknown as RicePrice[]);
      setHasData(false);
    }

    // Display a toast for error, only once per error
    if (error) {
      toast({
        title: "ไม่สามารถโหลดข้อมูลราคาข้าวได้",
        description: "กำลังแสดงข้อมูลตัวอย่างแทน",
        variant: "default"
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
            ) : displayData && displayData.length > 0 ? (
              displayData.map((rice) => (
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
              // This state should no longer show as we'll always have sample data
              <div className="min-w-[190px] mr-3 p-4 bg-amber-50 rounded-xl text-center">
                <p className="text-sm text-amber-700">ยังไม่มีข้อมูลราคาข้าว</p>
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
