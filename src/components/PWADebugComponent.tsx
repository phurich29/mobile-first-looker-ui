import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { usePWAContext } from '@/contexts/PWAContext';
import { RefreshCw, Smartphone, Wifi, WifiOff } from 'lucide-react';

export const PWADebugComponent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [localStorage, setLocalStorage] = useState<Record<string, any>>({});
  const pwaInstall = usePWAInstall();
  const pwaContext = usePWAContext();

  useEffect(() => {
    // เช็ค localStorage ทุกๆ 2 วินาที
    const interval = setInterval(() => {
      const localStorageData: Record<string, any> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          localStorageData[key] = window.localStorage.getItem(key);
        }
      }
      setLocalStorage(localStorageData);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleClearAll = () => {
    window.localStorage.clear();
    pwaInstall.resetDismissedStatus();
    window.location.reload();
  };

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const getStatusBadge = (status: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={status ? "default" : "secondary"}>
        {status ? trueText : falseText}
      </Badge>
    );
  };

  return (
    <>
      {/* Toggle Button - แสดงเฉพาะใน development */}
      {process.env.NODE_ENV === 'development' && (
        <Button
          onClick={handleToggleVisibility}
          className="fixed bottom-4 left-4 z-50"
          size="sm"
          variant="outline"
        >
          <Smartphone className="h-4 w-4 mr-1" />
          PWA Debug
        </Button>
      )}

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="bg-white max-w-2xl w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                PWA Debug Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PWA Install Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">PWA Install Status</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Can Install:</span>
                      {getStatusBadge(pwaInstall.canInstall, "Yes", "No")}
                    </div>
                    <div className="flex justify-between">
                      <span>Is Installed:</span>
                      {getStatusBadge(pwaInstall.isInstalled, "Yes", "No")}
                    </div>
                    <div className="flex justify-between">
                      <span>Is Installing:</span>
                      {getStatusBadge(pwaInstall.isInstalling, "Yes", "No")}
                    </div>
                    <div className="flex justify-between">
                      <span>Has Been Dismissed:</span>
                      {getStatusBadge(pwaInstall.hasBeenDismissed, "Yes", "No")}
                    </div>
                    <div className="flex justify-between">
                      <span>Is iOS:</span>
                      {getStatusBadge(pwaInstall.isIOS, "Yes", "No")}
                    </div>
                    <div className="flex justify-between">
                      <span>iOS PWA Compatible:</span>
                      {getStatusBadge(pwaInstall.isIOSPWACompatible, "Yes", "No")}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">PWA Context Status</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Is Online:</span>
                      {pwaContext.isOnline ? (
                        <Badge variant="default" className="bg-green-500">
                          <Wifi className="h-3 w-3 mr-1" />
                          Online
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <WifiOff className="h-3 w-3 mr-1" />
                          Offline
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span>Need Refresh:</span>
                      {getStatusBadge(pwaContext.needRefresh, "Yes", "No")}
                    </div>
                    <div className="flex justify-between">
                      <span>Offline Ready:</span>
                      {getStatusBadge(pwaContext.offlineReady, "Yes", "No")}
                    </div>
                    <div className="flex justify-between">
                      <span>App Version:</span>
                      <Badge variant="outline">{pwaContext.appVersion.slice(-8)}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Browser Info */}
              <div>
                <h3 className="font-medium mb-2">Browser Info</h3>
                <div className="space-y-1 text-xs bg-gray-50 p-2 rounded">
                  <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                  <div><strong>Display Mode:</strong> {window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}</div>
                  <div><strong>Navigator Standalone:</strong> {(navigator as any).standalone ? 'True' : 'False'}</div>
                  <div><strong>Service Worker:</strong> {'serviceWorker' in navigator ? 'Supported' : 'Not Supported'}</div>
                  <div><strong>Push Manager:</strong> {'PushManager' in window ? 'Supported' : 'Not Supported'}</div>
                </div>
              </div>

              {/* LocalStorage Info */}
              <div>
                <h3 className="font-medium mb-2">LocalStorage</h3>
                <div className="space-y-1 text-xs bg-gray-50 p-2 rounded max-h-32 overflow-auto">
                  {Object.entries(localStorage).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {value}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={pwaInstall.resetDismissedStatus}
                  size="sm"
                  variant="outline"
                >
                  Reset Dismissed
                </Button>
                <Button
                  onClick={() => pwaInstall.installApp()}
                  size="sm"
                  variant="outline"
                  disabled={pwaInstall.isInstalling}
                >
                  Force Install
                </Button>
                <Button
                  onClick={handleClearAll}
                  size="sm"
                  variant="destructive"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Clear All & Reload
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