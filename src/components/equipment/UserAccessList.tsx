
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { loadUsers } from "./utils/accessUtils";
import { UserItem } from "./UserItem";
import { User } from "./types";

interface UserAccessListProps {
  deviceCode: string;
}

export const UserAccessList = ({ deviceCode }: UserAccessListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      handleLoadUsers();
    }
  }, [user]);

  const handleLoadUsers = async () => {
    setIsLoading(true);
    try {
      const loadedUsers = await loadUsers(deviceCode, user?.id);
      setUsers(loadedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search for a user by email
  const searchUser = async () => {
    if (!searchEmail.trim() || !user) return;
    
    setIsSearching(true);
    try {
      // Search for the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', `%${searchEmail.trim()}%`)
        .limit(10);
        
      if (userError) {
        console.error("Error searching for user:", userError);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถค้นหาผู้ใช้ได้",
          variant: "destructive",
        });
        return;
      }
      
      if (!userData || userData.length === 0) {
        toast({
          title: "ไม่พบผู้ใช้",
          description: "ไม่พบผู้ใช้ที่มีอีเมลตรงกับที่ค้นหา",
          variant: "destructive",
        });
        return;
      }
      
      // Check if users are on waiting list
      const userIds = userData.map(u => u.id);
      const { data: waitingListUsers, error: waitingListError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)
        .eq('role', 'waiting_list');
        
      if (waitingListError) {
        console.error("Error checking user roles:", waitingListError);
      }
      
      // Create a set of waiting list user IDs
      const waitingListUserIds = new Set(waitingListUsers?.map(u => u.user_id) || []);
      
      // Filter out waiting list users
      const filteredUsers = userData.filter(u => !waitingListUserIds.has(u.id));
      
      if (filteredUsers.length === 0) {
        toast({
          title: "ไม่พบผู้ใช้",
          description: "ผู้ใช้ที่ค้นพบยังอยู่ในรายชื่อรอสิทธิ์การใช้งาน",
          variant: "destructive",
        });
        return;
      }
      
      // Fetch device access records for found users
      const filteredUserIds = filteredUsers.map(u => u.id);
      const { data: accessData, error: accessError } = await supabase
        .from('user_device_access')
        .select('user_id')
        .eq('device_code', deviceCode)
        .in('user_id', filteredUserIds);
        
      if (accessError) {
        console.error("Error fetching device access:", accessError);
        return;
      }
      
      // Create a set of user IDs with access
      const userIdsWithAccess = new Set(accessData?.map(record => record.user_id) || []);
      
      // Combine the data
      const searchResults = filteredUsers.map(u => ({
        id: u.id,
        email: u.email || "ไม่มีอีเมล",
        hasAccess: userIdsWithAccess.has(u.id)
      }));
      
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
        description: "มีข้อผิดพลาดไม่คาดคิดเกิดขึ้น",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4 mt-2">
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
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium">รายชื่อผู้ใช้</h3>
        
        <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              กำลังโหลดข้อมูลผู้ใช้...
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              ไม่พบข้อมูลผู้ใช้ กรุณาค้นหาผู้ใช้ที่ต้องการให้สิทธิ์
            </div>
          ) : (
            users.map((userItem) => (
              <UserItem 
                key={userItem.id} 
                user={userItem} 
                deviceCode={deviceCode} 
                onAccessToggled={(userId, newAccessState) => {
                  setUsers(prevUsers => 
                    prevUsers.map(u => 
                      u.id === userId ? { ...u, hasAccess: newAccessState } : u
                    )
                  );
                }} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
