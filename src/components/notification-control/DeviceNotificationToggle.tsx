import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { VolumeX, Volume2, AlertTriangle } from 'lucide-react';
import { useNotificationControl } from '@/hooks/useNotificationControl';
import { toast } from '@/hooks/use-toast';

interface DeviceNotificationToggleProps {
  deviceCode: string;
  deviceName?: string;
  className?: string;
  showEmergencyStop?: boolean;
}

export const DeviceNotificationToggle: React.FC<DeviceNotificationToggleProps> = ({
  deviceCode,
  deviceName,
  className = '',
  showEmergencyStop = true
}) => {
  const { stopDevice, enableDevice, emergencyStopAll, isDeviceEnabled } = useNotificationControl();
  const enabled = isDeviceEnabled(deviceCode);

  const handleToggle = (newEnabled: boolean) => {
    if (newEnabled) {
      enableDevice(deviceCode);
      toast({
        title: "🔔 เปิดการแจ้งเตือน",
        description: `เปิดการแจ้งเตือนสำหรับ ${deviceName || deviceCode} แล้ว`,
        duration: 3000,
      });
    } else {
      stopDevice(deviceCode);
      toast({
        title: "🔇 ปิดการแจ้งเตือน",
        description: `ปิดการแจ้งเตือนสำหรับ ${deviceName || deviceCode} แล้ว`,
        duration: 3000,
      });
    }
  };

  const handleEmergencyStop = () => {
    emergencyStopAll();
    toast({
      title: "🚨 หยุดการแจ้งเตือนทั้งหมด",
      description: "หยุดการแจ้งเตือนทั้งหมดแล้ว",
      variant: "destructive",
      duration: 5000,
    });
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        {enabled ? (
          <Volume2 className="h-4 w-4 text-primary" />
        ) : (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        )}
        
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          aria-label={`Toggle notifications for ${deviceName || deviceCode}`}
        />
        
        <span className="text-sm text-foreground">
          การแจ้งเตือน {deviceName || deviceCode}
        </span>
      </div>
      
      {showEmergencyStop && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleEmergencyStop}
          className="flex items-center gap-1"
        >
          <AlertTriangle className="h-3 w-3" />
          หยุดฉุกเฉิน
        </Button>
      )}
    </div>
  );
};