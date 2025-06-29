
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { AccessMapping } from "@/components/device-management/AccessMapping";

const DeviceAccessManagement = () => {
  const isMobile = useIsMobile();

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-4'}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              จัดการการเข้าถึงอุปกรณ์
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              กำหนดสิทธิ์การเข้าถึงอุปกรณ์สำหรับผู้ใช้งาน
            </p>
          </div>
        </div>
        
        <AccessMapping />
      </div>
    </AppLayout>
  );
};

export default DeviceAccessManagement;
