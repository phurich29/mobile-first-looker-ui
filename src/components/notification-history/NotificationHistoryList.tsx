
import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { NotificationHeader } from "./components/NotificationHeader";
import { NotificationFilters } from "./components/NotificationFilters";
import { EmptyState } from "./components/EmptyState";
import { LoadingState } from "./components/LoadingState";
import { MinimalNotificationCard } from "./components/MinimalNotificationCard";
import { NotificationDetailCard } from "./components/NotificationDetailCard";
import { NotificationPagination } from "./components/NotificationPagination";
import { useNotificationHistory } from "./hooks/useNotificationHistory";
import { useQueryClient } from "@tanstack/react-query";
import { RealtimePayload } from "./types";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/components/AuthProvider";

export const NotificationHistoryList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
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
    filters,
    isCheckingNotifications,
    handleManualCheck,
    handleRefresh,
    handlePageChange,
    handleFiltersChange,
    refetch
  } = useNotificationHistory();

  // Enhanced real-time subscription with proper user filtering
  useEffect(() => {
    if (!user?.id) {
      console.log("🚫 No authenticated user, skipping real-time subscription");
      return;
    }

    console.log("🔗 Setting up user-filtered real-time subscription for user:", user.id);
    
    const channel = supabase
      .channel('notification_updates_main')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}` // ⭐ CRITICAL: Only user's notifications
        }, 
        (payload: RealtimePayload) => {
          console.log('🔔 User-filtered real-time notification update received:', {
            event: payload.eventType,
            table: 'notifications',
            timestamp: new Date().toISOString(),
            record_id: payload.new?.id || payload.old?.id || 'unknown',
            user_id: payload.new?.user_id || payload.old?.user_id,
            current_user: user.id
          });
          
          // Double-check user_id validation (defense in depth)
          const notificationUserId = payload.new?.user_id || payload.old?.user_id;
          if (notificationUserId && notificationUserId !== user.id) {
            console.warn('🚫 Cross-user notification detected and blocked:', {
              notification_user: notificationUserId,
              current_user: user.id
            });
            return;
          }
          
          // Invalidate queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['notification_history'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 User-filtered realtime subscription status:', status, 'for user:', user.id);
      });
      
    return () => {
      console.log("🔗 Cleaning up user-filtered real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient, user?.id]);

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
          {t('general', 'errorLoadingData')}
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t('general', 'tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6">
      <NotificationHeader 
        totalCount={totalCount}
        handleManualCheck={handleManualCheck}
        handleRefresh={handleRefresh}
        isCheckingNotifications={isCheckingNotifications}
        isFetching={isFetching}
      />

      <NotificationFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {/* Notification Cards */}
        <div className="space-y-4">
          {notifications?.map((notification) => (
            <NotificationDetailCard 
              key={`${notification.id}-${notification.notification_count}`}
              notification={notification}
            />
          ))}
        </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <NotificationPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationHistoryList;
