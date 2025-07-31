import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testFCMNotification, checkFCMStatus, requestNotificationPermission } from "@/utils/fcmTestUtils";
import { useFCM } from "@/hooks/useFCM";

export const FCMDebugComponent: React.FC = () => {
  const {
    isInitialized,
    token,
    error,
    isLoading,
    requestPermission
  } = useFCM({
    onTokenReceived: (token) => {
      console.log('🔔 Debug: Token received:', token);
    },
    onNotificationReceived: (notification) => {
      console.log('🔔 Debug: Notification received:', notification);
    },
    onNotificationOpened: (notification) => {
      console.log('🔔 Debug: Notification opened:', notification);
    },
    onError: (error) => {
      console.error('🔔 Debug: FCM Error:', error);
    }
  });

  const handleTestNotification = () => {
    testFCMNotification((notification) => {
      console.log('🔔 Test notification triggered:', notification);
    });
  };

  const handleCheckStatus = () => {
    const status = checkFCMStatus();
    alert(JSON.stringify(status, null, 2));
  };

  const handleRequestPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      alert(`Permission result: ${permission}`);
    } catch (error) {
      console.error('Error requesting permission:', error);
      alert(`Error: ${error}`);
    }
  };

  const status = checkFCMStatus();

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>FCM Debug Panel</CardTitle>
        <CardDescription>Debug Firebase Cloud Messaging integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status indicators */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <span>Initialized:</span>
            <Badge variant={isInitialized ? "default" : "destructive"}>
              {isInitialized ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Loading:</span>
            <Badge variant={isLoading ? "default" : "secondary"}>
              {isLoading ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Has Token:</span>
            <Badge variant={token ? "default" : "destructive"}>
              {token ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Has Error:</span>
            <Badge variant={error ? "destructive" : "default"}>
              {error ? "Yes" : "No"}
            </Badge>
          </div>
        </div>

        {/* Browser support status */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <span>Notifications:</span>
            <Badge variant={status.notificationSupported ? "default" : "destructive"}>
              {status.notificationSupported ? "Supported" : "Not Supported"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Permission:</span>
            <Badge variant={status.notificationPermission === 'granted' ? "default" : "destructive"}>
              {status.notificationPermission}
            </Badge>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-md">
            <p className="text-sm text-red-700">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Token display */}
        {token && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-md">
            <p className="text-sm text-green-700">
              <strong>Token:</strong> {token.substring(0, 30)}...
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleTestNotification} variant="outline">
            Test Notification
          </Button>
          <Button onClick={handleCheckStatus} variant="outline">
            Check Status
          </Button>
          <Button onClick={handleRequestPermission} variant="outline">
            Request Permission
          </Button>
          <Button onClick={requestPermission} variant="outline" disabled={isLoading}>
            Initialize FCM
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
