
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NewsItemType {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  publish_date: string;
}

interface NewsSliderProps {
  flatStyle?: boolean;
}

export const NewsSlider = ({ flatStyle = false }: NewsSliderProps) => {
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItemType | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useIsMobile();
  const [api, setApi] = useState<any>(null);

  // Auto-slide effect that runs every 6 seconds
  useEffect(() => {
    if (!api || news.length <= 1) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [api, news.length]);
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('news').select('*').eq('published', true).order('publish_date', {
          ascending: false
        }).limit(5);
        if (error) {
          throw error;
        }
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);
  const handleReadMore = (item: NewsItemType) => {
    setSelectedNews(item);
    setSheetOpen(true);
  };
  if (loading) {
    return <div className="mb-6 w-full">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-3">ข่าวสารและประกาศ</h2>
        <div className={cn(
          "bg-white dark:bg-gray-700 rounded-xl p-6 animate-pulse flex flex-col space-y-3 relative",
          flatStyle ? "border border-gray-200 dark:border-gray-600" :
            [
              "before:content-[''] before:absolute before:inset-0 before:rounded-xl before:border before:border-gray-900/20 dark:before:border-gray-400/50 before:z-10",
              "after:content-[''] after:absolute after:inset-0 after:rounded-xl after:shadow-[3px_3px_0px_#00000010] after:z-0",
              "[filter:url(#pencil-border-loading)]"
            ]
        )}>
          {/* SVG filter สำหรับเอฟเฟกต์เส้นดินสอ */}
          {!flatStyle ? (
            <>
              <svg width="0" height="0" className="absolute">
                <filter id="pencil-border-loading">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                </filter>
              </svg>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
            </>
          ) : (
            <>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
            </>
          )}
        </div>
      </div>;
  }
  if (news.length === 0) {
    return <div className="mb-6 w-full">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-3">ข่าวสารและประกาศ</h2>
        <div className={cn(
          "bg-white dark:bg-gray-700 rounded-xl p-6 text-center relative",
          flatStyle ? "border border-gray-200 dark:border-gray-600" :
            [
              "before:content-[''] before:absolute before:inset-0 before:rounded-xl before:border before:border-gray-900/20 dark:before:border-gray-400/50 before:z-10",
              "after:content-[''] after:absolute after:inset-0 after:rounded-xl after:shadow-[3px_3px_0px_#00000010] after:z-0",
              "[filter:url(#pencil-border-empty)]"
            ]
        )}>
          {/* SVG filter สำหรับเอฟเฟกต์เส้นดินสอ */}
          {!flatStyle ? (
            <>
              <svg width="0" height="0" className="absolute">
                <filter id="pencil-border-empty">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                </filter>
              </svg>
              <p className="text-gray-500 dark:text-gray-400">ไม่มีข่าวสารในขณะนี้</p>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">ไม่มีข่าวสารในขณะนี้</p>
          )}
        </div>
      </div>;
  }
  return <div className="mb-6 w-full overflow-hidden">
      
      <Carousel opts={{
      align: "start",
      loop: true
    }} setApi={setApi} className="w-full">
        <CarouselContent>
          {news.map(item => <CarouselItem key={item.id} className={isMobile ? "w-full" : "basis-1/2"}>
              <div 
                onClick={() => handleReadMore(item)}
                className={cn(
                  "bg-white dark:bg-gray-700 rounded-xl overflow-hidden h-full relative cursor-pointer",
                  flatStyle ? 
                    "border border-gray-200 dark:border-gray-600 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600" :
                    [
                      "before:content-[''] before:absolute before:inset-0 before:rounded-xl before:border before:border-gray-900/20 dark:before:border-gray-400/50 before:z-10",
                      "after:content-[''] after:absolute before:inset-0 before:rounded-xl after:shadow-[3px_3px_0px_#00000010] after:z-0",
                      "transition-transform hover:scale-[1.02] hover:shadow-md",
                      /* เพิ่มเสน้แบบดินสอด้วย SVG filter */
                      "[filter:url(#pencil-border)]"
                    ]
              )}>
                {/* SVG filter สำหรับเอฟเฟกต์เส้นดินสอ */}
                {!flatStyle && (
                  <svg width="0" height="0" className="absolute">
                    <filter id="pencil-border">
                    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" result="noise" />
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                    </filter>
                  </svg>
                )}
                {item.image_url ? <div className="h-32 overflow-hidden">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
                  </div> : null}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 break-words">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 min-h-[4.5rem] break-words">{item.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      <span>{format(new Date(item.publish_date), "d MMM yyyy", {
                      locale: th
                    })}</span>
                    </div>
                    <span className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400">
                      อ่านเพิ่มเติม
                    </span>
                  </div>
                </div>
              </div>
            </CarouselItem>)}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>

      {/* Sheet for displaying full news content */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          {selectedNews && <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl">{selectedNews.title}</SheetTitle>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span>{format(new Date(selectedNews.publish_date), "d MMMM yyyy", {
                  locale: th
                })}</span>
                </div>
              </SheetHeader>
              <div className="mt-2 overflow-y-auto pr-2">
                {selectedNews.image_url && <div className="mb-6">
                    <img src={selectedNews.image_url} alt={selectedNews.title} className="w-full h-auto rounded-lg" onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
                  </div>}
                
                <div className="prose max-w-none mt-2 pb-6">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 break-words">{selectedNews.content}</p>
                </div>
              </div>
            </>}
        </SheetContent>
      </Sheet>
    </div>;
};
