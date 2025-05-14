
import { useState } from "react";
import { Pencil, Eye, MoreVertical, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NewsItem } from "../types";

interface NewsCardProps {
  news: NewsItem;
  onEdit: (news: NewsItem) => void;
  onPreview: (news: NewsItem) => void;
  onDelete: (id: string) => void;
  onPublishToggle: (id: string, currentStatus: boolean) => void;
}

export function NewsCard({ news, onEdit, onPreview, onDelete, onPublishToggle }: NewsCardProps) {
  return (
    <Card className={`overflow-hidden border ${news.published ? 'border-emerald-100' : 'border-gray-200'}`}>
      <CardHeader className="p-4 pb-2 bg-gray-50">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium text-gray-800 line-clamp-2 break-words">
            {news.title}
          </CardTitle>
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
      <CardContent className="p-4 pt-2">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>
            วันที่เผยแพร่: {format(new Date(news.publish_date), "d MMM yyyy", { locale: th })}
          </span>
          <span className={news.published ? "text-emerald-600" : "text-gray-400"}>
            {news.published ? "เผยแพร่แล้ว" : "ร่าง"}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-3 break-words">
          {news.content}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs"
          onClick={() => onEdit(news)}
        >
          แก้ไข
        </Button>
        <Button
          variant={news.published ? "outline" : "default"}
          size="sm"
          className={news.published ? "text-xs border-emerald-200 hover:bg-emerald-50" : "text-xs bg-emerald-600 hover:bg-emerald-700"}
          onClick={() => onPublishToggle(news.id, news.published)}
        >
          {news.published ? "ยกเลิกการเผยแพร่" : "เผยแพร่"}
        </Button>
      </CardFooter>
    </Card>
  );
}
