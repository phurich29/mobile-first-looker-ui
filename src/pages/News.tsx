
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
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

// Component for rice grain decoration
const RiceGrain = ({ top, left, rotate = 0, size = 6, color = "emerald" }: { 
  top: string; 
  left: string; 
  rotate?: number;
  size?: number;
  color?: string;
}) => {
  return (
    <div 
      className={`absolute w-${size} h-${Math.floor(size/2)} bg-${color}-200 rounded-full opacity-70`} 
      style={{ 
        top, 
        left, 
        transform: `rotate(${rotate}deg)`,
        zIndex: 0 
      }}
    />
  );
};

// Array of background gradient colors for the cards
const cardGradients = [
  "bg-gradient-to-br from-emerald-50 to-white",
  "bg-gradient-to-br from-amber-50 to-white",
  "bg-gradient-to-br from-blue-50 to-white",
  "bg-gradient-to-br from-purple-50 to-white",
  "bg-gradient-to-br from-rose-50 to-white",
];

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

  // Function to generate random rice grain positions
  const generateRiceGrains = (index: number) => {
    // Use the index to deterministically generate a unique set of rice grains
    const seedValue = index * 1000;
    const count = (seedValue % 3) + 2; // 2-4 grains per card
    const grains = [];
    
    for (let i = 0; i < count; i++) {
      const position = (seedValue + i * 100) % 1000;
      const top = `${10 + (position % 80)}%`;
      const left = `${5 + (position % 85)}%`;
      const rotate = (position % 360);
      const size = 3 + (position % 4);
      
      // Alternate between colors based on position
      const colors = ["emerald", "amber", "green"];
      const colorIndex = (position % 3);
      
      grains.push(
        <RiceGrain 
          key={i} 
          top={top} 
          left={left} 
          rotate={rotate} 
          size={size}
          color={colors[colorIndex]}
        />
      );
    }
    
    return grains;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 pt-8 pb-32">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </main>
        <FooterNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-8 pb-32">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">ข่าวสารและประกาศ</h1>
          <p className="text-gray-600 mt-1">ข่าวสารและประกาศล่าสุดจากระบบ</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ข่าวที่เลือก */}
          <div className="lg:col-span-2">
            {selectedNews ? (
              <div className="bg-white rounded-lg shadow-[0_15px_30px_-6px_rgba(0,0,0,0.2)] p-6 relative overflow-hidden border border-gray-100">
                {generateRiceGrains(selectedNews.id.length)}
                
                <h2 className="text-xl font-semibold text-emerald-800 mb-4 relative z-10">{selectedNews.title}</h2>
                
                <div className="flex items-center text-sm text-gray-500 mb-4 relative z-10">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span>{format(new Date(selectedNews.publish_date), "d MMMM yyyy", { locale: th })}</span>
                </div>
                
                {selectedNews.image_url && (
                  <div className="mb-6 relative z-10">
                    <img 
                      src={selectedNews.image_url} 
                      alt={selectedNews.title} 
                      className="w-full h-auto rounded-lg shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="prose max-w-none relative z-10">
                  <p className="whitespace-pre-wrap text-gray-700">{selectedNews.content}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
                {news.map((item, index) => {
                  // Get a gradient color based on the index
                  const gradientClass = cardGradients[index % cardGradients.length];
                  
                  return (
                    <Card 
                      key={item.id} 
                      className={`${gradientClass} transition-all duration-300 cursor-pointer relative overflow-hidden ${selectedNews?.id === item.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'hover:border-emerald-200'} shadow-md hover:shadow-lg hover:-translate-y-1`}
                      onClick={() => setSelectedNews(item)}
                    >
                      {/* Add rice grain decorations */}
                      {generateRiceGrains(index)}
                      
                      <CardContent className="p-4 relative z-10 bg-white rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.content}</p>
                        <div className="flex items-center text-xs text-gray-400">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          <span>{format(new Date(item.publish_date), "d MMM yyyy", { locale: th })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <FooterNav />
    </div>
  );
}
