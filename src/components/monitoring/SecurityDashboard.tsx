import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User,
  Database,
  Eye,
  Trash2
} from "lucide-react";

interface SecurityEvent {
  id: string;
  timestamp: string;
  function_name: string;
  user_id?: string;
  device_code?: string;
  rice_type_id?: string;
  action: string;
  success: boolean;
  error_message?: string;
}

/**
 * Phase 4: Security Dashboard - Monitor security events and violations
 */
export const SecurityDashboard = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    crossUserAttempts: 0
  });

  // Listen to security events from console or global event system
  useEffect(() => {
    const handleSecurityEvent = (event: CustomEvent<SecurityEvent>) => {
      const newEvent = {
        ...event.detail,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
      };
      
      setSecurityEvents(prev => [newEvent, ...prev.slice(0, 99)]); // Keep last 100
      
      // Update stats
      setStats(prev => ({
        totalEvents: prev.totalEvents + 1,
        successfulEvents: prev.successfulEvents + (newEvent.success ? 1 : 0),
        failedEvents: prev.failedEvents + (newEvent.success ? 0 : 1),
        crossUserAttempts: prev.crossUserAttempts + (
          newEvent.action.includes('cross_user') || 
          newEvent.action.includes('violation') ? 1 : 0
        )
      }));
    };

    // Listen for custom security events
    window.addEventListener('security-event', handleSecurityEvent as EventListener);
    
    // Create some sample events for demonstration
    const sampleEvents: SecurityEvent[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        function_name: 'getNotificationSettings',
        user_id: 'user-123',
        device_code: '6400000701259',
        rice_type_id: 'whiteness',
        action: 'fetch_settings_success',
        success: true
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        function_name: 'saveNotificationSettings',
        user_id: 'user-456',
        device_code: '6400000701260',
        rice_type_id: 'head_rice',
        action: 'cross_user_data_detected',
        success: false,
        error_message: 'Attempted to access another user\'s settings'
      }
    ];

    setSecurityEvents(sampleEvents);
    setStats({
      totalEvents: sampleEvents.length,
      successfulEvents: sampleEvents.filter(e => e.success).length,
      failedEvents: sampleEvents.filter(e => !e.success).length,
      crossUserAttempts: sampleEvents.filter(e => 
        e.action.includes('cross_user') || e.action.includes('violation')
      ).length
    });

    return () => {
      window.removeEventListener('security-event', handleSecurityEvent as EventListener);
    };
  }, []);

  const clearEvents = () => {
    setSecurityEvents([]);
    setStats({
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      crossUserAttempts: 0
    });
  };

  const getEventIcon = (event: SecurityEvent) => {
    if (!event.success) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (event.action.includes('access_denied')) return <Shield className="w-4 h-4 text-orange-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getEventBadgeColor = (action: string, success: boolean) => {
    if (!success) return "destructive";
    if (action.includes('violation') || action.includes('cross_user')) return "destructive";
    if (action.includes('access_denied')) return "secondary";
    return "default";
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-700 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Event Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <Database className="w-6 h-6 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-bold text-blue-700">{stats.totalEvents}</div>
            <div className="text-xs text-blue-600">Total Events</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-600" />
            <div className="text-lg font-bold text-green-700">{stats.successfulEvents}</div>
            <div className="text-xs text-green-600">Successful</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-red-600" />
            <div className="text-lg font-bold text-red-700">{stats.failedEvents}</div>
            <div className="text-xs text-red-600">Failed</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <Shield className="w-6 h-6 mx-auto mb-1 text-orange-600" />
            <div className="text-lg font-bold text-orange-700">{stats.crossUserAttempts}</div>
            <div className="text-xs text-orange-600">Violations</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-blue-700 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Recent Events
          </h4>
          <Button variant="outline" size="sm" onClick={clearEvents}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Events List */}
        {securityEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No security events recorded</p>
          </div>
        ) : (
          <ScrollArea className="h-96 w-full">
            <div className="space-y-2">
              {securityEvents.map((event) => (
                <div key={event.id} className="bg-white p-3 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event)}
                      <span className="font-medium text-sm">{event.function_name}</span>
                      <Badge variant={getEventBadgeColor(event.action, event.success)}>
                        {event.action}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="text-xs space-y-1">
                    {event.user_id && (
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>User: {event.user_id.substring(0, 8)}...</span>
                      </div>
                    )}
                    
                    {event.device_code && (
                      <div>Device: {event.device_code}</div>
                    )}
                    
                    {event.rice_type_id && (
                      <div>Type: {event.rice_type_id}</div>
                    )}
                    
                    {event.error_message && (
                      <div className="text-red-600 bg-red-50 p-2 rounded mt-2">
                        {event.error_message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityDashboard;