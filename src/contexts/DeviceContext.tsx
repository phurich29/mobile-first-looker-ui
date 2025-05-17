
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface DeviceContextType {
  selectedDevice: string | null;
  setSelectedDevice: (deviceCode: string | null) => Promise<void>;
  isDeviceSelected: boolean;
  isLoadingPreference: boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
};

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDevice, setSelectedDeviceState] = useState<string | null>(null);
  const [isLoadingPreference, setIsLoadingPreference] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load user's device preference when component mounts or user changes
  useEffect(() => {
    const loadDevicePreference = async () => {
      if (!user) {
        setSelectedDeviceState(null);
        setIsLoadingPreference(false);
        return;
      }

      try {
        setIsLoadingPreference(true);
        const { data, error } = await supabase
          .from('user_device_preferences')
          .select('device_code')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading device preference:', error);
          return;
        }

        if (data) {
          setSelectedDeviceState(data.device_code);
        } else {
          // No preference found, clear selection
          setSelectedDeviceState(null);
        }
      } catch (error) {
        console.error('Unexpected error loading device preference:', error);
      } finally {
        setIsLoadingPreference(false);
      }
    };

    loadDevicePreference();
  }, [user]);

  // Function to update the selected device and save to database
  const setSelectedDevice = async (deviceCode: string | null) => {
    if (!user) {
      toast({
        title: "ต้องเข้าสู่ระบบก่อน",
        description: "กรุณาเข้าสู่ระบบเพื่อบันทึกการเลือกอุปกรณ์",
        variant: "destructive",
      });
      return;
    }

    try {
      setSelectedDeviceState(deviceCode);
      
      if (deviceCode === null) {
        // Delete preference when clearing selection
        const { error } = await supabase
          .from('user_device_preferences')
          .delete()
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        toast({
          title: "ยกเลิกการเลือกอุปกรณ์",
          description: "กลับสู่การแสดงอุปกรณ์ทั้งหมด"
        });
        return;
      }

      // Check if preference already exists
      const { data, error: selectError } = await supabase
        .from('user_device_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError) throw selectError;

      if (data) {
        // Update existing preference
        const { error } = await supabase
          .from('user_device_preferences')
          .update({ device_code: deviceCode })
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Insert new preference
        const { error } = await supabase
          .from('user_device_preferences')
          .insert({ user_id: user.id, device_code: deviceCode });
          
        if (error) throw error;
      }

      toast({
        title: "เลือกอุปกรณ์สำเร็จ",
        description: `เลือกอุปกรณ์ ${deviceCode} เป็นอุปกรณ์หลัก`
      });
    } catch (error) {
      console.error('Error setting device preference:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการเลือกอุปกรณ์ได้",
        variant: "destructive",
      });
      
      // Revert local state if save failed
      setSelectedDeviceState(null);
    }
  };

  const value = {
    selectedDevice,
    setSelectedDevice,
    isDeviceSelected: !!selectedDevice,
    isLoadingPreference
  };

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
};
