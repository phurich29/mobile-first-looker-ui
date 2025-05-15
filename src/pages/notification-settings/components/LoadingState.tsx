
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 h-40 sm:h-60">
      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 animate-spin mb-3 sm:mb-4" />
      <p className="text-sm sm:text-base text-emerald-700">กำลังโหลดข้อมูล...</p>
    </div>
  );
};
