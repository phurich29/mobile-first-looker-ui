
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle } from "lucide-react";

interface AddDeviceFormProps {
  onDeviceAdded: () => Promise<void>;
}

export function AddDeviceForm({ onDeviceAdded }: AddDeviceFormProps) {
  const [deviceCode, setDeviceCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceCode.trim()) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกรหัสอุปกรณ์",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if the device already exists in the rice_quality_analysis table
      const { data: existingData, error: checkError } = await supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .eq('device_code', deviceCode)
        .limit(1);
      
      if (checkError) throw checkError;
      
      // If device does not exist in the table, create a new entry
      if (!existingData || existingData.length === 0) {
        const { error: insertError } = await supabase
          .from('rice_quality_analysis')
          .insert({
            device_code: deviceCode,
            // Adding minimal required data
            sample_index: 1,
            output: 0
          });
        
        if (insertError) throw insertError;
        
        toast({
          title: "เพิ่มอุปกรณ์สำเร็จ",
          description: `เพิ่มอุปกรณ์รหัส ${deviceCode} เรียบร้อยแล้ว`,
        });
      } else {
        toast({
          title: "ข้อมูลซ้ำ",
          description: `อุปกรณ์รหัส ${deviceCode} มีอยู่ในระบบแล้ว`,
        });
      }
      
      // Clear the input field and refresh the device list
      setDeviceCode("");
      await onDeviceAdded();
      
    } catch (error) {
      console.error("Error adding device:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มอุปกรณ์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>เพิ่มอุปกรณ์ใหม่ (แบบกำหนดเอง)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddDevice} className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="device-code" className="text-sm font-medium mb-1 block">
              รหัสอุปกรณ์
            </label>
            <Input
              id="device-code"
              placeholder="ระบุรหัสอุปกรณ์"
              value={deviceCode}
              onChange={(e) => setDeviceCode(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            <PlusCircle className="h-4 w-4 mr-2" />
            เพิ่มอุปกรณ์
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
