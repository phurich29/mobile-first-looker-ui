import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePWAContext } from "@/contexts/PWAContext";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Trash2 } from "lucide-react";

interface ClearCacheButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ClearCacheButton({ 
  variant = "outline", 
  size = "sm",
  className = ""
}: ClearCacheButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const { clearAllCache } = usePWAContext();
  const { toast } = useToast();

  const handleClearCache = async () => {
    try {
      setIsClearing(true);
      
      toast({
        title: "กำลังเคลียร์แคช...",
        description: "กรุณารอสักครู่",
        duration: 2000,
      });

      await clearAllCache();
      
      toast({
        title: "เคลียร์แคชสำเร็จ",
        description: "แอปจะรีโหลดเพื่อรับอัพเดทล่าสุด",
        duration: 3000,
      });

    } catch (error) {
      console.error("Error clearing cache:", error);
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเคลียร์แคชได้ กรุณาลองใหม่",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`flex items-center gap-2 ${className}`}
          disabled={isClearing}
        >
          {isClearing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">เคลียร์แคช</span>
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            เคลียร์แคชของแอป
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>การดำเนินการนี้จะลบแคชทั้งหมดของแอป เพื่อให้แอปรับอัพเดทล่าสุด</p>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-1">✅ จะคงไว้:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>สถานะการเข้าสู่ระบบ</li>
                <li>อุปกรณ์ที่เลือกล่าสุด</li>
              </ul>
              
              <p className="font-medium mt-3 mb-1">🗑️ จะลบ:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>ข้อมูลที่แคชไว้ทั้งหมด</li>
                <li>Service Worker เก่า</li>
                <li>การตั้งค่าชั่วคราว</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              หลังเคลียร์แคชเสร็จ แอปจะรีโหลดอัตโนมัติ
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleClearCache}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                กำลังเคลียร์...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                เคลียร์แคช
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}