import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, User, Database, RefreshCw } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

/**
 * Security Monitor Component - Phase 3 Enhanced Monitoring
 * Displays security events, user info, and validation status
 */

interface SecurityEvent {
  timestamp: string;
  function_name: string;
  action: string;
  success: boolean;
  user_id?: string;
  device_code?: string;
  rice_type_id?: string;
  error_message?: string;
}

export const SecurityMonitor = () => {
  const { user } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>('');

  // Listen to console logs for security events
  useEffect(() => {
    if (!user?.id) return;

    // In development, show security monitor for admins
    const showMonitor = process.env.NODE_ENV === 'development' || 
                       window.location.search.includes('debug=true');
    
    if (showMonitor) {
      setIsVisible(true);
    }

    // Capture console logs related to security
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const captureSecurityLog = (level: string, args: any[]) => {
      const message = args.join(' ');
      
      // Capture security-related logs
      if (message.includes('[SECURITY]') || 
          message.includes('🔍') || 
          message.includes('🚫') || 
          message.includes('✅') ||
          message.includes('🚨')) {
        
        try {
          // Try to parse structured log data
          let eventData: SecurityEvent | null = null;
          
          if (args.length > 1 && typeof args[1] === 'object') {
            eventData = {
              timestamp: new Date().toISOString(),
              function_name: args[0]?.replace(/.*\[SECURITY\]\s*/, '') || 'unknown',
              action: args[1]?.action || 'unknown',
              success: args[1]?.success !== false,
              user_id: args[1]?.user_id,
              device_code: args[1]?.device_code,
              rice_type_id: args[1]?.rice_type_id,
              error_message: args[1]?.error || args[1]?.error_message
            };
          } else {
            // Parse from string message
            eventData = {
              timestamp: new Date().toISOString(),
              function_name: extractFromMessage(message, /🔍|🚫|✅|🚨/) || 'console',
              action: extractAction(message),
              success: !message.includes('🚫') && !message.includes('🚨'),
              user_id: user.id,
              error_message: level === 'error' ? message : undefined
            };
          }

          if (eventData) {
            setSecurityEvents(prev => [eventData!, ...prev.slice(0, 19)]); // Keep last 20 events
            setLastCheck(new Date().toLocaleTimeString('th-TH'));
          }
        } catch (err) {
          // Ignore parsing errors
        }
      }
    };

    console.log = (...args) => {
      captureSecurityLog('log', args);
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      captureSecurityLog('warn', args);
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      captureSecurityLog('error', args);
      originalError.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, [user?.id]);

  const extractFromMessage = (message: string, pattern: RegExp): string | null => {
    const match = message.match(new RegExp(`${pattern.source}\\s*([^:]+)`));
    return match ? match[1].trim() : null;
  };

  const extractAction = (message: string): string => {
    if (message.includes('called')) return 'api_call';
    if (message.includes('validation')) return 'validation';
    if (message.includes('access')) return 'access_check';
    if (message.includes('settings')) return 'settings_operation';
    if (message.includes('reset')) return 'state_reset';
    return 'unknown';
  };

  const clearEvents = () => {
    setSecurityEvents([]);
    setLastCheck('');
  };

  if (!isVisible || !user?.id) {
    return null;
  }

  const securityViolations = securityEvents.filter(e => !e.success).length;
  const successfulOperations = securityEvents.filter(e => e.success).length;

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <Card className="border-2 border-blue-500 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-blue-500" />
            Security Monitor (Phase 3)
            <Badge variant={securityViolations > 0 ? "destructive" : "default"} className="text-xs">
              {securityViolations > 0 ? `${securityViolations} Issues` : 'Secure'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* User Context */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>User: {user.id.slice(0, 8)}...</span>
            </div>
            <span className="text-gray-500">
              Last: {lastCheck}
            </span>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="font-semibold text-green-700 dark:text-green-400">
                ✅ {successfulOperations}
              </div>
              <div className="text-green-600 dark:text-green-300">
                Success
              </div>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <div className="font-semibold text-red-700 dark:text-red-400">
                🚫 {securityViolations}
              </div>
              <div className="text-red-600 dark:text-red-300">
                Violations
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="max-h-40 overflow-y-auto space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Recent Security Events</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearEvents}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            
            {securityEvents.length === 0 ? (
              <div className="text-xs text-gray-500 p-2 text-center">
                No security events recorded
              </div>
            ) : (
              securityEvents.slice(0, 8).map((event, index) => (
                <div 
                  key={index} 
                  className={`text-xs p-2 rounded border-l-2 ${
                    event.success 
                      ? 'border-l-green-400 bg-green-50 dark:bg-green-900/10' 
                      : 'border-l-red-400 bg-red-50 dark:bg-red-900/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono truncate">
                        {event.function_name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 truncate">
                        {event.action}
                      </div>
                      {event.device_code && (
                        <div className="text-gray-500 text-xs truncate">
                          Device: {event.device_code}
                        </div>
                      )}
                      {event.error_message && (
                        <div className="text-red-600 dark:text-red-400 text-xs truncate">
                          {event.error_message}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {new Date(event.timestamp).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Toggle button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsVisible(false)}
            className="w-full h-8 text-xs"
          >
            Hide Monitor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;