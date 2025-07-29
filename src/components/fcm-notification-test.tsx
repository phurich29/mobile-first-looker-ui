'use client';

import { useEffect } from 'react';
import { useFCM } from '@/hooks/use-fcm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';

export function FCMNotificationTest() {
  const { token, notification, isSupported, requestPermission, clearNotification } = useFCM();

  useEffect(() => {
    if (notification) {
      // Show browser notification for foreground messages
      if (Notification.permission === 'granted') {
        new Notification(notification.title || 'New Message', {
          body: notification.body,
          icon: notification.icon || '/icon-192x192.png'
        });
      }
    }
  }, [notification]);

  const handleRequestPermission = async () => {
    const fcmToken = await requestPermission();
    if (fcmToken) {
      // You can send this token to your backend to store it
      console.log('FCM Token to save:', fcmToken);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          FCM Push Notifications
        </CardTitle>
        <CardDescription>
          Firebase Cloud Messaging setup and testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Support Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Browser Support:</span>
          <Badge variant={isSupported ? "default" : "destructive"}>
            {isSupported ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Supported
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Not Supported
              </>
            )}
          </Badge>
        </div>

        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Permission:</span>
          <Badge variant={
            Notification.permission === 'granted' ? "default" :
            Notification.permission === 'denied' ? "destructive" : "secondary"
          }>
            {Notification.permission === 'granted' && <CheckCircle className="h-3 w-3 mr-1" />}
            {Notification.permission === 'denied' && <XCircle className="h-3 w-3 mr-1" />}
            {Notification.permission === 'default' && <BellOff className="h-3 w-3 mr-1" />}
            {Notification.permission}
          </Badge>
        </div>

        {/* FCM Token Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">FCM Token:</span>
          <Badge variant={token ? "default" : "secondary"}>
            {token ? "Generated" : "Not Available"}
          </Badge>
        </div>

        {/* Request Permission Button */}
        {isSupported && Notification.permission !== 'granted' && (
          <Button 
            onClick={handleRequestPermission}
            className="w-full"
            disabled={Notification.permission === 'denied'}
          >
            <Bell className="h-4 w-4 mr-2" />
            Enable Notifications
          </Button>
        )}

        {/* Token Display */}
        {token && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs font-medium mb-1">FCM Token:</p>
            <p className="text-xs text-muted-foreground break-all font-mono">
              {token.substring(0, 50)}...
            </p>
          </div>
        )}

        {/* Current Notification */}
        {notification && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  {notification.title}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {notification.body}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearNotification}
                className="text-blue-600 hover:text-blue-800"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click "Enable Notifications" to allow push notifications</p>
          <p>• Copy the FCM token to test from Firebase Console</p>
          <p>• Notifications will appear even when the app is in background</p>
        </div>
      </CardContent>
    </Card>
  );
}
