
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Users, UserPlus, X, CheckCircle, ChartBar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EquipmentCardProps {
  deviceCode: string;
  lastUpdated: string | null;
  isAdmin?: boolean;
}

interface User {
  id: string;
  email: string;
  hasAccess: boolean;
}

export const EquipmentCard = ({ deviceCode, lastUpdated, isAdmin = false }: EquipmentCardProps) => {
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Format the last updated time to show exact date and time with +7 hours
  const formattedTime = lastUpdated 
    ? (() => {
        const date = new Date(lastUpdated);
        // เพิ่มเวลาอีก 7 ชั่วโมง
        date.setHours(date.getHours() + 7);
        return format(date, "dd MMMM yyyy HH:mm:ss น.", { locale: th });
      })()
    : "ไม่มีข้อมูล";
  
  // Load users with their device access status
  const loadUsers = async () => {
    if (!isAdmin || !user) return;
    
    setIsLoading(true);
    try {
      // Fetch all users who are not on waiting list using direct query instead of RPC
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email');
        
      if (usersError) {
        console.error("Error fetching users:", usersError);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
          variant: "destructive",
        });
        return;
      }
      
      // Filter out users on waiting list
      const { data: waitingListUsers, error: waitingListError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'waiting_list');
        
      if (waitingListError) {
        console.error("Error fetching waiting list users:", waitingListError);
      }
      
      const waitingListUserIds = new Set(waitingListUsers?.map(u => u.user_id) || []);
      const filteredUsers = usersData?.filter(u => !waitingListUserIds.has(u.id)) || [];
      
      // Fetch device access records for this device
      const { data: accessData, error: accessError } = await supabase
        .from('user_device_access')
        .select('user_id')
        .eq('device_code', deviceCode);
        
      if (accessError) {
        console.error("Error fetching device access:", accessError);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลการเข้าถึงอุปกรณ์ได้",
          variant: "destructive",
        });
        return;
      }
      
      // Create a set of user IDs with access
      const userIdsWithAccess = new Set(accessData?.map(record => record.user_id) || []);
      
      // Combine the data
      const usersWithAccess = filteredUsers.map(userData => ({
        id: userData.id,
        email: userData.email || "ไม่มีอีเมล",
        hasAccess: userIdsWithAccess.has(userData.id)
      }));
      
      setUsers(usersWithAccess);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "มีข้อผิดพลาดไม่คาดคิดเกิดขึ้น",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Search for a user by email
  const searchUser = async () => {
    if (!searchEmail.trim() || !isAdmin || !user) return;
    
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
  
  // Toggle device access for a user
  const toggleAccess = async (userId: string, currentAccess: boolean) => {
    if (!isAdmin || !user) return;
    
    try {
      if (currentAccess) {
        // Remove access
        const { error } = await supabase
          .from('user_device_access')
          .delete()
          .eq('user_id', userId)
          .eq('device_code', deviceCode);
          
        if (error) {
          console.error("Error removing device access:", error);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถลบสิทธิ์การเข้าถึงอุปกรณ์ได้",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Grant access
        const { error } = await supabase
          .from('user_device_access')
          .insert({
            user_id: userId,
            device_code: deviceCode,
            created_by: user.id
          });
          
        if (error) {
          console.error("Error granting device access:", error);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถให้สิทธิ์การเข้าถึงอุปกรณ์ได้",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, hasAccess: !currentAccess } : u
        )
      );
      
      toast({
        title: "อัพเดทสิทธิ์สำเร็จ",
        description: currentAccess 
          ? "ลบสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว" 
          : "เพิ่มสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "มีข้อผิดพลาดไม่คาดคิดเกิดขึ้น",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-1 p-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
              <ChartBar className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              อุปกรณ์
            </span>
          </div>
          <CardTitle className="text-base font-bold">{deviceCode}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xs text-gray-600">
            <p className="mb-0.5">อัพเดทล่าสุด:</p>
            <p className="font-medium">{formattedTime}</p>
          </div>
          
          <div className="flex flex-col gap-2 mt-3">
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full text-xs"
              asChild
            >
              <Link to={`/device/${deviceCode}`}>
                <ChartBar className="h-3 w-3 mr-1" />
                ดูข้อมูล
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>จัดการสิทธิ์การเข้าถึงอุปกรณ์ {deviceCode}</DialogTitle>
          </DialogHeader>
          
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
                  users.map((user) => (
                    <div key={user.id} className="p-3 flex justify-between items-center">
                      <div className="truncate flex-1">
                        <div className="text-sm font-medium truncate">
                          {user.email}
                        </div>
                      </div>
                      <Button
                        variant={user.hasAccess ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleAccess(user.id, user.hasAccess)}
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
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
