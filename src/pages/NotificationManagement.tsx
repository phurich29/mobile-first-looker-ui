
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellDot } from "lucide-react";

const NotificationManagement = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <Header />
      
      <main className={`flex-1 ${isMobile ? 'pb-32' : 'pb-16 ml-64'}`}>
        <div className={`mx-auto max-w-7xl px-4 ${!isMobile ? 'py-8' : 'pt-6'}`}>
          <div className="flex items-center mb-6">
            <BellDot className="mr-2 h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-800">จัดการการแจ้งเตือน</h1>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">การตั้งค่าการแจ้งเตือน</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">ตั้งค่าและกำหนดรูปแบบการแจ้งเตือนสำหรับอุปกรณ์ของคุณ</p>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  ตั้งค่าการแจ้งเตือน
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ประวัติการแจ้งเตือน</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">ดูประวัติการแจ้งเตือนทั้งหมดที่คุณได้รับ</p>
                <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  ดูประวัติ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <FooterNav />
    </div>
  );
};

export default NotificationManagement;
