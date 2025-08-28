import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { iOSLogger } from '@/utils/iOSDebugLogger';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Get initial logs
    const initialLogs = iOSLogger.getRecentErrors(60);
    setLogs(initialLogs);
    
    const interval = setInterval(() => {
      // Get fresh logs including all types, not just errors
      try {
        const allLogs = (iOSLogger as any).logs || [];
        setLogs(allLogs.slice(-100)); // Show last 100 logs
      } catch (error) {
        console.error('Failed to get logs:', error);
        const recentErrors = iOSLogger.getRecentErrors(60);
        setLogs(recentErrors);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const exportLogs = () => {
    const logData = iOSLogger.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ios-debug-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    iOSLogger.clearLogs();
    setLogs([]);
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'outline';
      case 'info': return 'secondary';
      case 'debug': return 'outline';
      default: return 'secondary';
    }
  };

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return '📝';
      case 'debug': return '🔍';
      default: return '📝';
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white"
        size="sm"
      >
        🐛 Debug
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>iOS PWA Debug Panel</CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportLogs} variant="outline" size="sm">
                📄 Export Logs
              </Button>
              <Button onClick={clearLogs} variant="outline" size="sm">
                🗑️ Clear
              </Button>
              <Button onClick={() => setIsVisible(false)} variant="outline" size="sm">
                ❌ Close
              </Button>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All ({logs.length})
            </Button>
            <Button
              onClick={() => setFilter('error')}
              variant={filter === 'error' ? 'default' : 'outline'}
              size="sm"
            >
              Errors ({logs.filter(l => l.level === 'error').length})
            </Button>
            <Button
              onClick={() => setFilter('WEBSOCKET_BLOCKED')}
              variant={filter === 'WEBSOCKET_BLOCKED' ? 'default' : 'outline'}
              size="sm"
            >
              WebSocket ({iOSLogger.getLogsByCategory('WEBSOCKET_BLOCKED').length})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {logs
                .filter(log => filter === 'all' || log.level === filter || log.category === filter)
                .slice(-50)
                .reverse()
                .map((log, index) => (
                  <div key={index} className="border rounded p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{getLevelEmoji(log.level)}</span>
                      <Badge variant={getLevelBadgeVariant(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{log.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="font-medium mb-1">{log.message}</div>
                    {log.data && (
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mb-1">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                    {log.stack && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs text-muted-foreground">
                          Stack trace
                        </summary>
                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mt-1">
                          {log.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              {logs.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No logs available. Logs will appear here as they are generated.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPanel;