
import { useState } from "react";
import { NewsItem } from "../types";

export function useNewsSearch(newsItems: NewsItem[]) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter news by search term
  const filteredNews = newsItems.filter(news => 
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    news.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return {
    searchTerm,
    setSearchTerm,
    filteredNews
  };
}
