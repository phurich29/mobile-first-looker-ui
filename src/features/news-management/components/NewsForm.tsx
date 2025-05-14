
import { useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { NewsItem } from "../types";

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
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">หัวข้อข่าวสาร</Label>
        <Input
          id="title"
          placeholder="ใส่หัวข้อข่าวสาร"
          value={currentNews.title || ""}
          onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="content">เนื้อหาข่าวสาร</Label>
        <Textarea
          id="content"
          placeholder="ใส่เนื้อหาข่าวสาร"
          rows={6}
          value={currentNews.content || ""}
          onChange={(e) => setCurrentNews({ ...currentNews, content: e.target.value })}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="image_url">URL รูปภาพ (ไม่บังคับ)</Label>
        <Input
          id="image_url"
          placeholder="https://example.com/image.jpg"
          value={currentNews.image_url || ""}
          onChange={(e) => setCurrentNews({ ...currentNews, image_url: e.target.value })}
        />
      </div>
      
      <div className="grid gap-2">
        <Label>วันที่เผยแพร่</Label>
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
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="published"
          checked={currentNews.published || false}
          onChange={(e) => setCurrentNews({ ...currentNews, published: e.target.checked })}
          className="rounded text-emerald-600 focus:ring-emerald-600"
        />
        <Label htmlFor="published" className="cursor-pointer">เผยแพร่ทันที</Label>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          ยกเลิก
        </Button>
        <Button 
          onClick={onSave} 
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700"
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
  );
}
