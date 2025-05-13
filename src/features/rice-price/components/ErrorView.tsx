
import { Button } from "@/components/ui/button";

interface ErrorViewProps {
  error: Error | null;
  onRetry: () => void;
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold text-gray-600 mb-2">เกิดข้อผิดพลาด</h1>
      <p className="text-gray-500">{error?.message}</p>
      <Button onClick={onRetry} className="mt-4">
        ลองใหม่
      </Button>
    </div>
  );
}
