import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useOneSignal } from '@/hooks/useOneSignal';
import { useAuth } from '@/components/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const OneSignalSettings: React.FC = () => {
  const { user } = useAuth();
  const {
    isInitialized,
    playerId,
    deviceState,
    hasPermission,
    isPushEnabled,
    isLoading,
    error,
    requestPermission,
    setSubscription,
    sendTags,
    getTags,
    setExternalUserId,
    removeExternalUserId,
    refreshDeviceState,
  } = useOneSignal();

  const [userTags, setUserTags] = useState<Record<string, string> | null>(null);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [isUpdatingTags, setIsUpdatingTags] = useState(false);

  // Load user tags on mount
  useEffect(() => {
    const loadTags = async () => {
      if (isInitialized) {
        const tags = await getTags();
        setUserTags(tags);
      }
    };
    loadTags();
  }, [isInitialized, getTags]);

  // Set external user ID when user is available
  useEffect(() => {
    const updateExternalUserId = async () => {
      if (user && isInitialized) {
        await setExternalUserId(user.id);
      }
    };
    updateExternalUserId();
  }, [user, isInitialized, setExternalUserId]);

  const handleToggleSubscription = async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    setIsUpdatingSubscription(true);
    try {
      await setSubscription(!isPushEnabled);
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const handleUpdateUserTags = async () => {
    if (!user) return;

    setIsUpdatingTags(true);
    try {
      const tags = {
        user_id: user.id,
        user_email: user.email || '',
        app_version: '1.0.0',
        platform: 'mobile',
        last_active: new Date().toISOString(),
      };

      await sendTags(tags);
      
      // Refresh tags to show updated values
      const updatedTags = await getTags();
      setUserTags(updatedTags);
    } finally {
      setIsUpdatingTags(false);
    }
  };

  const getStatusIcon = () => {
    if (!isInitialized) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    if (!hasPermission) return <XCircle className="h-5 w-5 text-red-500" />;
    if (isPushEnabled) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <BellOff className="h-5 w-5 text-gray-500" />;
  };

  const getStatusText = () => {
    if (!isInitialized) return 'Initializing...';
    if (!hasPermission) return 'Permission Required';
    if (isPushEnabled) return 'Active';
    return 'Disabled';
  };

  const getStatusColor = () => {
    if (!isInitialized) return 'yellow';
    if (!hasPermission) return 'red';
    if (isPushEnabled) return 'green';
    return 'gray';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </div>
          <Badge variant="outline" className={`text-${getStatusColor()}-600 border-${getStatusColor()}-600`}>
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Subscription Control */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Push Notifications</h4>
            <p className="text-sm text-muted-foreground">
              {hasPermission 
                ? 'Receive notifications for important updates' 
                : 'Permission required to receive notifications'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isPushEnabled && hasPermission}
              onCheckedChange={handleToggleSubscription}
              disabled={isUpdatingSubscription || !isInitialized}
            />
            {isUpdatingSubscription && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            )}
          </div>
        </div>

        {/* Permission Request */}
        {!hasPermission && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Permission Required
              </span>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
              Grant notification permission to receive important alerts about your devices and measurements.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={requestPermission}
              className="text-yellow-800 dark:text-yellow-200 border-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
            >
              <Bell className="h-3 w-3 mr-1" />
              Grant Permission
            </Button>
          </div>
        )}

        {/* Device Information */}
        {deviceState && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Device Information
            </h4>
            <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Player ID:</span>
                <span className="font-mono">{playerId?.slice(0, 8)}...</span>
              </div>
              {deviceState.pushToken && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Push Token:</span>
                  <span className="font-mono">{deviceState.pushToken.slice(0, 8)}...</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscribed:</span>
                <span className={deviceState.subscribed ? 'text-green-600' : 'text-red-600'}>
                  {deviceState.subscribed ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User Tags */}
        {userTags && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">User Tags</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={handleUpdateUserTags}
                disabled={isUpdatingTags}
              >
                {isUpdatingTags ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                ) : (
                  <Settings className="h-3 w-3 mr-1" />
                )}
                Update
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
              {Object.entries(userTags).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={refreshDeviceState}
          className="w-full"
        >
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
};

export default OneSignalSettings;
