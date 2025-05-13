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
  return <>
      <div className="px-[5%] mb-3 flex justify-between items-center" style={{
      width: '100%',
      boxSizing: 'border-box'
    }}>
        <h2 className="font-semibold text-gray-700">ราคาข้าว จากสมาคมโรงสีข้าวไทย</h2>
        <Link to="/rice-prices" className="text-sm text-green-600 font-medium">ดูทั้งหมด</Link>
      </div>
      
    </>;
};