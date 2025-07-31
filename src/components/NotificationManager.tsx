import React, { useState, useEffect } from 'react';
import { useFCM } from '../hooks/useFCM';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Bell, BellOff, Settings, Smartphone, Globe } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface NotificationLog {
  id: string;
  type: 'received' | 'opened';
  title: string;
  body: string;
  timestamp: Date;
  data?: Record<string, any>;
}

export const NotificationManager: React.FC = () => {
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  const {
    isInitialized,
    token,
    error,
    isLoading,
    requestPermission,
    sendTokenToServer,
    removeTokenFromServer
  } = useFCM({
    autoSendToServer: true,
    userId: 'demo-user-123', // In real app, get from auth context
    onTokenReceived: (token) => {
      console.log('🔔 FCM Token received:', token);
      setIsNotificationsEnabled(true);
      toast.success('Push notifications enabled successfully!');
    },
    onNotificationReceived: (notification) => {
      console.log('🔔 Notification received:', notification);
      
      // Log the notification
      const newLog: NotificationLog = {
        id: Date.now().toString(),
        type: 'received',
        title: notification.notification?.title || notification.title || 'New Notification',
        body: notification.notification?.body || notification.body || '',
        timestamp: new Date(),
        data: notification.data
      };
      
      setNotificationLogs(prev => [newLog, ...prev.slice(0, 9)]); // Keep last 10 notifications
    },
    onNotificationOpened: (notification) => {
      console.log('🔔 Notification opened:', notification);
      
      // Log the notification action
      const newLog: NotificationLog = {
        id: Date.now().toString() + '_opened',
        type: 'opened',
        title: notification.notification?.title || notification.title || 'Notification Opened',
        body: notification.notification?.body || notification.body || '',
        timestamp: new Date(),
        data: notification.data || notification.notification
      };
      
      setNotificationLogs(prev => [newLog, ...prev.slice(0, 9)]);
      
      // Handle specific actions based on notification data
      if (notification.data?.action) {
        handleNotificationAction(notification.data.action, notification.data);
      }
    },
    onError: (error) => {
      console.error('🔔 FCM Error:', error);
      toast.error('Failed to setup push notifications');
      setIsNotificationsEnabled(false);
    }
  });

  const handleNotificationAction = (action: string, data: any) => {
    switch (action) {
      case 'open_page':
        if (data.route) {
          // Navigate to specific route
          window.location.href = data.route;
        }
        break;
      case 'show_modal':
        // Show a modal or dialog
        toast.info(`Action: ${action}`, {
          description: `Data: ${JSON.stringify(data)}`
        });
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  };

  const toggleNotifications = async () => {
    if (isNotificationsEnabled) {
      // Disable notifications
      if (token) {
        try {
          await removeTokenFromServer();
          setIsNotificationsEnabled(false);
          toast.success('Push notifications disabled');
        } catch (error) {
          toast.error('Failed to disable notifications');
        }
      }
    } else {
      // Enable notifications
      try {
        await requestPermission();
      } catch (error) {
        toast.error('Failed to enable notifications');
      }
    }
  };

  const sendTestNotification = async () => {
    if (!token) {
      toast.error('No FCM token available');
      return;
    }

    // This would typically be done from your backend
    toast.info('Test notification sent!', {
      description: 'In a real app, this would be sent from your server'
    });
  };

  const clearLogs = () => {
    setNotificationLogs([]);
    toast.success('Notification logs cleared');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {Capacitor.isNativePlatform() ? <Smartphone className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
            Push Notifications
            <Badge variant={isInitialized ? "default" : "secondary"}>
              {Capacitor.getPlatform()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage your push notification preferences and view notification history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="notifications-toggle">Enable Notifications</Label>
              {isInitialized ? (
                <Badge variant="outline" className="text-green-600">
                  <Bell className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">
                  <BellOff className="h-3 w-3 mr-1" />
                  Not Ready
                </Badge>
              )}
            </div>
            <Switch
              id="notifications-toggle"
              checked={isNotificationsEnabled && isInitialized}
              onCheckedChange={toggleNotifications}
              disabled={isLoading}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Token Display */}
          {token && (
            <div className="p-3 text-xs bg-gray-50 rounded-md border">
              <div className="flex items-center justify-between mb-2">
                <strong>FCM Token:</strong>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="font-mono break-all text-gray-600">
                {token.substring(0, 50)}...
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={requestPermission} 
              disabled={isLoading || isInitialized}
              variant="outline"
              size="sm"
            >
              Request Permission
            </Button>
            
            <Button 
              onClick={sendTestNotification} 
              disabled={!token || isLoading}
              variant="outline"
              size="sm"
            >
              Test Notification
            </Button>
            
            <Button 
              onClick={() => sendTokenToServer('demo-user-123')} 
              disabled={!token || isLoading}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-1" />
              Sync Token
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                Recent notifications received and opened
              </CardDescription>
            </div>
            <Button 
              onClick={clearLogs} 
              variant="outline" 
              size="sm"
              disabled={notificationLogs.length === 0}
            >
              Clear Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notificationLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">Notifications will appear here when received</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificationLogs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={log.type === 'received' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {log.type === 'received' ? 'Received' : 'Opened'}
                        </Badge>
                        <span className="text-sm font-medium">{log.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{log.body}</p>
                      {log.data && Object.keys(log.data).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <strong>Data:</strong> {JSON.stringify(log.data, null, 2)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 ml-2">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {index < notificationLogs.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
