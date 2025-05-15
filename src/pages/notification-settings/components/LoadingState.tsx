
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-60">
      <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
      <p className="text-emerald-700">กำลังโหลดข้อมูล...</p>
    </div>
  );
};
