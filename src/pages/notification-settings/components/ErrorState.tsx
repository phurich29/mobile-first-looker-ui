
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 h-40 sm:h-60 text-center">
      <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mb-3 sm:mb-4" />
      <p className="text-red-600 font-medium text-base sm:text-lg mb-1 sm:mb-2">เกิดข้อผิดพลาด</p>
      <p className="text-sm sm:text-base text-gray-600">{error}</p>
      <Button 
        variant="outline" 
        className="mt-3 sm:mt-4 text-sm" 
        size="sm"
        onClick={() => window.location.reload()}
      >
        ลองใหม่
      </Button>
    </div>
  );
};
