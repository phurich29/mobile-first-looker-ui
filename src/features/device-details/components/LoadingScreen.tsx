
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";

export const LoadingScreen: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    // Set a 3-second timeout to redirect to equipment page
    const timeout = setTimeout(() => {
      console.log("LoadingScreen timeout: redirecting to equipment page");
      navigate('/equipment', { replace: true });
    }, 3000); // 3 seconds

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-28' : 'pb-4'}>
      <div className="flex flex-col flex-1 min-h-full bg-gradient-to-b from-emerald-50 to-gray-50">
        {/* Header and FooterNav are handled by AppLayout */}
        <main className="flex-1 flex justify-center items-center">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูลอุปกรณ์ล่าสุด...</p>
            <p className="text-sm text-gray-500 mt-2">หากไม่พบข้อมูล จะเปลี่ยนไปดูรายการอุปกรณ์ทั้งหมด</p>
          </div>
        </main>
        {/* FooterNav is handled by AppLayout */}
      </div>
    </AppLayout>
  );
};
