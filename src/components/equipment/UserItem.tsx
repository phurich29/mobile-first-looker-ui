
import { Button } from "@/components/ui/button";
import { X, CheckCircle } from "lucide-react";
import { toggleAccess } from "./utils/accessUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { User } from "./types";

interface UserItemProps {
  user: User;
  deviceCode: string;
  onAccessToggled: (userId: string, hasAccess: boolean) => void;
}

export const UserItem = ({ user, deviceCode, onAccessToggled }: UserItemProps) => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  
  const handleToggleAccess = async () => {
    if (!authUser) return;
    
    try {
      await toggleAccess(user.id, deviceCode, user.hasAccess, authUser.id);
      
      // Update local state via the callback
      onAccessToggled(user.id, !user.hasAccess);
      
      toast({
        title: "อัพเดทสิทธิ์สำเร็จ",
        description: user.hasAccess 
          ? "ลบสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว" 
          : "เพิ่มสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Error toggling access:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสิทธิ์การเข้าถึงอุปกรณ์ได้",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="p-3 flex justify-between items-center">
      <div className="truncate flex-1">
        <div className="text-sm font-medium truncate">
          {user.email}
        </div>
      </div>
      <Button
        variant={user.hasAccess ? "destructive" : "outline"}
        size="sm"
        onClick={handleToggleAccess}
        className="ml-2 flex items-center"
      >
        {user.hasAccess ? (
          <>
            <X className="h-3 w-3 mr-1" />
            <span className="text-xs">ลบสิทธิ์</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            <span className="text-xs">ให้สิทธิ์</span>
          </>
        )}
      </Button>
    </div>
  );
};
