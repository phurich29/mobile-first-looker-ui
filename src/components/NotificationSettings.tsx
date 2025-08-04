import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Check, Copy, AlertCircle } from 'lucide-react';
import { useFCM } from '@/hooks/useFCM';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  userId?: string;
  onTokenReceived?: (token: string) => void;
  onNotificationReceived?: (notification: any) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  userId,
  onTokenReceived,
  onNotificationReceived
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [tokenCopied, setTokenCopied] = useState(false);

  const {
    isInitialized,
    token,
    error,
    isLoading,
    requestPermission,
    sendTokenToServer,
    removeTokenFromServer
  } = useFCM({
    userId,
    autoSendToServer: autoSync,
    onTokenReceived: (receivedToken) => {
      setNotificationsEnabled(true);
      onTokenReceived?.(receivedToken);
    },
    onNotificationReceived,
    onError: (err) => {
      // toast.error('Notification Error', {
      //   description: err.message || 'Failed to configure notifications'
      // });
    }
  });

  const handleEnableNotifications = async () => {
    try {
      await requestPermission();
      setNotificationsEnabled(true);
      toast.success('Notifications enabled successfully!');
    } catch (error) {
      toast.error('Failed to enable notifications');
    }
  };

  const handleDisableNotifications = async () => {
    try {
      if (token) {
        await removeTokenFromServer();
      }
      setNotificationsEnabled(false);
      toast.success('Notifications disabled');
    } catch (error) {
      toast.error('Failed to disable notifications');
    }
  };

  const copyTokenToClipboard = async () => {
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        setTokenCopied(true);
        toast.success('Token copied to clipboard');
        setTimeout(() => setTokenCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy token');
      }
    }
  };

  const handleSyncToServer = async () => {
    try {
      await sendTokenToServer();
      toast.success('Token synced to server');
    } catch (error) {
      toast.error('Failed to sync token to server');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Manage your push notification preferences and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled" className="text-base">
                Enable Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications for important updates
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={notificationsEnabled && isInitialized}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleEnableNotifications();
                } else {
                  handleDisableNotifications();
                }
              }}
              disabled={isLoading}
            />
          </div>

          {/* Status indicators */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              {isLoading ? (
                <Badge variant="secondary">Configuring...</Badge>
              ) : isInitialized && token ? (
                <Badge variant="default" className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : error ? (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <BellOff className="h-3 w-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Auto sync toggle */}
          {isInitialized && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync" className="text-base">
                  Auto-sync to Server
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically send token to server when received
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>
          )}

          {/* Token display and actions */}
          {token && (
            <div className="space-y-3">
              <Label className="text-base">FCM Registration Token</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-xs font-mono bg-muted p-2 rounded border truncate">
                  {token}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyTokenToClipboard}
                  disabled={tokenCopied}
                >
                  {tokenCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {!autoSync && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncToServer}
                  disabled={isLoading}
                >
                  Sync to Server
                </Button>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {!isInitialized && (
              <Button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Setting up...' : 'Enable Notifications'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
