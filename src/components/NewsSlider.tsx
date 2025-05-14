import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
interface NewsItemType {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  publish_date: string;
}

// Array of background gradient colors for the cards
const cardGradients = [
  "bg-gradient-to-br from-emerald-50/90 to-white", 
  "bg-gradient-to-br from-amber-50/90 to-white", 
  "bg-gradient-to-br from-blue-50/90 to-white", 
  "bg-gradient-to-br from-purple-50/90 to-white", 
  "bg-gradient-to-br from-rose-50/90 to-white"
];

// Component for rice grain decoration
const RiceGrain = ({
  top,
  left,
  rotate = 0,
  size = 6,
  color = "emerald"
}: {
  top: string;
  left: string;
  rotate?: number;
  size?: number;
  color?: string;
}) => {
  return <div className={`absolute w-${size} h-${Math.floor(size / 2)} bg-${color}-200 rounded-full opacity-70`} style={{
    top,
    left,
    transform: `rotate(${rotate}deg)`,
    zIndex: 0
  }} />;
};

export const NewsSlider = () => {
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItemType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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
    setDialogOpen(true);
  };

  // Function to generate random rice grain positions for a card
  const generateRiceGrains = (index: number) => {
    // Use the index to deterministically generate a unique set of rice grains
    const seedValue = index * 1000;
    const count = seedValue % 3 + 2; // 2-4 grains per card
    const grains = [];
    for (let i = 0; i < count; i++) {
      const position = (seedValue + i * 100) % 1000;
      const top = `${10 + position % 80}%`;
      const left = `${5 + position % 85}%`;
      const rotate = position % 360;
      const size = 3 + position % 4;

      // Alternate between colors based on position
      const colors = ["emerald", "amber", "green"];
      const colorIndex = position % 3;
      grains.push(<RiceGrain key={i} top={top} left={left} rotate={rotate} size={size} color={colors[colorIndex]} />);
    }
    return grains;
  };
  if (loading) {
    return <div className="mb-6 w-full">
        <h2 className="font-semibold text-lg text-gray-800 mb-3">ข่าวสารและประกาศ</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse flex flex-col space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>;
  }
  if (news.length === 0) {
    return <div className="mb-6 w-full">
        <h2 className="font-semibold text-lg text-gray-800 mb-3">ข่าวสารและประกาศ</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500">ไม่มีข่าวสารในขณะนี้</p>
        </div>
      </div>;
  }
  return <div className="mb-6 w-full">
      <h2 className="font-semibold text-lg text-gray-800 mb-3">ข่าวสารและประกาศ</h2>
      <Carousel opts={{
      align: "start",
      loop: true
    }} setApi={setApi} className="w-full">
        <CarouselContent>
          {news.map((item, index) => {
          // Get a gradient color based on the index
          const gradientClass = cardGradients[index % cardGradients.length];
          return <CarouselItem key={item.id} className={isMobile ? "w-full" : "basis-1/2"}>
              <div className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                {/* Add random rice grain decorations */}
                {generateRiceGrains(index)}
                
                {item.image_url ? <div className="h-32 overflow-hidden relative">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div> : null}
                
                <div className="p-4 relative z-10 bg-white shadow-lg rounded-b-xl text-gray-800 transform translate-y-0 hover:translate-y-[-2px] transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 break-words">{item.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3 min-h-[4.5rem] break-words">{item.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      <span>{format(new Date(item.publish_date), "d MMM yyyy", {
                        locale: th
                      })}</span>
                    </div>
                    <button onClick={() => handleReadMore(item)} className={`text-xs px-3 py-1.5 rounded-full ${index % 2 === 0 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'} transition-all duration-300 hover:shadow-inner shadow-sm`}>
                      อ่านเพิ่มเติม
                    </button>
                  </div>
                </div>
              </div>
            </CarouselItem>;
        })}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-10 bg-white/80 hover:bg-white border border-gray-200" />
        <CarouselNext className="hidden md:flex -right-10 bg-white/80 hover:bg-white border border-gray-200" />
      </Carousel>

      {/* Dialog for displaying full news content - updated with more styling */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl overflow-hidden bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-lg">
          {selectedNews && <>
              <DialogHeader className="relative">
                <div className="absolute -right-2 -top-2 opacity-10">
                  <div className="w-16 h-8 bg-emerald-300 rounded-full rotate-45"></div>
                </div>
                <DialogTitle className="text-xl text-emerald-800 font-medium">{selectedNews.title}</DialogTitle>
                <div className="absolute -left-4 bottom-0 w-8 h-4 bg-amber-100 rounded-full opacity-20 rotate-12"></div>
              </DialogHeader>
              <div className="mt-2 overflow-y-auto max-h-[70vh] custom-white-scrollbar">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span>{format(new Date(selectedNews.publish_date), "d MMMM yyyy", {
                  locale: th
                })}</span>
                </div>
                
                {selectedNews.image_url && <div className="mb-4 overflow-hidden rounded-lg shadow-sm">
                    <img src={selectedNews.image_url} alt={selectedNews.title} className="w-full h-auto transition-transform duration-500 hover:scale-105" onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
                  </div>}
                
                <div className="prose max-w-none mt-2 relative p-2">
                  {/* Decorative rice grain */}
                  <div className="absolute -left-1 bottom-10 w-4 h-2 bg-amber-200 rounded-full opacity-70 rotate-45"></div>
                  <div className="absolute right-2 top-20 w-3 h-1.5 bg-emerald-200 rounded-full opacity-70 -rotate-30"></div>
                  
                  <p className="whitespace-pre-wrap text-gray-700 break-words">{selectedNews.content}</p>
                </div>
                
                <div className="mt-6 text-right">
                  <Link to={`/news/${selectedNews.id}`} className="inline-block px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full text-sm transition-colors shadow-sm hover:shadow">
                    ดูรายละเอียดเพิ่มเติม
                  </Link>
                </div>
              </div>
            </>}
        </DialogContent>
      </Dialog>
    </div>;
};
