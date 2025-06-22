
import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { NotificationHeader } from "./components/NotificationHeader";
import { NotificationTable } from "./components/NotificationTable";
import { NotificationPagination } from "./components/NotificationPagination";
import { EmptyState } from "./components/EmptyState";
import { LoadingState } from "./components/LoadingState";
import { useNotificationHistory } from "./hooks/useNotificationHistory";
import { useQueryClient } from "@tanstack/react-query";

export const NotificationHistoryList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    notifications,
    isLoading,
    isFetching,
    error,
    totalCount,
    totalPages,
    currentPage,
    isCheckingNotifications,
    handleManualCheck,
    handleRefresh,
    handlePageChange,
    refetch
  } = useNotificationHistory();

  // Enhanced real-time subscription
  useEffect(() => {
    console.log("🔗 Setting up real-time subscription");
    
    const channel = supabase
      .channel('notification_updates_main')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        (payload) => {
          console.log('🔔 Real-time notification update received:', {
            event: payload.eventType,
            table: payload.table,
            timestamp: new Date().toISOString(),
            record_id: payload.new?.id || payload.old?.id
          });
          
          // Invalidate queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['notification_history'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });
      
    return () => {
      console.log("🔗 Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Error logging
  useEffect(() => {
    if (error) {
      console.error("🚨 NotificationHistoryList error:", error);
    }
  }, [error]);

  const handleViewDetails = (deviceCode: string, riceTypeId: string) => {
    console.log("📱 Navigate to device details:", deviceCode);
    navigate(`/device/${deviceCode}`);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <NotificationHeader 
        totalCount={totalCount}
        handleManualCheck={handleManualCheck}
        handleRefresh={handleRefresh}
        isCheckingNotifications={isCheckingNotifications}
        isFetching={isFetching}
      />

      {notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <NotificationTable 
            notifications={notifications}
            handleViewDetails={handleViewDetails}
          />

          {totalPages > 1 && (
            <NotificationPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default NotificationHistoryList;
