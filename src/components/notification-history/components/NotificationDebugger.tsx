
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Database, Bell, AlertCircle, CheckCircle } from "lucide-react";
import { NotificationHistoryList } from "../NotificationHistoryList";

export const NotificationDebugger = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [lastActivity, setLastActivity] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to real-time notifications changes
    const channel = supabase
      .channel('notification_debugger')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        (payload) => {
          console.log('🔔 Notification real-time update:', payload);
          setLastActivity(new Date().toLocaleTimeString('th-TH'));
          setDebugInfo(prev => [
            {
              timestamp: new Date().toISOString(),
              event: payload.eventType,
              table: 'notifications',
              data: payload.new || payload.old,
            },
            ...prev.slice(0, 4) // Keep only last 5 entries
          ]);
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status);
        setConnectionStatus(status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
            สถานะการเชื่อมต่อ Realtime
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
              กิจกรรม Real-time ล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debugInfo.map((info, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <span className="font-mono">{new Date(info.timestamp).toLocaleTimeString('th-TH')}</span>
                  <Badge variant="outline" className="text-xs">
                    {info.event}
                  </Badge>
                  <span className="text-gray-600 truncate max-w-32">
                    ID: {info.data?.id?.substring(0, 8)}...
                  </span>
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
