import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Database, Bell, AlertCircle, CheckCircle } from "lucide-react";
import { NotificationHistoryList } from "../NotificationHistoryList";
import { useAuth } from "@/components/AuthProvider";

interface DebugInfo {
  timestamp: string;
  event: string;
  table: string;
  data: any;
  user_id?: string;
}

export const NotificationDebugger = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [lastActivity, setLastActivity] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);

  useEffect(() => {
    if (!user?.id) {
      console.log("🚫 NotificationDebugger: No authenticated user, skipping real-time subscription");
      return;
    }

    console.log("🔗 NotificationDebugger: Setting up user-filtered real-time subscription for user:", user.id);
    
    // Subscribe to user-filtered real-time notifications changes
    const channel = supabase
      .channel('notification_debugger')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}` // ⭐ CRITICAL: Only user's notifications
        }, 
        (payload) => {
          console.log('🔔 NotificationDebugger: User-filtered notification real-time update:', payload);
          
          // Double-check user_id validation (defense in depth)
          const notificationUserId = (payload.new as any)?.user_id || (payload.old as any)?.user_id;
          if (notificationUserId && notificationUserId !== user.id) {
            console.warn('🚫 NotificationDebugger: Cross-user notification detected and blocked:', {
              notification_user: notificationUserId,
              current_user: user.id
            });
            return;
          }
          
          setLastActivity(new Date().toLocaleTimeString('th-TH'));
          setDebugInfo(prev => [
            {
              timestamp: new Date().toISOString(),
              event: payload.eventType,
              table: 'notifications',
              data: payload.new || payload.old,
              user_id: notificationUserId
            },
            ...prev.slice(0, 4) // Keep only last 5 entries
          ]);
        }
      )
      .subscribe((status) => {
        console.log('📡 NotificationDebugger: User-filtered realtime status:', status, 'for user:', user.id);
        setConnectionStatus(status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('🔌 NotificationDebugger: Cleaning up user-filtered real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const testNotificationSystem = async () => {
    try {
      console.log('🧪 Testing notification system...');
      
      // Test database connection
      const { data, error } = await supabase
        .from('notifications')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Database test failed:', error);
        return;
      }
      
      console.log('✅ Database connection OK, total notifications:', data);
      
      // Test edge function
      const { data: functionResult, error: functionError } = await supabase.functions.invoke('check_notifications', {
        method: 'POST',
        body: { 
          timestamp: new Date().toISOString(),
          checkType: 'debug_test'
        }
      });
      
      if (functionError) {
        console.error('❌ Edge function test failed:', functionError);
      } else {
        console.log('✅ Edge function test OK:', functionResult);
      }
      
    } catch (error) {
      console.error('🚨 Test failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            สถานะการเชื่อมต่อ Realtime (User ID: {user?.id?.slice(0, 8)}...)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">สถานะ:</span>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  เชื่อมต่อแล้ว
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {connectionStatus}
                </>
              )}
            </Badge>
          </div>
          
          {lastActivity && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">กิจกรรมล่าสุด:</span>
              <span className="text-sm font-mono">{lastActivity}</span>
            </div>
          )}
          
          <Button 
            onClick={testNotificationSystem}
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            ทดสอบระบบ
          </Button>
        </CardContent>
      </Card>

      {/* Debug Activities */}
      {debugInfo.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              กิจกรรม Real-time ล่าสุด (กรองแล้วตาม User ID)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {debugInfo.map((info, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">{new Date(info.timestamp).toLocaleTimeString('th-TH')}</span>
                    <Badge variant="outline" className="text-xs">
                      {info.event}
                    </Badge>
                  </div>
                  <div className="font-mono text-xs">
                    <div><strong>Event:</strong> {info.event}</div>
                    <div><strong>User ID:</strong> {info.user_id || 'N/A'}</div>
                    <div><strong>Time:</strong> {info.timestamp}</div>
                    <div><strong>Data:</strong></div>
                    <pre className="text-xs mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto">
                      {JSON.stringify(info.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Notification History List */}
      <NotificationHistoryList />
    </div>
  );
};