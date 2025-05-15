
import { Header } from "@/components/Header";
import { PageHeader } from "./components/PageHeader";
import { NotificationSettingsList } from "./components/NotificationSettingsList";
import { useIsMobile } from "@/hooks/use-mobile";

const NotificationSettings = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-20' : 'ml-64'}`}>
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          <PageHeader />
          <NotificationSettingsList />
        </div>
      </main>
    </div>
  );
};

export default NotificationSettings;
