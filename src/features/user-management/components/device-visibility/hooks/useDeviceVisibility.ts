import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HiddenDevice } from "../types";

export function useDeviceVisibility() {
  const [hiddenDevices, setHiddenDevices] = useState<HiddenDevice[]>([]);
  const [newDeviceCode, setNewDeviceCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => {
    loadHiddenDevices();
  }, []);

  return {
    hiddenDevices,
    newDeviceCode,
    setNewDeviceCode,
    isLoading,
    isAddingDevice,
    addHiddenDevice,
    removeHiddenDevice
  };
}