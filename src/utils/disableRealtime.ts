/**
 * EMERGENCY iOS PWA Fix - Complete WebSocket and Service Worker disable
 * This prevents ALL "operation is insecure" errors in iOS PWA
 */

// IMMEDIATE global error handler before anything else loads
if (typeof window !== 'undefined') {
  console.log('🚨 EMERGENCY iOS PWA FIX ACTIVATED');
  
  // 1. Block ALL WebSocket attempts immediately
  const OriginalWebSocket = window.WebSocket;
  (window as any).WebSocket = class BlockedWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      console.error('🚫 BLOCKED WebSocket attempt to:', url);
      // Don't throw error, just return a mock that never connects
      return {
        readyState: 3, // CLOSED
        close: () => {},
        send: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null
      } as any;
    }
    
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
  };

  // 2. Disable Service Worker immediately
  if ('serviceWorker' in navigator) {
    console.log('🚫 Disabling Service Worker for iOS PWA');
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        console.log('🗑️ Unregistering service worker:', registration.scope);
        registration.unregister();
      });
    });
  }

  // 3. Override EventSource (Server-Sent Events)
  if (window.EventSource) {
    (window as any).EventSource = class BlockedEventSource {
      constructor(url: string) {
        console.error('🚫 BLOCKED EventSource attempt to:', url);
        return {
          readyState: 2, // CLOSED
          close: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          onopen: null,
          onmessage: null,
          onerror: null
        } as any;
      }
      
      static readonly CONNECTING = 0;
      static readonly OPEN = 1;
      static readonly CLOSED = 2;
    };
  }

  // 4. Global error handler for any missed errors
  window.addEventListener('error', (event) => {
    console.error('🚨 GLOBAL ERROR:', event.error);
    if (event.error?.message?.includes('insecure') || 
        event.error?.message?.includes('WebSocket')) {
      console.error('🚨 WEBSOCKET ERROR DETECTED:', event.error);
      event.preventDefault();
      return false;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 UNHANDLED REJECTION:', event.reason);
    if ((event.reason?.toString() || '').includes('insecure') ||
        (event.reason?.toString() || '').includes('WebSocket')) {
      console.error('🚨 WEBSOCKET REJECTION DETECTED:', event.reason);
      event.preventDefault();
      return false;
    }
  });

  // 5. Create comprehensive mock Supabase channel
  const createMockChannel = () => ({
    on: () => createMockChannel(),
    subscribe: () => Promise.resolve({ error: null }),
    unsubscribe: () => Promise.resolve({ error: null }),
    send: () => Promise.resolve({ error: null }),
    track: () => Promise.resolve({ error: null }),
    untrack: () => Promise.resolve({ error: null }),
    presence: { state: {} },
    state: 'closed'
  });

  // 6. Override global objects that might try to create connections
  const mockChannel = createMockChannel();
  
  // Supabase override
  Object.defineProperty(window, 'supabase', {
    value: {
      channel: () => mockChannel,
      realtime: {
        channel: () => mockChannel,
        connect: () => Promise.resolve(),
        disconnect: () => Promise.resolve()
      }
    },
    configurable: true
  });

  console.log('✅ iOS PWA emergency fixes applied');
}

// Export functions for compatibility
export const disableAllWebSockets = () => {
  console.log('WebSockets already disabled by emergency fix');
};

export const disableSupabaseRealtime = () => {
  console.log('Supabase realtime already disabled by emergency fix');
};