
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NewsItem } from "../types";

interface NewsPreviewProps {
  news: Partial<NewsItem>;
  isEditing: boolean;
  onEdit: () => void;
  onClose: () => void;
}

export function NewsPreview({ news, isEditing, onEdit, onClose }: NewsPreviewProps) {
  return (
    <div className="py-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{news.title}</h3>
      
      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span>
          วันที่เผยแพร่: {news.publish_date && format(new Date(news.publish_date), "PPP", { locale: th })}
        </span>
        <span className={news.published ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}>
          {news.published ? "เผยแพร่แล้ว" : "ร่าง"}
        </span>
      </div>
      
      {news.image_url && (
        <div className="mb-4">
          <img 
            src={news.image_url} 
            alt={news.title} 
            className="w-full h-auto rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
              toast.error("ไม่สามารถโหลดรูปภาพได้");
            }} 
          />
        </div>
      )}
      
      <div className="prose max-w-full">
        <p className="whitespace-pre-wrap dark:text-gray-300">{news.content}</p>
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="outline" onClick={onClose} className="dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-gray-100">
          ปิด
        </Button>
        {isEditing && (
          <Button onClick={onEdit} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 dark:text-white">
            แก้ไขข่าวสาร
          </Button>
        )}
      </div>
    </div>
  );
}
