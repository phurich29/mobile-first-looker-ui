
import { useState } from "react";
import { Pencil, Eye, MoreVertical, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { NewsItem } from "../types";

interface NewsCardProps {
  news: NewsItem;
  onEdit: (news: NewsItem) => void;
  onPreview: (news: NewsItem) => void;
  onDelete: (id: string) => void;
  onPublishToggle: (id: string, currentStatus: boolean) => void;
  viewType?: 'grid' | 'list';
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

export function NewsCard({ news, onEdit, onPreview, onDelete, onPublishToggle, viewType = 'grid' }: NewsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate rice grain decorations based on news ID
  const generateRiceGrains = () => {
    // Use the news ID to create a deterministic seed
    const seed = news.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = (seed % 3) + 2; // 2-4 grains per card
    const grains = [];
    
    for (let i = 0; i < count; i++) {
      const position = (seed + i * 100) % 1000;
      const top = `${10 + (position % 80)}%`;
      const left = `${5 + (position % 85)}%`;
      const rotate = (position % 360);
      const size = 3 + (position % 4);
      
      // Alternate between colors
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
  
  // Get a gradient color based on the news ID
  const gradientIndex = news.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % cardGradients.length;
  const gradientClass = cardGradients[gradientIndex];
  
  return (
    <Card 
      className={`overflow-hidden border transition-all duration-200 hover:shadow-md ${gradientClass} ${news.published ? 'border-emerald-100' : 'border-gray-200'} ${isHovered ? 'ring-1 ring-emerald-200' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative ${viewType === 'list' ? "flex flex-col md:flex-row" : ""}`}>
        {/* Add rice grain decorations */}
        {generateRiceGrains()}
        
        {news.image_url && (
          <div className={viewType === 'list' ? "md:w-1/4 p-2" : ""}>
            <div className={`${viewType === 'list' ? "" : "h-40"} overflow-hidden bg-gray-100 relative z-10`}>
              <img 
                src={news.image_url} 
                alt={news.title} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
          </div>
        )}
        
        <div className={`${viewType === 'list' ? "md:w-3/4" : ""} relative z-10`}>
          <CardHeader className={`p-4 pb-2 ${news.published ? 'bg-emerald-50/30' : 'bg-gray-50/50'}`}>
            <div className="flex justify-between items-start w-full">
              <div className="space-y-1.5">
                <CardTitle className="text-base font-medium text-gray-800 line-clamp-2 break-words">
                  {news.title}
                </CardTitle>
                <div className="flex items-center text-xs text-gray-500 gap-2">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(news.publish_date), "d MMM yyyy", { locale: th })}
                  
                  {news.published ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs font-normal">
                      เผยแพร่แล้ว
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs font-normal">
                      ฉบับร่าง
                    </Badge>
                  )}
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mt-1 h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="end">
                  <div className="flex flex-col space-y-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start gap-2 font-normal"
                      onClick={() => onPreview(news)}
                    >
                      <Eye className="h-4 w-4" />
                      ดูตัวอย่าง
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start gap-2 font-normal"
                      onClick={() => onEdit(news)}
                    >
                      <Pencil className="h-4 w-4" />
                      แก้ไข
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start gap-2 font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(news.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      ลบ
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          
          <CardContent className={`p-4 pt-3 ${viewType === 'grid' ? 'h-24' : ''}`}>
            <p className="text-sm text-gray-600 line-clamp-3 break-words">
              {news.content}
            </p>
          </CardContent>
          
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs hover:bg-gray-100"
              onClick={() => onPreview(news)}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              ดูตัวอย่าง
            </Button>
            <Button
              variant={news.published ? "outline" : "default"}
              size="sm"
              className={news.published ? 
                "text-xs border-emerald-200 hover:bg-emerald-50" : 
                "text-xs bg-emerald-600 hover:bg-emerald-700"}
              onClick={() => onPublishToggle(news.id, news.published)}
            >
              {news.published ? "ยกเลิกการเผยแพร่" : "เผยแพร่"}
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
