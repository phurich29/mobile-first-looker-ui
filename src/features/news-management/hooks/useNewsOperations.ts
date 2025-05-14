
import { useState } from "react";
import { toast } from "sonner";
import { NewsItem } from "../types";
import * as newsService from "../services/newsService";

type NewsOperationsProps = {
  fetchNews: () => Promise<void>;
  setNewsItems: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useNewsOperations({ 
  fetchNews, 
  setNewsItems, 
  setIsLoading 
}: NewsOperationsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle saving news (create or update)
  const handleSaveNews = async (
    currentNews: Partial<NewsItem>,
    isEditing: boolean,
    date: Date,
    onSuccess: () => void
  ) => {
    if (!currentNews.title || !currentNews.content) {
      toast.error("กรุณากรอกหัวข้อและเนื้อหาข่าวให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newsWithDate = {
        ...currentNews,
        publish_date: date.toISOString()
      };

      if (isEditing && currentNews.id) {
        // Update existing news
        await newsService.updateNews(currentNews.id, newsWithDate);
        toast.success("อัพเดทข่าวสารเรียบร้อยแล้ว");
      } else {
        // Add new news
        await newsService.createNews(newsWithDate);
        toast.success("เพิ่มข่าวสารใหม่เรียบร้อยแล้ว");
      }
      
      // Reload news after saving
      fetchNews();
      onSuccess();
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error("ไม่สามารถบันทึกข่าวสารได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting news
  const handleDeleteNews = async (id: string) => {
    if (!confirm("คุณต้องการลบข่าวสารนี้ใช่หรือไม่?")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await newsService.deleteNews(id);
      
      // Update news list after deletion
      setNewsItems(prevNews => prevNews.filter(news => news.id !== id));
      toast.success("ลบข่าวสารเรียบร้อยแล้ว");
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error("ไม่สามารถลบข่าวสารได้");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggling publish status
  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      await newsService.updatePublishStatus(id, !currentStatus);
      
      // Update news list after status change
      setNewsItems(prevNews => 
        prevNews.map(news => 
          news.id === id 
            ? { ...news, published: !news.published } 
            : news
        )
      );
      
      const newStatus = !currentStatus;
      toast.success(`${newStatus ? "เผยแพร่" : "ยกเลิกการเผยแพร่"}ข่าวสารเรียบร้อยแล้ว`);
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error("ไม่สามารถเปลี่ยนสถานะการเผยแพร่ได้");
    }
  };
  
  return {
    isSubmitting,
    handleSaveNews,
    handleDeleteNews,
    togglePublishStatus
  };
}
