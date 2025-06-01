
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
      <div className="bg-white/50 dark:bg-slate-800/70 rounded-lg border border-gray-100 dark:border-slate-700 flex justify-center items-center h-64 shadow-sm">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }
  
  if (sortedNews.length === 0) {
    return <NoNewsFound />;
  }
  
  return (
    <div className={`${viewType === 'list' && !isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'} w-full`}>
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
