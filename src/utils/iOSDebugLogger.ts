/**
 * Enhanced logging system for iOS PWA debugging
 * Helps identify the source of "insecure operation" errors
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

class IOSDebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    console.log('🔍 iOS Debug Logger initializing...');
    this.loadStoredLogs();
    this.setupGlobalErrorHandlers();
    this.monitorNetworkRequests();
    this.monitorServiceWorker();
    this.logIOSInfo();
    this.info('LOGGER', 'iOS Debug Logger started successfully');
  }

  private loadStoredLogs() {
    try {
      const stored = localStorage.getItem('ios-debug-logs');
      if (stored) {
        const parsedLogs = JSON.parse(stored);
        this.logs = Array.isArray(parsedLogs) ? parsedLogs : [];
        console.log('📂 Loaded', this.logs.length, 'stored logs');
      }
    } catch (e) {
      console.warn('Failed to load stored logs');
    }
  }

  private log(level: LogEntry['level'], category: string, message: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      stack: error?.stack
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Always log to console with emoji prefixes
    const prefix = {
      info: '📝',
      warn: '⚠️',
      error: '❌',
      debug: '🔍'
    }[level];

    console.log(`${prefix} [${category}] ${message}`, data || '');

    // Store in localStorage for persistence
    try {
      localStorage.setItem('ios-debug-logs', JSON.stringify(this.logs.slice(-100)));
    } catch (e) {
      console.warn('Failed to store logs in localStorage');
    }
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: any, error?: Error) {
    this.log('error', category, message, data, error);
  }

  debug(category: string, message: string, data?: any) {
    this.log('debug', category, message, data);
  }

  private setupGlobalErrorHandlers() {
    console.log('🛡️ Setting up global error handlers...');
    
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      console.error('🚨 GLOBAL ERROR CAPTURED:', event);
      this.error('GLOBAL_ERROR', 'Unhandled error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString(),
        stack: event.error?.stack
      }, event.error);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 PROMISE REJECTION CAPTURED:', event);
      this.error('PROMISE_REJECTION', 'Unhandled promise rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
        type: typeof event.reason
      });
    });

    // Monitor WebSocket attempts (even blocked ones)
    this.monitorWebSocketAttempts();
    
    console.log('✅ Global error handlers set up');
  }

  private monitorWebSocketAttempts() {
    const originalWebSocket = (window as any).WebSocket;
    
    (window as any).WebSocket = class MockWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        iOSLogger.error('WEBSOCKET_BLOCKED', 'WebSocket creation attempt blocked', {
          url: url.toString(),
          protocols,
          userAgent: navigator.userAgent,
          stack: new Error().stack
        });
        throw new Error('WebSocket connections are disabled for iOS PWA compatibility');
      }
      
      static readonly CONNECTING = 0;
      static readonly OPEN = 1;
      static readonly CLOSING = 2;
      static readonly CLOSED = 3;
    };

    this.info('WEBSOCKET_MONITOR', 'WebSocket monitoring activated');
  }

  private monitorNetworkRequests() {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0]?.toString() || 'unknown';
      this.debug('NETWORK', 'Fetch request initiated', { url, method: args[1]?.method || 'GET' });
      
      try {
        const response = await originalFetch(...args);
        this.debug('NETWORK', 'Fetch response received', { 
          url, 
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        });
        return response;
      } catch (error) {
        this.error('NETWORK', 'Fetch request failed', { url, error: error.toString() }, error as Error);
        throw error;
      }
    };

    // Monitor XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends originalXHR {
      constructor() {
        super();
        this.addEventListener('loadstart', () => {
          iOSLogger.debug('XHR', 'XMLHttpRequest started', { url: this.responseURL });
        });
        this.addEventListener('error', () => {
          iOSLogger.error('XHR', 'XMLHttpRequest error', { url: this.responseURL, status: this.status });
        });
      }
    };
  }

  private monitorServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.debug('SERVICE_WORKER', 'Message received from service worker', event.data);
      });

      navigator.serviceWorker.ready.then((registration) => {
        this.info('SERVICE_WORKER', 'Service worker ready', {
          scope: registration.scope,
          active: !!registration.active
        });
      });
    }
  }

  private logIOSInfo() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebView = (window as any).webkit?.messageHandlers;

    this.info('DEVICE_INFO', 'Device and environment information', {
      isIOS,
      isPWA,
      isInWebView: !!isInWebView,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: (navigator as any).connection ? {
        type: (navigator as any).connection.type,
        effectiveType: (navigator as any).connection.effectiveType
      } : 'unknown'
    });
  }

  // Method to export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Method to clear logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('ios-debug-logs');
    this.info('LOGGER', 'Logs cleared');
  }

  // Get logs by category
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  // Get recent error logs
  getRecentErrors(minutes: number = 10): LogEntry[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.logs.filter(log => 
      log.level === 'error' && new Date(log.timestamp) > cutoff
    );
  }

  // Get all logs (for debug panel)
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }
}

// Create global instance
export const iOSLogger = new IOSDebugLogger();

// Export for debugging in console
(window as any).iOSLogger = iOSLogger;