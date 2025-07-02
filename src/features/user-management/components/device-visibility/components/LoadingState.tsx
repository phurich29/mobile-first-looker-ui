import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeOff } from "lucide-react";

export function LoadingState() {
  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold dark:text-gray-100 flex items-center gap-2">
          <EyeOff className="h-5 w-5" />
          การควบคุมการแสดงผลอุปกรณ์
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
        </div>
      </CardContent>
    </Card>
  );
}