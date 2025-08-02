import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { shouldInitializeOneSignal, shouldInitializeFCM, getPrimaryNotificationSystem } from '@/config/notification-config';

interface NotificationStatus {
  oneSignal: {
    enabled: boolean;
    initialized: boolean;
    subscribed: boolean;
    userId: string | null;
    permission: string;
  };
  fcm: {
    enabled: boolean;
    initialized: boolean;
    token: string | null;
    permission: string;
  };
  browser: {
    permission: NotificationPermission;
    supported: boolean;
  };
}

export const NotificationDebugger: React.FC = () => {
  const [status, setStatus] = useState<NotificationStatus>({
    oneSignal: {
      enabled: false,
      initialized: false,
      subscribed: false,
      userId: null,
      permission: 'default'
    },
    fcm: {
      enabled: false,
      initialized: false,
      token: null,
      permission: 'default'
    },
    browser: {
      permission: 'default',
      supported: false
    }
  });

  const [refreshing, setRefreshing] = useState(false);

  const checkStatus = async () => {
    setRefreshing(true);
    
    try {
      // Check browser support and permission
      const browserSupported = 'Notification' in window;
      const browserPermission = browserSupported ? Notification.permission : 'denied';

      // Check OneSignal status
      const oneSignalEnabled = shouldInitializeOneSignal();
      let oneSignalStatus = {
        enabled: oneSignalEnabled,
        initialized: false,
        subscribed: false,
        userId: null,
        permission: browserPermission
      };

      if (oneSignalEnabled && window.OneSignal) {
        try {
          oneSignalStatus.initialized = true;
          oneSignalStatus.subscribed = await window.OneSignal.User.PushSubscription.optedIn;
          oneSignalStatus.userId = window.OneSignal.User.onesignalId;
        } catch (error) {
          console.log('OneSignal status check error:', error);
        }
      }

      // Check FCM status
      const fcmEnabled = shouldInitializeFCM();
      let fcmStatus = {
        enabled: fcmEnabled,
        initialized: false,
        token: null,
        permission: browserPermission
      };

      if (fcmEnabled) {
        // Check if FCM token exists in localStorage
        const storedToken = localStorage.getItem('fcm-token');
        fcmStatus.token = storedToken;
        fcmStatus.initialized = !!storedToken;
      }

      setStatus({
        oneSignal: oneSignalStatus,
        fcm: fcmStatus,
        browser: {
          permission: browserPermission,
          supported: browserSupported
        }
      });

    } catch (error) {
      console.error('Error checking notification status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getPermissionBadge = (permission: string) => {
    const variant = permission === 'granted' ? 'default' : 
                   permission === 'denied' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{permission}</Badge>;
  };

  const primarySystem = getPrimaryNotificationSystem();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Notification System Debugger
            </CardTitle>
            <CardDescription>
              Debug tool to check notification system status and prevent duplicates
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkStatus}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuration Status */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Primary System</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {primarySystem}
              </Badge>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(status.oneSignal.enabled)}
                <span className="font-medium">OneSignal</span>
              </div>
              <Badge variant={status.oneSignal.enabled ? 'default' : 'secondary'}>
                {status.oneSignal.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(status.fcm.enabled)}
                <span className="font-medium">FCM</span>
              </div>
              <Badge variant={status.fcm.enabled ? 'default' : 'secondary'}>
                {status.fcm.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Browser Status */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Browser Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(status.browser.supported)}
                <span className="font-medium">Notification API</span>
              </div>
              <Badge variant={status.browser.supported ? 'default' : 'destructive'}>
                {status.browser.supported ? 'Supported' : 'Not Supported'}
              </Badge>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Permission</span>
              </div>
              {getPermissionBadge(status.browser.permission)}
            </div>
          </div>
        </div>

        {/* OneSignal Status */}
        {status.oneSignal.enabled && (
          <div>
            <h3 className="text-lg font-semibold mb-3">OneSignal Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(status.oneSignal.initialized)}
                  <span className="font-medium">Initialized</span>
                </div>
                <Badge variant={status.oneSignal.initialized ? 'default' : 'destructive'}>
                  {status.oneSignal.initialized ? 'Yes' : 'No'}
                </Badge>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(status.oneSignal.subscribed)}
                  <span className="font-medium">Subscribed</span>
                </div>
                <Badge variant={status.oneSignal.subscribed ? 'default' : 'destructive'}>
                  {status.oneSignal.subscribed ? 'Yes' : 'No'}
                </Badge>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">User ID</span>
                </div>
                <div className="text-sm font-mono bg-gray-100 p-1 rounded truncate">
                  {status.oneSignal.userId || 'Not available'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FCM Status */}
        {status.fcm.enabled && (
          <div>
            <h3 className="text-lg font-semibold mb-3">FCM Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(status.fcm.initialized)}
                  <span className="font-medium">Initialized</span>
                </div>
                <Badge variant={status.fcm.initialized ? 'default' : 'destructive'}>
                  {status.fcm.initialized ? 'Yes' : 'No'}
                </Badge>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Token Available</span>
                </div>
                <Badge variant={status.fcm.token ? 'default' : 'destructive'}>
                  {status.fcm.token ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            
            {status.fcm.token && (
              <div className="mt-4 p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">FCM Token</span>
                </div>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                  {status.fcm.token}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Warnings */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Potential Issues</h3>
          <div className="space-y-2">
            {status.oneSignal.enabled && status.fcm.enabled && (
              <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">
                    Both OneSignal and FCM are enabled - this may cause duplicate notifications
                  </span>
                </div>
              </div>
            )}
            
            {!status.browser.supported && (
              <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800 font-medium">
                    Browser does not support notifications
                  </span>
                </div>
              </div>
            )}
            
            {status.browser.permission === 'denied' && (
              <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800 font-medium">
                    Notification permission is denied
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
