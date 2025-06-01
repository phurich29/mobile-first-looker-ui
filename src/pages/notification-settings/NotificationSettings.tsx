
import { Header } from "@/components/Header";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { cn } from "@/lib/utils";
import { PageHeader } from "./components/PageHeader";
import { NotificationSettingsList } from "./components/NotificationSettingsList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotificationSettings } from "./hooks/useNotificationSettings";
import { FooterNav } from "@/components/FooterNav";

const NotificationSettings = () => {
  // const { user } = useAuth(); // If auth-specific elements are added
  // const [isCollapsed, setIsCollapsed] = useState(false); // If sidebar collapse is implemented
  const isMobile = useIsMobile();
  const { settings, loading, error, fetchSettings } = useNotificationSettings();
  
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden dark:bg-zinc-900">
      <BackgroundImage />
      <Header />
      
      <main className={cn(
        "flex-1 relative z-10",
        isMobile ? "pb-24" : "pb-10",
        !isMobile && "md:ml-64" // Default desktop margin
        // !isMobile && !isCollapsed && "md:ml-64" // Add if sidebar collapse logic is used
      )}>
        <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8 my-6">
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
      </main>
      {isMobile && <FooterNav />}
    </div>
  );
};

export default NotificationSettings;
