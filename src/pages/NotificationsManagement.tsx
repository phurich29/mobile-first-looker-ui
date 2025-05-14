
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";

const NotificationsManagement = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-7xl px-4 ${!isMobile ? 'py-8' : 'pt-1'}`}>
          <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">จัดการแจ้งเตือน</h1>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 text-center text-gray-500">
              ยังไม่มีการแจ้งเตือน
            </div>
          </div>
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default NotificationsManagement;
