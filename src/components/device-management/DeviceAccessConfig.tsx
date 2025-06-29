
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Search, UserPlus, UserMinus, Settings, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
}

interface DeviceAccessConfigProps {
  deviceCode: string;
  displayName?: string;
  currentUsers: string[];
  userDetailsMap: Record<string, User>;
  onAccessChange: (deviceCode: string, updatedUsers: string[]) => void;
}

export function DeviceAccessConfig({
  deviceCode,
  displayName,
  currentUsers,
  userDetailsMap,
  onAccessChange
}: DeviceAccessConfigProps) {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGuestAccessEnabled, setIsGuestAccessEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if guest access is enabled for this device
  useEffect(() => {
    const checkGuestAccess = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_device_access')
          .select('enabled')
          .eq('device_code', deviceCode)
          .single();

        if (!error && data) {
          setIsGuestAccessEnabled(data.enabled);
        }
      } catch (error) {
        console.error('Error checking guest access:', error);
      }
    };

    checkGuestAccess();
  }, [deviceCode]);

  // Search for users by email
  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', `%${searchEmail.trim()}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถค้นหาผู้ใช้ได้",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Grant access to a user
  const grantAccess = async (userId: string) => {
    if (currentUsers.includes(userId)) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('user_device_access')
        .insert({
          user_id: userId,
          device_code: deviceCode,
          created_by: user.id
        });

      if (error) throw error;

      const updatedUsers = [...currentUsers, userId];
      onAccessChange(deviceCode, updatedUsers);

      toast({
        title: "เพิ่มสิทธิ์สำเร็จ",
        description: `เพิ่มสิทธิ์การเข้าถึงอุปกรณ์ ${displayName || deviceCode} เรียบร้อยแล้ว`
      });

      setSearchEmail("");
      setSearchResults([]);
    } catch (error) {
      console.error('Error granting access:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสิทธิ์การเข้าถึงได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke access from a user
  const revokeAccess = async (userId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_device_access')
        .delete()
        .eq('user_id', userId)
        .eq('device_code', deviceCode);

      if (error) throw error;

      const updatedUsers = currentUsers.filter(id => id !== userId);
      onAccessChange(deviceCode, updatedUsers);

      toast({
        title: "ลบสิทธิ์สำเร็จ",
        description: `ลบสิทธิ์การเข้าถึงอุปกรณ์ ${displayName || deviceCode} เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error revoking access:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสิทธิ์การเข้าถึงได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle guest access
  const toggleGuestAccess = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('guest_device_access')
        .upsert({
          device_code: deviceCode,
          enabled: enabled
        });

      if (error) throw error;

      setIsGuestAccessEnabled(enabled);
      toast({
        title: enabled ? "เปิดการเข้าถึง Guest" : "ปิดการเข้าถึง Guest",
        description: `${enabled ? 'เปิด' : 'ปิด'}การเข้าถึงแบบ Guest สำหรับอุปกรณ์ ${displayName || deviceCode} แล้ว`
      });
    } catch (error) {
      console.error('Error toggling guest access:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปลี่ยนแปลงการตั้งค่า Guest ได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4 border-emerald-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-emerald-600" />
          จัดการสิทธิ์การเข้าถึง - {displayName || deviceCode}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Guest Access Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isGuestAccessEnabled ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
              <span className="font-medium">การเข้าถึงแบบ Guest</span>
            </div>
            <Switch
              checked={isGuestAccessEnabled}
              onCheckedChange={toggleGuestAccess}
              disabled={isLoading}
            />
          </div>
          <p className="text-sm text-gray-600">
            เปิดให้ผู้ใช้ที่ไม่ได้ล็อกอินสามารถดูข้อมูลอุปกรณ์นี้ได้
          </p>
        </div>

        <Separator />

        {/* Add User Section */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-600" />
            เพิ่มผู้ใช้ใหม่
          </h4>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาด้วยอีเมล..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchEmail.trim()}
              variant="outline"
            >
              {isSearching ? "กำลังค้นหา..." : "ค้นหา"}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <span className="text-sm">{user.email}</span>
                  <Button
                    size="sm"
                    onClick={() => grantAccess(user.id)}
                    disabled={currentUsers.includes(user.id) || isLoading}
                    variant={currentUsers.includes(user.id) ? "secondary" : "default"}
                  >
                    {currentUsers.includes(user.id) ? "มีสิทธิ์แล้ว" : "เพิ่มสิทธิ์"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Current Users List */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            ผู้ใช้ที่มีสิทธิ์เข้าถึง ({currentUsers.length} คน)
          </h4>
          
          {currentUsers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              ยังไม่มีผู้ใช้ที่ได้รับสิทธิ์เข้าถึงอุปกรณ์นี้
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {currentUsers.map((userId) => {
                const user = userDetailsMap[userId];
                if (!user) return null;

                return (
                  <div
                    key={userId}
                    className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-emerald-700">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.email}</p>
                        <Badge variant="secondary" className="text-xs">
                          ผู้ใช้ทั่วไป
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => revokeAccess(userId)}
                      disabled={isLoading}
                    >
                      <UserMinus className="h-4 w-4 mr-1" />
                      ลบสิทธิ์
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
