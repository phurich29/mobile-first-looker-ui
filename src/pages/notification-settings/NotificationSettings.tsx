
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationSettingsList } from "./components/NotificationSettingsList";
import { useNotificationSettings } from "./hooks/useNotificationSettings";
import { PageHeader } from "./components/PageHeader";

const NotificationSettings = () => {
  const isMobile = useIsMobile();
  const { settings, loading, error } = useNotificationSettings();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-7xl px-4 ${!isMobile ? 'py-8' : 'pt-1'}`}>
          <PageHeader title="การตั้งค่าการแจ้งเตือน" />
          
          <div className="mt-6">
            <NotificationSettingsList 
              settings={settings}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default NotificationSettings;
