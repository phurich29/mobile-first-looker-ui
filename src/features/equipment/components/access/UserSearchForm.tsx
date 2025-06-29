
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User } from "../../types";
import { searchUsersByEmail } from "../../services/userAccessService";

interface UserSearchFormProps {
  deviceCode: string;
  allUsers: User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  filteredUsers: User[];
  setFilteredUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UserSearchForm({
  deviceCode,
  allUsers,
  setAllUsers,
  filteredUsers,
  setFilteredUsers,
  setIsLoading
}: UserSearchFormProps) {
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  // Filter existing users based on search input
  const handleFilter = (searchValue: string) => {
    setSearchEmail(searchValue);
    
    if (!searchValue.trim()) {
      setFilteredUsers(allUsers);
      return;
    }
    
    const filtered = allUsers.filter(user => 
      user.email.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredUsers(filtered);
  };
  
  // Search for new users by email and add to the list
  const searchAndAddUser = async () => {
    if (!searchEmail.trim()) return;
    
    setIsSearching(true);
    console.log("🚀 Starting user search for:", searchEmail);
    
    try {
      const searchResults = await searchUsersByEmail(searchEmail, deviceCode);
      console.log("📬 Search results received:", searchResults);
      
      if (searchResults.length === 0) {
        console.log("❌ No users found in search results");
        toast({
          title: "ไม่พบผู้ใช้",
          description: `ไม่พบผู้ใช้ที่มีอีเมล "${searchEmail}" ในระบบ กรุณาตรวจสอบความถูกต้องของอีเมล`,
          variant: "destructive",
        });
        return;
      }
      
      // Merge with existing users, avoiding duplicates
      const existingUserIds = new Set(allUsers.map(u => u.id));
      const newUsers = searchResults.filter(u => !existingUserIds.has(u.id));
      
      if (newUsers.length > 0) {
        const updatedAllUsers = [...allUsers, ...newUsers];
        setAllUsers(updatedAllUsers);
        
        // Update filtered users if search is empty or matches
        if (!searchEmail.trim()) {
          setFilteredUsers(updatedAllUsers);
        } else {
          const filtered = updatedAllUsers.filter(user => 
            user.email.toLowerCase().includes(searchEmail.toLowerCase())
          );
          setFilteredUsers(filtered);
        }
        
        console.log("✅ Successfully added new users:", newUsers);
        toast({
          title: "เพิ่มผู้ใช้สำเร็จ",
          description: `เพิ่มผู้ใช้ใหม่ ${newUsers.length} คน: ${newUsers.map(u => u.email).join(', ')}`,
        });
      } else {
        console.log("ℹ️ Users already exist in the list");
        toast({
          title: "ผู้ใช้มีอยู่แล้ว",
          description: "ผู้ใช้ที่ค้นหาได้ถูกเพิ่มในรายการแล้ว",
        });
      }
      
      setSearchEmail("");
    } catch (error) {
      console.error("💥 Unexpected error in search:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `มีข้อผิดพลาดในการค้นหาผู้ใช้: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1 space-y-1">
        <Label htmlFor="email-search">ค้นหาหรือเพิ่มผู้ใช้ตามอีเมล</Label>
        <Input
          id="email-search"
          placeholder="example@email.com"
          value={searchEmail}
          onChange={(e) => handleFilter(e.target.value)}
        />
      </div>
      <Button 
        onClick={searchAndAddUser} 
        disabled={isSearching || !searchEmail.trim()}
      >
        {isSearching ? "กำลังค้นหา..." : "เพิ่มผู้ใช้"}
      </Button>
    </div>
  );
}
