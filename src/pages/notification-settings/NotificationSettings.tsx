
import { Header } from "@/components/Header";
import { PageHeader } from "./components/PageHeader";
import { NotificationSettingsList } from "./components/NotificationSettingsList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotificationSettings } from "./hooks/useNotificationSettings";
import { FooterNav } from "@/components/FooterNav";

const NotificationSettings = () => {
  const isMobile = useIsMobile();
  const { settings, loading, error, fetchSettings } = useNotificationSettings();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'ml-64'}`}>
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
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
