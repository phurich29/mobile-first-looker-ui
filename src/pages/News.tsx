
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
// Header and FooterNav are handled by AppLayout
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Loader2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  publish_date: string;
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('published', true)
          .order('publish_date', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setNews(data || []);
        
        // ถ้ามี ID ในพารามิเตอร์ ให้แสดงข่าวนั้นเป็นหลัก
        if (id && data) {
          const found = data.find(item => item.id === id);
          if (found) {
            setSelectedNews(found);
          }
        } else if (data && data.length > 0) {
          // ถ้าไม่มี ID ให้แสดงข่าวล่าสุด
          setSelectedNews(data[0]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <AppLayout showFooterNav={true} contentPaddingBottom="pb-32">
        <div className="container mx-auto px-4 pt-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom="pb-32">
      <div className="container mx-auto px-4 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">ข่าวสารและประกาศ</h1>
          <p className="text-gray-600 mt-1">ข่าวสารและประกาศล่าสุดจากระบบ</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ข่าวที่เลือก */}
          <div className="lg:col-span-2">
            {selectedNews ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{selectedNews.title}</h2>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span>{format(new Date(selectedNews.publish_date), "d MMMM yyyy", { locale: th })}</span>
                </div>
                
                {selectedNews.image_url && (
                  <div className="mb-6">
                    <img 
                      src={selectedNews.image_url} 
                      alt={selectedNews.title} 
                      className="w-full h-auto rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{selectedNews.content}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">ไม่พบข่าวสารที่เลือก</p>
              </div>
            )}
          </div>
          
          {/* รายการข่าว */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-800 mb-4">ข่าวสารทั้งหมด</h3>
            
            {news.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">ไม่มีข่าวสาร</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {news.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`hover:border-emerald-200 transition-colors cursor-pointer ${selectedNews?.id === item.id ? 'border-emerald-500' : ''}`}
                    onClick={() => setSelectedNews(item)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.content}</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        <span>{format(new Date(item.publish_date), "d MMM yyyy", { locale: th })}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
