import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeviceVisibilityManagementProps {
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface HiddenDevice {
  id: string;
  device_code: string;
  hidden_for_admin: boolean;
  created_at: string;
}

export function DeviceVisibilityManagement({ isAdmin, isSuperAdmin }: DeviceVisibilityManagementProps) {
  const [hiddenDevices, setHiddenDevices] = useState<HiddenDevice[]>([]);
  const [newDeviceCode, setNewDeviceCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const { toast } = useToast();

  // Only show for superadmin only
  if (!isSuperAdmin) {
    return null;
  }

  useEffect(() => {
    loadHiddenDevices();
  }, []);

  const loadHiddenDevices = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('admin_device_visibility')
        .select('*')
        .eq('hidden_for_admin', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading hidden devices:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลได้",
          variant: "destructive"
        });
        return;
      }

      setHiddenDevices(data || []);
    } catch (error) {
      console.error('Error loading hidden devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHiddenDevice = async () => {
    if (!newDeviceCode.trim()) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาใส่รหัสอุปกรณ์",
        variant: "destructive"
      });
      return;
    }

    if (hiddenDevices.some(d => d.device_code === newDeviceCode.trim())) {
      toast({
        title: "รหัสอุปกรณ์ซ้ำ",
        description: "รหัสอุปกรณ์นี้มีอยู่ในรายการแล้ว",
        variant: "destructive"
      });
      return;
    }

    setIsAddingDevice(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่พบข้อมูลผู้ใช้",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('admin_device_visibility')
        .upsert({
          device_code: newDeviceCode.trim(),
          hidden_for_admin: true,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding hidden device:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเพิ่มรหัสอุปกรณ์ได้",
          variant: "destructive"
        });
        return;
      }

      setHiddenDevices(prev => [data, ...prev]);
      setNewDeviceCode("");
      toast({
        title: "บันทึกสำเร็จ",
        description: "เพิ่มรหัสอุปกรณ์ที่ต้องการซ่อนแล้ว"
      });
    } catch (error) {
      console.error('Error adding hidden device:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มรหัสอุปกรณ์ได้",
        variant: "destructive"
      });
    } finally {
      setIsAddingDevice(false);
    }
  };

  const removeHiddenDevice = async (deviceId: string, deviceCode: string) => {
    try {
      const { error } = await supabase
        .from('admin_device_visibility')
        .delete()
        .eq('id', deviceId);

      if (error) {
        console.error('Error removing hidden device:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบรหัสอุปกรณ์ได้",
          variant: "destructive"
        });
        return;
      }

      setHiddenDevices(prev => prev.filter(d => d.id !== deviceId));
      toast({
        title: "ลบสำเร็จ",
        description: `ลบรหัสอุปกรณ์ ${deviceCode} ออกจากรายการแล้ว`
      });
    } catch (error) {
      console.error('Error removing hidden device:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบรหัสอุปกรณ์ได้",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
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

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold dark:text-gray-100 flex items-center gap-2">
          <EyeOff className="h-5 w-5" />
          การควบคุมการแสดงผลอุปกรณ์ (Super Admin เท่านั้น)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          จัดการรหัสอุปกรณ์ที่ต้องการซ่อนจากการแสดงผลสำหรับ Admin (เฉพาะ Super Admin เท่านั้นที่สามารถควบคุมได้)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add device form */}
        <div className="flex gap-2">
          <Input
            placeholder="รหัสอุปกรณ์ที่ต้องการซ่อน เช่น 6400000401493"
            value={newDeviceCode}
            onChange={(e) => setNewDeviceCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addHiddenDevice();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={addHiddenDevice}
            disabled={isAddingDevice || !newDeviceCode.trim()}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            เพิ่ม
          </Button>
        </div>

        {/* Hidden devices list */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            รายการอุปกรณ์ที่ซ่อนการแสดงผล ({hiddenDevices.length} เครื่อง)
          </h4>
          
          {hiddenDevices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>แสดงอุปกรณ์ทั้งหมด</p>
              <p className="text-xs">ยังไม่มีอุปกรณ์ที่ซ่อนการแสดงผล</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {hiddenDevices.map((device) => (
                <Badge
                  key={device.id}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <EyeOff className="h-3 w-3" />
                  <span className="font-mono text-xs">{device.device_code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeHiddenDevice(device.id, device.device_code)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <p className="font-medium mb-1">📋 วิธีการใช้งาน:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>ใส่รหัสอุปกรณ์ที่ต้องการซ่อนจากการแสดงผลสำหรับ Admin</li>
            <li>อุปกรณ์ที่ซ่อนจะไม่แสดงในหน้ารายการอุปกรณ์สำหรับบัญชี Admin</li>
            <li>การตั้งค่านี้ใช้ได้เฉพาะบัญชี Super Admin เท่านั้น</li>
            <li>สามารถเอาอุปกรณ์กลับมาแสดงได้โดยกดปุ่ม X</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}