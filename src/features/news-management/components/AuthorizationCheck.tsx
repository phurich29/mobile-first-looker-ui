
import { Button } from "@/components/ui/button";

interface AuthorizationCheckProps {
  isAuthorized: boolean;
}

export function AuthorizationCheck({ isAuthorized }: AuthorizationCheckProps) {
  if (isAuthorized) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
        <p className="text-gray-600 mb-6">กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์เข้าถึงการจัดการข่าวสาร</p>
        <Button onClick={() => window.location.href = '/'} className="bg-emerald-600 hover:bg-emerald-700">
          กลับสู่หน้าหลัก
        </Button>
      </div>
    </div>
  );
}
