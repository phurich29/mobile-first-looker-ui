import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Users, Target } from 'lucide-react';
import { useOneSignal } from '@/hooks/useOneSignal';
import { useToast } from '@/hooks/use-toast';

export const OneSignalDemo: React.FC = () => {
  const { toast } = useToast();
  const {
    isInitialized,
    playerId,
    hasPermission,
    isPushEnabled,
    sendTags,
    setExternalUserId,
    requestPermission,
  } = useOneSignal();

  const sendTestNotification = async () => {
    if (!playerId) {
      toast({
        title: "No Player ID",
        description: "OneSignal is not properly initialized or permission not granted.",
        variant: "destructive",
      });
      return;
    }

    // This would typically be done on your server
    toast({
      title: "Test Notification",
      description: `Would send test notification to player: ${playerId.slice(0, 8)}...`,
    });
  };

  const setupUserSegmentation = async () => {
    if (!isInitialized) return;

    try {
      // Set external user ID (your app's user ID)
      await setExternalUserId('user123');

      // Send segmentation tags
      await sendTags({
        user_type: 'rice_farmer',
        device_count: '3',
        subscription: 'premium',
        region: 'thailand',
        language: 'th',
        app_version: '1.0.0',
        last_active: new Date().toISOString(),
      });

      toast({
        title: "User Segmentation Updated",
        description: "Tags have been sent to OneSignal for better targeting.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user segmentation.",
        variant: "destructive",
      });
    }
  };

  const sendDeviceAlertExample = async () => {
    // Example of how you might send device-specific alerts
    const deviceCode = "RICE001";
    const alertData = {
      title: "Rice Storage Alert",
      message: "Moisture level is above threshold",
      deviceCode,
      alertType: "moisture_high",
      value: 85,
      threshold: 80,
    };

    // This would be done on your server using OneSignal API
    const notificationPayload = {
      app_id: process.env.REACT_APP_ONESIGNAL_APP_ID,
      include_player_ids: [playerId],
      headings: { en: alertData.title },
      contents: { en: alertData.message },
      data: {
        screen: 'DeviceDetails',
        deviceCode: alertData.deviceCode,
        alertType: alertData.alertType,
        value: alertData.value.toString(),
        threshold: alertData.threshold.toString(),
      },
      buttons: [
        {
          id: "view_device",
          text: "View Device",
        },
        {
          id: "dismiss",
          text: "Dismiss",
        }
      ],
    };

    toast({
      title: "Device Alert Example",
      description: `Would send alert for device ${deviceCode}`,
    });

    console.log('Example notification payload:', notificationPayload);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            OneSignal Integration Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={isInitialized ? "default" : "secondary"}>
                {isInitialized ? "Initialized" : "Not Initialized"}
              </Badge>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Permission</span>
              <Badge variant={hasPermission ? "default" : "destructive"}>
                {hasPermission ? "Granted" : "Required"}
              </Badge>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Push Enabled</span>
              <Badge variant={isPushEnabled ? "default" : "secondary"}>
                {isPushEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Player ID</span>
              <span className="text-xs font-mono">
                {playerId ? `${playerId.slice(0, 8)}...` : "None"}
              </span>
            </div>
          </div>

          {!hasPermission && (
            <Button onClick={requestPermission} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Request Permission
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Send className="h-4 w-4" />
              Test Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Send a test push notification to this device.
            </p>
            <Button 
              onClick={sendTestNotification} 
              disabled={!hasPermission || !playerId}
              size="sm"
              className="w-full"
            >
              Send Test
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              User Segmentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Set up user tags for targeted notifications.
            </p>
            <Button 
              onClick={setupUserSegmentation} 
              disabled={!isInitialized}
              size="sm"
              className="w-full"
            >
              Setup Tags
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Device Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Example device-specific alert notification.
            </p>
            <Button 
              onClick={sendDeviceAlertExample} 
              disabled={!hasPermission || !playerId}
              size="sm"
              className="w-full"
            >
              Device Alert
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Integration with Your Existing System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-2">
            <p><strong>Server-side integration:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Use OneSignal REST API to send notifications from your server</li>
              <li>Include device-specific data in notification payload</li>
              <li>Set up user segmentation based on device access and preferences</li>
              <li>Integrate with your existing notification threshold system</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OneSignalDemo;
