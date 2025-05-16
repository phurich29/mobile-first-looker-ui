
import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { NotificationHeader } from "./components/NotificationHeader";
import { NotificationCardList } from "./components/NotificationCardList";
import { NotificationPagination } from "./components/NotificationPagination";
import { EmptyState } from "./components/EmptyState";
import { LoadingState } from "./components/LoadingState";
import { useNotificationHistory } from "./hooks/useNotificationHistory";

export const NotificationHistoryList = () => {
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    isFetching,
    totalCount,
    totalPages,
    currentPage,
    isCheckingNotifications,
    handleManualCheck,
    handleRefresh,
    handlePageChange,
    refetch
  } = useNotificationHistory();

  // Subscribe to real-time notification changes
  useEffect(() => {
    // Set up subscription to notifications table
    const channel = supabase
      .channel('notification_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        (payload) => {
          console.log('Real-time notification update:', payload);
          // Trigger a refetch when notifications change
          refetch();
        }
      )
      .subscribe();
      
    // Clean up subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleViewDetails = (deviceCode: string, riceTypeId: string) => {
    navigate(`/device/${deviceCode}`);
  };

  return (
    <div className="space-y-4">
      <NotificationHeader 
        totalCount={totalCount}
        handleManualCheck={handleManualCheck}
        handleRefresh={handleRefresh}
        isCheckingNotifications={isCheckingNotifications}
        isFetching={isFetching}
      />

      {isLoading ? (
        <LoadingState />
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <NotificationCardList 
            notifications={notifications}
            handleViewDetails={handleViewDetails}
          />

          <NotificationPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default NotificationHistoryList;
