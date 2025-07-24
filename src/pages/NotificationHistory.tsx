
import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationHistoryList } from "@/components/notification-history/NotificationHistoryList";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

const NotificationHistory: React.FC = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <AppLayout showFooterNav={true}>
      <BackgroundImage />
      <div className={cn("relative z-10")}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('notificationHistory', 'title')}</h1>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
              {t('notificationHistory', 'description')}
            </p>
          </div>

          <div className="mt-0">
            <NotificationHistoryList />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationHistory;
