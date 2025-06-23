
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Settings, Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Device {
  device_code: string;
  display_name?: string;
}

interface GuestDeviceAccess {
  device_code: string;
  enabled: boolean;
}

export const GuestDeviceManagement = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [guestAccess, setGuestAccess] = useState<GuestDeviceAccess[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDevicesAndGuestAccess();
  }, []);

  const fetchDevicesAndGuestAccess = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all devices
      const { data: deviceData, error: deviceError } = await supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null)
        .order('device_code');

      if (deviceError) throw deviceError;

      // Get unique device codes
      const uniqueDevices = Array.from(
        new Set(deviceData?.map(d => d.device_code))
      ).map(code => ({ device_code: code }));

      // Fetch display names from device_settings
      const { data: settingsData } = await supabase
        .from('device_settings')
        .select('device_code, display_name');

      const devicesWithNames = uniqueDevices.map(device => {
        const setting = settingsData?.find(s => s.device_code === device.device_code);
        return {
          device_code: device.device_code,
          display_name: setting?.display_name
        };
      });

      setDevices(devicesWithNames);

      // Fetch guest access settings
      const { data: guestData, error: guestError } = await supabase
        .from('guest_device_access')
        .select('device_code, enabled');

      if (guestError) {
        console.error('Error fetching guest access data:', guestError);
        // Don't throw here, just log and continue with empty guest data
      }

      const guestAccessMap = new Map(
        guestData?.map(g => [g.device_code, g.enabled]) || []
      );

      const guestAccessList = devicesWithNames.map(device => ({
        device_code: device.device_code,
        enabled: guestAccessMap.get(device.device_code) || false
      }));

      setGuestAccess(guestAccessList);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "กรุณากรอกข้อมูล",
        description: "กรุณากรอกรหัสอุปกรณ์ที่ต้องการค้นหา",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      
      // Search for devices that contain the search query
      const { data: searchData, error: searchError } = await supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .ilike('device_code', `%${searchQuery}%`)
        .not('device_code', 'is', null);

      if (searchError) throw searchError;

      // Get unique device codes from search results
      const uniqueSearchDevices = Array.from(
        new Set(searchData?.map(d => d.device_code))
      ).map(code => ({ device_code: code }));

      // Fetch display names for search results
      const { data: settingsData } = await supabase
        .from('device_settings')
        .select('device_code, display_name')
        .in('device_code', uniqueSearchDevices.map(d => d.device_code));

      const searchResultsWithNames = uniqueSearchDevices.map(device => {
        const setting = settingsData?.find(s => s.device_code === device.device_code);
        return {
          device_code: device.device_code,
          display_name: setting?.display_name
        };
      });

      setSearchResults(searchResultsWithNames);

      if (searchResultsWithNames.length === 0) {
        toast({
          title: "ไม่พบผลลัพธ์",
          description: "ไม่พบอุปกรณ์ที่ตรงกับคำค้นหา",
        });
      } else {
        toast({
          title: "ค้นหาสำเร็จ",
          description: `พบอุปกรณ์ ${searchResultsWithNames.length} รายการ`,
        });
      }
    } catch (error) {
      console.error('Error searching devices:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถค้นหาอุปกรณ์ได้",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddDeviceFromSearch = (device: Device) => {
    // Check if device already exists in the list
    const existingDevice = devices.find(d => d.device_code === device.device_code);
    if (existingDevice) {
      toast({
        title: "อุปกรณ์มีอยู่แล้ว",
        description: "อุปกรณ์นี้อยู่ในรายการแล้ว",
      });
      return;
    }

    // Add device to the main list
    const newDevices = [...devices, device];
    setDevices(newDevices);

    // Add to guest access list (disabled by default)
    const newGuestAccess = [...guestAccess, { device_code: device.device_code, enabled: false }];
    setGuestAccess(newGuestAccess);

    // Remove from search results
    setSearchResults(prev => prev.filter(d => d.device_code !== device.device_code));

    toast({
      title: "เพิ่มอุปกรณ์สำเร็จ",
      description: `เพิ่มอุปกรณ์ ${device.device_code} แล้ว`,
    });
  };

  const handleRemoveDevice = (deviceCode: string) => {
    // Remove device from the main list
    const newDevices = devices.filter(d => d.device_code !== deviceCode);
    setDevices(newDevices);

    // Remove from guest access list
    const newGuestAccess = guestAccess.filter(access => access.device_code !== deviceCode);
    setGuestAccess(newGuestAccess);

    toast({
      title: "ลบอุปกรณ์สำเร็จ",
      description: `ลบอุปกรณ์ ${deviceCode} แล้ว`,
    });
  };

  const handleToggleAccess = (deviceCode: string) => {
    setGuestAccess(prev =>
      prev.map(access =>
        access.device_code === deviceCode
          ? { ...access, enabled: !access.enabled }
          : access
      )
    );
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      // Delete existing guest access settings
      const { error: deleteError } = await supabase
        .from('guest_device_access')
        .delete()
        .neq('device_code', '');

      if (deleteError) throw deleteError;

      // Insert new settings
      const accessData = guestAccess
        .filter(access => access.enabled)
        .map(access => ({
          device_code: access.device_code,
          enabled: access.enabled
        }));

      if (accessData.length > 0) {
        const { error } = await supabase
          .from('guest_device_access')
          .insert(accessData);

        if (error) throw error;
      }

      toast({
        title: "บันทึกสำเร็จ",
        description: "การตั้งค่าสิทธิ์ Guest ได้รับการอัพเดทแล้ว",
      });
    } catch (error) {
      console.error('Error saving guest access:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const enabledCount = guestAccess.filter(access => access.enabled).length;

  if (isLoading) {
    return (
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <Settings className="h-5 w-5" />
            จัดการข้อมูลสำหรับผู้เยี่ยมชม (Guest)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
          <Settings className="h-5 w-5" />
          จัดการข้อมูลสำหรับผู้เยี่ยมชม (Guest)
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          เลือกอุปกรณ์ที่ต้องการให้ผู้เยี่ยมชม (Guest) สามารถเห็นข้อมูลได้
        </p>
        <div className="text-sm text-emerald-600 dark:text-emerald-400">
          เลือกแล้ว: {enabledCount} จาก {devices.length} อุปกรณ์
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Form */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
          <div className="space-y-2">
            <Label htmlFor="search-device" className="text-sm font-medium">
              ค้นหาอุปกรณ์เพิ่มเติม
            </Label>
            <div className="flex gap-2">
              <Input
                id="search-device"
                type="text"
                placeholder="กรอกรหัสอุปกรณ์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "กำลังค้นหา..." : "ค้นหา"}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">ผลลัพธ์การค้นหา</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {searchResults.map((device) => (
                  <div
                    key={device.device_code}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border rounded"
                  >
                    <div>
                      <div className="font-medium">{device.display_name || device.device_code}</div>
                      {device.display_name && device.display_name !== device.device_code && (
                        <div className="text-xs text-gray-500">{device.device_code}</div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddDeviceFromSearch(device)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      เพิ่ม
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Device List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
          {devices.map((device) => {
            const access = guestAccess.find(a => a.device_code === device.device_code);
            const isEnabled = access?.enabled || false;
            
            return (
              <div
                key={device.device_code}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  isEnabled 
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}
              >
                <Checkbox
                  id={`guest-${device.device_code}`}
                  checked={isEnabled}
                  onCheckedChange={() => handleToggleAccess(device.device_code)}
                />
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={`guest-${device.device_code}`}
                    className="text-sm font-medium cursor-pointer dark:text-gray-200"
                  >
                    {device.display_name || device.device_code}
                  </label>
                  {device.display_name && device.display_name !== device.device_code && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {device.device_code}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    {isEnabled ? (
                      <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveDevice(device.device_code)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {devices.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            ไม่พบอุปกรณ์ในระบบ
          </div>
        )}

        <div className="flex justify-end pt-4 border-t dark:border-gray-700">
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
          >
            {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
