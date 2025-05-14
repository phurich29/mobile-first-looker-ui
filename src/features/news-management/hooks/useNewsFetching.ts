
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { NewsItem } from "../types";
import * as newsService from "../services/newsService";

export function useNewsFetching() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to load news from Supabase
  const fetchNews = async () => {
    setIsLoading(true);
    
    try {
      const data = await newsService.fetchAllNews();
      setNewsItems(data);
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
