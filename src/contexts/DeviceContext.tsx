
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

type DeviceContextType = {
  selectedDeviceCode: string | null;
  selectedDeviceName: string | null;
  isLoadingDevice: boolean;
  selectDevice: (deviceCode: string, deviceName?: string) => Promise<void>;
  clearSelectedDevice: () => Promise<void>;
};

const DeviceContext = createContext<DeviceContextType>({
  selectedDeviceCode: null,
  selectedDeviceName: null,
  isLoadingDevice: true,
  selectDevice: async () => {},
  clearSelectedDevice: async () => {},
});

export const useDeviceContext = () => useContext(DeviceContext);

interface DeviceProviderProps {
  children: React.ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [selectedDeviceCode, setSelectedDeviceCode] = useState<string | null>(null);
  const [selectedDeviceName, setSelectedDeviceName] = useState<string | null>(null);
  const [isLoadingDevice, setIsLoadingDevice] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch device preference from the database on initial load
  useEffect(() => {
    const fetchDevicePreference = async () => {
      if (!user) {
        setIsLoadingDevice(false);
        return;
      }

      try {
        setIsLoadingDevice(true);
        
        // Fetch the user's device preference
        const { data, error } = await supabase
          .from('user_device_preferences')
          .select('device_code')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.device_code) {
          // If we have a device preference, fetch the display name
          setSelectedDeviceCode(data.device_code);
          
          // Fetch device display name from device_settings if available
          const { data: deviceData } = await supabase
            .from('device_settings')
            .select('display_name')
            .eq('device_code', data.device_code)
            .maybeSingle();
          
          setSelectedDeviceName(deviceData?.display_name || data.device_code);
        }
      } catch (error) {
        console.error('Error fetching device preference:', error);
      } finally {
        setIsLoadingDevice(false);
      }
    };

    fetchDevicePreference();
  }, [user]);

  // Function to save the selected device to the database
  const selectDevice = async (deviceCode: string, deviceName?: string) => {
    if (!user) {
      // For non-authenticated users, we just store in state but don't persist
      setSelectedDeviceCode(deviceCode);
      setSelectedDeviceName(deviceName || deviceCode);
      return;
    }

    try {
      setIsLoadingDevice(true);
      
      // Check if a preference already exists
      const { data: existingPref } = await supabase
        .from('user_device_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      
      if (existingPref) {
        // Update existing preference
        const { error: updateError } = await supabase
          .from('user_device_preferences')
          .update({ device_code: deviceCode })
          .eq('user_id', user.id);
        
        error = updateError;
      } else {
        // Insert new preference
        const { error: insertError } = await supabase
          .from('user_device_preferences')
          .insert({ user_id: user.id, device_code: deviceCode });
        
        error = insertError;
      }

      if (error) throw error;
      
      // Update local state
      setSelectedDeviceCode(deviceCode);
      setSelectedDeviceName(deviceName || deviceCode);
      
      toast({
        title: "อุปกรณ์เริ่มต้นถูกเปลี่ยนแปลง",
        description: `อุปกรณ์ ${deviceName || deviceCode} ถูกตั้งเป็นอุปกรณ์เริ่มต้น`,
      });
    } catch (error) {
      console.error('Error saving device preference:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าอุปกรณ์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDevice(false);
    }
  };

  // Function to clear the selected device
  const clearSelectedDevice = async () => {
    if (!user || !selectedDeviceCode) {
      setSelectedDeviceCode(null);
      setSelectedDeviceName(null);
      return;
    }

    try {
      setIsLoadingDevice(true);
      
      // Delete the device preference
      const { error } = await supabase
        .from('user_device_preferences')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setSelectedDeviceCode(null);
      setSelectedDeviceName(null);
      
      toast({
        title: "อุปกรณ์เริ่มต้นถูกลบ",
        description: "ไม่มีอุปกรณ์เริ่มต้นที่ถูกเลือกอีกต่อไป",
      });
    } catch (error) {
      console.error('Error clearing device preference:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบการตั้งค่าอุปกรณ์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDevice(false);
    }
  };

  return (
    <DeviceContext.Provider
      value={{
        selectedDeviceCode,
        selectedDeviceName,
        isLoadingDevice,
        selectDevice,
        clearSelectedDevice,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};
