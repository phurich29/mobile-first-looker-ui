
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-60 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-red-600 font-medium text-lg mb-2">เกิดข้อผิดพลาด</p>
      <p className="text-gray-600">{error}</p>
      <Button 
        variant="outline" 
        className="mt-4" 
        onClick={() => window.location.reload()}
      >
        ลองใหม่
      </Button>
    </div>
  );
};
