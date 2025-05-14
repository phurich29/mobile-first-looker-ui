
import { useState } from "react";
import { CalendarIcon, Loader2, Upload, FileText } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { NewsItem } from "../types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "@/hooks/use-mobile";

interface NewsFormProps {
  currentNews: Partial<NewsItem>;
  isSubmitting: boolean;
  date: Date;
  setDate: (date: Date) => void;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  setCurrentNews: (news: Partial<NewsItem>) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function NewsForm({
  currentNews,
  isSubmitting,
  date,
  setDate,
  showCalendar,
  setShowCalendar,
  setCurrentNews,
  onCancel,
  onSave
}: NewsFormProps) {
  const isMobile = useIsMobile();
  const [previewImage, setPreviewImage] = useState<string | null>(currentNews.image_url || null);
  const MAX_CHARS = 200;
  
  const currentLength = currentNews.content?.length || 0;
  const isOverLimit = currentLength > MAX_CHARS;

  return (
    <div className={`flex flex-col ${!isMobile ? 'md:flex-row' : ''} gap-8`}>
      <div className={`${!isMobile ? 'md:w-2/3' : 'w-full'}`}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-base">หัวข้อข่าวสาร</Label>
            <Input
              id="title"
              placeholder="ใส่หัวข้อข่าวสาร"
              value={currentNews.title || ""}
              onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
              className="text-base"
            />
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-base">เนื้อหาข่าวสาร</Label>
              <div className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                {currentLength}/{MAX_CHARS}
              </div>
            </div>
            <Textarea
              id="content"
              placeholder="ใส่เนื้อหาข่าวสาร"
              rows={8}
              value={currentNews.content || ""}
              onChange={(e) => {
                const newContent = e.target.value;
                setCurrentNews({ ...currentNews, content: newContent });
              }}
              className={`text-base resize-y min-h-[150px] ${isOverLimit ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              maxLength={MAX_CHARS}
            />
            {isOverLimit && (
              <p className="text-xs text-red-500">เกินจำนวนตัวอักษรที่กำหนด ({MAX_CHARS})</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="image_url" className="text-base">URL รูปภาพ (ไม่บังคับ)</Label>
            <Input
              id="image_url"
              placeholder="https://example.com/image.jpg"
              value={currentNews.image_url || ""}
              onChange={(e) => {
                setCurrentNews({ ...currentNews, image_url: e.target.value });
                setPreviewImage(e.target.value);
              }}
              className="text-base"
            />
          </div>
          
          <div className="grid gap-2">
            <Label className="text-base">วันที่เผยแพร่</Label>
            <div className="relative">
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-gray-700"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: th }) : "เลือกวันที่"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      if (newDate) {
                        setDate(newDate);
                        setShowCalendar(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              id="published"
              checked={currentNews.published || false}
              onChange={(e) => setCurrentNews({ ...currentNews, published: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-600 w-4 h-4"
            />
            <Label htmlFor="published" className="cursor-pointer">เผยแพร่ทันที</Label>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={onSave} 
            disabled={isSubmitting || isOverLimit}
            className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : "บันทึกข่าวสาร"}
          </Button>
        </div>
      </div>
      
      {/* Preview panel for desktop */}
      {!isMobile && (
        <div className="md:w-1/3 bg-gray-50 rounded-lg p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-3">ตัวอย่าง</h3>
          <div className="bg-white rounded-md p-4 shadow-sm">
            <h4 className="font-medium mb-2">
              {currentNews.title || "หัวข้อข่าวสาร"}
            </h4>
            
            {previewImage && (
              <div className="mb-3 border rounded-md overflow-hidden">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                    setPreviewImage('/placeholder.svg');
                  }} 
                />
              </div>
            )}
            
            <div className="text-xs text-gray-500 mb-2">
              {date ? format(date, "PPP", { locale: th }) : "วันที่จะแสดง"}
            </div>
            
            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-5">
              {currentNews.content || "เนื้อหาข่าวสารจะแสดงที่นี่"}
            </p>
            
            <div className="flex justify-end mt-3">
              <Badge variant={currentNews.published ? "default" : "outline"} className={`${currentNews.published ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 border-0' : 'text-gray-500'}`}>
                {currentNews.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
