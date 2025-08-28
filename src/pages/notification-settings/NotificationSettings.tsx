
import { AppLayout } from "@/components/layouts/app-layout";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { cn } from "@/lib/utils";
import { PageHeader } from "./components/PageHeader";
import { PersonalNotificationsList } from "./components/PersonalNotificationsList";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePersonalNotifications } from "@/hooks/usePersonalNotifications";
import { useTranslation } from "@/hooks/useTranslation";

const NotificationSettings = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { notifications, userSettings, hasActiveSettings } = usePersonalNotifications();
  
  return (
    <AppLayout showFooterNav={isMobile}>
      <BackgroundImage />
      {/* Main content container with original padding and max-width. Dynamic margins/paddings are now handled by AppLayout. */}
      <div className={cn(
        "flex-1 relative z-10", // Retain flex-1, relative, z-10 for content behavior
        isMobile ? "pb-24" : "pb-10" // Retain original dynamic padding bottom
        // Margin-left is handled by AppLayout
      )}>
        <div className="mx-auto max-w-4xl mb-6">
          <PageHeader title="ระบบแจ้งเตือนส่วนตัว" />
          <PersonalNotificationsList 
            notifications={notifications || []}
            userSettings={userSettings || []} 
            hasActiveSettings={hasActiveSettings}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationSettings;
