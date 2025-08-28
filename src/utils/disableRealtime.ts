/**
 * Complete WebSocket and Supabase realtime disable for iOS PWA compatibility
 * This prevents ALL WebSocket "operation is insecure" errors in iOS PWA
 */

// Override WebSocket constructor to prevent any WebSocket connections
export const disableAllWebSockets = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🚫 Completely disabling WebSockets for iOS PWA compatibility');
  
  // Store original WebSocket constructor
  const OriginalWebSocket = window.WebSocket;
  
  // Override WebSocket constructor to throw error
  (window as any).WebSocket = class MockWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      console.warn('🚫 WebSocket connection blocked for iOS PWA:', url);
      throw new Error('WebSocket connections are disabled for iOS PWA compatibility');
    }
    
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
  };
  
  // Create a comprehensive mock channel
  const mockChannel = {
    on: () => mockChannel,
    subscribe: () => Promise.resolve({ error: null }),
    unsubscribe: () => Promise.resolve({ error: null }),
    send: () => Promise.resolve({ error: null }),
    track: () => Promise.resolve({ error: null }),
    untrack: () => Promise.resolve({ error: null }),
    presence: { state: {} },
    state: 'closed'
  };
  
  return { OriginalWebSocket, mockChannel };
};

// Override Supabase realtime functions completely
export const disableSupabaseRealtime = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🔇 Disabling Supabase realtime for iOS PWA compatibility');
  
  const mockChannel = {
    on: () => mockChannel,
    subscribe: () => Promise.resolve({ error: null }),
    unsubscribe: () => Promise.resolve({ error: null }),
    send: () => Promise.resolve({ error: null }),
    track: () => Promise.resolve({ error: null }),
    untrack: () => Promise.resolve({ error: null }),
    presence: { state: {} }
  };

  // Override global Supabase if it exists
  if ((window as any).supabase) {
    const supabase = (window as any).supabase;
    
    // Completely disable channel creation
    supabase.channel = () => mockChannel;
    
    // Disable realtime if it exists
    if (supabase.realtime) {
      supabase.realtime.channel = () => mockChannel;
      supabase.realtime.connect = () => Promise.resolve();
      supabase.realtime.disconnect = () => Promise.resolve();
    }
  }

  return mockChannel;
};

// Initialize both disabling methods immediately
if (typeof window !== 'undefined') {
  disableAllWebSockets();
  disableSupabaseRealtime();
}