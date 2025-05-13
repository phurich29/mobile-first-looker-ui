
import { Button } from "@/components/ui/button";

export function AccessDeniedView() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold text-gray-600 mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
      <p className="text-gray-500">คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
    </div>
  );
}
