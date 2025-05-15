import { Header } from "@/components/Header";
import { NotificationList } from "@/components/NotificationList";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";

const Notifications = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-7xl px-4 ${!isMobile ? 'py-8' : 'pt-1'}`}>
          <div className="my-6">
            <h1 className="text-xl font-bold text-gray-800">การแจ้งเตือนที่กำหนดไว้</h1>
            <p className="text-sm text-gray-500 mt-1">จัดการการแจ้งเตือนสำหรับอุปกรณ์และค่าวัดต่างๆ</p>
          </div>
          
          {/* Notification list */}
          <div className={`${!isMobile ? 'mt-2' : ''}`}>
            <NotificationList />
          </div>
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default Notifications;
