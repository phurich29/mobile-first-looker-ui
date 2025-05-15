
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../../types";
import { searchUsersByEmail } from "../../services/userAccessService";

interface UserSearchFormProps {
  deviceCode: string;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UserSearchForm({
  deviceCode,
  users,
  setUsers,
  setIsLoading
}: UserSearchFormProps) {
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  // Search for users by email
  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    
    setIsSearching(true);
    try {
      const searchResults = await searchUsersByEmail(searchEmail, deviceCode);
      
      // Merge with existing users, avoiding duplicates
      const existingUserIds = new Set(users.map(u => u.id));
      const newUsers = [
        ...users,
        ...searchResults.filter(u => !existingUserIds.has(u.id))
      ];
      
      setUsers(newUsers);
      setSearchEmail("");
      
      toast({
        title: "ค้นหาสำเร็จ",
        description: `พบผู้ใช้ ${searchResults.length} คน`,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "มีข้อผิดพลาดในการค้นหาผู้ใช้",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1 space-y-1">
        <Label htmlFor="email-search">ค้นหาผู้ใช้ตามอีเมล</Label>
        <Input
          id="email-search"
          placeholder="example@email.com"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
      </div>
      <Button 
        onClick={searchUser} 
        disabled={isSearching || !searchEmail.trim()}
      >
        ค้นหา
      </Button>
    </div>
  );
}
