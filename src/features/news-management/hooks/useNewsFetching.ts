
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NewsItem } from "../types";

export function useNewsFetching() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Load news on component mount
  useEffect(() => {
    fetchNews();
  }, []);
  
  return {
    newsItems,
    setNewsItems,
    isLoading,
    setIsLoading,
    fetchNews
  };
}
