
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NewsItem } from "../types";

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
      if (isEditing && currentNews.id) {
        // Update existing news
        const { error } = await supabase
          .from('news')
          .update({
            title: currentNews.title,
            content: currentNews.content,
            publish_date: date.toISOString(),
            published: currentNews.published,
            image_url: currentNews.image_url
          })
          .eq('id', currentNews.id);
          
        if (error) throw error;
        toast.success("อัพเดทข่าวสารเรียบร้อยแล้ว");
      } else {
        // Add new news
        const { error } = await supabase
          .from('news')
          .insert({
            title: currentNews.title,
            content: currentNews.content,
            publish_date: date.toISOString(),
            published: currentNews.published || false,
            image_url: currentNews.image_url
          });
          
        if (error) throw error;
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
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('news')
        .update({ published: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
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
