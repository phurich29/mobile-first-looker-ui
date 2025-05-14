
import { Loader2 } from "lucide-react";
import { NewsCard } from "./NewsCard";
import { NoNewsFound } from "./NoNewsFound";
import { NewsItem } from "../types";
import { AspectRatio } from "@/components/ui/aspect-ratio"; 
import { useIsMobile } from "@/hooks/use-mobile";

interface NewsGridProps {
  isLoading: boolean;
  filteredNews: NewsItem[];
  onEdit: (news: NewsItem) => void;
  onPreview: (news: NewsItem) => void;
  onDelete: (id: string) => void;
  onPublishToggle: (id: string, currentStatus: boolean) => void;
  viewType?: 'grid' | 'list';
  sortBy?: 'newest' | 'oldest' | 'published';
}

// Component for rice grain decoration in loading state
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

export function NewsGrid({ 
  isLoading, 
  filteredNews, 
  onEdit, 
  onPreview, 
  onDelete, 
  onPublishToggle,
  viewType = 'grid',
  sortBy = 'newest'
}: NewsGridProps) {
  const isMobile = useIsMobile();
  
  // Apply sorting based on sortBy prop
  const sortedNews = [...filteredNews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.publish_date).getTime() - new Date(b.publish_date).getTime();
    } else if (sortBy === 'published') {
      if (a.published && !b.published) return -1;
      if (!a.published && b.published) return 1;
      return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
    }
    return 0;
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-lg border border-gray-100 flex justify-center items-center h-64 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.15)] relative overflow-hidden">
        {/* Add rice grain decorations to loading state */}
        <RiceGrain top="15%" left="10%" rotate={30} color="emerald" />
        <RiceGrain top="60%" left="85%" rotate={120} color="amber" />
        <RiceGrain top="80%" left="30%" rotate={210} color="green" />
        
        <div className="text-center relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }
  
  if (sortedNews.length === 0) {
    return <NoNewsFound />;
  }
  
  return (
    <div className={`${viewType === 'list' && !isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4'}`}>
      {sortedNews.map((news) => (
        <div key={news.id} className={`${viewType === 'list' && !isMobile ? 'w-full' : ''}`}>
          <NewsCard 
            news={news} 
            onEdit={onEdit} 
            onPreview={onPreview} 
            onDelete={onDelete}
            onPublishToggle={onPublishToggle}
            viewType={viewType}
          />
        </div>
      ))}
    </div>
  );
}
