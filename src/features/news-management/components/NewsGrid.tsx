
import { Loader2 } from "lucide-react";
import { NewsCard } from "./NewsCard";
import { NoNewsFound } from "./NoNewsFound";
import { NewsItem } from "../types";

interface NewsGridProps {
  isLoading: boolean;
  filteredNews: NewsItem[];
  onEdit: (news: NewsItem) => void;
  onPreview: (news: NewsItem) => void;
  onDelete: (id: string) => void;
  onPublishToggle: (id: string, currentStatus: boolean) => void;
}

export function NewsGrid({ 
  isLoading, 
  filteredNews, 
  onEdit, 
  onPreview, 
  onDelete, 
  onPublishToggle 
}: NewsGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }
  
  if (filteredNews.length === 0) {
    return <NoNewsFound />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredNews.map((news) => (
        <NewsCard 
          key={news.id} 
          news={news} 
          onEdit={onEdit} 
          onPreview={onPreview} 
          onDelete={onDelete}
          onPublishToggle={onPublishToggle}
        />
      ))}
    </div>
  );
}
