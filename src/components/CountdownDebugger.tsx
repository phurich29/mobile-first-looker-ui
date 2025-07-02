import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalCountdown } from '@/contexts/CountdownContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useQueryClient } from '@tanstack/react-query';
import { Timer, Database, RefreshCw, Activity } from 'lucide-react';

export const CountdownDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugStats, setDebugStats] = useState({
    totalCycles: 0,
    totalDbFetches: 0,
    lastError: null as string | null,
    averageFetchTime: 0
  });

  const countdown = useGlobalCountdown();
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  // Track countdown cycles
  useEffect(() => {
    if (countdown.lastCompleteTime) {
      setDebugStats(prev => ({
        ...prev,
        totalCycles: prev.totalCycles + 1
      }));
    }
  }, [countdown.lastCompleteTime]);

  // Track notification fetches
  useEffect(() => {
    if (notifications.isFetching) {
      setDebugStats(prev => ({
        ...prev,
        totalDbFetches: prev.totalDbFetches + 1
      }));
    }
  }, [notifications.isFetching]);

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString('th-TH');
  };

  const getQueryCacheInfo = () => {
    const queryCache = queryClient.getQueryCache();
    const allQueries = queryCache.getAll();
    
    return {
      total: allQueries.length,
      notifications: allQueries.filter(q => q.queryKey[0] === 'notifications').length,
      devices: allQueries.filter(q => q.queryKey[0] === 'devices').length,
      measurements: allQueries.filter(q => q.queryKey[0] === 'measurements').length,
      stale: allQueries.filter(q => q.isStale()).length,
      fetching: allQueries.filter(q => (q as any).state?.fetchStatus === 'fetching').length
    };
  };

  const handleManualRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['devices'] });
    queryClient.invalidateQueries({ queryKey: ['measurements'] });
  };

  const handleResetStats = () => {
    setDebugStats({
      totalCycles: 0,
      totalDbFetches: 0,
      lastError: null,
      averageFetchTime: 0
    });
  };

  const cacheInfo = getQueryCacheInfo();

  return (
    <>
      {/* Toggle Button - แสดงเฉพาะใน development */}
      {process.env.NODE_ENV === 'development' && (
        <Button
          onClick={() => setIsVisible(!isVisible)}
          className="fixed bottom-4 right-4 z-50"
          size="sm"
          variant="outline"
        >
          <Timer className="h-4 w-4 mr-1" />
          Timer Debug
        </Button>
      )}

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="bg-white max-w-4xl w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Countdown Timer & DB Debug Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Countdown Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Countdown Timer Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current Time:</span>
                      <Badge variant={countdown.seconds <= 10 ? "destructive" : "default"}>
                        {countdown.seconds}s
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Is Active:</span>
                      <Badge variant={countdown.isActive ? "default" : "secondary"}>
                        {countdown.isActive ? "Running" : "Paused"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Complete:</span>
                      <span className="text-xs">{formatTime(countdown.lastCompleteTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cycles:</span>
                      <Badge variant="outline">{debugStats.totalCycles}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Database Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Notifications:</span>
                      <Badge variant="outline">{notifications.notifications.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Is Loading:</span>
                      <Badge variant={notifications.loading ? "destructive" : "default"}>
                        {notifications.loading ? "Loading" : "Ready"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Is Fetching:</span>
                      <Badge variant={notifications.isFetching ? "destructive" : "secondary"}>
                        {notifications.isFetching ? "Fetching" : "Idle"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="text-xs">{formatTime(notifications.lastRefreshTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total DB Fetches:</span>
                      <Badge variant="outline">{debugStats.totalDbFetches}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Query Cache Status */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  React Query Cache Status
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Total Queries:</span>
                      <Badge variant="outline">{cacheInfo.total}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Notifications:</span>
                      <Badge variant="outline">{cacheInfo.notifications}</Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Devices:</span>
                      <Badge variant="outline">{cacheInfo.devices}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Measurements:</span>
                      <Badge variant="outline">{cacheInfo.measurements}</Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Stale Queries:</span>
                      <Badge variant={cacheInfo.stale > 0 ? "destructive" : "default"}>
                        {cacheInfo.stale}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Fetching:</span>
                      <Badge variant={cacheInfo.fetching > 0 ? "destructive" : "secondary"}>
                        {cacheInfo.fetching}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-sm mb-2">Performance Summary</h4>
                <div className="text-xs space-y-1">
                  <div>• Timer cycles completed: {debugStats.totalCycles}</div>
                  <div>• Database fetches triggered: {debugStats.totalDbFetches}</div>
                  <div>• Current notifications count: {notifications.notifications.length}</div>
                  <div>• Query cache utilization: {cacheInfo.total} queries active</div>
                  <div>• Background refetch: {notifications.isFetching ? "Active" : "Idle"}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={countdown.reset}
                  size="sm"
                  variant="outline"
                >
                  <Timer className="h-3 w-3 mr-1" />
                  Reset Timer
                </Button>
                <Button
                  onClick={countdown.toggle}
                  size="sm"
                  variant="outline"
                >
                  {countdown.isActive ? "Pause" : "Start"} Timer
                </Button>
                <Button
                  onClick={handleManualRefresh}
                  size="sm"
                  variant="outline"
                  disabled={notifications.isFetching}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${notifications.isFetching ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
                <Button
                  onClick={notifications.checkNotifications}
                  size="sm"
                  variant="outline"
                  disabled={notifications.isCheckingNotifications}
                >
                  Check Notifications
                </Button>
                <Button
                  onClick={handleResetStats}
                  size="sm"
                  variant="outline"
                >
                  Reset Stats
                </Button>
                <Button
                  onClick={() => setIsVisible(false)}
                  size="sm"
                  variant="default"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};