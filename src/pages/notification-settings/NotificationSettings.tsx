
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { cn } from "@/lib/utils";
import { PageHeader } from "./components/PageHeader";
import { NotificationSettingsList } from "./components/NotificationSettingsList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotificationSettings } from "./hooks/useNotificationSettings";
import { BackButton } from '@/components/ui/back-button';
// Header and FooterNav are handled by AppLayout

const NotificationSettings = () => {
  // const { user } = useAuth(); // If auth-specific elements are added
  // const [isCollapsed, setIsCollapsed] = useState(false); // If sidebar collapse is implemented
  const isMobile = useIsMobile();
  const { settings, loading, error, fetchSettings } = useNotificationSettings();
  
  return (
    <AppLayout showFooterNav={isMobile}>
      <BackButton />
      <BackgroundImage />
      {/* Main content container with original padding and max-width. Dynamic margins/paddings are now handled by AppLayout. */}
      <div className={cn(
        "flex-1 relative z-10", // Retain flex-1, relative, z-10 for content behavior
        isMobile ? "pb-24" : "pb-10" // Retain original dynamic padding bottom
        // Margin-left is handled by AppLayout
      )}>
        <div className="mx-auto max-w-4xl mb-6">
          <PageHeader title="การตั้งค่าการแจ้งเตือน" />
          <NotificationSettingsList 
            settings={settings} 
            loading={loading} 
            error={error} 
            onEditSetting={(deviceCode, riceTypeId, riceName) => {
              console.log("Edit setting:", deviceCode, riceTypeId, riceName);
              // Here you could navigate to a settings edit page or open a modal
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationSettings;
