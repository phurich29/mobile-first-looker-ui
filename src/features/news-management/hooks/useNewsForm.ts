
import { useState } from "react";
import { NewsItem } from "../types";

export function useNewsForm() {
  // State for news form
  const [currentNews, setCurrentNews] = useState<Partial<NewsItem>>({
    title: "",
    content: "",
    published: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Reset form to initial state
  const resetForm = () => {
    setCurrentNews({
      title: "",
      content: "",
      published: false,
    });
    setDate(new Date());
    setIsEditing(false);
  };
  
  // Setup form for adding a new news item
  const setupForNewNews = () => {
    resetForm();
  };
  
  // Setup form for editing an existing news item
  const setupForEditNews = (news: NewsItem) => {
    setCurrentNews(news);
    setDate(new Date(news.publish_date));
    setIsEditing(true);
  };
  
  return {
    currentNews,
    setCurrentNews,
    isEditing,
    setIsEditing,
    date,
    setDate,
    showCalendar,
    setShowCalendar,
    resetForm,
    setupForNewNews,
    setupForEditNews
  };
}
