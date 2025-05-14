
import { useNewsFetching } from "./useNewsFetching";
import { useNewsSearch } from "./useNewsSearch";
import { useNewsForm } from "./useNewsForm";
import { useNewsDialogs } from "./useNewsDialogs";
import { useNewsOperations } from "./useNewsOperations";
import { NewsItem } from "../types";

export function useNewsManagement() {
  // Combine smaller hooks to create the complete functionality
  const {
    newsItems,
    setNewsItems,
    isLoading,
    setIsLoading,
    fetchNews
  } = useNewsFetching();
  
  const {
    searchTerm,
    setSearchTerm,
    filteredNews
  } = useNewsSearch(newsItems);
  
  const {
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
  } = useNewsForm();
  
  const {
    dialogOpen,
    setDialogOpen,
    previewDialogOpen,
    setPreviewDialogOpen
  } = useNewsDialogs();
  
  const {
    isSubmitting,
    handleSaveNews,
    handleDeleteNews,
    togglePublishStatus
  } = useNewsOperations({
    fetchNews,
    setNewsItems,
    setIsLoading
  });

  // Wrapped functions to connect the pieces
  const handleAddNews = () => {
    setupForNewNews();
    setDialogOpen(true);
  };

  const handleEditNews = (news: NewsItem) => {
    setupForEditNews(news);
    setDialogOpen(true);
  };

  const handlePreviewNews = (news: NewsItem) => {
    setCurrentNews(news);
    setPreviewDialogOpen(true);
  };

  const wrappedHandleSaveNews = () => {
    handleSaveNews(currentNews, isEditing, date, () => {
      setDialogOpen(false);
    });
  };

  return {
    // States
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
    
    // Actions
    handleAddNews,
    handleEditNews,
    handlePreviewNews,
    handleSaveNews: wrappedHandleSaveNews,
    handleDeleteNews,
    togglePublishStatus,
    
    // Utilities
    fetchNews
  };
}
