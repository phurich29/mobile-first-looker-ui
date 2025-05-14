
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface NewsItemType {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  publish_date: string;
}

export const NewsSlider = () => {
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('published', true)
          .order('publish_date', { ascending: false })
          .limit(5);
        
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

  if (loading) {
    return (
      <div className="mb-6 w-full">
        <h2 className="font-semibold text-lg text-gray-800 mb-3">ข่าวสารและประกาศ</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse flex flex-col space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="mb-6 w-full">
        <h2 className="font-semibold text-lg text-gray-800 mb-3">ข่าวสารและประกาศ</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500">ไม่มีข่าวสารในขณะนี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 w-full">
      <h2 className="font-semibold text-lg text-gray-800 mb-3">ข่าวสารและประกาศ</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {news.map((item) => (
            <CarouselItem key={item.id} className={isMobile ? "w-full" : "basis-1/2"}>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full">
                {item.image_url ? (
                  <div className="h-32 overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : null}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3 min-h-[4.5rem]">{item.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      <span>{format(new Date(item.publish_date), "d MMM yyyy", { locale: th })}</span>
                    </div>
                    <Link 
                      to={`#news-${item.id}`} 
                      className="text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      อ่านเพิ่มเติม
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  );
};
