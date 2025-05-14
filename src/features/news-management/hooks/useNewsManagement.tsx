
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NewsItem } from "../types";

export function useNewsManagement() {
  // State for news management
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for news form
  const [currentNews, setCurrentNews] = useState<Partial<NewsItem>>({
    title: "",
    content: "",
    published: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  // Function to load news from Supabase
  const fetchNews = async () => {
    setIsLoading(true);
    
    try {
      let { data, error } = await supabase
        .from('news')
        .select('*')
        .order('publish_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setNewsItems(data as NewsItem[]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('ไม่สามารถโหลดข้อมูลข่าวสารได้');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter news by search term
  const filteredNews = newsItems.filter(news => 
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    news.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle adding new news
  const handleAddNews = () => {
    setCurrentNews({
      title: "",
      content: "",
      published: false,
    });
    setDate(new Date());
    setIsEditing(false);
    setDialogOpen(true);
  };

  // Handle editing news
  const handleEditNews = (news: NewsItem) => {
    setCurrentNews(news);
    setDate(new Date(news.publish_date));
    setIsEditing(true);
    setDialogOpen(true);
  };

  // Handle previewing news
  const handlePreviewNews = (news: NewsItem) => {
    setCurrentNews(news);
    setPreviewDialogOpen(true);
  };

  // Handle saving news
  const handleSaveNews = async () => {
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
      setDialogOpen(false);
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
  
  // Load news on component mount
  useEffect(() => {
    fetchNews();
  }, []);
  
  return {
    newsItems,
    filteredNews,
    searchTerm,
    setSearchTerm,
    isLoading,
    isSubmitting,
    currentNews,
    setCurrentNews,
    isEditing,
    date,
    setDate,
    showCalendar,
    setShowCalendar,
    dialogOpen,
    setDialogOpen,
    previewDialogOpen,
    setPreviewDialogOpen,
    handleAddNews,
    handleEditNews,
    handlePreviewNews,
    handleSaveNews,
    handleDeleteNews,
    togglePublishStatus,
  };
}
