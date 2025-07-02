import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGlobalCountdown } from '@/contexts/CountdownContext';
import { useNotifications } from '@/hooks/useNotifications';
import { RefreshCw, Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RefreshControlsProps {
  onManualRefresh?: () => Promise<void>;
  disabled?: boolean;
}

export const RefreshControls: React.FC<RefreshControlsProps> = ({ 
  onManualRefresh,
  disabled = false 
}) => {
  const { isActive, toggle, reset } = useGlobalCountdown();
  const { isFetching, checkNotifications } = useNotifications();
  const { toast } = useToast();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (isManualRefreshing || disabled) return;
    
    setIsManualRefreshing(true);
    try {
      console.log('🔄 Manual refresh triggered by user');
      
      // Call custom refresh function if provided
      if (onManualRefresh) {
        await onManualRefresh();
      }
      
      // Trigger notification check
      await checkNotifications();
      
      toast({
        title: "อัพเดทข้อมูลสำเร็จ",
        description: "ข้อมูลล่าสุดได้ถูกโหลดแล้ว",
        variant: "update",
      });
    } catch (error) {
      console.error('Manual refresh error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const handleToggleTimer = () => {
    toggle();
    toast({
      title: isActive ? "หยุดการอัพเดทอัตโนมัติ" : "เริ่มการอัพเดทอัตโนมัติ",
      description: isActive ? "ระบบจะหยุดอัพเดทข้อมูลอัตโนมัติ" : "ระบบจะเริ่มอัพเดทข้อมูลอัตโนมัติ",
      variant: "default",
    });
  };

  const handleResetTimer = () => {
    reset();
    toast({
      title: "รีเซ็ตตัวจับเวลา",
      description: "ตัวจับเวลาได้ถูกรีเซ็ตและเริ่มต้นใหม่",
      variant: "default",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleManualRefresh}
        disabled={isManualRefreshing || isFetching || disabled}
        size="sm"
        variant="outline"
        className="flex items-center gap-1"
      >
        <RefreshCw 
          className={`h-3 w-3 ${(isManualRefreshing || isFetching) ? 'animate-spin' : ''}`} 
        />
        {isManualRefreshing ? 'กำลังอัพเดท...' : 'อัพเดทเลย'}
      </Button>
      
      <Button
        onClick={handleToggleTimer}
        size="sm"
        variant="ghost"
        className="flex items-center gap-1"
      >
        {isActive ? (
          <>
            <Pause className="h-3 w-3" />
            หยุด
          </>
        ) : (
          <>
            <Play className="h-3 w-3" />
            เริ่ม
          </>
        )}
      </Button>
      
      <Button
        onClick={handleResetTimer}
        size="sm"
        variant="ghost"
        className="flex items-center gap-1"
      >
        <RotateCcw className="h-3 w-3" />
        รีเซ็ต
      </Button>
    </div>
  );
};