import React, { useEffect } from 'react';
import { useFCM } from '../hooks/useFCM';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export const FCMExample: React.FC = () => {
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
    userId: 'user-123', // Replace with actual user ID
    onTokenReceived: (token) => {
      console.log('FCM Token received:', token);
    },
    onNotificationReceived: (notification) => {
      console.log('Notification received:', notification);
      // Handle foreground notification
    },
    onNotificationOpened: (notification) => {
      console.log('Notification opened:', notification);
      // Handle notification tap/click
    },
    onError: (error) => {
      console.error('FCM Error:', error);
    }
  });

  useEffect(() => {
    // FCM will be initialized automatically when the hook mounts
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>
          Manage your push notification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Badge variant={isInitialized ? "default" : "secondary"}>
            {isLoading ? "Loading..." : isInitialized ? "Initialized" : "Not Initialized"}
          </Badge>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            Error: {error}
          </div>
        )}

        {token && (
          <div className="p-3 text-xs bg-gray-50 rounded-md">
            <strong>FCM Token:</strong>
            <br />
            <span className="break-all">{token.substring(0, 50)}...</span>
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={requestPermission} 
            disabled={isLoading || isInitialized}
            className="w-full"
          >
            Request Permission
          </Button>
          
          <Button 
            onClick={() => sendTokenToServer('user-123')} 
            disabled={!token || isLoading}
            variant="outline"
            className="w-full"
          >
            Send Token to Server
          </Button>
          
          <Button 
            onClick={removeTokenFromServer} 
            disabled={!token || isLoading}
            variant="destructive"
            className="w-full"
          >
            Remove Token from Server
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
